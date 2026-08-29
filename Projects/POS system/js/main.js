import { init } from './core/store.js';
import { initAuth, isLoggedIn } from './core/auth.js';
import { boot, showLogin } from './core/router.js';

init();
initAuth();

if(isLoggedIn()) boot();
else showLogin();
