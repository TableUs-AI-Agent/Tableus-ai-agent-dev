SHELL := /bin/bash

.PHONY: setup dev lint typecheck test build smoke mobile-e2e ready perf ai-eval ai-eval-live contract

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

mobile-e2e:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(DEVICE)" || (echo "DEVICE=<simulator-or-emulator-id> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	node scripts/mobile-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" $(if $(BUILD_ID),--build-id "$(BUILD_ID)",) $(if $(EVIDENCE),--evidence "$(EVIDENCE)",)

perf:
	./scripts/perf-budget.sh

ai-eval:
	cd backend && .venv/bin/python scripts/ai_eval.py

ai-eval-live:
	cd backend && .venv/bin/python scripts/ai_eval.py --live

ready: lint typecheck test contract build smoke perf
