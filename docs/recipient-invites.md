# Recipient-bound one-use invites

Local implementation for Brian's current development stage; this is not beta
activation or permission to issue/send invitations. Historical shared work keeps
its attribution. The public API shape and OTP flow are unchanged.

## Admission contract

- New trusted CLI issuance requires one email, normalized by the existing API
  validator (trim and lowercase), a single use, and expiry of 1–720 hours
  (default 168). No recipient change or multi-use switch is provided.
- `Invite.recipient_email_hash` stores SHA-256 of that normalized email. No new
  plaintext email is stored. This is pseudonymous and guessable for known emails,
  not anonymous or encrypted data. Existing private-schema access controls apply.
- Validation rejects wrong recipients with the same generic invalid-invite error,
  before reserving capacity. The matching recipient can renew its 20-minute
  reservation while the invite remains valid; no additional use is consumed.
- The signup hook checks a current matching reservation AND the current bound,
  unrevoked, unexpired, unconsumed one-use invite. It stays SECURITY INVOKER with
  empty search_path. Auth admin gets SELECT on invites and reservations and
  EXECUTE on the hook; browser roles and PUBLIC do not gain access.
- First application redemption independently checks the session email, token,
  current invite and reservation. Invite row locks serialize validation,
  redemption and trusted CLI revocation. One concurrent new account can consume
  the invitation; revocation committed first denies waiting redemption.
- Retrying a successful same-account redemption returns the profile without
  consuming another use. Existing approved accounts need no invite for sign-in;
  revoking the old invitation does not revoke account access. Full-deletion
  tombstones still prevent stale sessions from rejoining.
- Local demo unbound/multi-use fixtures remain compatible. Bound invites retain
  recipient and reservation checks even in demo mode. Hosted new intake fails
  closed for all legacy unbound/multi-use invites, including old unconsumed
  validation tokens. Existing approved legacy accounts remain usable.

The hook checks eligibility at its database snapshot. It does not reserve the
whole external Auth transaction or guarantee that revocation cancels an already
in-flight Auth creation. Application approval always rechecks at redemption;
an Auth session alone grants no application membership.

## Trusted issuance (requires an approved invitation scope)

From `backend/`, with the reviewed target and migration credentials configured:

```sh
.venv/bin/python scripts/invites.py create --expires-hours 168
.venv/bin/python scripts/invites.py list
.venv/bin/python scripts/invites.py revoke <invite-id>
```

Create prompts privately for the recipient; if hidden entry is unavailable, it
fails closed. Automation may use `--recipient-email-stdin` with one email from a
private input source and EOF. Do not place a real email in command arguments or
shell history. The code is printed once; direct stdout to approved private storage
and share only with its intended recipient. The CLI performs no email delivery.
If stdout delivery fails after commit, inspect metadata and revoke/reissue within
scope; do not assume creation rolled back. List never emits recipient hash/email
or code. It reports recipient binding, hosted eligibility and legacy replacement
need separately from expiry/revocation/redemption status. Protect the separate
approved roster-to-invite-ID mapping; this command is not a recipient directory.

## Migration and controlled rollout

Migration `d48f6c2ab913` follows `ab72e4f39d10`, adds the nullable hash and a check
that bound rows have max_uses=1, and replaces the signup hook. It preserves legacy
invites, reservations and redemptions without guessing recipients, revoking rows
or granting access to a new person. Downgrade restores predecessor hook admission
and drops recipient binding; it weakens intake and is not a safe live-cohort
rollback while invitations are open.

Before any hosted operation:

1. Approve exact application source, target, migration/rollout window and recovery
   limits. Coordinate with the existing native validation task before replacing
   any shared API or Auth hook it uses.
2. Inventory current invite IDs/status and the approved private recipient roster.
   Identify unused legacy invitations and in-flight onboarding. Existing approved
   memberships need no reissue. New replacement issuance/sends require explicit
   scope; nothing here authorizes mass issuance.
3. Quiesce new intake and old API writers. Apply the reviewed migration with the
   migration role, deploy compatible API/CLI, verify actual Auth-admin grants,
   private exposed-schema settings and configured hook, then approve reopening.
   Migration alone cannot constrain an older API's legacy redemption behavior.
4. Validate intended recipient, mismatch, revoke/expiry, one-use contention,
   successful retry and returning sign-in on the affected exact release candidate.
   Local synthetic PostgreSQL proof is not hosted Auth or mobile acceptance.
5. If rollout fails, keep intake closed. Preserve recipient records and use a
   reviewed forward fix or closed-intake rollback; do not silently reactivate
   unbound codes by downgrading.

## Remaining boundaries

No real invite, email, Auth operation, native run, hosted migration, deployment,
merge or beta activation occurred. Invitation capacity is per code, not a global
participant ceiling. A named cohort roster/cap, support/retention disclosure,
capability-link decision, production configuration and affected distributed-build
acceptance remain release gates. Email hashes on invite records are not cleared
by application-profile deletion; the broader invite/backup/log retention policy
is still unresolved and must not be represented as complete erasure.

Implementation follows the existing Alembic architecture. Current
[Supabase hook documentation](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook)
confirms the before-user-created contract. The public changelog was checked;
no relevant hook interface migration was identified. No hosted Supabase change
or advisor/scan was run.
