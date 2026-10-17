import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/INVANSION/.gemini/antigravity-ide/brain/ca049200-e1f5-41b9-9c43-da40bd78a4a4";

async function cdpCall(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener("message", handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalInPage(ws, expression) {
  const res = await cdpCall(ws, "Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(JSON.stringify(res.exceptionDetails));
  }
  return res.result.value;
}

async function captureScreenshot(ws, filename) {
  const res = await cdpCall(ws, "Page.captureScreenshot", { format: "png" });
  const buffer = Buffer.from(res.data, "base64");
  const filePath = path.join(ARTIFACT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
  return filePath;
}

async function main() {
  console.log("Connecting to Chrome DevTools Protocol...");
  const ws = new WebSocket("ws://127.0.0.1:9222/devtools/page/D3E92B0BBE11B1EF1BCD447CA2EC0B9A");
  await new Promise((resolve) => (ws.onopen = resolve));

  await cdpCall(ws, "Page.enable");
  await cdpCall(ws, "Runtime.enable");

  // =========================================================================
  // SECTION 1: DESKTOP VIEWPORT VERIFICATION (1280x800)
  // =========================================================================
  console.log("\n--- Starting Desktop Verification (1280x800) ---");
  await cdpCall(ws, "Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdpCall(ws, "Page.navigate", { url: "http://localhost:3000/" });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Fill valid synthetic target
  console.log("1. Filling valid synthetic target into form...");
  const fillResult = await evalInPage(
    ws,
    `(() => {
      const setVal = (placeholder, val) => {
        const input = Array.from(document.querySelectorAll('input')).find(i => i.placeholder === placeholder);
        if (input) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      setVal('1/4/2', '1/4/2');
      setVal('88', '88');
      setVal('ZTEGD2327302', 'ZTEGD2327302');
      setVal('1010112678', '1010112678');
      setVal('BUDI SANTOSO', 'BUDI SANTOSO');
      return {
        interface: Array.from(document.querySelectorAll('input')).find(i => i.placeholder === '1/4/2')?.value,
        onu: Array.from(document.querySelectorAll('input')).find(i => i.placeholder === '88')?.value,
        sn: Array.from(document.querySelectorAll('input')).find(i => i.placeholder === 'ZTEGD2327302')?.value,
      };
    })()`
  );
  console.log("Form values filled:", fillResult);
  await new Promise((r) => setTimeout(r, 500));

  // 2. Simulate clipboard rejected
  console.log("2. Simulating clipboard rejection...");
  await evalInPage(
    ws,
    `(() => {
      window.lastCopiedText = null;
      navigator.clipboard.writeText = (text) => {
        return Promise.reject(new Error("Simulated permission denied"));
      };
    })()`
  );

  // Click C600 Reboot command via UI
  console.log("Clicking 'Reboot Modem' button via UI on desktop...");
  const clickRebootResult = await evalInPage(
    ws,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('#command-list-desktop button'));
      const rebootBtn = buttons.find(b => b.innerText.includes('REBOOT MODEM'));
      if (!rebootBtn) return { error: 'Reboot button not found' };
      rebootBtn.click();
      return { success: true, text: rebootBtn.innerText };
    })()`
  );
  console.log("Click result:", clickRebootResult);
  await new Promise((r) => setTimeout(r, 300));

  // 3. Verify error displayed and COPIED! not shown
  const checkErrorState = await evalInPage(
    ws,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('#command-list-desktop button'));
      const rebootBtn = buttons.find(b => b.innerText.includes('REBOOT MODEM'));
      const hasCopied = document.body.innerText.includes('COPIED!');
      const rebootHasError = rebootBtn ? rebootBtn.innerText.includes('Simulated permission denied') : false;
      const globalError = document.body.innerText.includes('Gagal menyalin: Simulated permission denied');
      return { hasCopied, rebootHasError, globalError, buttonText: rebootBtn?.innerText };
    })()`
  );
  console.log("Rejection check:", checkErrorState);
  if (checkErrorState.hasCopied) throw new Error("COPIED! indicator should NOT appear on failure");
  if (!checkErrorState.rebootHasError) throw new Error("Error message should appear on reboot button");

  await captureScreenshot(ws, "ui_desktop_clipboard_rejected.png");

  // 4. Simulate clipboard success & retry
  console.log("4. Simulating clipboard success and retrying copy...");
  await evalInPage(
    ws,
    `(() => {
      navigator.clipboard.writeText = async (text) => {
        window.lastCopiedText = text;
        return Promise.resolve();
      };
    })()`
  );

  await evalInPage(
    ws,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('#command-list-desktop button'));
      const rebootBtn = buttons.find(b => b.innerText.includes('REBOOT MODEM'));
      rebootBtn.click();
    })()`
  );
  await new Promise((r) => setTimeout(r, 300));

  // 5. Verify error cleared and COPIED! displayed
  const checkSuccessState = await evalInPage(
    ws,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('#command-list-desktop button'));
      const rebootBtn = buttons.find(b => b.innerText.includes('REBOOT MODEM'));
      const hasCopiedOnReboot = rebootBtn ? rebootBtn.innerText.includes('COPIED!') : false;
      const rebootHasError = rebootBtn ? rebootBtn.innerText.includes('Simulated permission denied') : false;
      return {
        hasCopiedOnReboot,
        rebootHasError,
        lastCopiedText: window.lastCopiedText,
        buttonText: rebootBtn?.innerText
      };
    })()`
  );
  console.log("Success check on retry:", checkSuccessState);
  if (!checkSuccessState.hasCopiedOnReboot) throw new Error("COPIED! must appear on retry success");
  if (checkSuccessState.rebootHasError) throw new Error("Error must be cleared on success");

  await captureScreenshot(ws, "ui_desktop_clipboard_success_retry.png");

  // 6. Switch C600 to C300/C320 while status is active
  console.log("6. Switching desktop to C300/C320 while status is active...");
  await evalInPage(
    ws,
    `(() => {
      const c300Tab = document.getElementById('olt-tab-c300-desktop');
      if (c300Tab) c300Tab.click();
    })()`
  );
  await new Promise((r) => setTimeout(r, 300));

  const checkC300State = await evalInPage(
    ws,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('#command-list-desktop button'));
      const anyCopied = buttons.some(b => b.innerText.includes('COPIED!'));
      const restoreFactoryBtn = buttons.find(b => b.innerText.includes('RESTORE FACTORY'));
      const c300RebootBtn = buttons.find(b => b.innerText.includes('REBOOT MODEM'));
      return {
        anyCopied,
        restoreFactoryCopied: restoreFactoryBtn?.innerText.includes('COPIED!'),
        c300RebootCopied: c300RebootBtn?.innerText.includes('COPIED!'),
        buttonCount: buttons.length
      };
    })()`
  );
  console.log("C300 tab state check (no state leakage):", checkC300State);
  if (checkC300State.anyCopied) {
    throw new Error("C300 commands should NOT inherit COPIED! status from C600!");
  }
  if (checkC300State.buttonCount !== 15) {
    throw new Error(`Expected 15 commands in C300, got ${checkC300State.buttonCount}`);
  }

  await captureScreenshot(ws, "ui_desktop_switch_model_c300.png");

  // =========================================================================
  // SECTION 2: MOBILE VIEWPORT VERIFICATION (375x812)
  // =========================================================================
  console.log("\n--- Starting Mobile Verification (375x812) ---");
  await cdpCall(ws, "Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });

  await cdpCall(ws, "Page.navigate", { url: "http://localhost:3000/" });
  await new Promise((r) => setTimeout(r, 2000));

  // Fill valid synthetic target on mobile
  await evalInPage(
    ws,
    `(() => {
      const setVal = (placeholder, val) => {
        const input = Array.from(document.querySelectorAll('input')).find(i => i.placeholder === placeholder);
        if (input) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      setVal('1/4/2', '1/4/2');
      setVal('88', '88');
      setVal('ZTEGD2327302', 'ZTEGD2327302');
    })()`
  );
  await new Promise((r) => setTimeout(r, 300));

  // Open mobile accordion (BUKA)
  console.log("Opening mobile Command Hub accordion...");
  await evalInPage(
    ws,
    `(() => {
      const bukaBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('BUKA'));
      if (bukaBtn) bukaBtn.click();
    })()`
  );
  await new Promise((r) => setTimeout(r, 300));

  // Simulate mobile clipboard rejection
  console.log("Simulating mobile clipboard rejection on 'HAPUS ONU'...");
  await evalInPage(
    ws,
    `(() => {
      navigator.clipboard.writeText = () => Promise.reject(new Error("Mobile simulated error"));
      const buttons = Array.from(document.querySelectorAll('#command-list-mobile button'));
      const delBtn = buttons.find(b => b.innerText.includes('HAPUS ONU'));
      if (delBtn) delBtn.click();
    })()`
  );
  await new Promise((r) => setTimeout(r, 300));

  const mobileErrCheck = await evalInPage(
    ws,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('#command-list-mobile button'));
      const delBtn = buttons.find(b => b.innerText.includes('HAPUS ONU'));
      return {
        hasError: delBtn?.innerText.includes('Mobile simulated error'),
        hasCopied: delBtn?.innerText.includes('COPIED!'),
        buttonText: delBtn?.innerText
      };
    })()`
  );
  console.log("Mobile rejection check:", mobileErrCheck);
  if (!mobileErrCheck.hasError) throw new Error("Mobile error message missing on HAPUS ONU");
  if (mobileErrCheck.hasCopied) throw new Error("COPIED! must not show on mobile error");

  await captureScreenshot(ws, "ui_mobile_clipboard_rejected.png");

  // Mobile retry success
  console.log("Simulating mobile clipboard success retry on 'HAPUS ONU'...");
  await evalInPage(
    ws,
    `(() => {
      navigator.clipboard.writeText = async () => Promise.resolve();
      const buttons = Array.from(document.querySelectorAll('#command-list-mobile button'));
      const delBtn = buttons.find(b => b.innerText.includes('HAPUS ONU'));
      if (delBtn) delBtn.click();
    })()`
  );
  await new Promise((r) => setTimeout(r, 300));

  const mobileSuccessCheck = await evalInPage(
    ws,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('#command-list-mobile button'));
      const delBtn = buttons.find(b => b.innerText.includes('HAPUS ONU'));
      return {
        hasError: delBtn?.innerText.includes('Mobile simulated error'),
        hasCopied: delBtn?.innerText.includes('COPIED!'),
        buttonText: delBtn?.innerText
      };
    })()`
  );
  console.log("Mobile success retry check:", mobileSuccessCheck);
  if (mobileSuccessCheck.hasError) throw new Error("Mobile error must be cleared");
  if (!mobileSuccessCheck.hasCopied) throw new Error("Mobile COPIED! must appear");

  await captureScreenshot(ws, "ui_mobile_clipboard_success_retry.png");

  // Mobile switch C600 to C300 while copied is active
  console.log("Mobile switching to C300/C320 while status is active...");
  await evalInPage(
    ws,
    `(() => {
      const c300Tab = document.getElementById('olt-tab-c300-mobile');
      if (c300Tab) c300Tab.click();
    })()`
  );
  await new Promise((r) => setTimeout(r, 300));

  const mobileC300Check = await evalInPage(
    ws,
    `(() => {
      const buttons = Array.from(document.querySelectorAll('#command-list-mobile button'));
      return {
        anyCopied: buttons.some(b => b.innerText.includes('COPIED!')),
        restoreFactoryHasCopied: buttons.find(b => b.innerText.includes('RESTORE FACTORY'))?.innerText.includes('COPIED!'),
        count: buttons.length
      };
    })()`
  );
  console.log("Mobile C300 switch check:", mobileC300Check);
  if (mobileC300Check.anyCopied) throw new Error("Mobile C300 must not leak copied state");
  if (mobileC300Check.count !== 15) {
    throw new Error(`Expected 15 commands in mobile C300, got ${mobileC300Check.count}`);
  }

  await captureScreenshot(ws, "ui_mobile_switch_model_c300.png");

  // Reset Emulation
  await cdpCall(ws, "Emulation.clearDeviceMetricsOverride");

  ws.close();
  console.log("\n>>> ALL UI VERIFICATIONS COMPLETED SUCCESSFULLY! <<<");
}

main().catch((err) => {
  console.error("UI Verification Failed:", err);
  process.exit(1);
});
