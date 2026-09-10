'use client';
import { useState } from 'react';

const CHECKOUT = 'https://buy.stripe.com/9B6cMYgr1awwekf3LRbbG06';

export default function Diagnostico() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ total:number; authorized:number; blocked:number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function diagnose() {
    if (!file) return;
    setBusy(true); setError(''); setResult(null);
    const form = new FormData(); form.append('file', file);
    try {
      const r = await fetch('/api/diagnostico', { method:'POST', body:form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Falha no diagnóstico.');
      setResult(data.summary);
      // The first 10 sales are intentionally operated manually. The API proves the deterministic core; delivery is controlled by Spiral.
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha no diagnóstico.'); }
    finally { setBusy(false); }
  }

  return <main className="page">
    <header className="nav"><div className="brand">SPIRAL <span>GOVERNED RECOVERY</span></div><div className="status">OPERATED SERVICE · 24H</div></header>
    <section className="hero">
      <div className="eyebrow">RECUPERAÇÃO GOVERNADA DE OPORTUNIDADES</div>
      <h1>Você já pagou pela aquisição.<br/><em>A perda acontece na retomada sem governança.</em></h1>
      <p className="lead">Envie um CSV de leads parados entre 15 e 45 dias. Em até 24h úteis, a Spiral separa o que pode ser contatado do que deve ser bloqueado — com um registro verificável do processo.</p>
      <div className="actions"><a className="primary" href={`${CHECKOUT}?utm_source=landing&utm_campaign=diag_72h`}>Comprar PoC · R$ 1.500</a><a className="secondary" href="#mecanismo">Ver mecanismo</a></div>
      <p className="micro">14 dias · até 5.000 leads · sem disparo · você executa no seu CRM · reembolso se não entregarmos em 24h úteis</p>
    </section>

    <section className="proof" id="mecanismo"><div><div className="eyebrow">O QUE VOCÊ RECEBE</div><h2>Três artefatos. Uma decisão auditável.</h2></div><div className="cards"><article><b>01</b><h3>authorized.csv</h3><p>Leads elegíveis, identity hash, policy version, envelope e expiração de 10 minutos.</p></article><article><b>02</b><h3>blocked.csv</h3><p>Bloqueios tipados: OUT_OF_WINDOW, GLOBAL_OPT_OUT, DUPLICATE ou FREQUENCY.</p></article><article><b>03</b><h3>ledger.html + receipt</h3><p>Histórico hash-chained e receipt criptográfico para inspeção posterior.</p></article></div></section>

    <section className="diagnostic"><div className="eyebrow">DIAGNÓSTICO GRATUITO</div><h2>Quer ver a sua base antes de comprar?</h2><p>Envie um CSV anonimizado. O mecanismo roda as regras determinísticas e mostra a composição do diagnóstico. Não enviamos nenhuma mensagem.</p><div className="upload"><input type="file" accept=".csv,text/csv" onChange={e=>setFile(e.target.files?.[0] ?? null)}/><button onClick={diagnose} disabled={!file || busy}>{busy ? 'ANALISANDO…' : 'ANALISAR CSV →'}</button></div>{error && <div className="error">{error}</div>}{result && <div className="result"><span><small>TOTAL</small><strong>{result.total}</strong></span><span><small>AUTORIZADOS</small><strong>{result.authorized}</strong></span><span><small>BLOQUEADOS</small><strong>{result.blocked}</strong></span></div>}</section>

    <section className="boundary"><div className="eyebrow">FRONTEIRAS</div><h2>O que não afirmamos.</h2><p>Não afirmamos que um lead bloqueado causaria ban ou processo. O diagnóstico identifica condições de política no CSV. Também não enviamos WhatsApp, não integramos Meta Lead Ads e não substituímos o CRM.</p><p className="strong">Se um provedor já recebeu uma mensagem antes de um opt-out chegar, nenhuma ferramenta pode garantir retroativamente que ela não será entregue. Governança reduz e registra o risco; não reescreve o passado.</p></section>

    <footer><span>SPIRAL CODES</span><span>DECIDE BEFORE ACTING · PROVE AFTER</span></footer>
    <a className="sticky" href={`${CHECKOUT}?utm_source=landing_mobile&utm_campaign=diag_72h`}>ATIVAR POС · R$ 1.500</a>
    <style jsx>{`*{box-sizing:border-box}.page{min-height:100vh;background:#070706;color:#f2efe8;font-family:Inter,system-ui,sans-serif}.nav{height:72px;border-bottom:1px solid #292720;display:flex;align-items:center;justify-content:space-between;padding:0 max(28px,calc((100vw - 1120px)/2));position:sticky;top:0;background:#070706ee;backdrop-filter:blur(10px);z-index:5}.brand{font-weight:800;letter-spacing:.16em;font-size:12px}.brand span{color:#d6b56a}.status,.eyebrow,.micro,footer{font:10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8b877d;letter-spacing:.12em}.status{color:#9bcfb0}.hero,.proof,.diagnostic,.boundary{max-width:1120px;margin:auto;padding:96px 28px}.hero{padding-top:112px}.eyebrow{margin-bottom:18px;color:#d6b56a}.hero h1{font-size:clamp(42px,6vw,76px);line-height:1.01;letter-spacing:-.045em;max-width:980px;margin:0}.hero em{font-style:normal;color:#bcb7ad}.lead{max-width:760px;font-size:19px;line-height:1.65;color:#aaa59b;margin:30px 0}.actions{display:flex;gap:12px;flex-wrap:wrap}.primary,.secondary,.upload button{display:inline-flex;padding:15px 20px;border:1px solid #d6b56a;text-decoration:none;font-weight:800;font-size:13px}.primary,.upload button{background:#d6b56a;color:#080705}.secondary{color:#eee;border-color:#3a372f}.micro{margin-top:18px;letter-spacing:.03em}.proof{border-top:1px solid #292720}.proof h2,.diagnostic h2,.boundary h2{font-size:34px;letter-spacing:-.025em;margin:0 0 26px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.cards article{border:1px solid #292720;background:#0b0b09;padding:25px;min-height:210px}.cards b{color:#d6b56a;font:11px ui-monospace,monospace}.cards h3{font-size:20px;margin:34px 0 12px}.cards p,.diagnostic p,.boundary p{color:#99958c;line-height:1.65;font-size:14px}.diagnostic{border-top:1px solid #292720}.upload{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0}.upload input{border:1px solid #302e29;padding:12px;background:#0b0b09;color:#aaa;max-width:100%}.upload button{cursor:pointer}.upload button:disabled{opacity:.45}.error{color:#e6a2a2;border:1px solid #5b3030;padding:12px}.result{display:flex;border:1px solid #292720;background:#0b0b09}.result span{flex:1;padding:22px;border-right:1px solid #292720}.result span:last-child{border-right:0}.result small{display:block;color:#777;font:10px ui-monospace,monospace}.result strong{display:block;font-size:30px;margin-top:8px}.boundary{border-top:1px solid #292720}.strong{color:#d0cbc0!important}.boundary{padding-bottom:130px}footer{border-top:1px solid #292720;padding:30px 28px;display:flex;justify-content:space-between;max-width:1120px;margin:auto}.sticky{display:none}@media(max-width:680px){.nav{height:60px;padding:0 16px}.status{display:none}.hero,.proof,.diagnostic,.boundary{padding:68px 18px}.hero{padding-top:76px}.hero h1{font-size:42px}.lead{font-size:17px}.cards{grid-template-columns:1fr}.cards article{min-height:auto}.result strong{font-size:24px}footer{padding:26px 18px;gap:12px;flex-direction:column}.sticky{display:block;position:fixed;bottom:0;left:0;right:0;height:64px;background:#d6b56a;color:#080705;text-align:center;padding:22px;font:800 12px ui-monospace,monospace;z-index:9;text-decoration:none}}`}</style>
  </main>;
}
