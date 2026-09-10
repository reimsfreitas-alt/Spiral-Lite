# Operação Caixa 72h — Governed Recovery

## Status
Operated service. Not a self-service SaaS.

## Offer
**Spiral Governed Recovery — Diagnóstico Operado 5k**

- R$1.500 fixed
- 14 days
- up to 5,000 leads
- delivery target: 24 business hours
- no WhatsApp sending
- no Meta Lead Ads integration
- client executes approved contacts in its own CRM

## Input
CSV with mandatory columns:
`lead_id,phone,email,created_at,source_ref`

Optional suppression columns:
`opted_out,global_opt_out,email_opt_out,phone_opt_out`

## Deterministic rules
1. `GLOBAL_OPT_OUT` — explicit opt-out blocks the row.
2. `DUPLICATE` — repeated source reference or normalized identity blocks the row.
3. `OUT_OF_WINDOW` — created outside 15–45 days blocks the row.
4. Otherwise `AUTHORIZED` with a 10-minute envelope expiry.

The service does not infer delivery, read, reply, ban, lawsuit, or recovered revenue.

## Artifacts
- `authorized.csv`
- `blocked.csv`
- `ledger.html`
- `receipt.json`

## Integrity
The ledger is hash-chained. The receipt is signed with Ed25519 at processing time and contains the public key needed for verification.

This first operational version generates a fresh signing key per diagnostic. Persistent organizational key management belongs to the production hardening stage and is deliberately not represented as complete.

## Commercial boundary
A blocked row means that the current policy did not authorize contact. It does **not** prove that contacting the lead would have caused a ban or legal action.

If a provider has already accepted a message before a later opt-out reaches the system, Spiral cannot retroactively guarantee non-delivery. The service governs and records decisions; it does not rewrite external history.

## Next gate
Do not add Meta/WhatsApp/CRM execution until the first paid diagnostics establish demand and the execution P0 has been independently hardened.
