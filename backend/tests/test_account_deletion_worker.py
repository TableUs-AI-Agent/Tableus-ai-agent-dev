import json
import sys
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from scripts import process_account_deletions as worker
from tableus.db import Base
from tableus.models import AccountDeletion


@pytest.fixture
async def isolated_queue(monkeypatch: pytest.MonkeyPatch):
    engine = create_async_engine("sqlite+aiosqlite:///:memory:").execution_options(
        schema_translate_map={"app": None}
    )
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(worker, "SessionFactory", factory)
    yield factory
    await engine.dispose()


@pytest.mark.asyncio
async def test_status_report_is_aggregate_only_and_identifies_stalled_work(
    isolated_queue, monkeypatch: pytest.MonkeyPatch
) -> None:
    now = datetime(2026, 9, 24, 12, tzinfo=UTC)
    monkeypatch.setattr(worker, "full_deletion_available", lambda: False)
    rows = [
        AccountDeletion(subject_hash="a" * 64, auth_subject="private-a", requested_at=now - timedelta(hours=48)),
        AccountDeletion(
            subject_hash="b" * 64, auth_subject="private-b", requested_at=now - timedelta(hours=1),
            attempts=1, next_retry_at=now + timedelta(hours=1),
        ),
        AccountDeletion(
            subject_hash="c" * 64, auth_subject="private-c", requested_at=now - timedelta(hours=2),
            lease_token="private-lease", lease_until=now + timedelta(seconds=40),
        ),
        AccountDeletion(
            subject_hash="d" * 64, auth_subject="private-d", requested_at=now - timedelta(hours=3),
            needs_attention=True, last_error_code="rejected",
        ),
        AccountDeletion(
            subject_hash="e" * 64, auth_subject="private-e", requested_at=now - timedelta(hours=4),
            attempts=worker.MAX_ATTEMPTS, lease_until=now - timedelta(seconds=1),
        ),
        AccountDeletion(
            subject_hash="f" * 64, auth_subject=None, requested_at=now - timedelta(hours=5),
        ),
        AccountDeletion(
            subject_hash="g" * 64, auth_subject=None, status="completed",
            requested_at=now - timedelta(hours=6), completed_at=now - timedelta(hours=2),
        ),
    ]
    async with isolated_queue() as session:
        session.add_all(rows)
        await session.commit()

    report = await worker.queue_status(now=now)
    assert report == {
        "observed_at": now.isoformat(),
        "worker_available": False,
        "pending": 6,
        "attention": 1,
        "ready_due": 1,
        "active_leases": 1,
        "expired_final_claims": 1,
        "missing_subject": 1,
        "pending_older_than_24h": 1,
        "completed_last_24h": 1,
        "oldest_pending_age_seconds": 48 * 3600,
    }
    output = json.dumps(report)
    assert "private-" not in output
    assert "a" * 64 not in output


def test_disabled_worker_refuses_batch_before_claiming(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    async def unexpected_batch(*, limit: int) -> int:
        pytest.fail(f"worker claimed a batch of {limit} jobs")

    monkeypatch.setattr(worker, "full_deletion_available", lambda: False)
    monkeypatch.setattr(worker, "process_due_deletions", unexpected_batch)
    monkeypatch.setattr(sys, "argv", ["worker", "--limit", "3"])
    with pytest.raises(SystemExit) as exc:
        worker.main()
    assert exc.value.code == 2
    assert "no jobs claimed" in capsys.readouterr().err


def test_read_only_status_works_while_worker_disabled(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    async def report() -> dict[str, object]:
        return {"pending": 2, "worker_available": False}

    monkeypatch.setattr(worker, "queue_status", report)
    monkeypatch.setattr(worker, "full_deletion_available", lambda: False)
    monkeypatch.setattr(sys, "argv", ["worker", "--status"])
    worker.main()
    assert json.loads(capsys.readouterr().out) == {"pending": 2, "worker_available": False}


@pytest.mark.parametrize("digest", ["PRIVATE-USER", ""])
def test_retry_rejects_noncanonical_digest(
    monkeypatch: pytest.MonkeyPatch, digest: str
) -> None:
    monkeypatch.setattr(worker, "full_deletion_available", lambda: True)
    monkeypatch.setattr(sys, "argv", ["worker", "--retry-subject-hash", digest])
    with pytest.raises(SystemExit) as exc:
        worker.main()
    assert exc.value.code == 2
