# Spiral Lite — Gemini Excellence Build Brief

## Mission
Transform the existing Spiral Lite into an exceptional product and operating system without changing the product thesis.

## Product boundary
Spiral Lite is governed recovery infrastructure for stalled commercial opportunities. It is not a CRM, generic chatbot, mass sender, lead-generation product, or consulting service.

Core invariant:
`OPPORTUNITY → POLICY → AUTHORIZATION → EXECUTION → OBSERVATION → VERIFICATION → RECEIPT`

Never collapse these states:
- STAGED != SENT
- SENT != OBSERVED
- OBSERVED != VERIFIED
- APPROVED must represent an actual human approval event

## P0 engineering requirements
- Real tenant isolation at every data boundary.
- Explicit tenant timezone; never use process timezone implicitly.
- Idempotency keys enforced at persistence boundary.
- Concurrency-safe execution claiming.
- Replay protection.
- Permanent opt-out semantics.
- Human approval represented as a persisted event and required before approval-gated execution.
- Append-only audit ledger with safe concurrent append semantics.
- Independent observer; executor cannot self-attest.
- Deterministic verifier with CONFIRMED / DEVIATED / INCONCLUSIVE / BLOCKED / PENDING_REVIEW.
- No external integration may be represented as REAL unless credentials + webhook + production path have been tested.
- Every DEMO/SIMULATION must be explicitly labelled.
- Add adversarial tests for replay, double execution, stale approval, tenant escape, timezone boundary, opt-out race, observer/executor disagreement, and ledger integrity.

## Operating System UX
Build a premium OS surface with:
Overview, Recovery Queue, Policies, Authorizations, Executions, Observations, Verifications, Evidence/Ledger, Settings.

Every opportunity must have a readable evidence timeline:
original opportunity → policy decision → authorization → execution claim → independent observation → verifier comparison → receipt.

Use obsidian/graphite/warm gold, restrained typography, technical precision, human warmth. Avoid generic SaaS dashboards, excessive cards, gradients, fake metrics and startup clichés.

## Landing
The landing must feel like an instrument, not a template.
Hero: one precise sentence + product proof above the fold + one primary CTA.
Show the mechanism visually.
Show the distinction between CRM, channel and Spiral Lite.
Show boundaries and honest production status.
Show the OS, not only marketing copy.
Mobile must be first-class.
PT-BR first, EN second; preserve clean i18n architecture.
SEO, OpenGraph, accessibility, reduced motion, semantic HTML, keyboard navigation and fast load.

## Demo
Use fictional records and mock providers only. Demonstrate both a confirmed and a deviated path. The UI must make it impossible to confuse execution claim with external evidence.

## Commercial rule
Do not invent ROI, testimonials, customer counts or production integrations. Sell the mechanism and the evidence.

## Deliverables
1. Production-quality code.
2. Tests for P0 invariants.
3. Exceptional landing.
4. Exceptional OS UI.
5. README with REAL / DEMO / ROADMAP status.
6. Architecture diagram in Markdown.
7. Threat model.
8. Deployment checklist.
9. No new product category. This is Spiral Lite excellence work.
