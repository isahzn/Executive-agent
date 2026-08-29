// ─── Demo dataset: ABC Accounting — Practice Management ───
// All data is fictional demo data (Sri Lankan-style, Rs. currency). Clearly NOT production.

export const PERMISSIONS = [
  { module:'Clients', key:'clients', perms:['view','create','edit','delete'] },
  { module:'Accounting', key:'accounting', perms:['view','input','edit','export'] },
  { module:'Tax', key:'tax', perms:['view','input','edit','generateReports','markFiled'] },
  { module:'Documents', key:'documents', perms:['view','upload','edit','delete'] },
  { module:'Reports', key:'reports', perms:['view','create','export'] },
  { module:'Invoices', key:'invoices', perms:['view','create','edit'] },
  { module:'Expenses', key:'expenses', perms:['view','create','edit'] },
  { module:'Tasks', key:'tasks', perms:['view','create','assign','complete'] },
  { module:'Team', key:'team', perms:['view','manage'] },
  { module:'Settings', key:'settings', perms:['view','modify'] },
];

export const ALL_KEYS = PERMISSIONS.flatMap(m => m.perms.map(p => `${m.key}.${p}`));
export const VIEW_KEYS = PERMISSIONS.map(m => `${m.key}.view`);

export const ROLE_GRANTS = {
  admin:  { all:true },
  manager: { deny:['clients.delete','documents.delete'] },
  accountant: {
    clients:['view'],
    accounting:['view','input','edit','export'],
    tax:['view','input','edit','generateReports','markFiled'],
    documents:['view','upload','edit'],
    reports:['view','create','export'],
    invoices:['view','create','edit'],
    expenses:['view','create','edit'],
    tasks:['view','create','assign','complete'],
    team:['view'],
    settings:['view'],
  },
  viewer: { viewOnly:true },
};

export const CLIENTS = [
  {
    id:'c-silva', code:'C-01024', name:'Silva Holdings Ltd', type:'Company', location:'Colombo',
    status:'ok', firmValue:18400000, taxPosition:'Rs. 1.24M due', lastActivity:'12 min ago',
    overview:{ revenue:18400000, expenses:12100000, netProfit:6300000, taxLiability:1240000, receivables:2400000, payables:1100000 },
    transactions:[
      { id:'t01', date:'2026-08-28', description:'Client advisory fee', account:'Service revenue', debit:0, credit:320000, status:'cleared', reconciled:true },
      { id:'t02', date:'2026-08-22', description:'Payroll — Aug cycle', account:'Wages', debit:540000, credit:0, status:'cleared', reconciled:true },
      { id:'t03', date:'2026-08-15', description:'VAT remittance', account:'Output VAT', debit:124000, credit:0, status:'cleared', reconciled:true },
      { id:'t04', date:'2026-08-09', description:'Office rent', account:'Rent', debit:180000, credit:0, status:'pending', reconciled:false },
      { id:'t05', date:'2026-08-03', description:'Bank interest', account:'Income', debit:0, credit:18500, status:'cleared', reconciled:false },
    ],
    tax:{ outputTax:1240000, inputTax:486000, estimatedPayable:754000, returnStatus:'Review', filingDeadline:'2026-09-15', reviewStatus:'In review',
      returns:[ { id:'r1', name:'VAT', period:'Aug 2026', amount:1240000, due:'2026-09-15', status:'warn' }, { id:'r2', name:'PAYE', period:'Aug 2026', amount:210000, due:'2026-09-10', status:'ok' }, { id:'r3', name:'Income Tax', period:'FY 2025/26', amount:3400000, due:'2026-11-30', status:'neutral' } ] },
    documents:[
      { id:'d1', name:'Bank Statement — Aug 2026', type:'Bank statements', status:'Processed', date:'2026-08-30' },
      { id:'d2', name:'Invoice INV-2214', type:'Invoices', status:'Needs Review', date:'2026-08-26' },
      { id:'d3', name:'VAT Return Aug 2026', type:'Tax documents', status:'Processing', date:'2026-08-24' },
      { id:'d4', name:'Payroll Summary', type:'Payroll documents', status:'Processed', date:'2026-08-20' },
      { id:'d5', name:'Service Agreement 2026', type:'Contracts', status:'Processed', date:'2026-08-01' },
    ],
    invoices:[
      { id:'i1', number:'INV-2214', date:'2026-08-22', due:'2026-09-05', amount:320000, status:'Pending' },
      { id:'i2', number:'INV-2190', date:'2026-08-02', due:'2026-08-16', amount:285000, status:'Paid' },
      { id:'i3', number:'INV-2168', date:'2026-07-18', due:'2026-08-01', amount:412000, status:'Overdue' },
    ],
    expenses:[
      { id:'e1', category:'Software', clientId:'c-silva', amount:45000, date:'2026-08-27', status:'Approved' },
      { id:'e2', category:'Travel', clientId:'c-silva', amount:18000, date:'2026-08-20', status:'Pending' },
      { id:'e3', category:'Training', clientId:'c-silva', amount:60000, date:'2026-08-11', status:'Approved' },
    ],
    tasks:[
      { id:'tk1', title:'Finalise VAT return', due:'2026-09-05', priority:'High', clientId:'c-silva', assignee:'Amara Perera', status:'In progress' },
      { id:'tk2', title:'Bank reconciliation review', due:'2026-09-04', priority:'Medium', clientId:'c-silva', assignee:'Amara Perera', status:'Pending' },
    ],
  },
  {
    id:'c-nova', code:'C-01019', name:'Nova Retail', type:'Company', location:'Dehiwala',
    status:'warn', firmValue:31800000, taxPosition:'Rs. 860K due', lastActivity:'31 min ago',
    overview:{ revenue:31800000, expenses:24000000, netProfit:7800000, taxLiability:860000, receivables:4200000, payables:2900000 },
    transactions:[
      { id:'t01', date:'2026-08-29', description:'Retail turnover — Aug', account:'Sales', debit:0, credit:2840000, status:'cleared', reconciled:true },
      { id:'t02', date:'2026-08-21', description:'Supplier payment', account:'Purchases', debit:1680000, credit:0, status:'cleared', reconciled:true },
      { id:'t03', date:'2026-08-12', description:'Utility expense', account:'Utilities', debit:92000, credit:0, status:'pending', reconciled:false },
      { id:'t04', date:'2026-08-05', description:'Interest income', account:'Income', debit:0, credit:21000, status:'cleared', reconciled:true },
    ],
    tax:{ outputTax:860000, inputTax:412000, estimatedPayable:448000, returnStatus:'Pending', filingDeadline:'2026-09-10', reviewStatus:'Awaiting data',
      returns:[ { id:'r1', name:'VAT', period:'Aug 2026', amount:860000, due:'2026-09-15', status:'warn' }, { id:'r2', name:'PAYE', period:'Aug 2026', amount:340000, due:'2026-09-10', status:'ok' } ] },
    documents:[
      { id:'d1', name:'Bank Statement — Aug 2026', type:'Bank statements', status:'Processed', date:'2026-08-31' },
      { id:'d2', name:'Sales Ledger Extract', type:'Other', status:'Missing', date:'2026-08-22' },
      { id:'d3', name:'Receipt REC-330', type:'Receipts', status:'Needs Review', date:'2026-08-18' },
    ],
    invoices:[
      { id:'i1', number:'INV-2205', date:'2026-08-12', due:'2026-08-26', amount:184000, status:'Pending' },
      { id:'i2', number:'INV-2198', date:'2026-08-01', due:'2026-08-15', amount:240000, status:'Paid' },
    ],
    expenses:[
      { id:'e1', category:'Marketing', clientId:'c-nova', amount:82000, date:'2026-08-25', status:'Approved' },
      { id:'e2', category:'Logistics', clientId:'c-nova', amount:34000, date:'2026-08-18', status:'Pending' },
    ],
    tasks:[
      { id:'tk1', title:'Reconcile August bank', due:'2026-09-04', priority:'High', clientId:'c-nova', assignee:'Amara Perera', status:'Pending' },
      { id:'tk2', title:'Collect sales ledger', due:'2026-08-28', priority:'High', clientId:'c-nova', assignee:'Nuwan Silva', status:'In progress' },
    ],
  },
  {
    id:'c-greenline', code:'C-01011', name:'Greenline Services', type:'Business', location:'Kotte',
    status:'bad', firmValue:4600000, taxPosition:'Return overdue', lastActivity:'48 min ago',
    overview:{ revenue:4600000, expenses:3900000, netProfit:700000, taxLiability:340000, receivables:380000, payables:210000 },
    transactions:[
      { id:'t01', date:'2026-08-26', description:'Service invoice', account:'Service revenue', debit:0, credit:180000, status:'cleared', reconciled:true },
      { id:'t02', date:'2026-08-19', description:'Subcontractor payment', account:'Contract labour', debit:120000, credit:0, status:'pending', reconciled:false },
      { id:'t03', date:'2026-08-08', description:'Equipment lease', account:'Lease', debit:56000, credit:0, status:'cleared', reconciled:true },
    ],
    tax:{ outputTax:340000, inputTax:120000, estimatedPayable:220000, returnStatus:'Overdue', filingDeadline:'2026-09-03', reviewStatus:'Action required',
      returns:[ { id:'r1', name:'VAT', period:'Aug 2026', amount:340000, due:'2026-09-03', status:'bad' }, { id:'r2', name:'Income Tax', period:'FY 2025/26', amount:640000, due:'2026-11-30', status:'neutral' } ] },
    documents:[
      { id:'d1', name:'Bank Statement — Aug 2026', type:'Bank statements', status:'Processed', date:'2026-08-29' },
      { id:'d2', name:'VAT Return Aug 2026', type:'Tax documents', status:'Missing', date:'2026-08-25' },
      { id:'d3', name:'Contract CL-88', type:'Contracts', status:'Needs Review', date:'2026-08-14' },
    ],
    invoices:[
      { id:'i1', number:'INV-2187', date:'2026-08-10', due:'2026-08-24', amount:180000, status:'Overdue' },
    ],
    expenses:[
      { id:'e1', category:'Equipment', clientId:'c-greenline', amount:95000, date:'2026-08-16', status:'Approved' },
    ],
    tasks:[
      { id:'tk1', title:'Lodge overdue VAT', due:'2026-09-02', priority:'High', clientId:'c-greenline', assignee:'Amara Perera', status:'Overdue' },
    ],
  },
  {
    id:'c-perera', code:'C-01007', name:'Perera Trading', type:'SME', location:'Gampaha',
    status:'ok', firmValue:7200000, taxPosition:'Filed', lastActivity:'1 hr ago',
    overview:{ revenue:7200000, expenses:5100000, netProfit:2100000, taxLiability:126000, receivables:860000, payables:540000 },
    transactions:[
      { id:'t01', date:'2026-08-27', description:'Wholesale sales', account:'Sales', debit:0, credit:640000, status:'cleared', reconciled:true },
      { id:'t02', date:'2026-08-20', description:'Stock purchase', account:'Inventory', debit:410000, credit:0, status:'cleared', reconciled:true },
      { id:'t03', date:'2026-08-10', description:'PAYE remittance', account:'PAYE', debit:126000, credit:0, status:'cleared', reconciled:true },
    ],
    tax:{ outputTax:126000, inputTax:74000, estimatedPayable:52000, returnStatus:'Filed', filingDeadline:'2026-09-10', reviewStatus:'Completed',
      returns:[ { id:'r1', name:'PAYE', period:'Aug 2026', amount:126000, due:'2026-09-10', status:'ok' }, { id:'r2', name:'VAT', period:'Aug 2026', amount:174000, due:'2026-09-15', status:'ok' } ] },
    documents:[
      { id:'d1', name:'Bank Statement — Aug 2026', type:'Bank statements', status:'Processed', date:'2026-08-30' },
      { id:'d2', name:'Invoice INV-2155', type:'Invoices', status:'Processed', date:'2026-08-21' },
    ],
    invoices:[
      { id:'i1', number:'INV-2172', date:'2026-08-08', due:'2026-08-22', amount:154000, status:'Paid' },
    ],
    expenses:[
      { id:'e1', category:'Inventory', clientId:'c-perera', amount:120000, date:'2026-08-19', status:'Approved' },
      { id:'e2', category:'Fuel', clientId:'c-perera', amount:24000, date:'2026-08-15', status:'Approved' },
    ],
    tasks:[
      { id:'tk1', title:'Prepare tax computation', due:'2026-09-06', priority:'Medium', clientId:'c-perera', assignee:'Nuwan Silva', status:'Pending' },
    ],
  },
  {
    id:'c-oceanic', code:'C-01031', name:'Oceanic Foods', type:'Company', location:'Negombo',
    status:'ok', firmValue:12400000, taxPosition:'Rs. 620K due', lastActivity:'2 hrs ago',
    overview:{ revenue:12400000, expenses:8600000, netProfit:3800000, taxLiability:620000, receivables:1900000, payables:1500000 },
    transactions:[
      { id:'t01', date:'2026-08-28', description:'Export sales', account:'Sales', debit:0, credit:920000, status:'cleared', reconciled:true },
      { id:'t02', date:'2026-08-18', description:'Raw material', account:'Purchases', debit:540000, credit:0, status:'cleared', reconciled:true },
      { id:'t03', date:'2026-08-07', description:'Freight charge', account:'Logistics', debit:78000, credit:0, status:'pending', reconciled:false },
    ],
    tax:{ outputTax:620000, inputTax:290000, estimatedPayable:330000, returnStatus:'Pending', filingDeadline:'2026-09-15', reviewStatus:'In progress',
      returns:[ { id:'r1', name:'VAT', period:'Aug 2026', amount:620000, due:'2026-09-15', status:'warn' } ] },
    documents:[
      { id:'d1', name:'Bank Statement — Aug 2026', type:'Bank statements', status:'Processed', date:'2026-08-30' },
      { id:'d2', name:'Export Documentation', type:'Other', status:'Needs Review', date:'2026-08-24' },
    ],
    invoices:[
      { id:'i1', number:'INV-2220', date:'2026-08-15', due:'2026-08-29', amount:520000, status:'Pending' },
      { id:'i2', number:'INV-2201', date:'2026-08-01', due:'2026-08-15', amount:480000, status:'Paid' },
    ],
    expenses:[
      { id:'e1', category:'Logistics', clientId:'c-oceanic', amount:88000, date:'2026-08-26', status:'Pending' },
    ],
    tasks:[
      { id:'tk1', title:'Reconcile export receipts', due:'2026-09-03', priority:'Medium', clientId:'c-oceanic', assignee:'Nuwan Silva', status:'Pending' },
    ],
  },
  {
    id:'c-abc', code:'C-01002', name:'ABC Construction', type:'Company', location:'Colombo',
    status:'warn', firmValue:22600000, taxPosition:'Rs. 1.1M due', lastActivity:'2 hrs ago',
    overview:{ revenue:22600000, expenses:18700000, netProfit:3900000, taxLiability:1100000, receivables:3400000, payables:2200000 },
    transactions:[
      { id:'t01', date:'2026-08-27', description:'Contract revenue', account:'Construction revenue', debit:0, credit:1460000, status:'cleared', reconciled:true },
      { id:'t02', date:'2026-08-21', description:'Site labour', account:'Wages', debit:620000, credit:0, status:'cleared', reconciled:true },
      { id:'t03', date:'2026-08-14', description:'Material purchase', account:'Materials', debit:940000, credit:0, status:'pending', reconciled:false },
      { id:'t04', date:'2026-08-08', description:'Equipment hire', account:'Hire', debit:260000, credit:0, status:'cleared', reconciled:true },
    ],
    tax:{ outputTax:1100000, inputTax:430000, estimatedPayable:670000, returnStatus:'Review', filingDeadline:'2026-09-15', reviewStatus:'In review',
      returns:[ { id:'r1', name:'VAT', period:'Aug 2026', amount:1100000, due:'2026-09-15', status:'warn' }, { id:'r2', name:'PAYE', period:'Aug 2026', amount:290000, due:'2026-09-10', status:'ok' } ] },
    documents:[
      { id:'d1', name:'Bank Statement — Aug 2026', type:'Bank statements', status:'Processed', date:'2026-08-31' },
      { id:'d2', name:'Contract CON-12', type:'Contracts', status:'Processed', date:'2026-08-10' },
      { id:'d3', name:'Wage Register', type:'Payroll documents', status:'Needs Review', date:'2026-08-26' },
    ],
    invoices:[
      { id:'i1', number:'INV-2218', date:'2026-08-14', due:'2026-08-28', amount:890000, status:'Overdue' },
      { id:'i2', number:'INV-2200', date:'2026-08-01', due:'2026-08-15', amount:760000, status:'Paid' },
    ],
    expenses:[
      { id:'e1', category:'Materials', clientId:'c-abc', amount:210000, date:'2026-08-22', status:'Approved' },
      { id:'e2', category:'Equipment', clientId:'c-abc', amount:94000, date:'2026-08-11', status:'Pending' },
    ],
    tasks:[
      { id:'tk1', title:'Reconcile site costs', due:'2026-09-05', priority:'High', clientId:'c-abc', assignee:'Nuwan Silva', status:'In progress' },
    ],
  },
  {
    id:'c-metro', code:'C-01015', name:'Metro Services', type:'SME', location:'Kandy',
    status:'ok', firmValue:5400000, taxPosition:'Rs. 210K due', lastActivity:'3 hrs ago',
    overview:{ revenue:5400000, expenses:4100000, netProfit:1300000, taxLiability:210000, receivables:620000, payables:390000 },
    transactions:[
      { id:'t01', date:'2026-08-26', description:'Service income', account:'Service revenue', debit:0, credit:310000, status:'cleared', reconciled:true },
      { id:'t02', date:'2026-08-19', description:'Vehicle lease', account:'Lease', debit:47000, credit:0, status:'cleared', reconciled:true },
      { id:'t03', date:'2026-08-09', description:'Fuel & maintenance', account:'Vehicle', debit:31000, credit:0, status:'pending', reconciled:false },
    ],
    tax:{ outputTax:210000, inputTax:97000, estimatedPayable:113000, returnStatus:'Ready', filingDeadline:'2026-09-15', reviewStatus:'Ready to file',
      returns:[ { id:'r1', name:'VAT', period:'Aug 2026', amount:210000, due:'2026-09-15', status:'ok' } ] },
    documents:[
      { id:'d1', name:'Bank Statement — Aug 2026', type:'Bank statements', status:'Processed', date:'2026-08-30' },
      { id:'d2', name:'Employee Contracts', type:'Contracts', status:'Missing', date:'2026-08-12' },
    ],
    invoices:[
      { id:'i1', number:'INV-2210', date:'2026-08-10', due:'2026-08-24', amount:260000, status:'Paid' },
    ],
    expenses:[
      { id:'e1', category:'Vehicle', clientId:'c-metro', amount:41000, date:'2026-08-17', status:'Approved' },
    ],
    tasks:[
      { id:'tk1', title:'Prepare VAT return', due:'2026-09-04', priority:'Medium', clientId:'c-metro', assignee:'Nuwan Silva', status:'Pending' },
    ],
  },
  // Lightweight clients to populate the Clients list
  { id:'c-colombo', code:'C-01038', name:'Colombo Textiles', type:'Company', location:'Colombo', status:'ok', firmValue:9600000, taxPosition:'Rs. 480K due', lastActivity:'4 hrs ago',
    overview:{ revenue:9600000, expenses:6900000, netProfit:2700000, taxLiability:480000, receivables:1200000, payables:800000 }, transactions:[], tax:{outputTax:480000,inputTax:210000,estimatedPayable:270000,returnStatus:'Pending',filingDeadline:'2026-09-15',reviewStatus:'In progress',returns:[{id:'r1',name:'VAT',period:'Aug 2026',amount:480000,due:'2026-09-15',status:'warn'}]}, documents:[], invoices:[], expenses:[], tasks:[] },
  { id:'c-hilltop', code:'C-01041', name:'Hilltop Estates', type:'Business', location:'Nuwara Eliya', status:'ok', firmValue:3200000, taxPosition:'Filed', lastActivity:'5 hrs ago',
    overview:{ revenue:3200000, expenses:2500000, netProfit:700000, taxLiability:90000, receivables:200000, payables:140000 }, transactions:[], tax:{outputTax:90000,inputTax:40000,estimatedPayable:50000,returnStatus:'Filed',filingDeadline:'2026-09-10',reviewStatus:'Completed',returns:[{id:'r1',name:'VAT',period:'Aug 2026',amount:90000,due:'2026-09-10',status:'ok'}]}, documents:[], invoices:[], expenses:[], tasks:[] },
  { id:'c-araliya', code:'C-01044', name:'Araliya Foods', type:'SME', location:'Galle', status:'warn', firmValue:7800000, taxPosition:'Rs. 390K due', lastActivity:'6 hrs ago',
    overview:{ revenue:7800000, expenses:6100000, netProfit:1700000, taxLiability:390000, receivables:700000, payables:460000 }, transactions:[], tax:{outputTax:390000,inputTax:180000,estimatedPayable:210000,returnStatus:'Review',filingDeadline:'2026-09-15',reviewStatus:'In review',returns:[{id:'r1',name:'VAT',period:'Aug 2026',amount:390000,due:'2026-09-15',status:'warn'}]}, documents:[], invoices:[], expenses:[], tasks:[] },
];

export const USERS = [
  { id:'u-admin', name:'Admin User', email:'admin@abc.lk', password:'admin123', role:'admin', active:true, assigned:CLIENTS.map(c=>c.id), lastActive:'2026-08-29 09:12', permissions:null },
  { id:'u-amara', name:'Amara Perera', email:'amara@abc.lk', password:'demo123', role:'accountant', active:true, assigned:['c-silva','c-nova','c-perera','c-greenline'], lastActive:'2026-08-29 08:40', permissions:null },
  { id:'u-nuwan', name:'Nuwan Silva', email:'nuwan@abc.lk', password:'demo123', role:'accountant', active:true, assigned:['c-oceanic','c-abc','c-metro'], lastActive:'2026-08-28 17:20', permissions:null },
  { id:'u-kavisha', name:'Kavisha Fernando', email:'kavisha@abc.lk', password:'demo123', role:'manager', active:true, assigned:['c-silva','c-nova','c-oceanic','c-abc'], lastActive:'2026-08-28 16:05', permissions:null },
  { id:'u-dimuthu', name:'Dimuthu Jaya', email:'dimuthu@abc.lk', password:'demo123', role:'viewer', active:true, assigned:['c-silva','c-nova'], lastActive:'2026-08-29 08:02', permissions:null },
  { id:'u-rasika', name:'Rasika Bandara', email:'rasika@abc.lk', password:'demo123', role:'accountant', active:false, assigned:['c-colombo','c-hilltop'], lastActive:'2026-08-20 11:30', permissions:null },
];

export const FIRM = {
  name:'ABC Accounting', subtitle:'Practice Management',
  totalClients:128, monthlyRevenue:2850000, taxDueMonth:1240000, pendingTasks:37,
  capacity:{ used:128, total:180, pct:72 },
  workload:[ { team:'Tax', pct:82 }, { team:'Accounts', pct:67 }, { team:'Audit', pct:51 }, { team:'Payroll', pct:38 } ],
  snapshot:[ { label:'Average Client Value', value:'Rs. 22,265', trend:'up', delta:'7.1%' }, { label:'Reports Generated', value:486, trend:'up', delta:'11.4%' }, { label:'Documents Processed', value:'3,842', trend:'up', delta:'18.2%' }, { label:'Open Issues', value:19, trend:'down', delta:'9.5%' } ],
};

export const ACTIVITY = [
  { id:'a1', icon:'check', text:'VAT return reviewed', client:'c-silva', clientName:'Silva Holdings', time:'12 min ago' },
  { id:'a2', icon:'file', text:'24 documents processed', client:'c-nova', clientName:'Nova Retail', time:'31 min ago' },
  { id:'a3', icon:'clients', text:'New client added', client:'c-oceanic', clientName:'Oceanic Foods', time:'1 hr ago' },
  { id:'a4', icon:'reports', text:'Monthly report generated', client:'c-abc', clientName:'ABC Construction', time:'2 hrs ago' },
];

export const SCHEDULED_REPORTS = [
  { id:'s1', name:'Monthly Client Pack', recipient:'Management', freq:'Monthly', next:'Sep 01, 08:00', status:'Scheduled' },
  { id:'s2', name:'Tax Exposure Report', recipient:'Tax Team', freq:'Weekly', next:'Aug 31, 07:30', status:'Scheduled' },
  { id:'s3', name:'Outstanding Fees', recipient:'Finance', freq:'Weekly', next:'Sep 01, 09:00', status:'Scheduled' },
  { id:'s4', name:'Client Profitability', recipient:'Partners', freq:'Monthly', next:'Sep 05, 09:00', status:'Paused' },
];

export const REPORT_CATEGORIES = ['Overview','Financial','Tax','Client','Documents','Invoices','Expenses','Team','Management'];
