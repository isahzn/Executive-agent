import { getFirm, resetDemo } from '../core/store.js';
import { currentUser, can, canEditModule } from '../core/auth.js';
import { esc } from '../core/utils.js';
import { toast, field, input } from '../components/ui.js';
import { icon } from '../components/icons.js';

export default function render(root){
  const firm = getFirm();
  const user = currentUser();
  const canModify = can('settings.modify') || canEditModule('settings');

  root.innerHTML = `
    <div class="grid-main">
      <div class="grid-tables">
        <div class="card">
          <div class="card-title"><h3>Firm Details</h3>${canModify?'<button class="btn sm" data-act="saveFirm">'+icon('check',13)+' Save</button>':''}</div>
          <div class="form-grid">
            ${field('Firm name', input(`id="set-name" value="${esc(firm.name)}" ${canModify?'':'disabled'}`))}
            ${field('Subtitle', input(`id="set-sub" value="${esc(firm.subtitle)}" ${canModify?'':'disabled'}`))}
            ${field('Total clients', input(`id="set-clients" type="number" value="${firm.totalClients}" ${canModify?'':'disabled'}`))}
            ${field('Monthly revenue (Rs.)', input(`id="set-rev" type="number" value="${firm.monthlyRevenue}" ${canModify?'':'disabled'}`))}
          </div>
        </div>
        <div class="card">
          <div class="card-title"><h3>Your Profile</h3></div>
          <div class="form-grid">
            ${field('Display name', input(`value="${esc(user.name)}" disabled`))}
            ${field('Email', input(`value="${esc(user.email)}" disabled`))}
            ${field('Role', input(`value="${esc(user.role)}" disabled`))}
          </div>
          <div class="note">Role and permissions are controlled by an administrator.</div>
        </div>
      </div>
      <div class="grid-side">
        <div class="card">
          <div class="card-title"><h3>Security</h3></div>
          <div class="stack">
            <div class="activity-item"><div class="activity-icon p">${icon('check',16)}</div><div><b>Demo authentication</b><div class="sub">Sessions stored locally in your browser.</div></div></div>
            <div class="activity-item"><div class="activity-icon o">${icon('clock',16)}</div><div><b>Password reset</b><div class="sub">Handled by an administrator.</div></div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-title"><h3>Data</h3></div>
          <div class="note">This is a demo. Data is in-memory and resets on refresh (localStorage).</div>
          <button class="btn warning sm" data-act="reset">Reset Demo Data</button>
        </div>
      </div>
    </div>`;

  const reset = root.querySelector('[data-act=reset]');
  if(reset) reset.onclick = () => {
    resetDemo();
    toast('success','Demo data has been reset to defaults.');
  };
  const save = root.querySelector('[data-act=saveFirm]');
  if(save) save.onclick = () => toast('success','Firm details saved (demo)');
}
