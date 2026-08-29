import { getClients } from '../core/store.js';
import { visibleClients, can, canEditModule } from '../core/auth.js';
import { esc } from '../core/utils.js';
import { statusPill, emptyState, toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  if(!can('documents.view')){
    root.innerHTML = emptyState('documents','No access','You do not have permission to view documents.');
    return;
  }
  const canUpload = can('documents.upload') || canEditModule('documents');
  const types = ['Bank statements','Invoices','Receipts','Tax documents','Payroll documents','Contracts','Other'];

  root.innerHTML = `
    <div class="toolbar">
      <div class="search-wrap"><input class="input" id="docQ" placeholder="Search documents..." style="width:280px"></div>
      <select class="select" id="docType"><option value="">All types</option>${types.map(t=>`<option>${t}</option>`).join('')}</select>
      <select class="select" id="docStatus"><option value="">All statuses</option><option>Processed</option><option>Needs Review</option><option>Missing</option><option>Processing</option></select>
      <div class="spacer"></div>
      ${canUpload?`<button class="btn primary" data-act="upload">${icon('upload',13)} Upload Documents</button>`:''}
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="docList"></div></div>
    <div class="note" style="margin-top:10px">${canUpload?'You can upload documents.':'View only — upload permission is required.'}</div>`;

  renderList(root);
  root.querySelector('#docQ').oninput = ()=>renderList(root);
  root.querySelector('#docType').onchange = ()=>renderList(root);
  root.querySelector('#docStatus').onchange = ()=>renderList(root);
  const up = root.querySelector('[data-act=upload]');
  if(up) up.onclick = () => toast('success','Demo upload selected. Choose a client to attach the document.');
}

function renderList(root){
  const el = root.querySelector('#docList');
  const clients = visibleClients();
  const q = root.querySelector('#docQ').value.toLowerCase();
  const type = root.querySelector('#docType').value;
  const status = root.querySelector('#docStatus').value;
  let rows = clients.flatMap(c => c.documents.map(d => ({ ...d, client:c.name, clientId:c.id })));
  rows = rows.filter(d =>
    (!q || d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q) || d.client.toLowerCase().includes(q)) &&
    (!type || d.type === type) &&
    (!status || d.status === status));
  if(!rows.length){ el.innerHTML = emptyState('documents','No documents','No documents match the selected filters.'); return; }
  el.innerHTML = `<table><thead><tr><th>DOCUMENT</th><th>TYPE</th><th>CLIENT</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>
    ${rows.map(d=>`<tr><td><b>${esc(d.name)}</b></td><td>${d.type}</td><td>${esc(d.client)}</td><td>${d.date.slice(5)}</td><td>${statusPill(d.status==='Processed'?'ok':d.status==='Missing'?'bad':'warn', d.status)}</td></tr>`).join('')}
  </tbody></table>`;
}
