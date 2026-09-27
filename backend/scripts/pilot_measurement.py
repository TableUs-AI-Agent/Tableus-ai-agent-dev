"""Read-only retained-plan pilot report; the private roster is never printed."""

import argparse
import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text

from tableus.db import SessionFactory
from tableus.pilot_measurement import measure_pilot


async def run(args: argparse.Namespace, plan_ids: list[str]) -> dict:
    if not isinstance(plan_ids, list) or not all(isinstance(value, str) for value in plan_ids):
        raise ValueError("Roster must be a JSON array of canonical plan IDs")
    async with SessionFactory() as session, session.begin():
        if session.bind.dialect.name == "postgresql":
            await session.execute(text("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY"))
        return await measure_pilot(
            session, plan_ids, datetime.fromisoformat(args.start), datetime.fromisoformat(args.end),
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan-ids-file", required=True, help="Private JSON roster; 1–100 plan IDs")
    parser.add_argument("--start", required=True, help="Inclusive ISO timestamp with timezone")
    parser.add_argument("--end", required=True, help="Exclusive ISO timestamp, at most 21 days later")
    args = parser.parse_args()
    plan_ids = json.loads(Path(args.plan_ids_file).read_text())
    print(json.dumps(asyncio.run(run(args, plan_ids)), indent=2))
