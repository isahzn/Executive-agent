const rupee = new Intl.NumberFormat('en-LK', { style:'currency', currency:'LKR', maximumFractionDigits:0 });

export function money(n){
  const v = Math.round(Number(n) || 0);
  return rupee.format(v).replace('LKR','Rs.');
}

export function moneyK(n){
  const v = Number(n) || 0;
  if(Math.abs(v) >= 1_000_000) return 'Rs. ' + (v/1_000_000).toFixed(2).replace(/\.00$/,'') + 'M';
  if(Math.abs(v) >= 1_000) return 'Rs. ' + (v/1_000).toFixed(2).replace(/\.00$/,'') + 'K';
  return money(v);
}

export function num(n){
  return new Intl.NumberFormat('en-LK').format(Number(n) || 0);
}

export function pct(n){
  return (Number(n) || 0).toFixed(1).replace(/\.0$/,'') + '%';
}

export function esc(s){
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

export function uid(prefix){
  return (prefix||'id') + '-' + Math.random().toString(36).slice(2,9);
}

export function today(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

export function daysAgo(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0,10);
}

export function relTime(dateStr){
  if(!dateStr) return '';
  const diff = Math.round((new Date(dateStr) - new Date()) / 60000);
  if(diff >= -59 && diff <= 0) return 'just now';
  const mins = Math.abs(diff);
  if(mins < 60) return mins + ' min ago';
  const hrs = Math.round(mins/60);
  if(hrs < 24) return hrs + ' hr ago';
  const days = Math.round(hrs/24);
  if(days < 30) return days + ' day' + (days>1?'s':'') + ' ago';
  return dateStr;
}

export function initials(name){
  return String(name||'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
}
