import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), '.artifacts', 'ui-verification');
const CDP_PORT = process.env.CDP_PORT || 9222;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Normalizes URL pathnames by removing trailing slashes while preserving root '/'
 * @param {string} pathname
 * @returns {string}
 */
export function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

/**
 * Selects a matching Chrome DevTools target tab strictly based on target APP_URL origin and pathname.
 * Requires page target type and an active webSocketDebuggerUrl.
 * Throws immediately without fallback to prevent unintended tab manipulation.
 *
 * @param {Array} tabs - List of tab objects from Chrome DevTools /json/list
 * @param {string} appUrl - Target application URL (e.g. process.env.APP_URL or default)
 * @returns {Object} Matched target tab object
 */
export function selectTargetTab(tabs, appUrl) {
  if (!Array.isArray(tabs)) {
    throw new Error('Daftar tabs Chrome DevTools tidak valid atau bukan array.');
  }

  let targetUrlObj;
  try {
    targetUrlObj = new URL(appUrl);
  } catch (err) {
    throw new Error(`APP_URL tidak valid: "${appUrl}". Error: ${err.message}`);
  }

  const targetOrigin = targetUrlObj.origin.toLowerCase();
  const targetPath = normalizePath(targetUrlObj.pathname);

  const matchedTab = tabs.find((t) => {
    if (!t || typeof t.url !== 'string' || !t.webSocketDebuggerUrl) {
      return false;
    }
    // Only inspect page targets, strictly require type === 'page'
    if (t.type !== 'page') {
      return false;
    }

    try {
      const tabUrlObj = new URL(t.url);
      const tabOrigin = tabUrlObj.origin.toLowerCase();
      const tabPath = normalizePath(tabUrlObj.pathname);
      return tabOrigin === targetOrigin && tabPath === targetPath;
    } catch {
      return false;
    }
  });

  if (!matchedTab) {
    throw new Error(
      `Target tab browser untuk APP_URL "${appUrl}" (origin: ${targetOrigin}, path: ${targetPath}) tidak ditemukan atau tidak memiliki webSocketDebuggerUrl aktif di Chrome DevTools.`
    );
  }

  return matchedTab;
}

async function run() {
  const tabsRes = await fetch(`http://localhost:${CDP_PORT}/json/list`);
  const tabs = await tabsRes.json();
  const upazTab = selectTargetTab(tabs, APP_URL);
  const ws = new WebSocket(upazTab.webSocketDebuggerUrl);

  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    const handler = (evt) => {
      const res = JSON.parse(evt.data);
      if (res.id === id) {
        ws.removeEventListener('message', handler);
        if (res.error) reject(new Error(res.error.message));
        else resolve(res.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  console.log('Connected to CDP at target:', upazTab.title);

  async function setViewport(width, height) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 1024,
    });
    await new Promise(r => setTimeout(r, 400));
  }

  async function takeScreenshot(filename) {
    if (!fs.existsSync(ARTIFACT_DIR)) {
      fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    }
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${filename} (at ${fullPath})`);
  }

  async function evalInPage(fnString) {
    const res = await send('Runtime.evaluate', {
      expression: `(${fnString})()`,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text;
      throw new Error(`Browser Runtime.evaluate error: ${desc}`);
    }
    return res.result?.value;
  }

  // =========================================================================
  // TEST 1: Mobile 375px Layout & Zero Horizontal Overflow (Temuan A)
  // =========================================================================
  console.log('\n--- Running Test 1: Mobile 375px Layout & Zero Horizontal Overflow ---');
  await setViewport(375, 812);
  await send('Page.navigate', { url: APP_URL });
  await new Promise(r => setTimeout(r, 1500));

  const initialMetrics = await evalInPage(`() => {
    const docW = document.documentElement.clientWidth;
    const docScrollW = document.documentElement.scrollWidth;
    const form = document.querySelector('form#config-form-panel');
    const onu = document.querySelector('#onuId');
    const iface = document.querySelector('#interfaceOlt');
    if (!form || !onu || !iface) {
      throw new Error('Elemen form atau input mandatory tidak ditemukan di DOM!');
    }
    const fRect = form.getBoundingClientRect();
    const onuRect = onu.getBoundingClientRect();
    const ifaceRect = iface.getBoundingClientRect();

    return {
      docW,
      docScrollW,
      formWidth: fRect.width,
      formLeft: fRect.left,
      formRight: fRect.right,
      onuLeft: onuRect.left,
      onuRight: onuRect.right,
      onuWidth: onuRect.width,
      ifaceLeft: ifaceRect.left,
      ifaceRight: ifaceRect.right,
    };
  }`);

  // Assertions for initial mobile form layout
  assert.equal(initialMetrics.docW, 375, 'Viewport width harus tepat 375px');
  assert.ok(
    initialMetrics.docScrollW <= initialMetrics.docW,
    `Root document overflow horizontal terdeteksi: scrollWidth (${initialMetrics.docScrollW}) > clientWidth (${initialMetrics.docW})`
  );
  assert.ok(
    initialMetrics.formRight <= initialMetrics.docW,
    `Sisi kanan form (${initialMetrics.formRight}) melebihi viewport (${initialMetrics.docW})`
  );
  assert.ok(
    initialMetrics.onuRight <= initialMetrics.formRight,
    `Input ONU ID (${initialMetrics.onuRight}) melebihi batas kanan form (${initialMetrics.formRight})`
  );
  console.log('✔ Assertion PASSED: Form dan input ONU ID berada seutuhnya di dalam viewport 375px.');
  await takeScreenshot('screenshot_mobile_375_form.png');

  // Fill synthetic form data using React native value setter
  await evalInPage(`() => {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    const setVal = (sel, val) => {
      const el = document.querySelector(sel);
      if (!el) throw new Error('Field ' + sel + ' tidak ditemukan');
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };

    setVal('#interfaceOlt', '1/4/2');
    setVal('#onuId', '88');
    setVal('#sn', 'ZTEGD2327302');
    setVal('#idPelanggan', '1010112678');
    setVal('#namaPelanggan', 'BUDI SANTOSO');
    setVal('#pppoeUser', '1010112678@upaz');
    setVal('#pppoePass', 'upaz12345');

    const submitBtn = document.querySelector('button[type="submit"]');
    if (!submitBtn) throw new Error('Tombol submit "Buat Skrip" tidak ditemukan');
    submitBtn.click();
  }`);
  await new Promise(r => setTimeout(r, 600));

  // Open mobile accordion Command Hub
  await evalInPage(`() => {
    const bukaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('BUKA'));
    if (!bukaBtn) throw new Error('Tombol accordion BUKA tidak ditemukan');
    bukaBtn.click();
    window.scrollTo(0, document.body.scrollHeight);
  }`);
  await new Promise(r => setTimeout(r, 600));

  const mobileOpenMetrics = await evalInPage(`() => {
    const docW = document.documentElement.clientWidth;
    const docScrollW = document.documentElement.scrollWidth;
    const cmdHub = document.querySelector('#command-list-mobile')?.closest('.w-full');
    const cmdHeader = cmdHub?.firstElementChild;
    const tablist = cmdHub?.querySelector('[role="tablist"]');
    const c300Btn = document.querySelector('#olt-tab-c300-mobile');
    if (!cmdHub || !cmdHeader || !tablist || !c300Btn) {
      throw new Error('Komponen Command Hub mobile tidak lengkap setelah dibuka');
    }
    const hRect = cmdHeader.getBoundingClientRect();
    const tRect = tablist.getBoundingClientRect();
    const c300Rect = c300Btn.getBoundingClientRect();

    return {
      docW,
      docScrollW,
      cmdHeaderWidth: hRect.width,
      cmdHeaderScrollW: cmdHeader.scrollWidth,
      tablistRight: tRect.right,
      c300Right: c300Rect.right,
      headerRight: hRect.right,
    };
  }`);

  assert.ok(
    mobileOpenMetrics.docScrollW <= mobileOpenMetrics.docW,
    `Halaman overflow saat Command Hub mobile dibuka: scrollWidth (${mobileOpenMetrics.docScrollW}) > clientWidth (${mobileOpenMetrics.docW})`
  );
  assert.ok(
    mobileOpenMetrics.cmdHeaderScrollW <= mobileOpenMetrics.cmdHeaderWidth,
    `Header Command Hub overflow: scrollWidth (${mobileOpenMetrics.cmdHeaderScrollW}) > clientWidth (${mobileOpenMetrics.cmdHeaderWidth})`
  );
  assert.ok(
    mobileOpenMetrics.c300Right <= mobileOpenMetrics.headerRight,
    `Switch OLT C300 (${mobileOpenMetrics.c300Right}) keluar dari batas header Command Hub (${mobileOpenMetrics.headerRight})`
  );
  console.log('✔ Assertion PASSED: Command Hub mobile terbuka tanpa overflow horizontal (scrollWidth <= 375px).');
  await takeScreenshot('screenshot_mobile_375_command_hub_open.png');

  // =========================================================================
  // TEST 2: Error Salin Display & Retry Success (Temuan B)
  // =========================================================================
  console.log('\n--- Running Test 2: Error Salin Full Message & Retry Success ---');
  await setViewport(1280, 900);
  await send('Page.navigate', { url: APP_URL });
  await new Promise(r => setTimeout(r, 1200));

  // Generate valid script first
  await evalInPage(`() => {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    const setVal = (sel, val) => {
      const el = document.querySelector(sel);
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setVal('#interfaceOlt', '1/4/2');
    setVal('#onuId', '88');
    setVal('#sn', 'ZTEGD2327302');
    setVal('#idPelanggan', '1010112678');
    setVal('#namaPelanggan', 'BUDI SANTOSO');
    setVal('#pppoeUser', '1010112678@upaz');
    setVal('#pppoePass', 'upaz12345');
    document.querySelector('button[type="submit"]').click();
  }`);
  await new Promise(r => setTimeout(r, 600));

  // Get generated output text
  const expectedOltScript = await evalInPage(`() => {
    const pre = document.querySelector('pre');
    if (!pre) throw new Error('Output skrip OLT belum dihasilkan');
    return pre.textContent;
  }`);
  assert.ok(expectedOltScript.length > 50, 'Output skrip OLT harus memiliki konten konfigurasi yang valid');

  // Step 2a: Mock clipboard rejection (Simulasi)
  console.log('Menguji penanganan simulasi error clipboard reject...');
  await evalInPage(`() => {
    window.__originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = async () => {
      throw new Error("Failed to execute 'writeText' on 'Clipboard': Write permission denied by browser security policy.");
    };
    const salinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SALIN'));
    if (!salinBtn) throw new Error('Tombol SALIN tidak ditemukan di kartu output');
    salinBtn.click();
  }`);
  await new Promise(r => setTimeout(r, 600));

  const failCheck = await evalInPage(`() => {
    const alerts = Array.from(document.querySelectorAll('[role="alert"]'));
    const copyErrorAlert = alerts.find(a => a.textContent.includes('Gagal menyalin'));
    const tersalinBadge = Array.from(document.querySelectorAll('*')).find(el => el.textContent.includes('TERSALIN!'));
    const salinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SALIN'));

    return {
      hasErrorAlert: !!copyErrorAlert,
      errorText: copyErrorAlert ? copyErrorAlert.textContent : null,
      hasTersalinBadge: !!tersalinBadge,
      isButtonUsable: salinBtn ? !salinBtn.disabled : false,
      buttonText: salinBtn ? salinBtn.textContent.trim() : null,
    };
  }`);

  assert.ok(failCheck.hasErrorAlert, 'Alert pesan error gagal menyalin harus ditampilkan');
  assert.ok(
    failCheck.errorText.includes("Gagal menyalin: Failed to execute 'writeText' on 'Clipboard': Write permission denied"),
    `Pesan error harus memuat pesan lengkap, aktual: "${failCheck.errorText}"`
  );
  assert.equal(failCheck.hasTersalinBadge, false, 'Status berhasil TERSALIN! tidak boleh tampil saat penyalinan gagal');
  assert.ok(failCheck.isButtonUsable, 'Tombol Salin harus tetap terlihat dan aktif untuk retry');
  console.log('✔ Assertion PASSED: Pesan error Salin terbaca utuh, tanpa sukses palsu, dan tombol retry aktif.');
  await takeScreenshot('screenshot_copy_error_full.png');

  // Step 2b: Mock clipboard resolution (Simulasi retry sukses)
  console.log('Menguji retry penyalinan clipboard dengan mock resolve...');
  await evalInPage(`() => {
    window.__copiedPayload = null;
    navigator.clipboard.writeText = async (text) => {
      window.__copiedPayload = text;
    };
    const salinBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SALIN'));
    salinBtn.click();
  }`);
  await new Promise(r => setTimeout(r, 600));

  const successCheck = await evalInPage(`() => {
    const alerts = Array.from(document.querySelectorAll('[role="alert"]'));
    const copyErrorAlert = alerts.find(a => a.textContent.includes('Gagal menyalin'));
    const tersalinBadge = Array.from(document.querySelectorAll('*')).find(el => el.textContent.includes('TERSALIN!'));

    return {
      errorCleared: !copyErrorAlert,
      tersalinFound: !!tersalinBadge,
      copiedPayload: window.__copiedPayload,
    };
  }`);

  assert.ok(successCheck.errorCleared, 'Error banner harus dibersihkan setelah retry berhasil');
  assert.ok(successCheck.tersalinFound, 'Indikator status TERSALIN! harus muncul setelah retry berhasil');
  assert.equal(
    successCheck.copiedPayload,
    expectedOltScript,
    'Teks payload yang diterima clipboard harus persis sama dengan teks konfigurasi yang ditampilkan'
  );
  console.log('✔ Assertion PASSED: Retry membersihkan error, menampilkan TERSALIN!, dan payload teks identik.');
  await takeScreenshot('screenshot_copy_retry_success.png');

  // Restore clipboard mock
  await evalInPage(`() => {
    if (window.__originalWriteText) navigator.clipboard.writeText = window.__originalWriteText;
  }`);

  // =========================================================================
  // TEST 3: Script States (Empty, Generated, Stale)
  // =========================================================================
  console.log('\n--- Running Test 3: Output States (Empty, Generated, Stale) ---');
  await send('Page.navigate', { url: APP_URL });
  await new Promise(r => setTimeout(r, 1200));

  // 3a. Empty State Assertions
  const emptyCheck = await evalInPage(`() => {
    const badges = Array.from(document.querySelectorAll('span'));
    const belumDibuat = badges.find(b => b.textContent.includes('Belum Dibuat'));
    const salinBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('SALIN'));
    const allDisabled = salinBtns.every(b => b.disabled);
    return { hasBelumDibuat: !!belumDibuat, allDisabled, count: salinBtns.length };
  }`);
  assert.ok(emptyCheck.hasBelumDibuat, 'Badge "Belum Dibuat" harus ada pada state kosong');
  assert.ok(emptyCheck.allDisabled, 'Tombol Salin harus disabled saat belum ada output');
  console.log('✔ Assertion PASSED: Empty state menampilkan badge netral dan tombol Salin dinonaktifkan.');
  await takeScreenshot('screenshot_state_empty.png');

  // 3b. Generated State Assertions
  await evalInPage(`() => {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    const setVal = (sel, val) => {
      const el = document.querySelector(sel);
      nativeSetter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setVal('#interfaceOlt', '1/4/2');
    setVal('#onuId', '88');
    setVal('#sn', 'ZTEGD2327302');
    setVal('#idPelanggan', '1010112678');
    document.querySelector('button[type="submit"]').click();
  }`);
  await new Promise(r => setTimeout(r, 600));

  const genCheck = await evalInPage(`() => {
    const badges = Array.from(document.querySelectorAll('span'));
    const siapSalin = badges.find(b => b.textContent.includes('Siap Salin'));
    const salinBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('SALIN'));
    const allEnabled = salinBtns.every(b => !b.disabled);
    return { hasSiapSalin: !!siapSalin, allEnabled };
  }`);
  assert.ok(genCheck.hasSiapSalin, 'Badge "Siap Salin" harus ada setelah script digenerate');
  assert.ok(genCheck.allEnabled, 'Tombol Salin harus aktif setelah script digenerate');
  console.log('✔ Assertion PASSED: Generated state menampilkan badge Siap Salin dan tombol Salin aktif.');
  await takeScreenshot('screenshot_state_generated.png');

  // 3c. Stale State Assertions
  await evalInPage(`() => {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    const iface = document.querySelector('#interfaceOlt');
    nativeSetter.call(iface, '1/4/9');
    iface.dispatchEvent(new Event('input', { bubbles: true }));
    iface.dispatchEvent(new Event('change', { bubbles: true }));
  }`);
  await new Promise(r => setTimeout(r, 500));

  const staleCheck = await evalInPage(`() => {
    const alerts = Array.from(document.querySelectorAll('[role="alert"]'));
    const staleAlert = alerts.find(a => a.textContent.includes('Parameter input berubah'));
    const badges = Array.from(document.querySelectorAll('span'));
    const kedaluwarsaBadge = badges.find(b => b.textContent.includes('Kedaluwarsa'));
    const salinBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('SALIN'));
    const allDisabled = salinBtns.every(b => b.disabled);
    const tersalinBadge = Array.from(document.querySelectorAll('*')).find(el => el.textContent.includes('TERSALIN!'));

    return {
      hasStaleAlert: !!staleAlert,
      hasKedaluwarsaBadge: !!kedaluwarsaBadge,
      allDisabled,
      hasTersalinBadge: !!tersalinBadge,
    };
  }`);
  assert.ok(staleCheck.hasStaleAlert, 'Alert parameter input berubah harus ditampilkan saat stale');
  assert.ok(staleCheck.hasKedaluwarsaBadge, 'Badge "Kedaluwarsa" harus ditampilkan');
  assert.ok(staleCheck.allDisabled, 'Tombol Salin harus disabled saat state stale');
  assert.equal(staleCheck.hasTersalinBadge, false, 'Badge TERSALIN! tidak boleh tampil saat stale');
  console.log('✔ Assertion PASSED: Stale state menampilkan peringatan dan menonaktifkan Salin.');
  await takeScreenshot('screenshot_state_stale.png');

  // =========================================================================
  // TEST 4: Model Choice Persistence Across Breakpoints (Temuan C)
  // =========================================================================
  console.log('\n--- Running Test 4: Model Choice Persistence Across Breakpoints ---');
  // Step 4a: Start at 1000px (Mobile accordion instance)
  await setViewport(1000, 900);
  await send('Page.navigate', { url: APP_URL });
  await new Promise(r => setTimeout(r, 1200));

  // Open mobile accordion and click C300/C320 tab using specific selector
  await evalInPage(`() => {
    const bukaBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('BUKA'));
    if (!bukaBtn) throw new Error('Tombol BUKA pada mobile accordion tidak ditemukan');
    bukaBtn.click();
    const c300Tab = document.querySelector('#olt-tab-c300-mobile');
    if (!c300Tab) throw new Error('Tab #olt-tab-c300-mobile tidak ditemukan');
    c300Tab.click();
  }`);
  await new Promise(r => setTimeout(r, 500));

  const check1000 = await evalInPage(`() => {
    const c300Tab = document.querySelector('#olt-tab-c300-mobile');
    const firstCmd = document.querySelector('#command-list-mobile code');
    const commandsText = document.querySelector('#command-list-mobile')?.textContent || '';
    return {
      isSelected: c300Tab?.getAttribute('aria-selected') === 'true',
      firstCmd: firstCmd?.textContent,
      hasRestoreFactory: commandsText.includes('Restore Factory'),
    };
  }`);
  assert.ok(check1000.isSelected, 'Tab C300 pada mobile instance harus terpilih (aria-selected="true")');
  assert.ok(check1000.firstCmd.includes('gpon-olt_'), 'Sintaks perintah pertama harus format C300 (gpon-olt_)');
  assert.ok(check1000.hasRestoreFactory, 'Daftar perintah harus mencakup Restore Factory (fitur C300)');
  console.log('✔ 1000px: Model C300 terpilih dengan sintaks C300.');
  await takeScreenshot('screenshot_breakpoint_1000_c300.png');

  // Step 4b: Resize to 1100px (Laptop panel instance) WITHOUT reload or reselecting
  await setViewport(1100, 900);
  await new Promise(r => setTimeout(r, 500));

  const check1100 = await evalInPage(`() => {
    const c300Tab = document.querySelector('#olt-tab-c300-laptop');
    const firstCmd = document.querySelector('#command-list-laptop code');
    const commandsText = document.querySelector('#command-list-laptop')?.textContent || '';
    return {
      isSelected: c300Tab?.getAttribute('aria-selected') === 'true',
      firstCmd: firstCmd?.textContent,
      hasRestoreFactory: commandsText.includes('Restore Factory'),
    };
  }`);
  assert.ok(check1100.isSelected, 'Tab C300 pada laptop instance harus tetap terpilih di 1100px');
  assert.ok(check1100.firstCmd.includes('gpon-olt_'), 'Sintaks perintah laptop harus format C300');
  assert.ok(check1100.hasRestoreFactory, 'Daftar perintah laptop harus mencakup Restore Factory');
  console.log('✔ 1100px: Model C300 bertahan pada instance laptop tanpa reload.');
  await takeScreenshot('screenshot_breakpoint_1100_c300.png');

  // Step 4c: Resize to 1280px (Desktop sidebar instance) WITHOUT reload
  await setViewport(1280, 900);
  await new Promise(r => setTimeout(r, 500));

  const check1280 = await evalInPage(`() => {
    const c300Tab = document.querySelector('#olt-tab-c300-desktop');
    const firstCmd = document.querySelector('#command-list-desktop code');
    const commandsText = document.querySelector('#command-list-desktop')?.textContent || '';
    return {
      isSelected: c300Tab?.getAttribute('aria-selected') === 'true',
      firstCmd: firstCmd?.textContent,
      hasRestoreFactory: commandsText.includes('Restore Factory'),
    };
  }`);
  assert.ok(check1280.isSelected, 'Tab C300 pada desktop sidebar harus tetap terpilih di 1280px');
  assert.ok(check1280.firstCmd.includes('gpon-olt_'), 'Sintaks perintah desktop harus format C300');
  assert.ok(check1280.hasRestoreFactory, 'Daftar perintah desktop harus mencakup Restore Factory');
  console.log('✔ 1280px: Model C300 bertahan pada desktop sidebar.');
  await takeScreenshot('screenshot_breakpoint_1280_c300.png');

  // Step 4d: Resize back to 1000px
  await setViewport(1000, 900);
  await new Promise(r => setTimeout(r, 500));

  const checkReturn1000 = await evalInPage(`() => {
    const c300Tab = document.querySelector('#olt-tab-c300-mobile');
    const firstCmd = document.querySelector('#command-list-mobile code');
    return {
      isSelected: c300Tab?.getAttribute('aria-selected') === 'true',
      firstCmd: firstCmd?.textContent,
    };
  }`);
  assert.ok(checkReturn1000.isSelected, 'Tab C300 pada mobile harus tetap terpilih saat kembali ke 1000px');
  assert.ok(checkReturn1000.firstCmd.includes('gpon-olt_'), 'Sintaks perintah harus tetap format C300');
  console.log('✔ Return to 1000px: Model C300 tetap konsisten.');

  // Step 4e: Switch to C600 at 1000px and verify synchronization to 1280px
  await evalInPage(`() => {
    const c600Tab = document.querySelector('#olt-tab-c600-mobile');
    if (!c600Tab) throw new Error('Tab #olt-tab-c600-mobile tidak ditemukan');
    c600Tab.click();
  }`);
  await new Promise(r => setTimeout(r, 400));

  await setViewport(1280, 900);
  await new Promise(r => setTimeout(r, 500));

  const check1280C600 = await evalInPage(`() => {
    const c600Tab = document.querySelector('#olt-tab-c600-desktop');
    const firstCmd = document.querySelector('#command-list-desktop code');
    const commandsText = document.querySelector('#command-list-desktop')?.textContent || '';
    return {
      isSelected: c600Tab?.getAttribute('aria-selected') === 'true',
      firstCmd: firstCmd?.textContent,
      hasRestoreFactory: commandsText.includes('Restore Factory'),
    };
  }`);
  assert.ok(check1280C600.isSelected, 'Tab C600 pada desktop sidebar harus terpilih');
  assert.ok(check1280C600.firstCmd.includes('gpon_olt-'), 'Sintaks perintah C600 harus format gpon_olt-');
  assert.equal(check1280C600.hasRestoreFactory, false, 'Perintah Restore Factory tidak boleh ada di C600');
  console.log('✔ 1280px: Switch model C600 tersinkronisasi ke desktop sidebar.');
  await takeScreenshot('screenshot_breakpoint_1280_c600.png');

  // =========================================================================
  // TEST 5: Standard Breakpoints Overflow Assertions (768, 1024, 1280, 1536)
  // =========================================================================
  console.log('\n--- Running Test 5: Standard Breakpoints Check (768, 1024, 1280, 1536) ---');
  for (const w of [768, 1024, 1280, 1536]) {
    await setViewport(w, 900);
    const m = await evalInPage(`() => {
      const docW = document.documentElement.clientWidth;
      const docScrollW = document.documentElement.scrollWidth;
      return { docW, docScrollW, overflow: docScrollW > docW };
    }`);
    assert.ok(
      m.docScrollW <= m.docW,
      `Overflow horizontal pada viewport ${w}px: scrollWidth (${m.docScrollW}) > clientWidth (${m.docW})`
    );
    console.log(`✔ Viewport ${w}px: Bebas overflow (scrollWidth: ${m.docScrollW} <= clientWidth: ${m.docW})`);
  }

  // Cleanup
  await send('Emulation.clearDeviceMetricsOverride');
  ws.close();
  console.log('\n=============================================================================');
  console.log('ALL VERIFICATION ASSERTIONS PASSED WITH ZERO FAILURES (Exit code 0)');
  console.log('=============================================================================');
}

const isMain = process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();

if (isMain) {
  run().catch(err => {
    console.error('\n❌ VERIFICATION SCRIPT FAILED WITH ASSERTION ERROR:');
    console.error(err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  });
}
