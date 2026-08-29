import { getClients } from '../core/store.js';
import { visibleClients, can, canEditModule } from '../core/auth.js';
import { money, esc } from '../core/utils.js';
import { statusPill, emptyState } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  if(!can('accounting.view')){
    root.innerHTML = emptyState('accounting','No access','You do not have permission to view accounting data.');
    return;
  }
  const clients = visibleClients();
  const ledger = clients.flatMap(c => c.transactions.map(t => ({ ...t, client:c.name, clientId:c.id })));
  const canEdit = canEditModule('accounting');

  root.innerHTML = `
    <div class="toolbar">
      <div class="search-wrap"><input class="input" id="accQ" placeholder="Search transactions..." style="width:280px"></div>
      <select class="select" id="accClient"><option value="">All clients</option>${clients.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
      <select class="select" id="accStatus"><option value="">All statuses</option><option>cleared</option><option>pending</option></select>
      <input type="date" class="input" id="accFrom" style="width:150px">
      <input type="date" class="input" id="accTo" style="width:150px">
      <div class="spacer"></div>
      <button class="btn sm" data-act="export">${icon('download',13)} Export</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="accList"></div></div>
    <div class="note" style="margin-top:10px">${canEdit?'You can record transactions per-client from the Client workspace.':'View only — input transactions require accounting permission.'}</div>`;

  renderList(root);
  root.querySelector('#accQ').oninput = ()=>renderList(root);
  root.querySelector('#accClient').onchange = ()=>renderList(root);
  root.querySelector('#accStatus').onchange = ()=>renderList(root);
  root.querySelector('#accFrom').onchange = ()=>renderList(root);
  root.querySelector('#accTo').onchange = ()=>renderList(root);
  root.querySelector('[data-act=export]').onclick = ()=>null;
}

function renderList(root){
  const el = root.querySelector('#accList');
  const clients = visibleClients();
  const q = root.querySelector('#accQ').value.toLowerCase();
  const cid = root.querySelector('#accClient').value;
  const status = root.querySelector('#accStatus').value;
  const from = root.querySelector('#accFrom').value;
  const to = root.querySelector('#accTo').value;

  let rows = clients.flatMap(c => c.transactions.map(t => ({ ...t, client:c.name, clientId:c.id })));
  rows = rows.filter(t =>
    (!q || t.description.toLowerCase().includes(q) || t.account.toLowerCase().includes(q) || t.client.toLowerCase().includes(q)) &&
    (!cid || t.clientId === cid) &&
    (!status || t.status === status) &&
    (!from || t.date >= from) &&
    (!to || t.date <= to));

  if(!rows.length){ el.innerHTML = emptyState('accounting','No transactions','No transactions match the selected filters.'); return; }
  el.innerHTML = `<table><thead><tr><th>DATE</th><th>CLIENT</th><th>DESCRIPTION</th><th>ACCOUNT</th><th>DEBIT</th><th>CREDIT</th><th>STATUS</th></tr></thead><tbody>
    ${rows.map(t=>`<tr><td>${t.date.slice(5)}</td><td><b>${esc(t.client)}</b></td><td>${esc(t.description)}</td><td>${esc(t.account)}</td><td class="numeric">${t.debit?money(t.debit):'—'}</td><td class="numeric">${t.credit?money(t.credit):'—'}</td><td>${statusPill(t.status==='cleared'?'ok':'warn', t.status)}</td></tr>`).join('')}
  </tbody></table>`;
}
