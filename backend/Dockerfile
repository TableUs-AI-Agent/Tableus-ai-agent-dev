FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/app/.venv/bin:$PATH

WORKDIR /app
COPY --from=ghcr.io/astral-sh/uv:0.12.5 /uv /usr/local/bin/uv
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY backend/ .
RUN uv sync --frozen --no-dev

EXPOSE 8000
CMD ["python", "-m", "tableus.run"]
