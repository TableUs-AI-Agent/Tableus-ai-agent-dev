import pytest

from tableus import run


def test_release_container_refuses_missing_hosted_environment(monkeypatch) -> None:
    monkeypatch.setenv("TABLEUS_CONTAINER_RELEASE", "1")
    monkeypatch.delenv("ENVIRONMENT", raising=False)
    monkeypatch.delenv("RAILWAY_ENVIRONMENT_ID", raising=False)

    with pytest.raises(RuntimeError, match="ENVIRONMENT=staging or production"):
        run.main()


def test_hosted_entrypoint_sets_server_resource_bounds(monkeypatch) -> None:
    calls: list[tuple[str, dict]] = []
    monkeypatch.setenv("TABLEUS_CONTAINER_RELEASE", "1")
    monkeypatch.setenv("ENVIRONMENT", "staging")
    monkeypatch.setenv("PORT", "8123")
    monkeypatch.setattr(run.uvicorn, "run", lambda app, **options: calls.append((app, options)))

    run.main()

    assert calls == [
        (
            "main:app",
            {
                "host": "0.0.0.0",
                "port": 8123,
                "limit_concurrency": 128,
                "timeout_keep_alive": 5,
            },
        )
    ]
