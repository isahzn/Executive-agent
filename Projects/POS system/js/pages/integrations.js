import { can, canEditModule } from '../core/auth.js';
import { esc } from '../core/utils.js';
import { emptyState, toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

const INTEGRATIONS = [
  { id:'xero', name:'Xero', cat:'Accounting', desc:'Sync clients, invoices and ledger entries.', connected:true, icon:'accounting' },
  { id:'quickbooks', name:'QuickBooks Online', cat:'Accounting', desc:'Import chart of accounts and transactions.', connected:false, icon:'accounting' },
  { id:'gdrive', name:'Google Drive', cat:'Documents', desc:'Store and retrieve client documents.', connected:true, icon:'documents' },
  { id:'dropbox', name:'Dropbox', cat:'Documents', desc:'Back up files and shared client folders.', connected:false, icon:'documents' },
  { id:'slack', name:'Slack', cat:'Communication', desc:'Send task and deadline notifications.', connected:true, icon:'team' },
  { id:'outlook', name:'Outlook / Email', cat:'Communication', desc:'Send invoices and reminders from the firm address.', connected:false, icon:'file' },
  { id:'irdexact', name:'IRDeXact', cat:'Tax', desc:'Lodge VAT and PAYE returns directly.', connected:false, icon:'tax' },
];

export default function render(root){
  const connected = INTEGRATIONS.filter(i => i.connected).length;
  const canManage = canEditModule('settings') || can('settings.modify');

  root.innerHTML = `
    <div class="report-kpis" style="margin-bottom:12px">
      ${[['Integrations',INTEGRATIONS.length],['Connected',connected],['Available',INTEGRATIONS.length-connected],['Setup Status',connected===INTEGRATIONS.length?'Complete':'In progress']].map(([l,v])=>`<div class="report-kpi"><small>${l}</small><b>${v}</b></div>`).join('')}
    </div>
    <div class="card">
      <div class="stack">
        ${INTEGRATIONS.map(i => `
          <div class="activity-item" style="align-items:center">
            <div class="activity-icon p">${icon(i.icon,18)}</div>
            <div style="flex:1">
              <b>${esc(i.name)}</b>
              <div class="sub">${esc(i.cat)} · ${esc(i.desc)}</div>
            </div>
            ${i.connected
              ? '<span class="status ok"><span class="dot"></span>Connected</span>'
              : '<span class="status neutral"><span class="dot"></span>Not connected</span>'}
            <button class="btn sm" data-conn="${i.id}">${i.connected?'Disconnect':'Connect'}</button>
          </div>`).join('')}
      </div>
    </div>
    <div class="note" style="margin-top:10px">${canManage?'You can manage these connections in a real deployment.':'View only — connections are shown for demo purposes.'}</div>`;

  root.querySelectorAll('[data-conn]').forEach(b => {
    b.onclick = () => {
      const item = INTEGRATIONS.find(i => i.id === b.dataset.conn);
      if(!canManage) return toast('error','You do not have permission to modify integrations.');
      item.connected = !item.connected;
      toast('success', `${item.name} ${item.connected ? 'connected' : 'disconnected'} (demo)`);
      render(root);
    };
  });
}
