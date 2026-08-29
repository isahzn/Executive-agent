import { CLIENTS, USERS, ACTIVITY, FIRM } from '../data/db.js';
import { defaultPermissionsFor } from './permissions.js';

// ─── Data abstraction layer ───
// Reads/writes demo data from an in-memory store backed by localStorage.
// Swap the load/save boundary for a real API/server to move off the demo layer.

const LS_KEY = 'abc_pm_state';

let state = null;

function nextId(prefix){
  return prefix + '-' + Math.random().toString(36).slice(2,8);
}

function initialize(){
  const persisted = read();
  const seeded = persisted || {
    users: USERS.map(u => ({
      ...u,
      customRole: u.role,
      permissionSet: [...defaultPermissionsFor(u.role)],
      customPermissions: false, // uses role template
    })),
    activity: ACTIVITY_FALLBACK(),
  };
  return seeded;
}

function ACTIVITY_FALLBACK(){
  return ACTIVITY.map(a => ({ ...a }));
}

function read(){
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persist(){
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* demo persistence is best-effort */ }
}

export function init(){
  if(!state) state = initialize();
  return state;
}

export function getState(){ return state; }

export function resetDemo(){
  state = initialize();
  try { localStorage.removeItem(LS_KEY); } catch {}
  return state;
}

export function getFirm(){
  return FIRM;
}

// ─── Clients ───
export function getClients(){
  return CLIENTS;
}
export function getClient(id){
  return CLIENTS.find(c => c.id === id);
}
export function addClient({ name, type, location, taxPosition }){
  const nc = {
    id: nextId('c'), code:'C-' + String(Math.floor(10000+Math.random()*89999)),
    name, type, location, status:'ok', firmValue:0, taxPosition: taxPosition||'Filed',
    lastActivity:'just now',
    overview:{ revenue:0, expenses:0, netProfit:0, taxLiability:0, receivables:0, payables:0 },
    transactions:[],
    tax:{ outputTax:0, inputTax:0, estimatedPayable:0, returnStatus:'Pending', filingDeadline:'2026-10-15', reviewStatus:'Not started', returns:[] },
    documents:[], invoices:[], expenses:[], tasks:[],
  };
  CLIENTS.push(nc);
  logActivity({ icon:'clients', text:`New client added: ${name}`, client:nc.id, clientName:name, time:'just now' });
  persist();
  return nc;
}
export function getVisibleClients(user){
  if(!user) return [];
  const isAdmin = user.role === 'admin';
  return CLIENTS.filter(c => isAdmin || user.assigned.includes(c.id));
}

// ─── Users ───
export function getUsers(){
  return state.users;
}
export function getUser(id){
  return state.users.find(u => u.id === id);
}
export function findByEmail(email){
  return state.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
}

export function addUser({ name, email, password, role, status='active', assigned=[] }){
  const nu = {
    id: nextId('u'), name, email, password, role,
    active: status !== 'disabled', assigned,
    lastActive:'Never', customRole:role,
    permissionSet:[...defaultPermissionsFor(role)],
    customPermissions:false,
  };
  state.users.push(nu);
  logActivity({ icon:'team', text:`Account created for ${name}`, client:null, clientName:null, time:'just now' });
  persist();
  return nu;
}

export function updateUser(id, patch){
  const u = getUser(id);
  if(!u) return null;
  Object.assign(u, patch);
  persist();
  return u;
}

export function toggleUserActive(id){
  const u = getUser(id);
  if(!u) return;
  u.active = !u.active;
  logActivity({ icon:'users', text:`Account ${u.active ? 'enabled' : 'disabled'} for ${u.name}`, client:null, clientName:null, time:'just now' });
  persist();
  return u;
}

export function setUserRole(id, role){
  const u = getUser(id);
  if(!u) return;
  u.role = role;
  u.customRole = role;
  u.customPermissions = false;
  u.permissionSet = [...defaultPermissionsFor(role)];
  logActivity({ icon:'settings', text:`Role changed to ${cap(role)} for ${u.name}`, client:null, clientName:null, time:'just now' });
  persist();
  return u;
}

export function setUserPermissions(id, permissionSet){
  const u = getUser(id);
  if(!u) return;
  u.permissionSet = [...permissionSet];
  u.customPermissions = true;
  persist();
  return u;
}

function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// ─── Record mutations (in-session demo edits) ───
const COLLECTIONS = ['transactions','invoices','expenses','tasks','documents'];

export function saveRecord(clientId, key, record){
  const client = getClient(clientId);
  if(!client || !COLLECTIONS.includes(key)) return null;
  const list = client[key] || (client[key] = []);
  if(record.id){
    const i = list.findIndex(r => r.id === record.id);
    if(i >= 0){ list[i] = { ...list[i], ...record }; return list[i]; }
  }
  const withId = { id: nextId(key.slice(0,2)), ...record };
  list.unshift(withId);
  return withId;
}

export function deleteRecord(clientId, key, id){
  const client = getClient(clientId);
  if(!client || !COLLECTIONS.includes(key)) return;
  const list = client[key];
  if(!list) return;
  const i = list.findIndex(r => r.id === id);
  if(i >= 0) list.splice(i,1);
}

// ─── Activity ───
export function logActivity(entry){
  state.activity.unshift({ id: nextId('a'), ...entry });
  if(state.activity.length > 40) state.activity.length = 40;
  persist();
}
export function getActivity(){
  return state.activity;
}
