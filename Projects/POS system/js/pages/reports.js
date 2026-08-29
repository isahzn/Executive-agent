import { REPORT_CATEGORIES } from '../data/db.js';
import { visibleClients, can } from '../core/auth.js';
import { moneyK, esc } from '../core/utils.js';
import { statusPill, emptyState, toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  if(!can('reports.view')){
    root.innerHTML = emptyState('reports','No access','You do not have permission to view reports.');
    return;
  }
  const canCreate = can('reports.create');
  const clients = visibleClients();
  const firmTotal = clients.reduce((s,c)=>s+c.overview.revenue,0);

  root.innerHTML = `
    <div class="report-toolbar">
      <div class="report-crumb">Reports / <b>All Reports</b></div>
      ${canCreate?`<button class="btn primary sm" data-act="new">${icon('plus',13)} New Report</button>`:''}
    </div>

    <div class="report-layout">
      <div class="report-groups">
        ${REPORT_CATEGORIES.map(cat => `
          <div class="report-group">
            <div class="report-group-title">${cat}</div>
            ${reportLinks(cat).map(l => `<button class="report-link" data-report="${cat}/${l}"><span>${esc(l)}</span>${icon('chev',12)}</button>`).join('')}
          </div>`).join('')}
      </div>

      <div class="report-content">
        <div class="report-head">
          <div>
            <h2>${ctxTitle()}</h2>
            <p class="muted">Consolidated figures across your ${clients.length} visible clients. All values are demo data.</p>
          </div>
          <button class="btn sm" data-act="export">${icon('download',13)} Export</button>
        </div>
        <div class="report-kpis">
          <div class="report-kpi"><small>Revenue</small><b>${moneyK(firmTotal)}</b></div>
          <div class="report-kpi"><small>Net Profit</small><b>${moneyK(clients.reduce((s,c)=>s+c.overview.netProfit,0))}</b></div>
          <div class="report-kpi"><small>Receivables</small><b>${moneyK(clients.reduce((s,c)=>s+c.overview.receivables,0))}</b></div>
          <div class="report-kpi"><small>Payables</small><b>${moneyK(clients.reduce((s,c)=>s+c.overview.payables,0))}</b></div>
        </div>
        ${clientTable(clients)}
        <div class="note">This prototype provides a representative report. Build a single report by choosing a link on the left.</div>
      </div>
    </div>`;

  root.querySelector('[data-act=export]').onclick = () => toast('success','Report exported to CSV (demo)');
  const nr = root.querySelector('[data-act=new]');
  if(nr) nr.onclick = () => toast('success','New report builder (demo)');
  root.querySelectorAll('[data-report]').forEach(b => {
    b.onclick = () => toast('info', `Preview: ${b.dataset.report} (demo)`);
  });
}

function reportLinks(cat){
  const map = {
    Overview:['Practice Summary','Capacity & Utilization'],
    Financial:['Profit & Loss','Balance Sheet','Cash Flow'],
    Tax:['Exposure Summary','Due Dates Calendar'],
    Client:['Client List','Revenue by Client','Account Receivable'],
    Documents:['Document Status','Processed vs Pending'],
    Invoices:['Invoice Ageing','Outstanding'],
    Expenses:['Expense Analysis','By Category'],
    Team:['Workload','Assigned Clients'],
    Management:['Scheduled Reports','Custom'],
  };
  return map[cat] || [cat];
}

function ctxTitle(){
  return 'Firm Overview';
}

function clientTable(clients){
  if(!clients.length) return emptyState('reports','No clients','No clients are visible to your account.');
  return `<table><thead><tr><th>CLIENT</th><th>REVENUE</th><th>NET PROFIT</th><th>RECEIVABLES</th><th>TAX</th></tr></thead><tbody>
    ${clients.map(c => `<tr>
      <td><b>${esc(c.name)}</b><div class="sub">${c.code}</div></td>
      <td class="numeric">${moneyK(c.overview.revenue)}</td>
      <td class="numeric">${moneyK(c.overview.netProfit)}</td>
      <td class="numeric">${moneyK(c.overview.receivables)}</td>
      <td class="numeric">${moneyK(c.tax.estimatedPayable)}</td>
    </tr>`).join('')}
  </tbody></table>`;
}
