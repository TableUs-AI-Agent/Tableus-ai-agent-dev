# Verified staging deployment — c5b041c

Application source: `c5b041c85f4f7b959436c13bef48c959622c624f`.
Branch: `codex/astra-project-reassessment`.
Owner approval and verification date: 2026-09-12 America/Chicago
(2026-09-13 UTC in provider receipts).

The owner approved this exact source's push, CI, and deployment to the existing
Railway staging and Vercel Preview targets. The source is pushed. The
[sanitized receipt](staging-deployment.json) records the operations and checks.

| Surface | Result | Evidence |
| --- | --- | --- |
| GitHub CI | Success | [Run 34728044149](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/34728044149): 197 JavaScript, 101 Python, four browser tests; seven deterministic AI cases; all three Postgres migration assertions ran |
| Railway staging API | SUCCESS; public readiness reports this exact SHA | Deployment `dcccd4a1-cca7-489b-9d7d-81e4019aad0c`; [readiness](https://api-staging-3795.up.railway.app/health/ready) |
| Vercel Preview | READY; Git source matches; Next.js build completed in about 216 seconds | Deployment `dpl_9zGVqXpFNQkCzSXBaecR18hqMs2M`; [Preview](https://tableus-staging-3e0h7umke-briancheis-projects.vercel.app) |
| API CORS | All four intended exact origins accepted; unrelated origin rejected | Anonymous OPTIONS requests for both existing origins and both new Preview URLs |

The first browser preflight rejected the new Preview URL. The staging API's
existing `ALLOWED_ORIGINS` entry now retains both previous origins and adds the
new immutable Preview URL and its branch alias. Redeploying the same Git commit
applied that correction. No wildcard origin was added.

Existing source-stamp entries were updated before the accepted deployments:
Railway `TABLEUS_BUILD_SHA`/`TABLEUS_SOURCE_SHA`, and Vercel Preview
`TABLEUS_BUILD_SHA`/`NEXT_PUBLIC_SOURCE_SHA`. The push-triggered automatic
Preview preceded those updates; the accepted Preview was explicitly rebuilt
from the same Git SHA. Vercel production target/aliases, deployment protection
and every other project environment entry match the pre-deployment snapshot.

Railway's deployment metadata retains the connected service's `main` branch
label. The deployment API received an explicit `commitSha`; returned
`commitHash` and public `build_sha` both equal `c5b041c`. No merge was performed.

These checks used CI results, deployment metadata/build logs, public readiness
and anonymous CORS preflights. The Preview retains Vercel deployment protection.
There was no interactive hosted auth journey, new provider evaluation, email,
OTP, native build, security-plugin scan, resource/credential creation,
production deployment or store submission. CI used deterministic providers.

The subsequent [native verification](native/README.md) accepted all six artifact
pairs and passed deterministic lifecycle/offline journeys on iOS and Android.
Canonical fallback, physical/live-session observations, telemetry delivery,
security-evidence acceptance and cumulative sign-off remain outstanding.
Historical `daa89a0` smoke and `069473c` scan reports keep their original source
associations.

Raw operational metadata and logs remain in the private ignored `.artifacts/`
directory; the receipt includes log digests. This evidence/status descendant
stays local so publishing documentation cannot automatically replace the
verified application Preview. The remote and deployed application SHA remains
`c5b041c`.
