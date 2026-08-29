import { getClient, getFirm, saveRecord, deleteRecord, logActivity } from '../core/store.js';
import { currentUser, can, canEditModule, visibleClients } from '../core/auth.js';
import { money, moneyK, num, esc, uid } from '../core/utils.js';
import { areaLine } from '../components/charts.js';
import { statusPill, openModal, field, input, select, emptyState, toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

const TABS = [
  { key:'overview', label:'Financial Overview', icon:'dashboard' },
  { key:'accounting', label:'Accounting', icon:'accounting' },
  { key:'tax', label:'Tax', icon:'tax' },
  { key:'documents', label:'Documents', icon:'documents' },
  { key:'invoices', label:'Invoices', icon:'invoices' },
  { key:'expenses', label:'Expenses', icon:'expenses' },
  { key:'reports', label:'Reports', icon:'reports' },
];

let activeClient = null;
let activeTab = 'overview';

export default function render(root, { clientId }){
  const client = getClient(clientId);
  const user = currentUser();
  const authorized = user.role === 'admin' || visibleClients().some(c => c.id === clientId);
  if(!client){
    root.innerHTML = emptyState('warn','Client not found','The selected client could not be found.');
    return;
  }
  if(!authorized){
    root.innerHTML = `<div class="empty"><div class="ic" style="background:var(--red-bg);color:var(--red)">${icon('lock',20) || '!'}</div><b>Access denied</b><p>You are not authorised to view this client. Contact an administrator.</p><button class="btn primary" data-action="back-clients" style="margin-top:12px">Back to Clients</button></div>`;
    return;
  }
  activeClient = client;
  activeTab = 'overview';

  build(root);
}

function build(root){
  const client = activeClient;
  const o = client.overview;
  const kpis = [
    { label:'Revenue', value:moneyK(o.revenue) },
    { label:'Expenses', value:moneyK(o.expenses) },
    { label:'Net Profit', value:moneyK(o.netProfit) },
    { label:'Tax Liability', value:moneyK(o.taxLiability) },
    { label:'Receivables', value:moneyK(o.receivables) },
    { label:'Payables', value:moneyK(o.payables) },
  ];
  root.innerHTML = `
    <div class="breadcrumb">
      <button data-action="back-clients">Clients</button>
      <span class="sep">/</span>
      <span>${esc(client.name)}</span>
    </div>
    <div class="client-hero">
      <div class="ch-main">
        <h2>${esc(client.name)}</h2>
        <div class="ch-row">
          <span class="tag ${client.status==='bad'?'':'purple'}">${esc(client.type)}</span>
          ${statusPill(client.status=== 'bad'?'bad':client.status==='warn'?'warn':'ok', client.status==='bad'?'Action required':client.status==='warn'?'Review':'Active')}
        </div>
        <div class="meta">
          <span>${icon('file',13)} ${esc(client.code)}</span>
          <span>${icon('clients',13)} ${esc(client.location)}</span>
          <span>${icon('clock',13)} Last activity ${esc(client.lastActivity)}</span>
        </div>
      </div>
      <div class="ch-main" style="max-width:380px">
        <div class="chip-row"><span class="tag">${esc(client.taxPosition)}</span></div>
        <div class="note" style="margin-top:10px">Demo client record. Financial and tax figures are fictional and for demonstration only.</div>
      </div>
      <div class="client-kpis">${kpis.map(k => `<div class="metric"><small>${k.label}</small><b>${k.value}</b></div>`).join('')}</div>
    </div>
    <div class="tabs">${TABS.map(t => `<button data-tab="${t.key}" class="${t.key===activeTab?'active':''}">${icon(t.icon,15)} ${t.label}</button>`).join('')}</div>
    <div id="clientTab"></div>`;

  // Single delegated handler replaced on every build (avoids listener accumulation).
  root.onclick = (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if(tabBtn){ activeTab = tabBtn.dataset.tab; build(root); return; }
    const actBtn = e.target.closest('[data-act]');
    if(actBtn) handleAction(actBtn);
  };
  renderTab();
}

function renderTab(){
  const tab = document.getElementById('clientTab');
  if(!tab) return;
  const client = activeClient;
  const map = { overview:tabOverview, accounting:tabAccounting, tax:tabTax, documents:tabDocuments, invoices:tabInvoices, expenses:tabExpenses, reports:tabReports };
  tab.innerHTML = map[activeTab](client);
  wire();
}

// ───────────────────────── Tabs ─────────────────────────
function tabOverview(c){
  const revenue = [180000, 220000, 210000, 260000, 240000, 300000, 280000, 320000].map(v => Math.round(v * (c.overview.revenue/1800000)));
  return `
    <div class="grid-main">
      <div class="card"><div class="card-title"><h3>Revenue Trend</h3><span class="sub">Last 8 months</span></div>
        <div class="chart" style="height:200px">${areaLine(revenue, {h:180})}</div>
        <div class="legend"><span><i class="dot" style="background:var(--purple)"></i>Revenue</span></div></div>
      <div class="card"><div class="card-title"><h3>Financial Position</h3></div>
        <div class="report-kpis" style="grid-template-columns:1fr 1fr">
          ${[['Revenue',moneyK(c.overview.revenue)],['Expenses',moneyK(c.overview.expenses)],['Net Profit',moneyK(c.overview.netProfit)],['Tax Liability',moneyK(c.overview.taxLiability)]].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}
        </div>
        <div class="note">Balance sheet position is illustrative demo data for ${esc(c.name)}.</div></div>
    </div>
    <div class="card"><div class="card-title"><h3>Recent Transactions</h3></div>
      ${table(c.transactions.slice(0,3), c, true)}</div>`;
}

function tabAccounting(c){
  const canView = can('accounting.view');
  if(!canView && !canEditModule('accounting'))
    return `<div class="card">${emptyState('lock' in icon ? 'warn' : 'warn','No access','You do not have permission to view accounting for this client.')}</div>`;
  const canEdit = canEditModule('accounting');
  return `
    <div class="card">
      <div class="card-title"><h3>Transaction Ledger</h3>
        <div class="report-actions"><button class="btn sm" data-act="export-ledger">${icon('download',13)} Export</button>
        ${canEdit?`<button class="btn primary sm" data-act="add-transaction">${icon('plus',13)} Add Transaction</button>`:''}</div></div>
      <div class="toolbar" style="margin-bottom:10px">
        <div class="search-wrap"><input class="input" data-filter="q" placeholder="Search transactions..." style="width:240px"></div>
        <select class="select" data-filter="account"><option value="">All accounts</option>${c.transactions.map(t=>`<option>${t.account}</option>`).filter((v,i,a)=>a.indexOf(v)===i).join('')}</select>
        <select class="select" data-filter="status"><option value="">All statuses</option><option>cleared</option><option>pending</option></select>
      </div>
      <div id="ledger" data-rows>${table(c.transactions, c, false, canEdit)}</div>
      <div class="note">${canEdit?'You can add and edit transactions.':'View only — you do not have input permission.'}</div>
    </div>`;
}

function tabTax(c){
  const t = c.tax;
  const canView = can('tax.view');
  if(!canView) return `<div class="card">${emptyState('tax','No access','You do not have permission to view tax data.')}</div>`;
  const canEdit = canEditModule('tax');
  const kpis = [
    { label:'Output Tax', value:moneyK(t.outputTax) },
    { label:'Input Tax', value:moneyK(t.inputTax) },
    { label:'Estimated Payable', value:moneyK(t.estimatedPayable) },
    { label:'Return Status', value:t.returnStatus },
  ];
  return `
    <div class="card"><div class="card-title"><h3>Tax Position</h3>
      ${canEdit?`<button class="btn sm" data-act="edit-tax">${icon('plus',13)} ${t.returnStatus==='Filed'?'Update':'Mark Filed'}</button>`:''}</div>
      <div class="report-kpis">${kpis.map(k=>`<div class="report-kpi"><small>${k.label}</small><b>${k.value}</b></div>`).join('')}</div>
      <div class="cols-2" style="margin-top:6px">
        <div class="metric"><small>Filing Deadline</small><b>${t.filingDeadline}</b></div>
        <div class="metric"><small>Review Status</small><b>${t.reviewStatus}</b></div>
      </div>
      <div class="note">All tax figures are fictional demo data. This prototype is not legal or tax advice.</div>
    </div>
    <div class="card"><div class="card-title"><h3>Returns</h3></div>
      <table><thead><tr><th>RETURN</th><th>PERIOD</th><th>AMOUNT</th><th>DUE</th><th>STATUS</th></tr></thead><tbody>
      ${(t.returns||[]).map(r=>`<tr><td><b>${r.name}</b></td><td>${r.period}</td><td class="numeric">${money(r.amount)}</td><td>${r.due.slice(5)}</td><td>${statusPill(r.status, r.status==='bad'?'Action required':r.status==='warn'?'Review':'Ready')}</td></tr>`).join('')||'<tr><td colspan="5" class="muted">No returns recorded.</td></tr>'}
      </tbody></table></div>`;
}

function tabDocuments(c){
  const canView = can('documents.view');
  if(!canView) return `<div class="card">${emptyState('documents','No access','You do not have permission to view documents.')}</div>`;
  const canUpload = can('documents.upload');
  const catFilter = c.documents.map(d=>d.type).filter((v,i,a)=>a.indexOf(v)===i);
  return `
    <div class="card"><div class="card-title"><h3>Documents</h3>
      ${canUpload?`<button class="btn primary sm" data-act="upload-document">${icon('upload',13)} Upload</button>`:''}</div>
      <div class="toolbar" style="margin-bottom:10px"><div class="search-wrap"><input class="input" data-filter="docq" placeholder="Search documents..." style="width:240px"></div>
        <select class="select" data-filter="doctype"><option value="">All types</option>${catFilter.map(t=>`<option>${t}</option>`).join('')}</select></div>
      <div data-rows id="docRows">${docTable(c)}</div>
      <div class="note">${canUpload?'You can upload documents.':'View only — upload permission required.'}</div>
    </div>`;
}

function tabInvoices(c){
  const canView = can('invoices.view');
  if(!canView) return `<div class="card">${emptyState('invoices','No access','You do not have permission to view invoices.')}</div>`;
  const canCreate = can('invoices.create');
  const total = c.invoices.reduce((s,i)=>s+i.amount,0);
  const counts = { Paid:c.invoices.filter(i=>i.status==='Paid').length, Pending:c.invoices.filter(i=>i.status==='Pending').length, Overdue:c.invoices.filter(i=>i.status==='Overdue').length };
  return `
    <div class="report-kpis" style="margin-bottom:12px">${[['Total Billed',moneyK(total)],['Paid',counts.Paid],['Pending',counts.Pending],['Overdue',counts.Overdue]].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}</div>
    <div class="card"><div class="card-title"><h3>Invoices</h3>
      ${canCreate?`<button class="btn primary sm" data-act="add-invoice">${icon('plus',13)} Create Invoice</button>`:''}</div>
      <table><thead><tr><th>NUMBER</th><th>DATE</th><th>DUE</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>
      ${c.invoices.map(i=>`<tr><td><b>${i.number}</b></td><td>${i.date.slice(5)}</td><td>${i.due.slice(5)}</td><td class="numeric">${money(i.amount)}</td><td>${statusPill(i.status==='Paid'?'ok':i.status==='Overdue'?'bad':'warn', i.status)}</td><td class="actions-cell"><button class="link" data-act="edit-invoice" data-id="${i.id}">${can('invoices.edit')?'Edit':'View'}</button></td></tr>`).join('')||'<tr><td colspan="6" class="muted">No invoices.</td></tr>'}
      </tbody></table></div>`;
}

function tabExpenses(c){
  const canView = can('expenses.view');
  if(!canView) return `<div class="card">${emptyState('expenses','No access','You do not have permission to view expenses.')}</div>`;
  const canCreate = can('expenses.create');
  const total = c.expenses.reduce((s,e)=>s+e.amount,0);
  return `
    <div class="card"><div class="card-title"><h3>Expenses</h3>
      ${canCreate?`<button class="btn primary sm" data-act="add-expense">${icon('plus',13)} Add Expense</button>`:''}</div>
      <div class="report-kpis" style="margin-bottom:12px"><div class="report-kpi"><small>Total</small><b>${moneyK(total)}</b></div><div class="report-kpi"><small>Items</small><b>${c.expenses.length}</b></div></div>
      <table><thead><tr><th>CATEGORY</th><th>AMOUNT</th><th>DATE</th><th>STATUS</th><th></th></tr></thead><tbody>
      ${c.expenses.map(e=>`<tr><td><b>${e.category}</b></td><td class="numeric">${money(e.amount)}</td><td>${e.date.slice(5)}</td><td>${statusPill(e.status==='Approved'?'ok':'warn', e.status)}</td><td class="actions-cell"><button class="link" data-act="edit-expense" data-id="${e.id}">${can('expenses.edit')?'Edit':'View'}</button></td></tr>`).join('')||'<tr><td colspan="5" class="muted">No expenses.</td></tr>'}
      </tbody></table></div>`;
}

function tabReports(c){
  if(!can('reports.view')) return `<div class="card">${emptyState('reports','No access','You do not have permission to view reports.')}</div>`;
  const canExp = can('reports.export');
  return `
    <div class="cols-2">
      <div class="report-card"><div class="report-head"><h3>Profit & Loss</h3><div class="report-actions">${canExp?`<button class="btn sm" data-act="export-pdf">PDF</button><button class="btn sm" data-act="export-csv">CSV</button>`:''}</div></div>
        <div class="report-kpis">${[['Revenue',moneyK(c.overview.revenue)],['Expenses',moneyK(c.overview.expenses)],['Net Profit',moneyK(c.overview.netProfit)]].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}</div>
        <div class="note">Illustrative profit & loss for ${esc(c.name)}.</div></div>
      <div class="report-card"><div class="report-head"><h3>Outstanding Invoices</h3></div>
        <table><tbody>${c.invoices.filter(i=>i.status!=='Paid').slice(0,5).map(i=>`<tr><td><b>${i.number}</b></td><td class="numeric">${money(i.amount)}</td><td>${statusPill(i.status==='Overdue'?'bad':'warn', i.status)}</td></tr>`).join('')||'<tr><td class="muted">No outstanding invoices.</td></tr>'}</tbody></table></div>
    </div>
    <div class="card"><div class="card-title"><h3>Generate Report</h3></div>
      <div class="toolbar">
        <select class="select" data-report-type><option>Profit & Loss</option><option>Balance Sheet</option><option>Tax Summary</option><option>Invoice Aging</option></select>
        <select class="select" data-report-range><option>Last 30 days</option><option>Quarter to date</option><option>Year to date</option></select>
        <div class="spacer"></div>
        <button class="btn primary" data-act="gen-report">${icon('reports',13)} Generate Report</button>
      </div>
      <div class="note">Report generation is simulated for this demonstration.</div></div>`;
}

// ───────────────────────── Tables ─────────────────────────
function table(rows, c, compact, canEdit){
  if(!rows.length) return emptyState('file','No transactions','No transactions recorded for this client.');
  return `<table><thead><tr><th>DATE</th><th>DESCRIPTION</th><th>ACCOUNT</th><th>DEBIT</th><th>CREDIT</th><th>STATUS</th>${canEdit?'<th></th>':''}</tr></thead><tbody>
    ${rows.map(t=>`<tr>
      <td>${t.date.slice(5)}</td><td><b>${t.description}</b></td><td>${t.account}</td>
      <td class="numeric">${t.debit?money(t.debit):'—'}</td><td class="numeric">${t.credit?money(t.credit):'—'}</td>
      <td>${statusPill(t.status==='cleared'?'ok':'warn', t.status)} ${t.reconciled?'':''}</td>
      ${canEdit?`<td class="actions-cell"><button class="link" data-act="edit-transaction" data-id="${t.id}">Edit</button></td>`:''}
    </tr>`).join('')}</tbody></table>`;
}

function docTable(c){
  if(!c.documents.length) return emptyState('documents','No documents','No documents uploaded for this client.');
  return `<table><thead><tr><th>DOCUMENT</th><th>TYPE</th><th>DATE</th><th>STATUS</th><th></th></tr></thead><tbody>
    ${c.documents.map(d=>`<tr><td><b>${d.name}</b></td><td>${d.type}</td><td>${d.date.slice(5)}</td><td>${statusPill(d.status==='Processed'?'ok':d.status==='Missing'?'bad':'warn', d.status)}</td><td class="actions-cell"><button class="link" data-act="open-document" data-id="${d.id}">Open</button></td></tr>`).join('')}</tbody></table>`;
}

// ───────────────────────── Wiring / actions ─────────────────────────
function wire(){
  const root = document.querySelector('#clientTab');
  if(!root) return;
  root.querySelectorAll('[data-filter]').forEach(el => { el.oninput = applyFilter; el.onchange = applyFilter; });
}

function applyFilter(){
  const root = document.querySelector('#clientTab');
  if(!root) return;
  const client = activeClient;
  const q = (root.querySelector('[data-filter=q]')||{}).value?.toLowerCase() || '';
  const acct = (root.querySelector('[data-filter=account]')||{}).value || '';
  const status = (root.querySelector('[data-filter=status]')||{}).value || '';
  const docq = (root.querySelector('[data-filter=docq]')||{}).value?.toLowerCase() || '';
  const doctype = (root.querySelector('[data-filter=doctype]')||{}).value || '';

  const ledger = root.querySelector('[data-rows][id=ledger]');
  if(ledger){
    let rows = client.transactions.filter(t =>
      (!q || t.description.toLowerCase().includes(q) || t.account.toLowerCase().includes(q)) &&
      (!acct || t.account === acct) && (!status || t.status === status));
    ledger.innerHTML = table(rows, client, false, canEditModule('accounting'));
  }

  const docRows = root.querySelector('#docRows');
  if(docRows){
    let dr = client.documents.filter(d => (!docq || d.name.toLowerCase().includes(docq) || d.type.toLowerCase().includes(docq)) && (!doctype || d.type === doctype));
    docRows.innerHTML = docTable({ documents:dr });
  }
}

function handleAction(btn){
  const act = btn.dataset.act;
  const client = activeClient;
  const acts = {
    'back-clients': () => window.__nav('clients'),
    'add-transaction': () => addTransaction(client),
    'edit-transaction': () => editTransaction(client, btn.dataset.id),
    'add-invoice': () => addInvoice(client),
    'edit-invoice': () => editInvoice(client, btn.dataset.id),
    'add-expense': () => addExpense(client),
    'edit-expense': () => editExpense(client, btn.dataset.id),
    'upload-document': () => uploadDocument(client),
    'open-document': () => toast('info','Opening '+client.documents.find(d=>d.id===btn.dataset.id)?.name),
    'edit-tax': () => markTaxFiled(client),
    'export-ledger': () => toast('success','Exported ledger as CSV (demo)'),
    'export-pdf': () => toast('success','Exporting report as PDF (demo)'),
    'export-csv': () => toast('success','Exporting report as CSV (demo)'),
    'gen-report': () => toast('success','Report generated (demo)'),
  };
  if(acts[act]) acts[act]();
}

// ───────────────────────── Modal forms ─────────────────────────
function addTransaction(c){
  if(!canEditModule('accounting')) return toast('error','No permission to input transactions.');
  const { close } = openModal({
    title:'Add Transaction',
    body:`
      <div class="form-grid">
        ${field('Date',input('type="date" value="'+dateISO()+'" id="tx-date"'))}
        ${field('Description',input('id="tx-desc" placeholder="e.g. Client advisory fee"'))}
        ${field('Account',input('id="tx-acct" placeholder="e.g. Service revenue"'))}
        ${field('Amount (Rs.)',input('type="number" id="tx-amt" placeholder="0"'))}
        ${field('Direction',select('<option>Credit (income)</option><option>Debit (expense)</option>', 'id="tx-dir"'))}
      </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save Transaction</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    const desc = modal.querySelector('#tx-desc').value.trim();
    const amt = Number(modal.querySelector('#tx-amt').value);
    if(!desc || !amt) return toast('error','Fill in description and amount.');
    const dir = modal.querySelector('#tx-dir').value.startsWith('Credit');
    saveRecord(c.id, 'transactions', {
      id:uid('t'), date:modal.querySelector('#tx-date').value || dateISO(), description:desc,
      account:modal.querySelector('#tx-acct').value.trim() || 'General', debit:dir?0:amt, credit:dir?amt:0, status:'pending', reconciled:false
    });
    logActivity({ icon:'accounting', text:'Transaction added', client:c.id, clientName:c.name, time:'just now' });
    toast('success','Transaction saved'); close(); renderTab();
  });
}

function editTransaction(c, id){
  if(!canEditModule('accounting')) return toast('error','No permission to edit transactions.');
  const t = c.transactions.find(x=>x.id===id);
  if(!t) return;
  const current = t.credit ? 'Credit (income)' : 'Debit (expense)';
  const { close } = openModal({
    title:'Edit Transaction',
    body:`
      <div class="form-grid">
        ${field('Date',input('type="date" value="'+t.date+'" id="tx-date"'))}
        ${field('Description',input('value="'+esc(t.description)+'" id="tx-desc"'))}
        ${field('Account',input('value="'+esc(t.account)+'" id="tx-acct"'))}
        ${field('Amount (Rs.)',input('type="number" value="'+(t.credit||t.debit)+'" id="tx-amt"'))}
        ${field('Direction',select('<option'+(current==='Credit (income)'?' selected':'')+'>Credit (income)</option><option'+(current==='Debit (expense)'?' selected':'')+'>Debit (expense)</option>', 'id="tx-dir"'))}
      </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save Changes</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    const amt = Number(modal.querySelector('#tx-amt').value);
    if(!amt) return toast('error','Enter an amount.');
    const dir = modal.querySelector('#tx-dir').value.startsWith('Credit');
    saveRecord(c.id, 'transactions', { id:t.id, date:modal.querySelector('#tx-date').value, description:modal.querySelector('#tx-desc').value.trim(), account:modal.querySelector('#tx-acct').value.trim(), debit:dir?0:amt, credit:dir?amt:0 });
    toast('success','Transaction updated'); close(); renderTab();
  });
}

function addInvoice(c){
  if(!can('invoices.create')) return toast('error','No permission to create invoices.');
  const { close } = openModal({
    title:'Create Invoice',
    body:`
      <div class="form-grid">
        ${field('Number',input('value="INV-'+Math.floor(2000+Math.random()*999)+'" id="inv-num"'))}
        ${field('Amount (Rs.)',input('type="number" id="inv-amt" placeholder="0"'))}
        ${field('Issue date',input('type="date" value="'+dateISO()+'" id="inv-date"'))}
        ${field('Due date',input('type="date" value="'+dateISO()+'" id="inv-due"'))}
      </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Create Invoice</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    const amt = Number(modal.querySelector('#inv-amt').value);
    if(!amt) return toast('error','Enter an amount.');
    saveRecord(c.id, 'invoices', { number:modal.querySelector('#inv-num').value.trim(), date:modal.querySelector('#inv-date').value, due:modal.querySelector('#inv-due').value, amount:amt, status:'Pending' });
    logActivity({ icon:'invoices', text:'Invoice created', client:c.id, clientName:c.name, time:'just now' });
    toast('success','Invoice created'); close(); renderTab();
  });
}

function editInvoice(c, id){
  if(!can('invoices.edit')) return toast('error','No permission to edit invoices.');
  const i = c.invoices.find(x=>x.id===id);
  if(!i) return;
  const { close } = openModal({
    title:'Update Invoice',
    body:`<div class="form-grid">
      ${field('Number',input('value="'+esc(i.number)+'" id="inv-num"'))}
      ${field('Amount (Rs.)',input('type="number" value="'+i.amount+'" id="inv-amt"'))}
      ${field('Status',select('<option'+(i.status==='Paid'?' selected':'')+'>Paid</option><option'+(i.status==='Pending'?' selected':'')+'>Pending</option><option'+(i.status==='Overdue'?' selected':'')+'>Overdue</option>', 'id="inv-status"'))}
    </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    saveRecord(c.id, 'invoices', { id:i.id, number:modal.querySelector('#inv-num').value, amount:Number(modal.querySelector('#inv-amt').value), status:modal.querySelector('#inv-status').value });
    toast('success','Invoice updated'); close(); renderTab();
  });
}

function addExpense(c){
  if(!can('expenses.create')) return toast('error','No permission to add expenses.');
  const cats = ['Software','Travel','Training','Marketing','Logistics','Equipment','Vehicle','Inventory','Fuel','Other'];
  const { close } = openModal({
    title:'Add Expense', body:`<div class="form-grid">
      ${field('Category',select(cats.map(x=>`<option>${x}</option>`).join(''), 'id="exp-cat"'))}
      ${field('Amount (Rs.)',input('type="number" id="exp-amt" placeholder="0"'))}
      ${field('Date',input('type="date" value="'+dateISO()+'" id="exp-date"'))}
    </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Add Expense</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    const amt = Number(modal.querySelector('#exp-amt').value);
    if(!amt) return toast('error','Enter an amount.');
    saveRecord(c.id, 'expenses', { category:modal.querySelector('#exp-cat').value, clientId:c.id, amount:amt, date:modal.querySelector('#exp-date').value, status:'Pending' });
    toast('success','Expense added'); close(); renderTab();
  });
}

function editExpense(c, id){
  if(!can('expenses.edit')) return toast('error','No permission to edit expenses.');
  const e = c.expenses.find(x=>x.id===id);
  if(!e) return;
  const cats = ['Software','Travel','Training','Marketing','Logistics','Equipment','Vehicle','Inventory','Fuel','Other'];
  const { close } = openModal({
    title:'Edit Expense', body:`<div class="form-grid">
      ${field('Category',select(cats.map(x=>`<option${x===e.category?' selected':''}>${x}</option>`).join(''), 'id="exp-cat"'))}
      ${field('Amount (Rs.)',input('type="number" value="'+e.amount+'" id="exp-amt"'))}
      ${field('Status',select('<option'+(e.status==='Approved'?' selected':'')+'>Approved</option><option'+(e.status==='Pending'?' selected':'')+'>Pending</option>', 'id="exp-status"'))}
    </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Save</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    saveRecord(c.id, 'expenses', { id:e.id, category:modal.querySelector('#exp-cat').value, amount:Number(modal.querySelector('#exp-amt').value), status:modal.querySelector('#exp-status').value });
    toast('success','Expense updated'); close(); renderTab();
  });
}

function uploadDocument(c){
  if(!can('documents.upload')) return toast('error','No permission to upload documents.');
  const types = ['Bank statements','Invoices','Receipts','Tax documents','Payroll documents','Contracts','Other'];
  const { close } = openModal({
    title:'Upload Document', body:`<div class="form-grid">
      ${field('File name',input('id="doc-name" placeholder="e.g. Bank Statement — Aug 2026"'))}
      ${field('Type',select(types.map(x=>`<option>${x}</option>`).join(''), 'id="doc-type"'))}
    </div>`,
    footer:`<button class="btn" data-close>Cancel</button><button class="btn primary" data-save>Upload</button>`
  });
  const modal = document.querySelector('.modal:last-child');
  modal.querySelector('[data-close]').addEventListener('click', close);
  modal.querySelector('[data-save]').addEventListener('click', () => {
    const name = modal.querySelector('#doc-name').value.trim();
    if(!name) return toast('error','Enter a file name.');
    saveRecord(c.id, 'documents', { name, type:modal.querySelector('#doc-type').value, status:'Needs Review', date:dateISO() });
    toast('success','Document uploaded'); close(); renderTab();
  });
}

function markTaxFiled(c){
  if(!canEditModule('tax')) return toast('error','No permission to update tax.');
  saveRecord(c.id, 'tasks', { title:'Tax return update', due:dateISO(), priority:'Low', clientId:c.id, assignee: currentUser().name, status:'Completed' });
  c.tax.returnStatus = 'Filed';
  c.tax.reviewStatus = 'Completed';
  const r = c.tax.returns[0];
  if(r){ r.status = 'ok'; }
  logActivity({ icon:'tax', text:'Tax return marked filed', client:c.id, clientName:c.name, time:'just now' });
  toast('success','Tax position updated (demo)'); renderTab();
}

function dateISO(){
  return new Date().toISOString().slice(0,10);
}
