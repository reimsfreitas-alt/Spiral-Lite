# Spiral Lite — Next Operational Gates

## Current truth

Spiral Lite is governed recovery infrastructure. It decides whether an opportunity may be reapproached, authorizes only within policy, and records what happened. It does not guarantee revenue or response.

## Tomorrow-risk register

1. **Stateless opt-out** — request-level `opted_out` is not a global identity-level opt-out registry. Do not treat it as production compliance.
2. **Duplicate ingest** — `source_ref` must become a persistent unique key per tenant/channel/opportunity before real dispatch.
3. **TOCTOU** — authorization must be rechecked immediately before execution, atomically with opt-out and opportunity locks.
4. **Expiry** — authorization must expire and be rejected at execution time, not only when issued.
5. **Webhook ordering** — duplicate/out-of-order provider events need unique event IDs and monotonic transitions.
6. **Observation** — SENT/EXECUTED is not evidence of response; response evidence must come from an observer.
7. **Human review** — approval must be immutable, attributable and bound to the exact opportunity/policy snapshot.

## P0 gates

- Persistent tenant-scoped opt-out table.
- Persistent unique source_ref/idempotency constraint.
- Authorization expiry + scope binding + execution-time recheck.
- Atomic opportunity/identity locking around READY → EXECUTED.
- Webhook signature verification and provider_event_id deduplication.
- LOG_ONLY end-to-end test before enabling any real WhatsApp adapter.
- Real Meta/WhatsApp integration only after the governed chain passes in sandbox/controlled production.

## Decision rule

Do not add channels before closing identity, authorization, idempotency and observation gaps.
