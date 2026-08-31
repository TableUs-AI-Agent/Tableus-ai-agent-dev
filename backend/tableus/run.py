import os

import uvicorn


def main() -> None:
    environment = os.environ.get("ENVIRONMENT", "").strip().lower()
    release_container = os.environ.get("TABLEUS_CONTAINER_RELEASE") == "1"
    railway_runtime = bool(os.environ.get("RAILWAY_ENVIRONMENT_ID"))
    if (release_container or railway_runtime) and environment not in {"staging", "production"}:
        raise RuntimeError(
            "Hosted TableUs startup requires explicit ENVIRONMENT=staging or production"
        )
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        limit_concurrency=128,
        timeout_keep_alive=5,
    )


if __name__ == "__main__":
    main()
