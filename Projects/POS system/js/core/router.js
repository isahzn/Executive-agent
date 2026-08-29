import { currentUser, can, logout } from './auth.js';
import { getFirm, getClients } from '../core/store.js';
import { visibleClients } from './auth.js';
import { icon } from '../components/icons.js';
import { esc, initials, moneyK } from '../core/utils.js';
import dashboard from '../pages/dashboard.js';
import clients from '../pages/clients.js';
import client from '../pages/client.js';
import accounting from '../pages/accounting.js';
import tax from '../pages/tax.js';
import invoices from '../pages/invoices.js';
import expenses from '../pages/expenses.js';
import documents from '../pages/documents.js';
import reports from '../pages/reports.js';
import tasks from '../pages/tasks.js';
import team from '../pages/team.js';
import integrations from '../pages/integrations.js';
import settings from '../pages/settings.js';
import admin from '../pages/admin.js';

export const PAGES = { dashboard, clients, client, accounting, tax, invoices, expenses, documents, reports, tasks, team, integrations, settings, admin };

const NAV = [
  { key:'dashboard', label:'Dashboard', icon:'dashboard' },
  { key:'clients', label:'Clients', icon:'clients' },
  { key:'accounting', label:'Accounting', icon:'accounting', perm:'accounting' },
  { key:'tax', label:'Tax Center', icon:'tax', perm:'tax' },
  { key:'invoices', label:'Invoices', icon:'invoices', perm:'invoices' },
  { key:'expenses', label:'Expenses', icon:'expenses', perm:'expenses' },
  { key:'documents', label:'Documents', icon:'documents', perm:'documents' },
  { key:'reports', label:'Reports', icon:'reports', perm:'reports' },
  { key:'tasks', label:'Tasks', icon:'tasks', perm:'tasks' },
  { key:'team', label:'Team', icon:'team', perm:'team' },
  { key:'integrations', label:'Integrations', icon:'integrations', perm:'settings' },
  { key:'settings', label:'Settings', icon:'settings', perm:'settings' },
  { key:'admin', label:'Admin Console', icon:'settings', adminOnly:true },
];

const META = {
  dashboard:['Dashboard','Firm overview and key metrics'],
  clients:['Clients','Manage client records and open a workspace'],
  client:['Client','Client workspace'],
  accounting:['Accounting','Firm-wide transaction ledger'],
  tax:['Tax Center','Returns, deadlines and exposure'],
  invoices:['Invoices','Billing across all clients'],
  expenses:['Expenses','Costs and approvals'],
  documents:['Documents','Firm-wide document repository'],
  reports:['Reports','Build and preview reports'],
  tasks:['Tasks','To-dos and deadlines'],
  team:['Team','People, roles and permissions'],
  integrations:['Integrations','Connected services'],
  settings:['Settings','Firm preferences and data'],
  admin:['Admin Console','Users, roles and access control'],
};

let currentPage = 'dashboard';

export function isAdmin(){
  const u = currentUser();
  return u && u.role === 'admin';
}

export function showLogin(){
  const root = document.getElementById('root');
  if(!root) return;
  root.innerHTML = '<div id="login"></div>';
  import('../pages/login.js').then(m => m.render(root.querySelector('#login')));
}

export function boot(){
  const root = document.getElementById('root');
  if(!root) return;
  if(!currentUser()){ showLogin(); return; }
  root.innerHTML = shell();
  wireTopbar(root);
  navigate('dashboard');
}

export function navigate(page, params){
  if(!currentUser()){ showLogin(); return; }
  const pg = PAGES[page] ? page : 'dashboard';
  currentPage = pg;
  const el = document.getElementById('page');
  if(!el) return;
  PAGES[pg](el, params || {});
  setMeta(pg, params);
  setNavActive(pg);
  document.getElementById('root')?.scrollTo?.(0,0);
  window.scrollTo(0,0);
}

function shell(){
  const me = currentUser();
  const firm = getFirm();
  const vis = visibleClients();
  const nav = NAV.filter(n => {
    if(n.adminOnly) return isAdmin();
    if(n.perm) return can(n.perm + '.view');
    return true;
  });
  const planPct = firm.capacity.pct;
  const clientOpts = vis.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  const taskCount = vis.reduce((s,c)=>s+(c.tasks||[]).filter(t=>t.status!=='Completed').length,0);

  return `
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">${icon('accounting',20)}</div>
        <div><strong>${esc(firm.name)}</strong><span>${esc(firm.subtitle)}</span></div>
      </div>
      <nav class="nav">
        ${nav.map(n => `<button data-nav="${n.key}" title="${n.label}"><span class="ico">${icon(n.icon,17)}</span><span>${n.label}</span></button>`).join('')}
      </nav>
      <div class="sidebar-bottom">
        <div class="plan">
          <b>Practice capacity</b>
          <p>Active engagements vs. firm capacity.</p>
          <div class="bar"><i style="width:${planPct}%"></i></div>
          <div class="pct"><span>used</span><b>${firm.capacity.used}/${firm.capacity.total}</b></div>
        </div>
        <div class="user">
          <div class="avatar sm">${initials(me.name)}</div>
          <div><b>${esc(me.name)}</b><small>${esc(me.email)}</small></div>
          <span class="role-tag" data-act="logout" title="Sign out">${cap(me.role)}</span>
        </div>
      </div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div class="title"><h1 id="pageTitle">Dashboard</h1><p id="pageSub">Firm overview and key metrics</p></div>
        <select class="select top-select" id="clientSwitch" title="Open a client">
          <option value="">Open a client…</option>${clientOpts}
        </select>
        <div class="top-icons">
          <button class="icon-btn" id="iconSearch" title="Search">${icon('search',18)}</button>
          <button class="icon-btn" id="iconBell" title="Notifications">${icon('bell',18)}${taskCount?`<span class="badge">${taskCount}</span>`:''}</button>
        </div>
        <button class="top-user" data-act="logout" title="Sign out">
          <div class="avatar sm">${initials(me.name)}</div>
          <div><b>${esc(me.name)}</b><small>${cap(me.role)}</small></div>
        </button>
      </header>
      <div class="demo-banner"><span><b>Demo workspace</b> — all data is fictional and in-memory. Sign in as a different user to explore role-based access.</span></div>
      <div id="page" class="page active"></div>
    </main>
  </div>`;
}

function wireTopbar(root){
  root.querySelectorAll('[data-nav]').forEach(b => {
    b.onclick = () => navigate(b.dataset.nav);
  });
  const sw = root.querySelector('#clientSwitch');
  if(sw) sw.onchange = () => { if(sw.value) navigate('client', { clientId:sw.value }); };
  root.querySelectorAll('[data-act=logout]').forEach(b => {
    b.onclick = () => { logout(); showLogin(); };
  });
  const bell = root.querySelector('#iconBell');
  if(bell) bell.onclick = () => navigate('tasks');
  const search = root.querySelector('#iconSearch');
  if(search) search.onclick = () => navigate('clients');
}

function setNavActive(page){
  const key = page === 'client' ? 'clients' : page;
  document.querySelectorAll('[data-nav]').forEach(b => {
    b.classList.toggle('active', b.dataset.nav === key);
  });
}

function setMeta(page, params){
  const [title, sub] = META[page] || ['Dashboard',''];
  const t = document.getElementById('pageTitle');
  const s = document.getElementById('pageSub');
  if(t) t.textContent = page === 'client' && params?.clientId
    ? (getClients().find(c=>c.id===params.clientId)?.name || 'Client')
    : title;
  if(s) s.textContent = sub;
}

function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// Expose navigation to page modules.
window.__nav = navigate;
window.__boot = boot;
