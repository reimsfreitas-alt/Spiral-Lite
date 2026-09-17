# P0 COMMISSION — REBASE ON DISTRIBUTION ENGINE / NO DEMO

## READ THIS FIRST

This is the canonical instruction for the Claude engineering agent working on Spiral Lite.

Canonical execution repository:
`reimsfreitas-alt/spiral-distribution-engine`

This Lite repository is NOT to become a second execution engine.

## Mission

Preserve Spiral Lite as the governed-recovery customer application while delegating real execution to Distribution Engine.

Canonical architecture:

SPIRAL OS
  INTENT
    -> AUTHORIZATION
      -> DISTRIBUTION ENGINE
        -> REAL EXTERNAL CHANNEL
          -> OBSERVATION
            -> TRUTH / EVIDENCE

LITE sits on top as the recovery application.

Policy is an internal mechanism, NOT a separate product.

## Non-negotiable

- No fake/mock/simulated success.
- Provider without valid credentials/configuration must show `NOT CONFIGURED` and block execution.
- Preserve state semantics: `STAGED != SENT != DELIVERED != READ != REPLIED != QUALIFIED != CONVERTED`.
- Delegate real execution to Distribution Engine.
- Preserve server-side authorization, tenant isolation, idempotency, opt-out/suppression, persistence, observation and evidence requirements.
- Keep Truth as the verification/evidence layer.

## Customer flow

LEAD -> RECOVERY CANDIDATE -> ELIGIBILITY/POLICY -> AUTHORIZATION -> MESSAGE -> EXECUTION -> OBSERVATION -> VERIFICATION -> OUTCOME

The customer should see a simple recovery workflow. The infrastructure underneath must be real.

## Commercial gate

Do not ship a cosmetic/demo-only revision. The resulting product must be deployable and commercially honest. If a real provider is not configured, block execution rather than pretending it succeeded.

## Required final report

Return:
- LIVE;
- NOT CONFIGURED;
- BLOCKED;
- real provider selected;
- request -> execution -> observation -> evidence;
- E2E tests;
- production URL;
- remaining external dependencies.

Screenshots are not proof of execution.
