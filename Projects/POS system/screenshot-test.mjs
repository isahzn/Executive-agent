import { chromium } from 'playwright';

const BASE = 'http://localhost:8123/index.html';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function boot(page, email) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 10000 });
  await sleep(2000); // Wait for dynamic login page to render
  // Click the demo user button for quick login
  const btn = page.locator(`button.demo-user[data-email="${email}"]`);
  const count = await btn.count();
  console.log(`  Demo buttons found: ${count}`);
  if (count > 0) {
    await btn.click();
  } else {
    // Fallback: wait longer and retry
    await sleep(2000);
    const retry = page.locator(`button.demo-user[data-email="${email}"]`);
    if (await retry.count() > 0) {
      await retry.click();
    } else {
      console.log('  ERROR: Could not find login button');
      return false;
    }
  }
  await sleep(1500);
  return true;
}

async function nav(page, key, params) {
  if (params) {
    await page.evaluate(({k, p}) => window.__nav(k, p), {k: key, p: params});
  } else {
    await page.evaluate((k) => window.__nav(k), key);
  }
  await sleep(800);
}

async function shot(page, name) {
  await sleep(300);
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  console.log(`  ✓ ${name}`);
}

async function clickTab(page, tab) {
  const btn = page.locator(`[data-tab="${tab}"]`);
  if (await btn.count()) {
    await btn.click();
    await sleep(600);
    return true;
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // ─── ADMIN ───
  console.log('\n=== ADMIN ===');
  const ok = await boot(page, 'admin@abc.lk');
  if (!ok) { await browser.close(); process.exit(1); }

  const adminPages = ['dashboard','clients','accounting','tax','invoices','expenses','documents','reports','tasks','team','integrations','settings','admin'];
  for (const p of adminPages) {
    await nav(page, p);
    await shot(page, `admin-${p}`);
  }

  // Client workspace
  await nav(page, 'client', { clientId: 'c-silva' });
  await shot(page, 'admin-client-silva-overview');
  for (const tab of ['accounting','tax','documents','invoices','expenses','reports']) {
    if (await clickTab(page, tab)) {
      await shot(page, `admin-client-silva-${tab}`);
    }
  }

  // ─── AMARA ───
  console.log('\n=== AMARA PERERA ===');
  await page.evaluate(() => sessionStorage.clear());
  await boot(page, 'amara@abc.lk');

  for (const p of ['dashboard','clients','accounting','tax','invoices','expenses','documents','reports','tasks','team','settings']) {
    await nav(page, p);
    await shot(page, `amara-${p}`);
  }

  // Client workspace
  await nav(page, 'client', { clientId: 'c-silva' });
  await shot(page, 'amara-client-silva-overview');
  for (const tab of ['accounting','tax','documents','invoices','expenses','reports']) {
    if (await clickTab(page, tab)) {
      await shot(page, `amara-client-silva-${tab}`);
    }
  }

  await browser.close();
  console.log('\n✅ Done');
})();
