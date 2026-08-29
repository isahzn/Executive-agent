import { getClients } from '../core/store.js';
import { visibleClients, can, canEditModule } from '../core/auth.js';
import { moneyK, money, esc } from '../core/utils.js';
import { statusPill, emptyState, toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  if(!can('invoices.view')){
    root.innerHTML = emptyState('invoices','No access','You do not have permission to view invoices.');
    return;
  }
  const canCreate = can('invoices.create') || canEditModule('invoices');
  const clients = visibleClients();
  const total = clients.reduce((s,c)=>s+c.invoices.reduce((a,i)=>a+i.amount,0),0);
  const counts = { Paid:0, Pending:0, Overdue:0, Draft:0 };
  clients.forEach(c => c.invoices.forEach(i => counts[i.status] = (counts[i.status]||0)+1));

  root.innerHTML = `
    <div class="report-kpis" style="margin-bottom:12px">
      ${[['Total Billed',moneyK(total)],['Paid',counts.Paid||0],['Pending',counts.Pending||0],['Overdue',counts.Overdue||0]].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}
    </div>
    <div class="toolbar">
      <div class="search-wrap"><input class="input" id="invQ" placeholder="Search invoices..." style="width:280px"></div>
      <select class="select" id="invStatus"><option value="">All statuses</option><option>Paid</option><option>Pending</option><option>Overdue</option><option>Draft</option></select>
      <select class="select" id="invClient"><option value="">All clients</option>${clients.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
      <div class="spacer"></div>
      ${canCreate?`<button class="btn primary" data-act="create">${icon('plus',13)} Create Invoice</button>`:''}
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="invList"></div></div>
    <div class="note" style="margin-top:10px">${canCreate?'You can create invoices per-client.':'View only — creating invoices requires permission.'}</div>`;

  renderList(root);
  root.querySelector('#invQ').oninput = ()=>renderList(root);
  root.querySelector('#invStatus').onchange = ()=>renderList(root);
  root.querySelector('#invClient').onchange = ()=>renderList(root);
  const cr = root.querySelector('[data-act=create]');
  if(cr) cr.onclick = () => toast('info','Select a client from the dropdown to open their workspace and create an invoice.');
}

function renderList(root){
  const el = root.querySelector('#invList');
  const clients = visibleClients();
  const q = root.querySelector('#invQ').value.toLowerCase();
  const status = root.querySelector('#invStatus').value;
  const cid = root.querySelector('#invClient').value;
  let rows = clients.flatMap(c => c.invoices.map(i => ({ ...i, client:c.name, clientId:c.id })));
  rows = rows.filter(i =>
    (!q || i.number.toLowerCase().includes(q) || i.client.toLowerCase().includes(q)) &&
    (!status || i.status === status) &&
    (!cid || i.clientId === cid));
  if(!rows.length){ el.innerHTML = emptyState('invoices','No invoices','No invoices match the selected filters.'); return; }
  el.innerHTML = `<table><thead><tr><th>NUMBER</th><th>CLIENT</th><th>DATE</th><th>DUE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>
    ${rows.map(i=>`<tr><td><b>${i.number}</b></td><td>${esc(i.client)}</td><td>${i.date.slice(5)}</td><td>${i.due.slice(5)}</td><td class="numeric">${money(i.amount)}</td><td>${statusPill(i.status==='Paid'?'ok':i.status==='Overdue'?'bad':'warn', i.status)}</td></tr>`).join('')}
  </tbody></table>`;
}
