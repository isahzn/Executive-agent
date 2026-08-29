import { getFirm, getClients, getActivity } from '../core/store.js';
import { currentUser, visibleClients, can } from '../core/auth.js';
import { money, num, pct } from '../core/utils.js';
import { areaLine, donutStyle } from '../components/charts.js';
import { statusPill } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  const firm = getFirm();
  const user = currentUser();
  const all = getClients();
  const isAdmin = user.role === 'admin';

  const clients = visibleClients();
  const requiring = all.filter(c => c.status === 'bad');
  const deadlines = all
    .flatMap(c => (c.tax.returns || []).map(r => ({ client:c.name, return:r.name, due:r.due, status:r.status })))
    .filter(d => d.status !== 'neutral')
    .sort((a,b) => String(a.due).localeCompare(String(b.due)))
    .slice(0,4);

  const revenue = [1600000, 1390000, 1460000, 1120000, 1260000, 910000, 690000, 380000].reverse();
  const portfolio = [
    { label:'Companies', value:46, color:'var(--purple)' },
    { label:'SMEs', value:22, color:'var(--blue)' },
    { label:'Individuals', value:17, color:'var(--green)' },
    { label:'Partnerships', value:15, color:'var(--orange)' },
  ];

  const attentionRows = requiring.map(c => `
    <tr><td><b>${c.name}</b><div class="sub">${c.type}</div></td>
    <td>${c.taxPosition}</td><td>${deadlineDate(c)}</td>
    <td>${statusPill('bad','Action required')}</td></tr>`).join('');

  const kpis = [
    { icon:'clients', color:'p', label:'Total Clients', value:num(firm.totalClients), trend:'up', delta:'8.4%', sub:'vs last month' },
    { icon:'money', color:'b', label:'Monthly Revenue', value:money(firm.monthlyRevenue), trend:'up', delta:'12.6%', sub:'vs last month' },
    { icon:'tax', color:'o', label:'Tax Due This Month', value:money(firm.taxDueMonth), trend:'down', delta:'6.2%', sub:'across 23 clients' },
    { icon:'tasks', color:'g', label:'Pending Tasks', value:num(firm.pendingTasks), trend:'up', delta:'14.8%', sub:'vs last week' },
  ];

  const activity = getActivity().slice(0,4).map(a => `
    <div class="activity-item"><div class="activity-icon">${icon(a.icon,14)}</div>
      <div><b>${a.text}</b><small>${a.clientName ? a.clientName + ' · ' : ''}${a.time}</small></div></div>`).join('');

  root.innerHTML = `
    ${isAdmin ? '' : ''}
    <div class="kpis">${kpis.map(kpi).join('')}</div>

    <div class="grid-main">
      <div class="card">
        <div class="card-title"><h3>Firm Revenue</h3><button class="link" data-action="view-report">View report</button></div>
        <div class="chart">
          <div class="gridline" style="top:18%"><span>3M</span></div>
          <div class="gridline" style="top:43%"><span>2M</span></div>
          <div class="gridline" style="top:68%"><span>1M</span></div>
          <div class="gridline" style="top:93%"><span>0</span></div>
          ${areaLine(revenue)}
        </div>
        <div class="legend"><span><i class="dot" style="background:var(--purple)"></i>Revenue</span><span class="muted">Jan – Aug 2026</span></div>
      </div>
      <div class="card">
        <div class="card-title"><h3>Client Portfolio</h3><button class="link" data-action="view-clients">View clients</button></div>
        <div class="donut-wrap">
          <div class="donut" style="background:${donutStyle(portfolio)}"><div class="donut-label">${firm.totalClients}<small>clients</small></div></div>
          <div class="legend-list">${portfolio.map(p => `<div class="legend-row"><span class="legend-name"><i class="dot" style="background:${p.color}"></i>${p.label}</span><b>${p.value}%</b></div>`).join('')}</div>
        </div>
      </div>
    </div>

    <div class="tables">
      <div class="card">
        <div class="card-title"><h3>Clients Requiring Attention</h3><button class="link" data-action="view-clients">View all</button></div>
        <table><thead><tr><th>CLIENT</th><th>ISSUE</th><th>DUE</th><th>STATUS</th></tr></thead>
          <tbody>${attentionRows || '<tr><td colspan="4" class="muted">No clients require attention.</td></tr>'}</tbody></table>
      </div>
      <div class="card">
        <div class="card-title"><h3>Upcoming Tax Deadlines</h3><button class="link" data-action="view-tax">View calendar</button></div>
        <table><thead><tr><th>CLIENT</th><th>RETURN</th><th>DUE</th></tr></thead>
          <tbody>${deadlineRows(deadlines)}</tbody></table>
      </div>
    </div>

    <div class="bottom">
      <div class="card">
        <div class="card-title"><h3>Workload by Team</h3><button class="link">Details</button></div>
        ${firm.workload.map(w => `<div class="barrow"><span>${w.team}</span><div class="bar"><i style="width:${w.pct}%"></i></div><b>${w.pct}%</b></div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title"><h3>Firm Snapshot</h3><button class="link" data-action="view-report">View report</button></div>
        <div class="snapshot">${firm.snapshot.map(s => `<div class="metric"><small>${s.label}</small><b>${typeof s.value === 'number' ? num(s.value) : s.value}</b><span class="trend ${s.trend}">${s.trend==='up'?'↑':'↓'} ${s.delta}</span></div>`).join('')}</div>
      </div>
      <div class="card">
        <div class="card-title"><h3>Recent Activity</h3><button class="link">View all</button></div>
        <div class="activity">${activity}</div>
      </div>
    </div>`;

  root.onclick = (e) => {
    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const act = btn.dataset.action;
    if(act === 'view-report') window.__nav('reports');
    else if(act === 'view-clients') window.__nav('clients');
    else if(act === 'view-tax') window.__nav('tax');
  };
}

function deadlineDate(c){
  const r = (c.tax.returns || []).find(x => x.status === 'bad') || (c.tax.returns || [])[0];
  return r ? r.due.slice(5) : '—';
}

function deadlineRows(deadlines){
  if(!deadlines.length) return '<tr><td colspan="3" class="muted">No upcoming deadlines.</td></tr>';
  return deadlines.map(d => `<tr><td>${d.client}</td><td>${d['return']}</td><td><b>${d.due.slice(5)}</b></td></tr>`).join('');
}

function kpi(k){
  return `<div class="card"><div class="kpi-head">${k.label}<div class="kpi-icon ${k.color}">${icon(k.icon,16)}</div></div>
    <div class="kpi-value">${k.value}</div>
    <div class="trend ${k.trend}">${k.trend==='up'?'↑':'↓'} ${k.delta} <span class="muted">${k.sub}</span></div></div>`;
}
