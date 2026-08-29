import { getUsers, getFirm } from '../core/store.js';
import { login, demoLogin } from '../core/auth.js';
import { esc } from '../core/utils.js';
import { toast } from '../components/ui.js';
import { icon } from '../components/icons.js';

export function render(overlay){
  const firm = getFirm();
  const demoUsers = getUsers().filter(u => u.active);
  overlay.className = 'login-page';
  overlay.innerHTML = `
    <form class="login-card" id="loginForm">
      <div class="login-brand">
        <div class="logo">${icon('accounting',20)}</div>
        <div><h1>${esc(firm.name)}</h1><span class="muted">${esc(firm.subtitle)}</span></div>
      </div>
      <p class="muted" style="margin:0 0 18px">Sign in to the practice management workspace.</p>
      <div class="field">
        <label>Email</label>
        <input class="input" name="email" type="email" placeholder="you@abc.lk" autocomplete="username" autofocus>
      </div>
      <div class="field">
        <label>Password</label>
        <input class="input" name="password" type="password" placeholder="••••••••" autocomplete="current-password">
      </div>
      <div class="login-error" id="loginError" style="display:none"></div>
      <button class="btn primary" type="submit" style="width:100%">${icon('log',15)} Sign in</button>
      <div class="login-note">Demo accounts — tap a name below to sign in instantly. All data is fictional.</div>
      <div class="demo-users">
        ${demoUsers.map(u => `<button type="button" class="demo-user" data-email="${esc(u.email)}">
          <span class="avatar sm">${esc(u.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase())}</span>
          <span class="du-main"><b>${esc(u.name)}</b><small>${esc(u.role)} · ${esc(u.email)}</small></span>
        </button>`).join('')}
      </div>
    </form>`;

  const form = overlay.querySelector('#loginForm');
  const err = overlay.querySelector('#loginError');
  const showErr = (m) => { err.textContent = m; err.style.display = 'block'; };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    const res = login(email, password);
    if(!res.ok){ showErr(res.error); return; }
    toast('success', `Welcome back, ${res.user.name}`);
    window.__boot();
  });
  overlay.querySelectorAll('.demo-user').forEach(b => {
    b.addEventListener('click', () => {
      const res = demoLogin(b.dataset.email);
      if(!res.ok){ showErr(res.error); return; }
      toast('success', `Signed in as ${res.user.name} (demo)`);
      window.__boot();
    });
  });
}
