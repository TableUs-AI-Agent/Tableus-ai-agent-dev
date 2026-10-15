SHELL := /bin/bash

.PHONY: setup dev lint typecheck test build contract smoke ai-eval ready

setup:
	npm ci
	python3.12 -m venv backend/.venv
	backend/.venv/bin/python -m pip install --upgrade uv
	cd backend && .venv/bin/uv sync --frozen --extra dev

dev:
	./scripts/dev.sh

lint:
	npm run lint
	cd backend && .venv/bin/python -m ruff check .

typecheck:
	npm run typecheck
	cd backend && .venv/bin/python -m mypy tableus

test:
	npm run test
	cd backend && .venv/bin/python -m pytest

build:
	npm run build

contract:
	cd backend && .venv/bin/python scripts/export_openapi.py
	npm run contract:generate

smoke:
	./scripts/smoke.sh

ai-eval:
	cd backend && .venv/bin/python scripts/ai_eval.py

ready: lint typecheck test contract build smoke
