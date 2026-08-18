import asyncio

from httpx import ASGITransport, AsyncClient

from main import app
from tableus.db import init_database


async def main() -> None:
    await init_database()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://smoke") as client:
        health = await client.get("/health")
        health.raise_for_status()
        me = await client.get("/api/v1/me", headers={"X-Demo-User-ID": "demo-organizer"})
        me.raise_for_status()
        assert me.json()["data"]["id"] == "demo-organizer"
    print("TableUs deterministic smoke passed")


if __name__ == "__main__":
    asyncio.run(main())
