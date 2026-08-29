import { visibleClients, can, canEditModule, currentUser } from '../core/auth.js';
import { esc } from '../core/utils.js';
import { statusPill, emptyState, toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

const PRIORITIES = ['High','Medium','Low'];

export default function render(root){
  if(!can('tasks.view')){
    root.innerHTML = emptyState('tasks','No access','You do not have permission to view tasks.');
    return;
  }
  const canEdit = can('tasks.complete') || can('tasks.assign') || canEditModule('tasks');
  const clients = visibleClients();
  const all = clients.flatMap(c => c.tasks.map(t => ({ ...t, client:c.name, clientId:c.id })));
  const open = all.filter(t => t.status !== 'Completed').length;
  const overdue = all.filter(t => t.status === 'Overdue').length;
  const mine = currentUser() ? all.filter(t => t.assignee === currentUser().name).length : 0;

  root.innerHTML = `
    <div class="report-kpis" style="margin-bottom:12px">
      ${[['Open Tasks',open],['Overdue',overdue],['Assigned to Me',mine]].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}
    </div>
    <div class="toolbar">
      <div class="search-wrap"><input class="input" id="taskQ" placeholder="Search tasks..." style="width:280px"></div>
      <select class="select" id="taskStatus"><option value="">All statuses</option><option>Pending</option><option>In progress</option><option>Overdue</option><option>Completed</option></select>
      <select class="select" id="taskPrio"><option value="">All priorities</option>${PRIORITIES.map(p=>`<option>${p}</option>`).join('')}</select>
      <select class="select" id="taskClient"><option value="">All clients</option>${clients.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
      <div class="spacer"></div>
      ${canEdit?`<button class="btn primary" data-act="create">${icon('plus',13)} New Task</button>`:''}
    </div>
    <div class="card" style="padding:0;overflow:hidden"><div id="taskList"></div></div>
    <div class="note" style="margin-top:10px">${canEdit?'You can create and update tasks.':'View only — updating tasks requires permission.'}</div>`;

  renderList(root);
  root.querySelector('#taskQ').oninput = ()=>renderList(root);
  root.querySelector('#taskStatus').onchange = ()=>renderList(root);
  root.querySelector('#taskPrio').onchange = ()=>renderList(root);
  root.querySelector('#taskClient').onchange = ()=>renderList(root);
  const cr = root.querySelector('[data-act=create]');
  if(cr) cr.onclick = () => toast('info','Select a client from the dropdown to open their workspace and create a task.');
}

function renderList(root){
  const el = root.querySelector('#taskList');
  const clients = visibleClients();
  const q = root.querySelector('#taskQ').value.toLowerCase();
  const status = root.querySelector('#taskStatus').value;
  const prio = root.querySelector('#taskPrio').value;
  const cid = root.querySelector('#taskClient').value;
  let rows = clients.flatMap(c => c.tasks.map(t => ({ ...t, client:c.name, clientId:c.id })));
  rows = rows.filter(t =>
    (!q || t.title.toLowerCase().includes(q) || t.client.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)) &&
    (!status || t.status === status) &&
    (!prio || t.priority === prio) &&
    (!cid || t.clientId === cid));
  if(!rows.length){ el.innerHTML = emptyState('tasks','No tasks','No tasks match the selected filters.'); return; }
  el.innerHTML = `<table><thead><tr><th>TASK</th><th>CLIENT</th><th>ASSIGNEE</th><th>DUE</th><th>PRIORITY</th><th>STATUS</th></tr></thead><tbody>
    ${rows.map(t=>`<tr><td><b>${esc(t.title)}</b></td><td>${esc(t.client)}</td><td>${esc(t.assignee)}</td><td>${t.due.slice(5)}</td><td>${statusPill(t.priority==='High'?'bad':t.priority==='Medium'?'warn':'neutral', t.priority)}</td><td>${statusPill(t.status==='Completed'?'ok':t.status==='Overdue'?'bad':'info', t.status)}</td></tr>`).join('')}
  </tbody></table>`;
}
