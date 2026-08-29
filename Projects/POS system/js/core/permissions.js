import { PERMISSIONS, ROLE_GRANTS, ALL_KEYS, VIEW_KEYS } from '../data/db.js';

// Build the set of granted permission keys for a role template (or explicit grants).
export function buildPermissionSet(grantSpec, base){
  const spec = grantSpec || {};
  const set = new Set(base || []);
  if(spec.all){
    ALL_KEYS.forEach(k => set.add(k));
  } else if(spec.viewOnly){
    VIEW_KEYS.forEach(k => set.add(k));
  } else if(spec.deny){
    ALL_KEYS.forEach(k => set.add(k));
    spec.deny.forEach(k => set.delete(k));
  } else {
    Object.entries(spec).forEach(([module, perms]) => {
      perms.forEach(p => set.add(`${module}.${p}`));
    });
  }
  return set;
}

export function roleGrantSpec(role){
  return ROLE_GRANTS[role] || { viewOnly:true };
}

export function defaultPermissionsFor(role){
  return buildPermissionSet(roleGrantSpec(role));
}

export function can(permissionSet, key){
  return permissionSet.has(key);
}

// A module is considered editable (INPUT/EDIT column) if any non-view perm in it is granted.
export function canEditModule(permissionSet, moduleKey){
  const mod = PERMISSIONS.find(m => m.key === moduleKey);
  if(!mod) return false;
  return mod.perms.filter(p => p !== 'view').some(p => permissionSet.has(`${moduleKey}.${p}`));
}

export function moduleHasAny(permissionSet, moduleKey){
  const mod = PERMISSIONS.find(m => m.key === moduleKey);
  if(!mod) return false;
  return mod.perms.some(p => permissionSet.has(`${moduleKey}.${p}`));
}
