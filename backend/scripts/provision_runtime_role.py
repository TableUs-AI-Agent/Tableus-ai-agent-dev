import asyncio
import json
import os

import asyncpg

from tableus.config import get_settings


async def run() -> None:
    settings = get_settings()
    role = settings.tableus_runtime_db_role
    password = os.environ.get("TABLEUS_RUNTIME_DB_PASSWORD", "")
    if not role:
        raise SystemExit("TABLEUS_RUNTIME_DB_ROLE is required")
    if not settings.migration_database_url:
        raise SystemExit("MIGRATION_DATABASE_URL is required")
    if not password:
        raise SystemExit("TABLEUS_RUNTIME_DB_PASSWORD is required")

    dsn = settings.migration_sqlalchemy_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    connection = await asyncpg.connect(dsn)
    try:
        password_literal = await connection.fetchval("select quote_literal($1)", password)
        exists = await connection.fetchval(
            "select exists(select 1 from pg_roles where rolname = $1)", role
        )
        verb = "ALTER" if exists else "CREATE"
        await connection.execute(
            f'{verb} ROLE "{role}" WITH LOGIN PASSWORD {password_literal} '
            "NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION "
            "CONNECTION LIMIT 20"
        )
        await connection.execute(f"ALTER ROLE \"{role}\" SET statement_timeout = '15s'")
        await connection.execute(
            f"ALTER ROLE \"{role}\" SET idle_in_transaction_session_timeout = '15s'"
        )
        print(json.dumps({"role": role, "action": verb.lower(), "credential": "redacted"}))
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(run())
