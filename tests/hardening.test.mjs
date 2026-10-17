import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidOltInterface,
  formatOltInterfaceInput,
  validateConfigForm,
  isOutputStale,
} from "../src/lib/validation.js";
import { getCommandList } from "../src/lib/commands.js";
import { copyToClipboard } from "../src/hooks/useClipboard.js";

// ============================================================================
// 1. OLT Interface Normalization & Strict Validation Tests (Production Code)
// ============================================================================

test("Interface formatting: 1.2.16 normalizes to 1/2/16", () => {
  const result = formatOltInterfaceInput("1.2.16");
  assert.equal(result, "1/2/16");
  assert.equal(isValidOltInterface(result), true);
});

test("Interface formatting: 1/2/16 remains 1/2/16 without modification", () => {
  const result = formatOltInterfaceInput("1/2/16");
  assert.equal(result, "1/2/16");
  assert.equal(isValidOltInterface(result), true);
});

test("Interface formatting: single alternative separators (comma, space, hyphen) convert cleanly", () => {
  assert.equal(formatOltInterfaceInput("1,2,16"), "1/2/16");
  assert.equal(isValidOltInterface(formatOltInterfaceInput("1,2,16")), true);

  assert.equal(formatOltInterfaceInput("1 2 16"), "1/2/16");
  assert.equal(isValidOltInterface(formatOltInterfaceInput("1 2 16")), true);

  assert.equal(formatOltInterfaceInput("1-2-16"), "1/2/16");
  assert.equal(isValidOltInterface(formatOltInterfaceInput("1-2-16")), true);
});

test("Interface contract table verification: empty segments, invalid characters, excess segments, and partial formats", () => {
  // 1. 1/2/16 -> Tetap valid sebagai 1/2/16
  assert.equal(formatOltInterfaceInput("1/2/16"), "1/2/16");
  assert.equal(isValidOltInterface(formatOltInterfaceInput("1/2/16")), true);

  // 2. 1.2.16 -> Dinormalisasi menjadi 1/2/16, valid
  assert.equal(formatOltInterfaceInput("1.2.16"), "1/2/16");
  assert.equal(isValidOltInterface(formatOltInterfaceInput("1.2.16")), true);

  // 3. 1,2,16 -> Dinormalisasi menjadi 1/2/16, valid
  assert.equal(formatOltInterfaceInput("1,2,16"), "1/2/16");
  assert.equal(isValidOltInterface(formatOltInterfaceInput("1,2,16")), true);

  // 4. 1 2 16 -> Dinormalisasi menjadi 1/2/16, valid
  assert.equal(formatOltInterfaceInput("1 2 16"), "1/2/16");
  assert.equal(isValidOltInterface(formatOltInterfaceInput("1 2 16")), true);

  // 5. 1..2..16 -> Tidak valid; jangan digabung menjadi target sah
  const doubleDots = formatOltInterfaceInput("1..2..16");
  assert.equal(doubleDots, "1//2//16");
  assert.equal(isValidOltInterface(doubleDots), false);

  // 6. 1,,2,16 -> Tidak valid
  const doubleCommas = formatOltInterfaceInput("1,,2,16");
  assert.equal(doubleCommas, "1//2/16");
  assert.equal(isValidOltInterface(doubleCommas), false);

  // 7. 1//2/16 -> Tidak valid
  const doubleSlashes = formatOltInterfaceInput("1//2/16");
  assert.equal(doubleSlashes, "1//2/16");
  assert.equal(isValidOltInterface(doubleSlashes), false);

  // 8. 1/2/ -> Parsial, belum valid
  const partialTrailing = formatOltInterfaceInput("1/2/");
  assert.equal(partialTrailing, "1/2/");
  assert.equal(isValidOltInterface(partialTrailing), false);

  // 9. 1216 -> Tidak valid, jangan ditebak
  const noDelim = formatOltInterfaceInput("1216");
  assert.equal(noDelim, "1216");
  assert.equal(isValidOltInterface(noDelim), false);

  // 10. 1a/2b/16c -> Tidak valid, jangan dibersihkan
  const withLetters = formatOltInterfaceInput("1a/2b/16c");
  assert.equal(withLetters, "1a/2b/16c");
  assert.equal(isValidOltInterface(withLetters), false);

  // 11. 1/2/16/99 -> Tidak valid, jangan dipotong
  const excessSegments = formatOltInterfaceInput("1/2/16/99");
  assert.equal(excessSegments, "1/2/16/99");
  assert.equal(isValidOltInterface(excessSegments), false);
});

// ============================================================================
// 2. Shared Form Validation & Stale Output Detection Tests
// ============================================================================

test("Form validation: catches missing required fields and rejects invalid interface formats", () => {
  const emptyForm = {
    interfaceOlt: "",
    onuId: "",
    sn: "",
    idPelanggan: "",
    pppoeUser: "",
    pppoePass: "",
  };

  const emptyResult = validateConfigForm(emptyForm);
  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.interfaceOlt);
  assert.ok(emptyResult.errors.onuId);
  assert.ok(emptyResult.errors.sn);
  assert.ok(emptyResult.errors.idPelanggan);
  assert.ok(emptyResult.errors.pppoeUser);
  assert.ok(emptyResult.errors.pppoePass);

  // Form with invalid interface values must fail validation
  const invalidInputs = ["1..2..16", "1,,2,16", "1//2/16", "1a/2b/16c", "1/2/16/99", "1216", "1/2/"];
  for (const inv of invalidInputs) {
    const formatted = formatOltInterfaceInput(inv);
    const formWithInvalid = {
      interfaceOlt: formatted,
      onuId: "88",
      sn: "ZTEGD2327302",
      idPelanggan: "1010112678",
      pppoeUser: "1010112678",
      pppoePass: "150326",
    };
    const res = validateConfigForm(formWithInvalid);
    assert.equal(res.isValid, false, `Form with interface '${inv}' (${formatted}) must be invalid`);
    assert.ok(res.errors.interfaceOlt);
  }
});

test("Form validation: accepts complete valid form data", () => {
  const validForm = {
    interfaceOlt: "1/4/2",
    onuId: "88",
    sn: "ZTEGD2327302",
    idPelanggan: "1010112678",
    pppoeUser: "1010112678",
    pppoePass: "150326",
  };

  const result = validateConfigForm(validForm);
  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, {});
});

test("Stale output tracking: returns true when input parameters or tabs change after generation", () => {
  const snapshot = {
    configType: "standard",
    interfaceOlt: "1/4/2",
    onuId: "88",
    sn: "ZTEGD2327302",
    idPelanggan: "1010112678",
    namaPelanggan: "BUDI",
    pppoeUser: "1010112678",
    pppoePass: "150326",
    paketLayanan: "KUSUMA 1",
    selectedC600Type: "standard",
    selectedUcdType: "ucd_standard",
    selectedUgrType: "ugr_standard",
    selectedUhoType: "uho_standard",
    selectedVlanType: "100",
    metroProfile: "metro10",
  };

  // Identical data -> not stale
  assert.equal(isOutputStale(snapshot, snapshot, "standard"), false);

  // Tab changed -> stale
  assert.equal(isOutputStale(snapshot, snapshot, "unb"), true);

  // Interface changed -> stale
  assert.equal(
    isOutputStale(snapshot, { ...snapshot, interfaceOlt: "1/4/3" }, "standard"),
    true
  );

  // ONU ID changed -> stale
  assert.equal(
    isOutputStale(snapshot, { ...snapshot, onuId: "89" }, "standard"),
    true
  );

  // ID Pelanggan changed -> stale
  assert.equal(
    isOutputStale(snapshot, { ...snapshot, idPelanggan: "9999999999" }, "standard"),
    true
  );

  // Credentials changed -> stale
  assert.equal(
    isOutputStale(snapshot, { ...snapshot, pppoePass: "newpass" }, "standard"),
    true
  );

  // Subvariant changed -> stale
  assert.equal(
    isOutputStale(snapshot, { ...snapshot, selectedC600Type: "bridge" }, "standard"),
    true
  );
});

// ============================================================================
// 3. Command Hub Production getCommandList Tests (Direct Production Function)
// ============================================================================

test("Command Hub (Production getCommandList): empty or invalid targets disable dependent commands", () => {
  // 1. Form completely empty
  const emptyCommands = getCommandList({ interfaceOlt: "", onuId: "", sn: "" }, "c600");
  for (const item of emptyCommands) {
    if (item.id === "c600_uncfg_sn") {
      assert.equal(item.isReady, true, "Targetless command must stay usable when empty");
    } else {
      assert.equal(item.isReady, false, `${item.label} must be disabled when target is empty`);
      assert.ok(item.missingHint, `${item.label} must have missingHint`);
    }
  }

  // 2. Form with invalid interface with repeating separators or letters (1..2..16 or 1a/2b/16c)
  const invalidInputs = ["1..2..16", "1a/2b/16c", "1/2/16/99", "1216", "1//2/16"];
  for (const inv of invalidInputs) {
    const formatted = formatOltInterfaceInput(inv);
    const commands = getCommandList(
      { interfaceOlt: formatted, onuId: "88", sn: "ZTEGD2327302" },
      "c600"
    );
    for (const item of commands) {
      if (item.id === "c600_uncfg_sn") {
        assert.equal(item.isReady, true);
      } else {
        assert.equal(
          item.isReady,
          false,
          `${item.label} must be disabled when interface is '${inv}' (${formatted})`
        );
      }
    }
  }

  // 3. C300 mode with missing ONU ID
  const missingOnuCommands = getCommandList(
    { interfaceOlt: "1/4/2", onuId: "", sn: "ZTEGD2327302" },
    "c300"
  );
  const rebootCmd = missingOnuCommands.find((c) => c.id === "c300_reboot");
  assert.equal(rebootCmd.isReady, false);
  assert.equal(rebootCmd.missingHint, "Butuh ONU ID");

  const portCmd = missingOnuCommands.find((c) => c.id === "c300_rx_power");
  assert.equal(portCmd.isReady, true, "Port-level command only needs valid interface");

  const uncfgCmd = missingOnuCommands.find((c) => c.id === "c300_uncfg_sn");
  assert.equal(uncfgCmd.isReady, true, "Targetless C300 command must stay usable");
});

test("Command Hub (Production getCommandList): valid targets generate exact existing CLI syntax", () => {
  const validData = {
    interfaceOlt: "1/4/2",
    onuId: "88",
    sn: "ZTEGD2327302",
  };

  // C600 command generation from production function
  const c600List = getCommandList(validData, "c600");
  const c600Power = c600List.find((c) => c.id === "c600_rx_power");
  assert.equal(c600Power.cmd, "sho pon power onu-rx gpon_olt-1/4/2");
  assert.equal(c600Power.isReady, true);

  const c600Reboot = c600List.find((c) => c.id === "c600_reboot");
  assert.equal(c600Reboot.cmd, "conf t\npon-onu-mng gpon_onu-1/4/2:88\nreboot");
  assert.equal(c600Reboot.isReady, true);

  const c600Delete = c600List.find((c) => c.id === "c600_delete_onu");
  assert.equal(c600Delete.cmd, "conf t\ninterface gpon_olt-1/4/2\nno onu 88");
  assert.equal(c600Delete.isReady, true);

  const c600Activate = c600List.find((c) => c.id === "c600_activate_port");
  assert.equal(c600Activate.cmd, "conf t\ninterface gpon_olt-1/4/2\nno shutdown");
  assert.equal(c600Activate.isReady, true);

  const c600Uncfg = c600List.find((c) => c.id === "c600_uncfg_sn");
  assert.equal(c600Uncfg.cmd, "sho pon onu un");
  assert.equal(c600Uncfg.isReady, true);

  // C300 command generation from production function
  const c300List = getCommandList(validData, "c300");
  const c300Power = c300List.find((c) => c.id === "c300_rx_power");
  assert.equal(c300Power.cmd, "show pon power onu-rx gpon-olt_1/4/2");
  assert.equal(c300Power.isReady, true);

  const c300Reboot = c300List.find((c) => c.id === "c300_reboot");
  assert.equal(c300Reboot.cmd, "conf t\npon-onu-mng gpon-onu_1/4/2:88\nreboot");
  assert.equal(c300Reboot.isReady, true);

  const c300Restore = c300List.find((c) => c.id === "c300_restore_factory");
  assert.equal(c300Restore.cmd, "conf t\npon-onu-mng gpon-onu_1/4/2:88\nrestore factory");
  assert.equal(c300Restore.isReady, true);

  const c300ChangeSn = c300List.find((c) => c.id === "c300_change_sn");
  assert.equal(
    c300ChangeSn.cmd,
    "conf t\ninterface gpon-onu_1/4/2:88\nregistration-method sn ZTEGD2327302"
  );
  assert.equal(c300ChangeSn.isReady, true);

  const c300BySn = c300List.find((c) => c.id === "c300_by_sn");
  assert.equal(c300BySn.cmd, "show gpon onu by sn ZTEGD2327302");
  assert.equal(c300BySn.isReady, true);
});

// ============================================================================
// 4. Clipboard Production copyToClipboard Tests with Stable Command IDs
// ============================================================================

test("Clipboard (Production copyToClipboard): rejects empty text without calling Clipboard API", async () => {
  let writeCalled = false;
  const mockClipboard = {
    writeText: async () => {
      writeCalled = true;
    },
  };

  let successCalled = false;
  const resultEmpty = await copyToClipboard("", {
    clipboard: mockClipboard,
    onSuccess: () => {
      successCalled = true;
    },
  });
  assert.equal(resultEmpty, false);
  assert.equal(writeCalled, false);
  assert.equal(successCalled, false);

  const resultSpaces = await copyToClipboard("   ", {
    clipboard: mockClipboard,
  });
  assert.equal(resultSpaces, false);
  assert.equal(writeCalled, false);
});

test("Clipboard (Production copyToClipboard): uses stable command ID and isolates C600 vs C300 command state", async () => {
  let written = "";
  const mockClipboard = {
    writeText: async (text) => {
      written = text;
    },
  };

  const state = {};
  const onSuccess = ({ key, copied }) => {
    state[key] = copied;
  };

  // Copy c600_delete_onu
  const success = await copyToClipboard("no onu 88", {
    clipboard: mockClipboard,
    key: "c600_delete_onu",
    onSuccess,
  });

  assert.equal(success, true);
  assert.equal(written, "no onu 88");
  assert.equal(state["c600_delete_onu"], true);

  // Ensure c300_restore_factory does NOT show copied status (cross-model state isolation)
  assert.equal(Boolean(state["c300_restore_factory"]), false, "C300 command must not inherit C600 command status");
});

test("Clipboard (Production copyToClipboard): handles writeText rejection safely with stable command ID", async () => {
  const failingClipboard = {
    writeText: async () => {
      throw new Error("Clipboard permission denied");
    },
  };

  let successPayload = null;
  let errorPayload = null;

  const result = await copyToClipboard("reboot", {
    clipboard: failingClipboard,
    key: "c600_reboot",
    onSuccess: (val) => {
      successPayload = val;
    },
    onError: (val) => {
      errorPayload = val;
    },
  });

  assert.equal(result, false);
  assert.deepEqual(successPayload, { key: "c600_reboot", copied: false });
  assert.equal(errorPayload?.key, "c600_reboot");
  assert.equal(errorPayload?.message, "Clipboard permission denied");
});

test("Clipboard (Production copyToClipboard): subsequent successful copy clears previous error on same command ID", async () => {
  let fail = true;
  const mockClipboard = {
    writeText: async () => {
      if (fail) throw new Error("Temporary error");
    },
  };

  let currentError = null;
  let isCopied = false;

  // 1st attempt fails on c600_attenuation
  await copyToClipboard("command", {
    clipboard: mockClipboard,
    key: "c600_attenuation",
    onSuccess: ({ copied }) => {
      isCopied = copied;
    },
    onError: (err) => {
      currentError = err;
    },
  });
  assert.equal(isCopied, false);
  assert.equal(currentError?.message, "Temporary error");

  // 2nd attempt succeeds on c600_attenuation
  fail = false;
  await copyToClipboard("command", {
    clipboard: mockClipboard,
    key: "c600_attenuation",
    onSuccess: ({ copied }) => {
      isCopied = copied;
    },
    onError: (err) => {
      currentError = err;
    },
  });
  assert.equal(isCopied, true);
  assert.equal(currentError, null, "Subsequent success must clear error state");
});

test("Clipboard (Production copyToClipboard): reports error when Clipboard API is unavailable", async () => {
  let errorPayload = null;

  const result = await copyToClipboard("test", {
    clipboard: undefined,
    key: "olt",
    onError: (err) => {
      errorPayload = err;
    },
  });

  assert.equal(result, false);
  assert.equal(errorPayload?.key, "olt");
  assert.equal(errorPayload?.message, "Clipboard API tidak didukung di lingkungan ini");
});

test("Clipboard (Production copyToClipboard): repeated rapid clicks cancel previous timer on same command ID", async () => {
  const mockClipboard = {
    writeText: async () => {},
  };

  const timers = {};
  let clearedTimerId = null;

  const originalClearTimeout = globalThis.clearTimeout;
  globalThis.clearTimeout = (id) => {
    clearedTimerId = id;
    originalClearTimeout(id);
  };

  try {
    // 1st click on c600_delete_onu
    await copyToClipboard("text1", {
      clipboard: mockClipboard,
      key: "c600_delete_onu",
      timers,
    });
    const firstTimerId = timers["c600_delete_onu"];
    assert.ok(firstTimerId, "First timer must be set");

    // 2nd rapid click on c600_delete_onu
    await copyToClipboard("text2", {
      clipboard: mockClipboard,
      key: "c600_delete_onu",
      timers,
    });

    assert.equal(
      clearedTimerId,
      firstTimerId,
      "Previous timer must be cancelled by clearTimeout on repeated click"
    );
  } finally {
    globalThis.clearTimeout = originalClearTimeout;
    if (timers["c600_delete_onu"]) originalClearTimeout(timers["c600_delete_onu"]);
  }
});

test("Command Hub (Production getCommandList): selects distinct commands for C600 vs C300/C320 models", () => {
  const sampleData = {
    interfaceOlt: "1/4/2",
    onuId: "88",
    sn: "ZTEGD2327302",
  };

  // 1. Model C600 menghasilkan perintah dengan format gpon_olt-<iface>
  const c600Commands = getCommandList(sampleData, "c600");
  assert.equal(c600Commands[0].id, "c600_rx_power");
  assert.equal(c600Commands[0].cmd, "sho pon power onu-rx gpon_olt-1/4/2");
  assert.equal(
    c600Commands.some((c) => c.id === "c300_restore_factory"),
    false,
    "Perintah khusus C300 tidak boleh ada di daftar C600"
  );

  // 2. Model C300/C320 menghasilkan perintah dengan format gpon-olt_<iface> dan opsi restore factory
  const c300Commands = getCommandList(sampleData, "c300");
  assert.equal(c300Commands[0].id, "c300_rx_power");
  assert.equal(c300Commands[0].cmd, "show pon power onu-rx gpon-olt_1/4/2");

  const restoreFactoryCmd = c300Commands.find((c) => c.id === "c300_restore_factory");
  assert.ok(restoreFactoryCmd, "Daftar perintah C300 harus mencakup c300_restore_factory");
  assert.equal(
    restoreFactoryCmd.cmd,
    "conf t\npon-onu-mng gpon-onu_1/4/2:88\nrestore factory"
  );

  // 3. Sintaks dan identifier berbeda secara terukur antara kedua model
  assert.notEqual(c600Commands[0].id, c300Commands[0].id);
  assert.notEqual(c600Commands[0].cmd, c300Commands[0].cmd);
});

