# Spiral Lite — Production Readiness Gate

## Current verdict

**PILOT READY candidate; not yet production-ready SaaS.**

## Non-negotiable state semantics

`STAGED != SENT != DELIVERED != READ != REPLIED != QUALIFIED != CONVERTED`

The system must never infer a stronger state from a weaker event.

## Governance chain

`LEAD → RECOVERY CANDIDATE → POLICY → AUTHORIZATION → MESSAGE → OBSERVATION → VERIFICATION → OUTCOME`

## P0/P1 controls

- server-side authorization enforcement;
- tenant isolation on every read/write;
- deterministic phone/email normalization;
- idempotency under retries and concurrent requests;
- human approval must require an actual approved state;
- permanent opt-out/suppression must be enforced before execution;
- provider timeout-after-success must not be represented as confirmed delivery without independent evidence;
- webhook authenticity and replay protection must be verified;
- Ledger writes must be concurrency-safe and tamper-evident;
- UTC must be used for persisted timestamps; business timezone must be explicit per tenant/policy.

## Demo boundary

If WhatsApp, Meta Lead Ads, CRM or other provider integration is mocked, the interface must show `DEMO` / `MOCK PROVIDERS ACTIVE` and must not imply real-world recovery results.

## Commercial gate

The first commercial motion should be a tightly scoped pilot with a measurable input, explicit policy, evidence output and clear handoff to the production integration. Do not claim production SaaS status until external credentials, persistence, tenant isolation, webhooks and end-to-end observation are validated in the target environment.
