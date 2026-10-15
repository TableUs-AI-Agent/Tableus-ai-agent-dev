from collections.abc import AsyncIterator

from sqlalchemy import MetaData, event, inspect, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    metadata = MetaData(schema=settings.database_schema)


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


DEMO_PROFILES = {"demo-organizer": "Demo Organizer", "demo-guest": "Demo Guest"}


async def init_database() -> None:
    """Create tables and demo people for local development and tests.

    Hosted databases are managed by Alembic only.
    """
    from .models import Profile

    if settings.environment not in {"development", "test"}:
        return
    async with engine.begin() as connection:
        schema = settings.database_schema
        # PostgreSQL checks CREATE privilege even with IF NOT EXISTS, and a
        # pre-migrated test database is used through the restricted runtime role.
        if schema and not await connection.run_sync(lambda sync: inspect(sync).has_schema(schema)):
            await connection.execute(text(f'CREATE SCHEMA "{schema}"'))
        await connection.run_sync(Base.metadata.create_all)
    if settings.demo_auth:
        async with SessionFactory() as session:
            for profile_id, name in DEMO_PROFILES.items():
                if not await session.get(Profile, profile_id):
                    session.add(Profile(id=profile_id, display_name=name))
            await session.commit()
