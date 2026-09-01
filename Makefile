SHELL := /bin/bash

.PHONY: setup dev lint typecheck test build smoke mobile-workflows-validate mobile-device-preflight mobile-e2e mobile-auth-e2e mobile-offline-e2e mobile-links-e2e mobile-readiness-e2e maps-staging-e2e gemini-staging-e2e telemetry-staging-e2e cumulative-readiness-evidence local-mobile-build inspect-mobile-auth inspect-mobile-local-e2e inspect-mobile-links inspect-mobile-readiness ready perf ai-eval ai-eval-live contract

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

mobile-workflows-validate:
	node scripts/validate-eas-workflows.mjs

mobile-device-preflight:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(DEVICE)" || (echo "DEVICE=<simulator-or-emulator-id> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	node scripts/mobile-device-preflight.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --boot "$(if $(BOOT),$(BOOT),false)" $(if $(EVIDENCE),--evidence "$(EVIDENCE)",)

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
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(RECEIPT)" || (echo "RECEIPT=<verified-build-receipt-json> is required" && exit 2)
	@test "$(PLATFORM)" != "android" -o -n "$(ANDROID_FINGERPRINT)" || (echo "ANDROID_FINGERPRINT=<expected-sha256> is required" && exit 2)
	node scripts/mobile-auth-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --build-id "$(BUILD_ID)" --evidence "$(EVIDENCE)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" --sha "$(SHA)" --receipt "$(RECEIPT)" --link-host "$(if $(LINK_HOST),$(LINK_HOST),links.table-us.com)" $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",) $(if $(START_PHASE),--start-phase "$(START_PHASE)",)

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
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(RECEIPT)" || (echo "RECEIPT=<verified-build-receipt-json> is required" && exit 2)
	@test "$(PLATFORM)" != "ios" -o -n "$(APPLE_TEAM_ID)" || (echo "APPLE_TEAM_ID=<expected-team-id> is required" && exit 2)
	@test "$(PLATFORM)" != "android" -o -n "$(ANDROID_FINGERPRINT)" || (echo "ANDROID_FINGERPRINT=<expected-sha256> is required" && exit 2)
	node scripts/mobile-links-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --build-id "$(BUILD_ID)" --origin "$(ORIGIN)" --evidence "$(EVIDENCE)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" --sha "$(SHA)" --receipt "$(RECEIPT)" $(if $(APPLE_TEAM_ID),--apple-team-id "$(APPLE_TEAM_ID)",) $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",)

mobile-readiness-e2e:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(DEVICE)" || (echo "DEVICE=<physical-ios-or-emulator-id> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-ipa-or-apk> is required" && exit 2)
	@test -n "$(BUILD_ID)" || (echo "BUILD_ID=<local-build-id> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	@test -n "$(RECEIPT)" || (echo "RECEIPT=<verified-build-receipt-json> is required" && exit 2)
	node scripts/mobile-readiness-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --build-id "$(BUILD_ID)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" --sha "$(SHA)" --receipt "$(RECEIPT)" --evidence "$(EVIDENCE)" $(if $(APPLE_TEAM_ID),--apple-team-id "$(APPLE_TEAM_ID)",) $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",)

maps-staging-e2e:
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	node scripts/maps-staging-e2e.mjs --api-url "$(API_URL)" --evidence "$(EVIDENCE)" $(if $(RAILWAY_DEPLOYMENT),--railway-deployment "$(RAILWAY_DEPLOYMENT)",) $(if $(VERCEL_DEPLOYMENT),--vercel-deployment "$(VERCEL_DEPLOYMENT)",)

gemini-staging-e2e:
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	node scripts/gemini-staging-e2e.mjs --api-url "$(API_URL)" --sha "$(SHA)" --evidence "$(EVIDENCE)" $(if $(RAILWAY_DEPLOYMENT),--railway-deployment "$(RAILWAY_DEPLOYMENT)",) $(if $(VERCEL_DEPLOYMENT),--vercel-deployment "$(VERCEL_DEPLOYMENT)",)

telemetry-staging-e2e:
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	node scripts/telemetry-staging-e2e.mjs --api-url "$(API_URL)" --sha "$(SHA)" --evidence "$(EVIDENCE)"

cumulative-readiness-evidence:
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(INPUT)" || (echo "INPUT=<sanitized-cumulative-input-json> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	node scripts/cumulative-readiness-evidence.mjs --api-url "$(API_URL)" --sha "$(SHA)" --input "$(INPUT)" --evidence "$(EVIDENCE)"

local-mobile-build:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(PROFILE)" || (echo "PROFILE=<EAS-profile> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<new-artifact-output-path> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(BUILD_ID)" || (echo "BUILD_ID=<sanitized-local-build-id> is required" && exit 2)
	@test -n "$(RECEIPT)" || (echo "RECEIPT=<new-receipt-json-path> is required" && exit 2)
	@test -n "$(INSPECTION_REPORT)" || (echo "INSPECTION_REPORT=<new-inspection-json-path> is required" && exit 2)
	node scripts/local-mobile-build.mjs --platform "$(PLATFORM)" --profile "$(PROFILE)" --sha "$(SHA)" --build-id "$(BUILD_ID)" --artifact "$(APP)" --inspection-report "$(INSPECTION_REPORT)" --receipt "$(RECEIPT)" $(if $(API_URL),--api-url "$(API_URL)",) $(if $(SUPABASE_URL),--supabase-url "$(SUPABASE_URL)",) $(if $(LINK_HOST),--link-host "$(LINK_HOST)",) $(if $(APPLE_TEAM_ID),--apple-team-id "$(APPLE_TEAM_ID)",) $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",)

mobile-account-e2e:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(DEVICE)" || (echo "DEVICE=<simulator-or-emulator-id> is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(BUILD_ID)" || (echo "BUILD_ID=<EAS-build-id> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-directory> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(RECEIPT)" || (echo "RECEIPT=<verified-build-receipt-json> is required" && exit 2)
	@test "$(PLATFORM)" != "android" -o -n "$(ANDROID_FINGERPRINT)" || (echo "ANDROID_FINGERPRINT=<expected-sha256> is required" && exit 2)
	node scripts/mobile-auth-e2e.mjs --platform "$(PLATFORM)" --device "$(DEVICE)" --app "$(APP)" --build-id "$(BUILD_ID)" --evidence "$(EVIDENCE)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" --sha "$(SHA)" --receipt "$(RECEIPT)" --link-host "$(if $(LINK_HOST),$(LINK_HOST),links.table-us.com)" $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) --start-phase "returning-send"

inspect-mobile-auth:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	@test -n "$(LINK_HOST)" || (echo "LINK_HOST=links.table-us.com is required" && exit 2)
	@test "$(PLATFORM)" != "android" -o -n "$(ANDROID_FINGERPRINT)" || (echo "ANDROID_FINGERPRINT=<expected-sha256> is required" && exit 2)
	node scripts/inspect-mobile-auth-artifact.mjs --platform "$(PLATFORM)" --artifact "$(APP)" --sha "$(SHA)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" --link-host "$(LINK_HOST)" $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",) $(if $(INSPECTION_REPORT),--output "$(INSPECTION_REPORT)",)

inspect-mobile-local-e2e:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-or-apk> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test "$(PLATFORM)" != "android" -o -n "$(ANDROID_FINGERPRINT)" || (echo "ANDROID_FINGERPRINT=<expected-sha256> is required" && exit 2)
	node scripts/inspect-mobile-local-e2e-artifact.mjs --platform "$(PLATFORM)" --artifact "$(APP)" --sha "$(SHA)" $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",) $(if $(INSPECTION_REPORT),--output "$(INSPECTION_REPORT)",)

inspect-mobile-links:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-ipa-or-apk> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	@test -n "$(LINK_HOST)" || (echo "LINK_HOST=links.table-us.com is required" && exit 2)
	@test "$(PLATFORM)" != "ios" -o -n "$(APPLE_TEAM_ID)" || (echo "APPLE_TEAM_ID=<expected-team-id> is required" && exit 2)
	@test "$(PLATFORM)" != "android" -o -n "$(ANDROID_FINGERPRINT)" || (echo "ANDROID_FINGERPRINT=<expected-sha256> is required" && exit 2)
	node scripts/inspect-mobile-links-artifact.mjs --platform "$(PLATFORM)" --artifact "$(APP)" --sha "$(SHA)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" --link-host "$(LINK_HOST)" $(if $(APPLE_TEAM_ID),--apple-team-id "$(APPLE_TEAM_ID)",) $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",) $(if $(INSPECTION_REPORT),--output "$(INSPECTION_REPORT)",)

inspect-mobile-readiness:
	@test -n "$(PLATFORM)" || (echo "PLATFORM=ios or PLATFORM=android is required" && exit 2)
	@test -n "$(APP)" || (echo "APP=<path-to-app-ipa-or-apk> is required" && exit 2)
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(API_URL)" || (echo "API_URL=<HTTPS-staging-api> is required" && exit 2)
	@test -n "$(SUPABASE_URL)" || (echo "SUPABASE_URL=<HTTPS-staging-supabase> is required" && exit 2)
	@test -n "$(LINK_HOST)" || (echo "LINK_HOST=links.table-us.com is required" && exit 2)
	@test "$(PLATFORM)" != "ios" -o -n "$(APPLE_TEAM_ID)" || (echo "APPLE_TEAM_ID=<expected-team-id> is required" && exit 2)
	@test "$(PLATFORM)" != "android" -o -n "$(ANDROID_FINGERPRINT)" || (echo "ANDROID_FINGERPRINT=<expected-sha256> is required" && exit 2)
	node scripts/inspect-mobile-readiness-artifact.mjs --platform "$(PLATFORM)" --artifact "$(APP)" --sha "$(SHA)" --api-url "$(API_URL)" --supabase-url "$(SUPABASE_URL)" --link-host "$(LINK_HOST)" $(if $(APPLE_TEAM_ID),--apple-team-id "$(APPLE_TEAM_ID)",) $(if $(ANDROID_FINGERPRINT),--android-fingerprint "$(ANDROID_FINGERPRINT)",) $(if $(FORBIDDEN_ORIGINS),--forbidden-origins "$(FORBIDDEN_ORIGINS)",) $(if $(INSPECTION_REPORT),--output "$(INSPECTION_REPORT)",)

perf:
	./scripts/perf-budget.sh

ai-eval:
	cd backend && .venv/bin/python scripts/ai_eval.py

ai-eval-live:
	@test -n "$(SHA)" || (echo "SHA=<exact-candidate-sha> is required" && exit 2)
	@test -n "$(EVIDENCE)" || (echo "EVIDENCE=<sanitized-output-dir> is required" && exit 2)
	cd backend && .venv/bin/python scripts/ai_eval.py --live --sha "$(SHA)" --evidence "$(abspath $(EVIDENCE))"

ready: lint typecheck test contract build smoke perf
