import { NextResponse } from 'next/server';
import { ledgerHtml, parseCsv, processRecovery, toCsv } from '../../../../lib/governed-recovery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Envie um arquivo CSV.' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'CSV acima do limite de 10 MB.' }, { status: 413 });
    const csv = await file.text();
    const rows = parseCsv(csv);
    if (rows.length > 5000) return NextResponse.json({ error: 'O diagnóstico desta oferta aceita até 5.000 leads.' }, { status: 400 });
    const result = processRecovery(rows);
    return NextResponse.json({
      ok: true,
      summary: { total: rows.length, authorized: result.authorized.length, blocked: result.blocked.length },
      artifacts: {
        authorized_csv: toCsv(result.authorized),
        blocked_csv: toCsv(result.blocked),
        ledger_html: ledgerHtml(result.ledger, result.receipt),
        receipt_json: JSON.stringify(result.receipt, null, 2),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível processar o CSV.' }, { status: 400 });
  }
}
