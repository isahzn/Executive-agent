import { getClients, getFirm, addClient } from '../core/store.js';
import { visibleClients, currentUser, can } from '../core/auth.js';
import { moneyK, esc } from '../core/utils.js';
import { statusPill, emptyState, toast, openModal, field, input, select } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  const clients = visibleClients();
  const canCreate = can('clients.create');
  const isAdmin = currentUser().role === 'admin';

  root.innerHTML = `
    <div class="toolbar">
      <div class="search-wrap"><input class="input" id="cSearch" placeholder="Search clients..." style="width:280px"></div>
      <select class="select" id="cTypeFilter"><option value="">All types</option><option>Company</option><option>SME</option><option>Business</option><option>Individual</option></select>
      <select class="select" id="cStateFilter"><option value="">All statuses</option><option>Active</option><option>Review</option><option>Action required</option></select>
      <div class="spacer"></div>
      ${canCreate?`<button class="btn primary" id="addClient">${icon('plus',13)} Add Client</button>`:''}
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="clientList"></div></div>
    <div class="note" style="margin-top:10px">${isAdmin?'Showing all clients.':'Showing only your assigned clients. '}Total active clients: <b>${getFirm().totalClients}</b>.</div>`;

  renderList(root);
  root.querySelector('#cSearch').oninput = () => renderList(root);
  root.querySelector('#cTypeFilter').onchange = () => renderList(root);
  root.querySelector('#cStateFilter').onchange = () => renderList(root);
  const addBtn = root.querySelector('#addClient');
  if(addBtn) addBtn.onclick = () => addClientModal(root);
}

function renderList(root){
  const el = root.querySelector('#clientList');
  const q = root.querySelector('#cSearch').value.toLowerCase();
  const type = root.querySelector('#cTypeFilter').value;
  const state = root.querySelector('#cStateFilter').value;

  let rows = visibleClients().filter(c =>
    (!q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)) &&
    (!type || c.type === type) &&
    (!state || statusLabel(c.status) === state));

  if(!rows.length){
    el.innerHTML = emptyState('clients','No clients found','Try adjusting your search or filters.');
    return;
  }
  el.innerHTML = `<table><thead><tr><th>CLIENT</th><th>TYPE</th><th>REVENUE</th><th>TAX POSITION</th><th>LAST ACTIVITY</th><th>STATUS</th><th></th></tr></thead><tbody>
    ${rows.map(c => `
      <tr data-client="${c.id}" style="cursor:pointer">
        <td><b>${esc(c.name)}</b><div class="sub">${c.code} · ${esc(c.location)}</div></td>
        <td><span class="tag">${esc(c.type)}</span></td>
        <td class="numeric">${moneyK(c.firmValue)}</td>
        <td>${esc(c.taxPosition)}</td>
        <td>${esc(c.lastActivity)}</td>
        <td>${statusPill(c.status, statusLabel(c.status))}</td>
        <td class="actions-cell"><button class="link" data-open="${c.id}">Open →</button></td>
      </tr>`).join('')}
    </tbody></table>`;

  el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => window.__nav('client', { clientId:b.dataset.open }));
  el.querySelectorAll('tr[data-client]').forEach(tr => tr.onclick = (e) => {
    if(e.target.closest('a,button')) return;
    window.__nav('client', { clientId:tr.dataset.client });
  });
}

function statusLabel(status){
  return status==='bad' ? 'Action required' : status==='warn' ? 'Review' : 'Active';
}

function addClientModal(root){
  if(!can('clients.create')) return toast('error','No permission to create clients.');
  const types = ['Company','SME','Business','Individual'];
  const { close } = openModal({
    title:'Add Client',
    body:`<div class="form-grid">
      ${field('Client name',input('id="cn-name" placeholder="e.g. Sunrise Traders"'))}
      ${field('Location',input('id="cn-loc" placeholder="e.g. Colombo"'))}
      ${field('Type',select(types.map(x=>`<option>${x}</option>`).join(''), 'id="cn-type"'))}
      ${field('Tax position',input('id="cn-tax" placeholder="e.g. Rs. 120K due"'))}
    </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Add Client</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    const name = modal.querySelector('#cn-name').value.trim();
    if(!name) return toast('error','Enter a client name.');
    addClient({
      name,
      type: modal.querySelector('#cn-type').value,
      location: modal.querySelector('#cn-loc').value.trim() || 'Colombo',
      taxPosition: modal.querySelector('#cn-tax').value.trim() || 'Filed',
    });
    toast('success','Client added');
    close();
    render(root);
  });
}
