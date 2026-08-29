import { visibleClients, can, canEditModule } from '../core/auth.js';
import { money, esc } from '../core/utils.js';
import { statusPill, emptyState, toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  if(!can('expenses.view')){
    root.innerHTML = emptyState('expenses','No access','You do not have permission to view expenses.');
    return;
  }
  const canCreate = can('expenses.create') || canEditModule('expenses');
  const clients = visibleClients();
  const cats = ['Software','Travel','Training','Marketing','Logistics','Materials','Vehicle','Equipment','Inventory','Fuel','Other'];
  const all = clients.flatMap(c => c.expenses.map(e => ({ ...e, client:c.name, clientId:c.id })));
  const total = all.reduce((s,e)=>s+e.amount,0);
  const pending = all.filter(e => e.status==='Pending').length;

  root.innerHTML = `
    <div class="report-kpis" style="margin-bottom:12px">
      ${[['Total Expenses',money(total)],['Pending Approval',pending],['Approved',all.filter(e=>e.status==='Approved').length]].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}
    </div>
    <div class="toolbar">
      <div class="search-wrap"><input class="input" id="expQ" placeholder="Search expenses..." style="width:280px"></div>
      <select class="select" id="expCat"><option value="">All categories</option>${cats.map(c=>`<option>${c}</option>`).join('')}</select>
      <select class="select" id="expStatus"><option value="">All statuses</option><option>Approved</option><option>Pending</option><option>Rejected</option></select>
      <select class="select" id="expClient"><option value="">All clients</option>${clients.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
      <div class="spacer"></div>
      ${canCreate?`<button class="btn primary" data-act="create">${icon('plus',13)} Add Expense</button>`:''}
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="expList"></div></div>
    <div class="note" style="margin-top:10px">${canCreate?'You can log expenses per-client.':'View only — adding expenses requires permission.'}</div>`;

  renderList(root);
  root.querySelector('#expQ').oninput = ()=>renderList(root);
  root.querySelector('#expCat').onchange = ()=>renderList(root);
  root.querySelector('#expStatus').onchange = ()=>renderList(root);
  root.querySelector('#expClient').onchange = ()=>renderList(root);
  const cr = root.querySelector('[data-act=create]');
  if(cr) cr.onclick = () => toast('info','Select a client from the dropdown to open their workspace and add an expense.');
}

function renderList(root){
  const el = root.querySelector('#expList');
  const clients = visibleClients();
  const q = root.querySelector('#expQ').value.toLowerCase();
  const cat = root.querySelector('#expCat').value;
  const status = root.querySelector('#expStatus').value;
  const cid = root.querySelector('#expClient').value;
  let rows = clients.flatMap(c => c.expenses.map(e => ({ ...e, client:c.name, clientId:c.id })));
  rows = rows.filter(e =>
    (!q || e.category.toLowerCase().includes(q) || e.client.toLowerCase().includes(q)) &&
    (!cat || e.category === cat) &&
    (!status || e.status === status) &&
    (!cid || e.clientId === cid));
  if(!rows.length){ el.innerHTML = emptyState('expenses','No expenses','No expenses match the selected filters.'); return; }
  el.innerHTML = `<table><thead><tr><th>DATE</th><th>CATEGORY</th><th>CLIENT</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>
    ${rows.map(e=>`<tr><td>${e.date.slice(5)}</td><td>${esc(e.category)}</td><td>${esc(e.client)}</td><td class="numeric">${money(e.amount)}</td><td>${statusPill(e.status==='Approved'?'ok':e.status==='Rejected'?'bad':'warn', e.status)}</td></tr>`).join('')}
  </tbody></table>`;
}
