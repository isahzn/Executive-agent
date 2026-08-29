import { init, findByEmail, getUsers, updateUser, getVisibleClients } from './store.js';
import { can as permCan, canEditModule as permCanEdit } from './permissions.js';

const SS_KEY = 'abc_pm_session';

let current = null;

function readSession(){
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function initAuth(){
  init();
  const s = readSession();
  if(s && s.userId){
    const u = getUsers().find(x => x.id === s.userId);
    if(u && u.active) current = u;
  }
  return current;
}

export function login(email, password){
  const u = findByEmail(email);
  if(!u) return { ok:false, error:'No account found for that email.' };
  if(u.password !== password) return { ok:false, error:'Incorrect password. Try one of the demo accounts.' };
  if(!u.active) return { ok:false, error:'This account is disabled. Ask an administrator to re-enable it.' };
  current = u;
  touchSession({ userId:u.id });
  updateLastActive(u.id);
  return { ok:true, user:u };
}

export function demoLogin(email){
  const u = findByEmail(email);
  if(!u) return { ok:false, error:'No demo account.' };
  if(!u.active) return { ok:false, error:'This account is disabled.' };
  current = u;
  touchSession({ userId:u.id });
  updateLastActive(u.id);
  return { ok:true, user:u };
}

export function logout(){
  current = null;
  try { sessionStorage.removeItem(SS_KEY); } catch {}
}

export function currentUser(){
  return current;
}

export function isLoggedIn(){
  return !!current;
}

export function permissionSet(){
  return current ? new Set(current.permissionSet) : new Set();
}

export function can(key){
  if(!current) return false;
  return permCan(permissionSet(), key);
}

export function canEditModule(moduleKey){
  if(!current) return false;
  if(current.role === 'admin') return true;
  return permCanEdit(permissionSet(), moduleKey);
}

export function visibleClients(){
  if(!current) return [];
  return getVisibleClients(current);
}

function updateLastActive(id){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const dd = String(now.getDate()).padStart(2,'0');
  const mo = String(now.getMonth()+1).padStart(2,'0');
  updateUser(id, { lastActive: `${now.getFullYear()}-${mo}-${dd} ${hh}:${mm}` });
}

// Persist a login but reset any prior session.
export function touchSession(payload){
  try { sessionStorage.setItem(SS_KEY, JSON.stringify(payload)); } catch {}
}
