"""Trusted invite CLI uses private recipient input and emits no email metadata."""

import io
import json
import warnings
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from scripts import invites
from tableus.db import Base
from tableus.models import Invite
from tableus.security import hash_value


@pytest.fixture
async def isolated_invites(tmp_path, monkeypatch: pytest.MonkeyPatch):
    url = f"sqlite+aiosqlite:///{tmp_path / 'invites.db'}"
    engine = create_async_engine(url).execution_options(
        schema_translate_map={Base.metadata.schema: None} if Base.metadata.schema else {}
    )
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(invites, "get_settings", lambda: SimpleNamespace(migration_sqlalchemy_url=url))
    yield factory
    await engine.dispose()


@pytest.mark.asyncio
async def test_create_from_stdin_is_one_use_bound_and_never_prints_email(
    isolated_invites, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    recipient = "person@example.test"
    monkeypatch.setattr(invites.sys, "stdin", io.StringIO("  Person@Example.Test  \n"))
    await invites.run(invites.parse_args(["create", "--recipient-email-stdin", "--expires-hours", "2"]))
    output = capsys.readouterr()
    created = json.loads(output.out)
    assert output.err == ""
    assert recipient not in output.out.lower()
    assert created["max_uses"] == 1
    assert created["recipient_bound"] is True
    assert created["hosted_eligible"] is True
    assert "invite_code" in created
    assert "recipient_email_hash" not in created
    async with isolated_invites() as session:
        row = await session.get(Invite, created["id"])
        assert row is not None
        assert row.recipient_email_hash == hash_value(recipient)
        assert row.code_hash == hash_value(created["invite_code"])
        assert row.max_uses == 1
        assert row.expires_at is not None
        assert datetime.now(UTC) + timedelta(hours=1, minutes=59) < row.expires_at.replace(tzinfo=UTC)


@pytest.mark.asyncio
async def test_hidden_prompt_and_list_revoke_never_expose_recipient_or_hash(
    isolated_invites, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    recipient = "private@example.test"
    monkeypatch.setattr(invites.getpass, "getpass", lambda prompt: recipient)
    await invites.run(invites.parse_args(["create"]))
    created = json.loads(capsys.readouterr().out)
    async with isolated_invites() as session:
        session.add_all([
            Invite(code_hash=hash_value("legacy-single"), max_uses=1),
            Invite(code_hash=hash_value("legacy-multi"), max_uses=3),
        ])
        await session.commit()
    await invites.run(invites.parse_args(["list"]))
    listed_output = capsys.readouterr().out
    listed = json.loads(listed_output)
    assert recipient not in listed_output
    assert hash_value(recipient) not in listed_output
    bound = next(item for item in listed if item["id"] == created["id"])
    assert bound["recipient_bound"] is True and bound["hosted_eligible"] is True
    assert bound["legacy_requires_replacement"] is False
    legacy = [item for item in listed if item["id"] != created["id"]]
    assert len(legacy) == 2
    assert all(item["recipient_bound"] is False and item["hosted_eligible"] is False for item in legacy)
    assert all(item["legacy_requires_replacement"] is True for item in legacy)
    assert {item["max_uses"] for item in legacy} == {1, 3}
    assert all("invite_code" not in item and "recipient_email_hash" not in item for item in listed)

    await invites.run(invites.parse_args(["revoke", created["id"]]))
    assert json.loads(capsys.readouterr().out) == {"id": created["id"], "status": "revoked"}
    async with isolated_invites() as session:
        row = await session.get(Invite, created["id"])
        assert row is not None and row.revoked_at is not None
    await invites.run(invites.parse_args(["list"]))
    revoked = next(item for item in json.loads(capsys.readouterr().out) if item["id"] == created["id"])
    assert revoked["status"] == "revoked" and revoked["hosted_eligible"] is False


@pytest.mark.asyncio
@pytest.mark.parametrize("raw", ["invalid-private-address", "two@example.test\nother@example.test\n", "x" * 321 + "@example.test"])
async def test_invalid_private_input_fails_before_database_access_and_never_echoes(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str], raw: str
) -> None:
    monkeypatch.setattr(invites.sys, "stdin", io.StringIO(raw))

    def forbidden_engine(*_args, **_kwargs):
        pytest.fail("Invalid recipient reached database setup")

    monkeypatch.setattr(invites, "create_async_engine", forbidden_engine)
    with pytest.raises(SystemExit) as error:
        await invites.run(invites.parse_args(["create", "--recipient-email-stdin"]))
    assert "A single valid recipient email is required" in str(error.value)
    captured = capsys.readouterr()
    combined = captured.out + captured.err + str(error.value)
    assert raw not in combined


@pytest.mark.asyncio
async def test_hidden_prompt_refuses_echo_fallback_before_database_access(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    def unprotected_prompt(_prompt: str) -> str:
        warnings.warn("Cannot control terminal echo", invites.getpass.GetPassWarning, stacklevel=2)
        return "private@example.test"

    def forbidden_engine(*_args, **_kwargs):
        pytest.fail("Unsafe prompt reached database setup")

    monkeypatch.setattr(invites.getpass, "getpass", unprotected_prompt)
    monkeypatch.setattr(invites, "create_async_engine", forbidden_engine)
    with pytest.raises(SystemExit) as error:
        await invites.run(invites.parse_args(["create"]))
    assert str(error.value) == "Recipient email was not provided"
    output = capsys.readouterr()
    assert "private@example.test" not in output.out + output.err


def test_exact_expiry_is_expired() -> None:
    now = datetime(2026, 9, 24, 12, tzinfo=UTC)
    invite = Invite(code_hash=hash_value("expiry"), max_uses=1, expires_at=now)
    assert invites._status(invite, now) == "expired"


def test_cli_rejects_multiuse_and_out_of_bounds_expiry(capsys: pytest.CaptureFixture[str]) -> None:
    for argv in (
        ["create", "--max-uses", "2"],
        ["create", "--expires-hours", "0"],
        ["create", "--expires-hours", "721"],
    ):
        with pytest.raises(SystemExit) as error:
            invites.parse_args(argv)
        assert error.value.code == 2
    assert "recipient" not in capsys.readouterr().out.lower()
