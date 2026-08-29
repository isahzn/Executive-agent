import { icon } from './icons.js';

export function statusPill(kind, text){
  return `<span class="status ${kind}"><span class="dot"></span>${esc(text)}</span>`;
}

export function esc(s){
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

export function toast(type, message){
  let wrap = document.querySelector('.toast-wrap');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  const iconType = type === 'success' ? 'check' : type === 'error' ? 'warn' : 'clock';
  t.innerHTML = `<span class="ico">${icon(iconType,14)}</span><span>${esc(message)}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 200); }, 2400);
}

export function openModal({ title, body, footer, size }){
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal ${size || ''}" role="dialog" aria-modal="true">
      <div class="modal-head">
        <h3>${title}</h3>
        <button class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>`;
  const close = () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  };
  const onKey = (e) => { if(e.key === 'Escape') close(); };
  overlay.querySelector('.modal-close').addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });
  document.body.appendChild(overlay);
  return { overlay, close };
}

export function confirmModal({ title, message, confirmText='Confirm', danger=false }){
  return new Promise((resolve) => {
    const { close } = openModal({
      title,
      body: `<p class="muted" style="margin:0">${message}</p>`,
      footer: `<button class="btn" data-x>Cancel</button><button class="btn ${danger?'danger':'primary'}" data-y>${confirmText}</button>`,
    });
    const ov = document.querySelector('.modal:last-child');
    ov.querySelector('[data-x]').addEventListener('click', () => { close(); resolve(false); });
    ov.querySelector('[data-y]').addEventListener('click', () => { close(); resolve(true); });
  });
}

export function field(label, inner){
  return `<div class="field"><label>${label}</label>${inner}</div>`;
}

export function input(attrs, cls='input'){
  return `<input class="${cls}" ${attrs}>`;
}

export function select(options, attrs, cls='select'){
  return `<select class="${cls}" ${attrs}>${options}</select>`;
}

export function emptyState(iconName, title, text){
  return `<div class="empty"><div class="ic">${icon(iconName,20)}</div><b>${title}</b><p>${text}</p></div>`;
}
