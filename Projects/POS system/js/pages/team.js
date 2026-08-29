import { getUsers, getClients, addUser } from '../core/store.js';
import { currentUser, can, canEditModule } from '../core/auth.js';
import { esc, initials } from '../core/utils.js';
import { statusPill, emptyState, toast, openModal, field, input, select } from '../components/ui.js';
import { icon } from '../components/icons.js';

const ROLES = ['admin','manager','accountant','viewer'];

export default function render(root){
  if(!can('team.view')){
    root.innerHTML = emptyState('team','No access','You do not have permission to view the team.');
    return;
  }
  const canManage = can('team.manage') || canEditModule('team');
  const users = getUsers();
  const active = users.filter(u => u.active).length;

  root.innerHTML = `
    <div class="report-kpis" style="margin-bottom:12px">
      ${[['Team Members',users.length],['Active',active],['Disabled',users.length-active]].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}
    </div>
    <div class="toolbar">
      <div class="search-wrap"><input class="input" id="teamQ" placeholder="Search team..." style="width:280px"></div>
      <select class="select" id="teamRole"><option value="">All roles</option>${ROLES.map(r=>`<option value="${r}">${cap(r)}</option>`).join('')}</select>
      <select class="select" id="teamStatus"><option value="">All statuses</option><option>Active</option><option>Disabled</option></select>
      <div class="spacer"></div>
      ${canManage?`<button class="btn primary" data-act="add">${icon('plus',13)} Add Team Member</button>`:''}
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="teamList"></div></div>
    <div class="note" style="margin-top:10px">${canManage?'You can add members and change roles.':'View only — managing the team requires permission.'}</div>`;

  renderList(root);
  root.querySelector('#teamQ').oninput = ()=>renderList(root);
  root.querySelector('#teamRole').onchange = ()=>renderList(root);
  root.querySelector('#teamStatus').onchange = ()=>renderList(root);
  const add = root.querySelector('[data-act=add]');
  if(add) add.onclick = () => addMember(root);
}

function renderList(root){
  const el = root.querySelector('#teamList');
  const q = root.querySelector('#teamQ').value.toLowerCase();
  const role = root.querySelector('#teamRole').value;
  const status = root.querySelector('#teamStatus').value;
  let rows = getUsers().filter(u =>
    (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
    (!role || u.role === role) &&
    (!status || (status==='Active' ? u.active : !u.active)));
  if(!rows.length){ el.innerHTML = emptyState('team','No members','No team members match the selected filters.'); return; }
  el.innerHTML = `<table><thead><tr><th>MEMBER</th><th>EMAIL</th><th>ROLE</th><th>CLIENTS</th><th>LAST ACTIVE</th><th>STATUS</th></tr></thead><tbody>
    ${rows.map(u=>`<tr>
      <td><div class="avatar sm">${initials(u.name)}</div> <b>${esc(u.name)}</b></td>
      <td>${esc(u.email)}</td>
      <td><span class="tag">${cap(u.role)}</span></td>
      <td>${u.assigned.length} assigned</td>
      <td>${esc(u.lastActive)}</td>
      <td>${statusPill(u.active?'ok':'neutral', u.active?'Active':'Disabled')}</td>
    </tr>`).join('')}
  </tbody></table>`;
}

function addMember(root){
  const { close } = openModal({
    title:'Add Team Member',
    body:`<div class="form-grid">
      ${field('Full name',input('id="tm-name" placeholder="e.g. Sandali Wickram"'))}
      ${field('Email',input('id="tm-email" type="email" placeholder="name@abc.lk"'))}
      ${field('Role',select(ROLES.map(r=>`<option value="${r}" ${r==='accountant'?'selected':''}>${cap(r)}</option>`).join(''), 'id="tm-role"'))}
    </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Add Member</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    const name = modal.querySelector('#tm-name').value.trim();
    const email = modal.querySelector('#tm-email').value.trim();
    if(!name || !email) return toast('error','Enter a name and email.');
    addUser({ name, email, password:'demo123', role:modal.querySelector('#tm-role').value });
    toast('success','Team member added');
    close();
    render(root);
  });
}

function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
