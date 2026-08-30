from collections.abc import AsyncIterator

from sqlalchemy import MetaData, event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings

settings = get_settings()
metadata = MetaData(schema=settings.database_schema)


class Base(DeclarativeBase):
    metadata = metadata


engine = create_async_engine(settings.sqlalchemy_url, pool_pre_ping=True)


if engine.url.get_backend_name() == "sqlite":
    @event.listens_for(engine.sync_engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionFactory = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionFactory() as session:
        yield session


async def init_database() -> None:
    from . import models  # noqa: F401

    if settings.environment in {"development", "test"}:
        async with engine.begin() as connection:
            if settings.database_schema:
                await connection.execute(
                    text(f'CREATE SCHEMA IF NOT EXISTS "{settings.database_schema}"')
                )
            await connection.run_sync(Base.metadata.create_all)

    if settings.tableus_auth_mode == "demo" and settings.environment in {"development", "test"}:
        await seed_demo_data()


async def seed_demo_data() -> None:
    from sqlalchemy import select

    from .models import Invite, Profile
    from .security import hash_value

    async with SessionFactory() as session:
        profile = await session.get(Profile, "demo-organizer")
        if not profile:
            session.add(
                Profile(
                    id="demo-organizer",
                    display_name="Demo Organizer",
                    email_hash=hash_value("organizer@tableus.local"),
                )
            )
        guest = await session.get(Profile, "demo-guest")
        if not guest:
            session.add(
                Profile(
                    id="demo-guest",
                    display_name="Demo Guest",
                    email_hash=hash_value("guest@tableus.local"),
                )
            )
        invite_hash = hash_value(settings.tableus_demo_invite)
        invite = await session.scalar(select(Invite).where(Invite.code_hash == invite_hash))
        if not invite:
            session.add(Invite(code_hash=invite_hash, max_uses=100))
        await session.commit()
