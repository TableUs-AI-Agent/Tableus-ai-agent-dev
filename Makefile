SHELL := /bin/bash

.PHONY: setup dev lint typecheck test build smoke mobile-e2e mobile-auth-e2e mobile-offline-e2e mobile-links-e2e local-mobile-build-receipt inspect-mobile-auth inspect-mobile-local-e2e inspect-mobile-links ready perf ai-eval ai-eval-live contract

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

mobile-auth-e2e:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(DEVICE)" || (echo "DEVICE=<simulator-or-emulator-id> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(BUILD_ID)" || (echo "BUILD_ID=<EAS-build-id> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	node scripts/mobile-auth-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --build-id "$(BUILD_ID)" --evidence "$(EVIDENCE)" --api-url "$(API_URL)" $(if $(START_PHASE),--start-phase "$(START_PHASE)",)

mobile-offline-e2e:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(DEVICE)" || (echo "DEVICE=<simulator-or-emulator-id> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(BUILD_ID)" || (echo "BUILD_ID=<EAS-build-id> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	node scripts/mobile-offline-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --build-id "$(BUILD_ID)" --evidence "$(EVIDENCE)"

mobile-links-e2e:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(DEVICE)" || (echo "DEVICE=<physical-ios-or-emulator-id> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-ipa-or-apk> is required" && exit 2)
	@test -n "$(BUILD_ID)" || (echo "BUILD_ID=<local-build-id> is required" && exit 2)
	@test -n "$(ORIGIN)" || (echo "ORIGIN=https://links.table-us.com is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	node scripts/mobile-links-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --build-id "$(BUILD_ID)" --origin "$(ORIGIN)" --evidence "$(EVIDENCE)"

local-mobile-build-receipt:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(PROFILE)" || (echo "PROFILE=<EAS-profile> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(BUILD_ID)" || (echo "BUILD_ID=<sanitized-local-build-id> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<receipt-json-path> is required" && exit 2)
	@test -n "$(EAS_VERSION)" || (echo "EAS_VERSION=<eas-cli-version> is required" && exit 2)
	node scripts/local-mobile-build-receipt.mjs --platform "$(PLATFORM)" --profile "$(PROFILE)" --artifact "$(APP)" --sha "$(SHA)" --build-id "$(BUILD_ID)" --output "$(EVIDENCE)" --eas-cli-version "$(EAS_VERSION)" --inspection-passed "$(INSPECTION_PASSED)"

mobile-account-e2e:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(DEVICE)" || (echo "DEVICE=<simulator-or-emulator-id> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(BUILD_ID)" || (echo "BUILD_ID=<EAS-build-id> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	node scripts/mobile-auth-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --build-id "$(BUILD_ID)" --evidence "$(EVIDENCE)" --api-url "$(API_URL)" --start-phase "returning-send"

inspect-mobile-auth:
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	node scripts/inspect-mobile-auth-artifact.mjs --artifact "$(APP)" --sha "$(SHA)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",)

inspect-mobile-local-e2e:
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	node scripts/inspect-mobile-local-e2e-artifact.mjs --artifact "$(APP)" --sha "$(SHA)" $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",)

inspect-mobile-links:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-ipa-or-apk> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	@test -n "$(LINK_HOST)" || (echo "LINK_HOST=links.table-us.com is required" && exit 2)
	node scripts/inspect-mobile-links-artifact.mjs --platform "$(PLATFORM)" --artifact "$(APP)" --sha "$(SHA)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" --link-host "$(LINK_HOST)" $(if $(APPLE_TEAM_ID),--apple-team-id "$(APPLE_TEAM_ID)",) $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",)

perf:
	./scripts/perf-budget.sh

ai-eval:
	cd backend && .venv/bin/python scripts/ai_eval.py

ai-eval-live:
	cd backend && .venv/bin/python scripts/ai_eval.py --live

ready: lint typecheck test contract build smoke perf
