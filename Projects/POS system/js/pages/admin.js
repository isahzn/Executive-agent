import { getUsers, addUser, updateUser, toggleUserActive, setUserRole, setUserPermissions } from '../core/store.js';
import { PERMISSIONS, ROLE_GRANTS } from '../data/db.js';
import { defaultPermissionsFor } from '../core/permissions.js';
import { currentUser, can } from '../core/auth.js';
import { esc, initials } from '../core/utils.js';
import { statusPill, emptyState, toast, openModal, field, input, select, confirmModal } from '../components/ui.js';
import { icon } from '../components/icons.js';

const ROLES = ['admin','manager','accountant','viewer'];

export default function render(root){
  const me = currentUser();
  if(me.role !== 'admin'){
    root.innerHTML = emptyState('settings','Admins only','The Administration console is available to administrators only.');
    return;
  }
  root.innerHTML = `
    <div class="report-kpis" style="margin-bottom:12px">
      ${[['Users',getUsers().length],['Active',getUsers().filter(u=>u.active).length],['Roles',ROLES.length],['Custom',getUsers().filter(u=>u.customPermissions).length]].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title"><h3>Users & Access</h3>
        <button class="btn primary sm" data-act="add-user">${icon('plus',13)} Add User</button></div>
      <div class="toolbar" style="margin-bottom:10px">
        <div class="search-wrap"><input class="input" id="admQ" placeholder="Search users..." style="width:280px"></div>
        <select class="select" id="admRole"><option value="">All roles</option>${ROLES.map(r=>`<option value="${r}">${cap(r)}</option>`).join('')}</select>
      </div>
      <div id="admList"></div>
    </div>
    <div class="card">
      <div class="card-title"><h3>Role Templates</h3><span class="sub">Default permission sets per role</span></div>
      <div id="roleMatrix"></div>
    </div>`;

  renderUsers(root);
  renderMatrix(root);
  root.querySelector('#admQ').oninput = ()=>renderUsers(root);
  root.querySelector('#admRole').onchange = ()=>renderUsers(root);
  root.querySelector('[data-act=add-user]').onclick = ()=>addUserModal(root);
}

function renderUsers(root){
  const el = root.querySelector('#admList');
  const q = root.querySelector('#admQ').value.toLowerCase();
  const role = root.querySelector('#admRole').value;
  let rows = getUsers().filter(u => (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (!role || u.role === role));
  if(!rows.length){ el.innerHTML = emptyState('team','No users','No users match the search.'); return; }
  el.innerHTML = `<table><thead><tr><th>USER</th><th>EMAIL</th><th>ROLE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
    ${rows.map(u=>`<tr>
      <td><div class="avatar sm">${initials(u.name)}</div> <b>${esc(u.name)}</b></td>
      <td>${esc(u.email)}</td>
      <td><span class="tag">${cap(u.role)}${u.customPermissions?' · custom':''}</span></td>
      <td>${statusPill(u.active?'ok':'neutral', u.active?'Active':'Disabled')}</td>
      <td class="actions-cell">
        <button class="link" data-role="${u.id}">Role</button>
        <button class="link" data-perms="${u.id}">Permissions</button>
        <button class="link" data-toggle="${u.id}">${u.active?'Disable':'Enable'}</button>
      </td>
    </tr>`).join('')}
  </tbody></table>`;
  el.querySelectorAll('[data-role]').forEach(b => b.onclick = ()=>roleModal(b.dataset.role));
  el.querySelectorAll('[data-perms]').forEach(b => b.onclick = ()=>permModal(b.dataset.perms));
  el.querySelectorAll('[data-toggle]').forEach(b => b.onclick = ()=>{
    toggleUserActive(b.dataset.toggle);
    toast('success','Account updated'); renderUsers(root);
  });
}

function renderMatrix(root){
  const el = root.querySelector('#roleMatrix');
  el.innerHTML = `<table><thead><tr><th>Module</th>${ROLES.map(r=>`<th>${cap(r)}</th>`).join('')}</tr></thead><tbody>
    ${PERMISSIONS.map(m => `<tr><td><b>${m.module}</b></td>${ROLES.map(r=>{
      const set = new Set(defaultPermissionsFor(r));
      return `<td>${permLabel(set, m)}</td>`;
    }).join('')}</tr>`).join('')}
  </tbody></table>`;
}

function permLabel(set, mod){
  const hasView = set.has(`${mod.key}.view`);
  const edit = mod.perms.filter(p=>p!=='view').some(p=>set.has(`${mod.key}.${p}`));
  if(hasView && edit) return '<span class="status ok"><span class="dot"></span>Edit</span>';
  if(hasView) return '<span class="status neutral"><span class="dot"></span>View</span>';
  return '<span class="muted">—</span>';
}

function roleModal(id){
  const u = getUsers().find(x=>x.id===id);
  if(!u) return;
  const { close } = openModal({
    title:`Change Role — ${esc(u.name)}`,
    body:`<div class="form-grid">${field('Role', select(ROLES.map(r=>`<option value="${r}" ${r===u.role?'selected':''}>${cap(r)}</option>`).join(''), 'id="r-role"'))}</div>
      <div class="note">Changing the role resets any custom permissions to the template for that role.</div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', ()=>{
    setUserRole(id, modal.querySelector('#r-role').value);
    toast('success','Role updated'); close(); render(root);
  });
}

function permModal(id){
  const u = getUsers().find(x=>x.id===id);
  if(!u) return;
  const current = new Set(u.permissionSet);
  const { close } = openModal({
    title:`Permissions — ${esc(u.name)}`,
    size:'lg',
    body:`<table><thead><tr><th>Module</th><th>View</th><th>Edit / Input</th></tr></thead><tbody>
      ${PERMISSIONS.map(m => {
        const mod = m.key;
        const editPerms = m.perms.filter(p=>p!=='view').map(p=>`${mod}.${p}`);
        const hasView = current.has(`${mod}.view`);
        const hasEdit = editPerms.some(p=>current.has(p));
        return `<tr><td><b>${m.module}</b></td>
          <td><input type="checkbox" data-perm="${mod}.view" ${hasView?'checked':''}></td>
          <td><input type="checkbox" data-perm="${editPerms.join(',')}" ${hasEdit?'checked':''}></td></tr>`;
      }).join('')}
    </tbody></table>
    <div class="note">Checking "Edit / Input" grants every non-view permission for the module. Unchecking both removes access.</div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save Permissions</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', ()=>{
    const granted = [];
    modal.querySelectorAll('[data-perm]').forEach(cb => {
      if(cb.checked) cb.dataset.perm.split(',').forEach(p => granted.push(p));
    });
    setUserPermissions(id, granted);
    toast('success','Permissions saved'); close(); render(root);
  });
}

function addUserModal(root){
  const { close } = openModal({
    title:'Add User',
    body:`<div class="form-grid">
      ${field('Full name',input('id="u-name" placeholder="e.g. Sandali Wickram"'))}
      ${field('Email',input('id="u-email" type="email" placeholder="name@abc.lk"'))}
      ${field('Password',input('id="u-pass" type="password" value="demo123"'))}
      ${field('Role',select(ROLES.map(r=>`<option value="${r}">${cap(r)}</option>`).join(''), 'id="u-role"'))}
    </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Add User</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', ()=>{
    const name = modal.querySelector('#u-name').value.trim();
    const email = modal.querySelector('#u-email').value.trim();
    if(!name || !email) return toast('error','Enter a name and email.');
    addUser({ name, email, password:modal.querySelector('#u-pass').value||'demo123', role:modal.querySelector('#u-role').value });
    toast('success','User added'); close(); render(root);
  });
}

function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
