export const runtime = 'edge';

type Input = {
  payload?: unknown;
  channel?: unknown;
  opportunity_id?: unknown;
  tenant_id?: unknown;
  dormant_days?: unknown;
  opted_out?: unknown;
};

const channels = new Set(['whatsapp', 'email', 'webhook']);
const POLICY_VERSION = 'lite-policy-v1';
const WINDOW_DAYS = { min: 15, max: 45 };

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  const started = performance.now();
  try {
    const body = (await request.json()) as Input;
    const payload = typeof body.payload === 'string' ? body.payload.trim() : '';
    const channel = typeof body.channel === 'string' ? body.channel : '';
    const tenant = typeof body.tenant_id === 'string' && body.tenant_id ? body.tenant_id : 'demo';
    const opportunityId = typeof body.opportunity_id === 'string' && body.opportunity_id
      ? body.opportunity_id
      : await digest(`${tenant}|${channel}|${payload}`);
    const dormantDays = typeof body.dormant_days === 'number' ? body.dormant_days : null;
    const optedOut = body.opted_out === true;

    if (!payload) return Response.json({ success: false, error: 'Payload vazio.' }, { status: 400 });
    if (!channels.has(channel)) return Response.json({ success: false, error: 'Canal não permitido.' }, { status: 400 });

    const idempotencyKey = await digest(`${tenant}|${opportunityId}|${channel}`);
    const normalized = { state: 'NORMALIZED', tenant_id: tenant, opportunity_id: opportunityId, channel };

    if (optedOut) {
      return Response.json({ success: true, mode: 'LOG_ONLY', ...normalized, state: 'POLICY_BLOCKED', decision: 'BLOCKED', reason: 'OPT_OUT', policy_version: POLICY_VERSION, idempotency_key: idempotencyKey });
    }
    if (dormantDays !== null && (dormantDays < WINDOW_DAYS.min || dormantDays > WINDOW_DAYS.max)) {
      return Response.json({ success: true, mode: 'LOG_ONLY', ...normalized, state: 'INELIGIBLE', decision: 'BLOCKED', reason: 'OUTSIDE_REAPPROACH_WINDOW', policy_version: POLICY_VERSION, idempotency_key: idempotencyKey });
    }

    const authorization = await digest(`${tenant}|${opportunityId}|${channel}|${POLICY_VERSION}|${idempotencyKey}`);
    const eventHash = await digest(`POLICY_CHECK|${opportunityId}|${idempotencyKey}|${authorization}`);
    return Response.json({
      success: true,
      mode: 'LOG_ONLY',
      ...normalized,
      state: 'AUTHORIZED',
      decision: 'AUTHORIZED',
      policy_version: POLICY_VERSION,
      authorization: { status: 'ISSUED', binding: authorization, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() },
      ledger_event: { type: 'AUTHORIZATION_ISSUED', hash: eventHash },
      idempotency_key: idempotencyKey,
      channel,
      latency_ms: Number((performance.now() - started).toFixed(2))
    });
  } catch {
    return Response.json({ success: false, error: 'Payload inválido.' }, { status: 400 });
  }
}
