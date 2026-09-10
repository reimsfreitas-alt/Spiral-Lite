import { createHash, generateKeyPairSync, sign } from 'node:crypto';

type Lead = Record<string, string>;
export type Decision = 'AUTHORIZED' | 'BLOCKED';
export type BlockReason = 'OUT_OF_WINDOW' | 'GLOBAL_OPT_OUT' | 'DUPLICATE' | 'FREQUENCY';

export type ProcessedLead = Lead & {
  identity_hash: string;
  source_ref_hash: string;
  decision: Decision;
  authorization_envelope_id?: string;
  expires_at?: string;
  policy_version: string;
  block_reason?: BlockReason;
};

export type RecoveryResult = {
  authorized: ProcessedLead[];
  blocked: ProcessedLead[];
  ledger: LedgerEvent[];
  receipt: Record<string, unknown>;
};

const POLICY_VERSION = 'governed-recovery-v1';
const WINDOW_MIN_DAYS = 15;
const WINDOW_MAX_DAYS = 45;

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}
function normalize(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, '');
}
function truthy(value: string | undefined): boolean {
  return ['1', 'true', 'yes', 'sim', 'y'].includes(normalize(value));
}
function identityKey(row: Lead): string {
  const email = normalize(row.email);
  const phone = normalize(row.phone).replace(/[^0-9+]/g, '');
  return `${email}|${phone}`;
}
function sourceKey(row: Lead): string {
  return normalize(row.source_ref || row.lead_id);
}

export function parseCsv(csv: string): Lead[] {
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV vazio ou sem linhas de dados.');
  const headers = lines[0].split(',').map(h => h.trim());
  const required = ['lead_id', 'phone', 'email', 'created_at', 'source_ref'];
  for (const field of required) if (!headers.includes(field)) throw new Error(`Coluna obrigatória ausente: ${field}`);
  return lines.slice(1).map(line => {
    const cells: string[] = [];
    let current = ''; let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') quoted = !quoted;
      else if (ch === ',' && !quoted) { cells.push(current); current = ''; }
      else current += ch;
    }
    cells.push(current);
    return Object.fromEntries(headers.map((h, i) => [h, (cells[i] ?? '').replace(/^"|"$/g, '').trim()]));
  });
}

function csvEscape(value: unknown): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export function toCsv(rows: Lead[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [headers.join(','), ...rows.map(r => headers.map(h => csvEscape(r[h])).join(','))].join('\n') + '\n';
}

export type LedgerEvent = { seq: number; event: string; lead_id: string; decision: Decision; reason?: string; ts: string; prev_hash: string; hash: string };

export function processRecovery(rows: Lead[], now = new Date()): RecoveryResult {
  const seenSource = new Set<string>();
  const seenIdentity = new Set<string>();
  const authorized: ProcessedLead[] = [];
  const blocked: ProcessedLead[] = [];
  const ledger: LedgerEvent[] = [];
  let prevHash = 'GENESIS';
  const nowMs = now.getTime();

  rows.forEach((row, index) => {
    const identityHash = sha256(identityKey(row));
    const sourceHash = sha256(sourceKey(row));
    const createdMs = Date.parse(row.created_at);
    const ageDays = Number.isFinite(createdMs) ? (nowMs - createdMs) / 86400000 : Infinity;
    const optedOut = truthy(row.opted_out) || truthy(row.global_opt_out) || truthy(row.email_opt_out) || truthy(row.phone_opt_out);
    let reason: BlockReason | undefined;
    if (optedOut) reason = 'GLOBAL_OPT_OUT';
    else if (seenSource.has(sourceHash) || seenIdentity.has(identityHash)) reason = 'DUPLICATE';
    else if (!Number.isFinite(createdMs) || ageDays < WINDOW_MIN_DAYS || ageDays > WINDOW_MAX_DAYS) reason = 'OUT_OF_WINDOW';

    seenSource.add(sourceHash);
    seenIdentity.add(identityHash);
    const base = { ...row, identity_hash: identityHash, source_ref_hash: sourceHash, policy_version: POLICY_VERSION } as ProcessedLead;
    if (reason) {
      const item = { ...base, decision: 'BLOCKED' as const, block_reason: reason };
      blocked.push(item);
      const body = JSON.stringify({ seq: index + 1, event: 'BLOCKED', lead_id: row.lead_id, decision: 'BLOCKED', reason, ts: now.toISOString(), prev_hash: prevHash });
      const hash = sha256(body); const event = { seq: index + 1, event: 'BLOCKED', lead_id: row.lead_id, decision: 'BLOCKED', reason, ts: now.toISOString(), prev_hash: prevHash, hash };
      ledger.push(event); prevHash = hash;
    } else {
      const expires = new Date(nowMs + 10 * 60 * 1000).toISOString();
      const envelope = sha256(`${sourceHash}|${identityHash}|${POLICY_VERSION}|${expires}`);
      const item = { ...base, decision: 'AUTHORIZED' as const, authorization_envelope_id: `env_${envelope.slice(0, 24)}`, expires_at: expires };
      authorized.push(item);
      const body = JSON.stringify({ seq: index + 1, event: 'AUTHORIZED', lead_id: row.lead_id, decision: 'AUTHORIZED', ts: now.toISOString(), prev_hash: prevHash });
      const hash = sha256(body); const event = { seq: index + 1, event: 'AUTHORIZED', lead_id: row.lead_id, decision: 'AUTHORIZED', ts: now.toISOString(), prev_hash: prevHash, hash };
      ledger.push(event); prevHash = hash;
    }
  });

  const receiptBody = { schema: 'spiral-governed-recovery-receipt-v1', policy_version: POLICY_VERSION, total: rows.length, authorized: authorized.length, blocked: blocked.length, ledger_head: prevHash, generated_at: now.toISOString() };
  const receiptCanonical = JSON.stringify(receiptBody);
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const signature = sign(null, Buffer.from(receiptCanonical), privateKey).toString('base64');
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  return { authorized, blocked, ledger, receipt: { ...receiptBody, receipt_hash: sha256(receiptCanonical), signature, public_key_pem: publicKeyPem, signature_algorithm: 'Ed25519' } };
}

export function ledgerHtml(events: LedgerEvent[], receipt: Record<string, unknown>): string {
  const rows = events.map(e => `<tr><td>${e.seq}</td><td>${e.event}</td><td>${e.lead_id}</td><td>${e.reason ?? ''}</td><td><code>${e.hash.slice(0, 20)}…</code></td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Spiral Governed Recovery Ledger</title><style>body{font-family:system-ui;background:#080808;color:#eee;padding:32px}table{width:100%;border-collapse:collapse}td,th{padding:9px;border-bottom:1px solid #292929;text-align:left;font-size:13px}code{color:#d6b56a}.ok{color:#9ad7b1}</style></head><body><h1>Spiral Governed Recovery</h1><p class="ok">Tamper-evident append-only ledger · ${events.length} events</p><p>Receipt hash: <code>${receipt.receipt_hash}</code></p><table><thead><tr><th>Seq</th><th>Event</th><th>Lead</th><th>Reason</th><th>Hash</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}
