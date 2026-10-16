"""TableUs API."""

import uuid
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from tableus.api import router
from tableus.config import get_settings
from tableus.db import SessionFactory, init_database

settings = get_settings()
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        release=settings.build_sha or None,
        send_default_pii=False,
        traces_sample_rate=0,
    )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_database()
    yield


app = FastAPI(title="TableUs", version="0.3.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Demo-User-ID"],
)


@app.middleware("http")
async def request_id(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response


def _error(request: Request, status_code: int, code: str, message: str, **extra) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {"code": code, "message": message, **extra},
            "request_id": getattr(request.state, "request_id", "unknown"),
        },
    )


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException):
    return _error(request, exc.status_code, f"http_{exc.status_code}", str(exc.detail))


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    return _error(
        request, 422, "validation_error", "Request validation failed",
        fields=[{key: item[key] for key in ("loc", "msg", "type")} for item in exc.errors()],
    )


@app.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok", "build": settings.build_sha or None}


@app.get("/health/ready", include_in_schema=False)
async def ready():
    async with SessionFactory() as session:
        await session.execute(text("SELECT 1"))
    return {"status": "ready"}


app.include_router(router)
