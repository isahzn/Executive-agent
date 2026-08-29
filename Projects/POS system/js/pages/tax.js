import { getClients } from '../core/store.js';
import { visibleClients, can, canEditModule } from '../core/auth.js';
import { moneyK, money, esc } from '../core/utils.js';
import { statusPill, emptyState, toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  if(!can('tax.view')){
    root.innerHTML = emptyState('tax','No access','You do not have permission to view tax data.');
    return;
  }
  const clients = visibleClients();
  const returns = clients.flatMap(c => (c.tax.returns||[]).map(r => ({ ...r, client:c.name, clientId:c.id })));
  const taxDue = clients.reduce((s,c)=>s+c.tax.estimatedPayable,0);
  const filed = clients.filter(c => c.tax.returnStatus==='Filed').length;
  const atRisk = clients.filter(c => c.status==='bad').length;
  const canGen = can('tax.generateReports') || canEditModule('tax');

  const scopeNote = '';
  root.innerHTML = `
    <div class="report-kpis" style="margin-bottom:12px">
      <div class="report-kpi"><small>Total Tax Due</small><b>${moneyK(taxDue)}</b></div>
      <div class="report-kpi"><small>Returns Due</small><b>${returns.length}</b></div>
      <div class="report-kpi"><small>Returns Filed</small><b>${Math.round(filed/clients.length*100)}%</b></div>
      <div class="report-kpi"><small>Clients At Risk</small><b>${atRisk}</b></div>
    </div>
    <div class="card">
      <div class="card-title"><h3>Tax Returns</h3>
        ${canGen?`<button class="btn primary sm" data-act="gen">${icon('reports',13)} Generate Tax Report</button>`:''}</div>
      <div class="toolbar" style="margin-bottom:10px">
        <input class="input" id="taxQ" placeholder="Search client or return..." style="width:260px">
        <select class="select" id="taxStatus"><option value="">All statuses</option><option>ok</option><option>warn</option><option>bad</option><option>neutral</option></select>
      </div>
      <div id="taxList"></div>
      <div class="note">All tax figures are fictional demo data. This prototype does not provide legal or tax advice.</div>
    </div>`;

  renderList(root);
  root.querySelector('#taxQ').oninput = ()=>renderList(root);
  root.querySelector('#taxStatus').onchange = ()=>renderList(root);
  const gen = root.querySelector('[data-act=gen]');
  if(gen) gen.onclick = () => toast('success','Tax report generated (demo)');
}

function renderList(root){
  const el = root.querySelector('#taxList');
  if(!el) return;
  const clients = visibleClients();
  const q = root.querySelector('#taxQ').value.toLowerCase();
  const st = root.querySelector('#taxStatus').value;
  let rows = clients.flatMap(c => (c.tax.returns||[]).map(r => ({ ...r, client:c.name, clientId:c.id })));
  if(q) rows = rows.filter(r => r.client.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
  if(st) rows = rows.filter(r => r.status === st);
  if(!rows.length){ el.innerHTML = emptyState('tax','No returns','No tax returns match the selected filters.'); return; }
  el.innerHTML = `<table><thead><tr><th>CLIENT</th><th>RETURN</th><th>PERIOD</th><th>AMOUNT</th><th>DUE</th><th>STATUS</th></tr></thead><tbody>
    ${rows.map(r=>`<tr><td><b>${esc(r.client)}</b></td><td>${r.name}</td><td>${r.period}</td><td class="numeric">${money(r.amount)}</td><td>${r.due.slice(5)}</td><td>${statusPill(r.status, r.status==='bad'?'Action required':r.status==='warn'?'Review':r.status==='ok'?'Ready':'Filed')}</td></tr>`).join('')}
  </tbody></table>`;
}
