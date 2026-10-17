import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateC600, generateUGR, generateMikrotikSecret } from "../src/lib/generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("AC1: PJK C600 is available only in UGR optgroup Standard and removed from UNR", () => {
  const selectFile = path.resolve(__dirname, "../src/components/form/ConfigTypeSelect.js");
  const content = fs.readFileSync(selectFile, "utf-8");

  // Removed from UNR
  assert.strictEqual(
    content.includes("unr_pjk_c600"),
    false,
    "ConfigTypeSelect must NOT contain 'unr_pjk_c600'"
  );

  // Present in UGR optgroup Standard
  assert.ok(
    content.includes('<option value="ugr_pjk_c600">PJK C600</option>'),
    "ConfigTypeSelect must contain <option value=\"ugr_pjk_c600\">PJK C600</option>"
  );

  // Positioned under optgroup Standard in UGR section
  const ugrIndex = content.indexOf('configType === "ugr"');
  const optgroupStandardIndex = content.indexOf('<optgroup label="Standard">', ugrIndex);
  const pjkIndex = content.indexOf('value="ugr_pjk_c600"', optgroupStandardIndex);
  const optgroupEndIndex = content.indexOf('</optgroup>', optgroupStandardIndex);

  assert.ok(optgroupStandardIndex > ugrIndex, "optgroup Standard must be in UGR section");
  assert.ok(pjkIndex > optgroupStandardIndex && pjkIndex < optgroupEndIndex, "ugr_pjk_c600 must be inside optgroup Standard");
});

test("AC2: generateUGR with ugr_pjk_c600 produces exact expected CLI output", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "dummy_acs_user";
  process.env.NEXT_PUBLIC_ACS_PASS = "dummy_acs_pass";

  const dummyData = {
    interfaceOlt: "1/4/2",
    onuId: "12",
    sn: "ZTEGC1234567",
    idPelanggan: "1010112678",
    pppoeUser: "budi_pppoe",
    pppoePass: "150326",
    namaPelanggan: "Budi Santoso",
    selectedUgrType: "ugr_pjk_c600",
  };

  const expectedScript = `conf t
interface gpon_olt-1/4/2
onu 12 type ALL sn ZTEGC1234567
exit
interface gpon_onu-1/4/2:12
name 1010112678
description 1010112678 - BUDI SANTOSO
tcont 1 profile kusuma
gemport 1 tcont 1
exit
interface vport-1/4/2.12:1
service-port 1 user-vlan 1000 vlan 1000
exit
pon-onu-mng gpon_onu-1/4/2:12
service 1 gemport 1 vlan 1000
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username budi_pppoe password 150326 vlan-profile v1000 host 1
wan 1 service tr069 internet
tr069-mgmt 1 state unlock
tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username dummy_acs_user password dummy_acs_pass
exit
exit
write`;

  const result = generateUGR(dummyData);
  assert.strictEqual(result, expectedScript);
});

test("AC3: Prior UNR selection does NOT affect UGR PJK C600 output (cross-tab state isolation)", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "dummy_acs_user";
  process.env.NEXT_PUBLIC_ACS_PASS = "dummy_acs_pass";

  // Simulate user who previously selected unr_v130 in UNR tab, then switched to UGR tab and selected ugr_pjk_c600
  const formDataFromStateWithV130 = {
    interfaceOlt: "1/4/2",
    onuId: "12",
    sn: "ZTEGC1234567",
    idPelanggan: "1010112678",
    pppoeUser: "budi_pppoe",
    pppoePass: "150326",
    namaPelanggan: "Budi Santoso",
    selectedC600Type: "unr_v130", // residual UNR state
    selectedUgrType: "ugr_pjk_c600",
  };

  const result1 = generateUGR(formDataFromStateWithV130);
  assert.ok(result1.includes("service-port 1 user-vlan 1000 vlan 1000"), "Must use VLAN 1000 despite selectedC600Type=unr_v130");
  assert.ok(result1.includes("vlan-profile v1000 host 1"), "Must use profile v1000 despite selectedC600Type=unr_v130");
  assert.strictEqual(result1.includes("130"), false, "Must not contain VLAN 130 from residual UNR state");

  // Simulate user who previously selected unr_v1001 in UNR tab
  const formDataFromStateWithV1001 = {
    ...formDataFromStateWithV130,
    selectedC600Type: "unr_v1001",
  };

  const result2 = generateUGR(formDataFromStateWithV1001);
  assert.ok(result2.includes("interface gpon_olt-1/4/2"), "Must use C600 syntax despite selectedC600Type=unr_v1001");
  assert.ok(result2.includes("service-port 1 user-vlan 1000 vlan 1000"));
});

test("AC4: Switching between UGR and UNR produces expected output for each respective option", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "dummy_acs_user";
  process.env.NEXT_PUBLIC_ACS_PASS = "dummy_acs_pass";

  const data = {
    interfaceOlt: "1/4/2",
    onuId: "10",
    sn: "ZTEG12345678",
    idPelanggan: "1010112678",
    pppoeUser: "user_test",
    pppoePass: "150326",
    namaPelanggan: "Test Switch",
    selectedC600Type: "unr_v130",
    selectedUgrType: "ugr_pjk_c600",
  };

  // UGR PJK C600
  const pjkResult = generateUGR(data);
  assert.ok(pjkResult.includes("interface gpon_olt-1/4/2"));
  assert.ok(pjkResult.includes("user-vlan 1000 vlan 1000"));

  // Switch to UGR Standard (PPPoE C300)
  const ugrStandardResult = generateUGR({ ...data, selectedUgrType: "ugr_standard" });
  assert.ok(ugrStandardResult.includes("interface gpon-olt_1/4/2"));
  assert.ok(ugrStandardResult.includes("service-port 1 vport 1 user-vlan 1000 vlan 1000"));

  // Switch to UGR Babadan Bridge
  const ugrBabadanResult = generateUGR({ ...data, selectedUgrType: "ugr_babadan_bridge" });
  assert.ok(ugrBabadanResult.includes("user-vlan 207 vlan 207"));
  assert.ok(ugrBabadanResult.includes("user-vlan 206 vlan 206"));

  // Switch to UNR tab (V130)
  const unrResult = generateC600(data);
  assert.ok(unrResult.includes("interface gpon_olt-1/4/2"));
  assert.ok(unrResult.includes("user-vlan 130 vlan 130"));
});

test("AC3 & AC5: Parameter handling, data integrity, and MikroTik script", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "acs_user";
  process.env.NEXT_PUBLIC_ACS_PASS = "acs_pass";

  const customerWith1000 = {
    interfaceOlt: "1/2/3",
    onuId: "8",
    sn: "ZTEG10002000",
    idPelanggan: "1000123456EXTRA",
    pppoeUser: "custom_pjk_user",
    pppoePass: "secretPass",
    namaPelanggan: "Toko 1000 Jaya",
    selectedUgrType: "ugr_pjk_c600",
    paketLayanan: "KUSUMA 1",
  };

  const result = generateUGR(customerWith1000);

  // cleanId slice 10 chars
  assert.ok(result.includes("name 1000123456\n"), "name must be 10 chars cleanId");
  assert.ok(result.includes("description 1000123456 - TOKO 1000 JAYA"), "description must preserve 1000 in ID and uppercase name");
  // pppoeUser
  assert.ok(result.includes("username custom_pjk_user password secretPass"), "PPPoE user must be from form");
  // no undefined or null
  assert.strictEqual(result.includes("undefined"), false, "Output must not contain 'undefined'");
  assert.strictEqual(result.includes("null"), false, "Output must not contain 'null'");

  // MikroTik
  const mikrotikResult = generateMikrotikSecret(customerWith1000);
  assert.strictEqual(
    mikrotikResult,
    `/ppp secret add name=custom_pjk_user password=secretPass service=pppoe profile="KUSUMA 1" comment="1000123456EXTRA-TOKO 1000 JAYA"`,
    "MikroTik secret generation must be untouched"
  );
});

test("AC1 (Bridge): PJK C600 Bridge option is in UGR optgroup Standard adjacent to PJK C600", () => {
  const selectFile = path.resolve(__dirname, "../src/components/form/ConfigTypeSelect.js");
  const content = fs.readFileSync(selectFile, "utf-8");

  assert.ok(
    content.includes('<option value="ugr_pjk_c600_bridge">PJK C600 Bridge</option>'),
    "ConfigTypeSelect must contain <option value=\"ugr_pjk_c600_bridge\">PJK C600 Bridge</option>"
  );

  const pjkIndex = content.indexOf('value="ugr_pjk_c600"');
  const pjkBridgeIndex = content.indexOf('value="ugr_pjk_c600_bridge"');
  assert.ok(pjkBridgeIndex > pjkIndex, "ugr_pjk_c600_bridge must be placed adjacent and after ugr_pjk_c600");
});

test("AC2 (Bridge): generateUGR with ugr_pjk_c600_bridge produces exact expected CLI output", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "dummy_acs_user";
  process.env.NEXT_PUBLIC_ACS_PASS = "dummy_acs_pass";

  const dummyData = {
    interfaceOlt: "1/4/2",
    onuId: "12",
    sn: "ZTEGC1234567",
    idPelanggan: "1010112678",
    pppoeUser: "budi_pppoe",
    pppoePass: "150326",
    namaPelanggan: "Budi Santoso",
    selectedUgrType: "ugr_pjk_c600_bridge",
  };

  const expectedScript = `config terminal
interface gpon_olt-1/4/2
onu 12 type ALL sn ZTEGC1234567
!
interface gpon_onu-1/4/2:12
name 1010112678
description 1010112678 - BUDI SANTOSO
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
!
interface vport-1/4/2.12:1
service-port 1 user-vlan 1000 vlan 1000
!
interface vport-1/4/2.12:2
service-port 2 user-vlan 1001 vlan 1001
!
pon-onu-mng gpon_onu-1/4/2:12
service 1 gemport 1 vlan 1000
service 2 gemport 2 vlan 1001
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username budi_pppoe password 150326 vlan-profile v1000 host 1
wan 1 service tr069 internet
tr069-mgmt 1 state unlock
tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username dummy_acs_user password dummy_acs_pass
!
!
write`;

  const result = generateUGR(dummyData);
  assert.strictEqual(result, expectedScript);
});

test("AC3 (Bridge): Data containing 1000 and 1001 is preserved and parameters sourced properly", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "acs_bridge";
  process.env.NEXT_PUBLIC_ACS_PASS = "pass_bridge";

  const customerData = {
    interfaceOlt: "1/4/2",
    onuId: "15",
    sn: "ZTEG10001001",
    idPelanggan: "1000100123EXTRA",
    pppoeUser: "bridge_user_1000",
    pppoePass: "pass1001",
    namaPelanggan: "Toko 1000 1001",
    selectedUgrType: "ugr_pjk_c600_bridge",
  };

  const result = generateUGR(customerData);

  assert.ok(result.includes("name 1000100123\n"), "name must preserve customer ID digits and slice to 10");
  assert.ok(result.includes("description 1000100123 - TOKO 1000 1001"), "description preserves 1000 and 1001");
  assert.ok(result.includes("username bridge_user_1000 password pass1001"), "PPPoE username and pass from form");
  assert.ok(result.includes("service-port 1 user-vlan 1000 vlan 1000"));
  assert.ok(result.includes("service-port 2 user-vlan 1001 vlan 1001"));
  assert.ok(result.includes("vlan-profile v1000 host 1"));

  // Check no Ethernet tagging commands exist (which don't exist in UNR bridge)
  assert.strictEqual(result.includes("vlan port eth"), false, "No Ethernet port tagging command should exist");
  assert.strictEqual(result.includes("undefined"), false);
  assert.strictEqual(result.includes("null"), false);
});

test("AC4 (Bridge): Cross-tab isolation and UNR Bridge return check", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "acs_user";
  process.env.NEXT_PUBLIC_ACS_PASS = "acs_pass";

  const crossTabData = {
    interfaceOlt: "1/4/2",
    onuId: "12",
    sn: "ZTEGC1234567",
    idPelanggan: "1010112678",
    pppoeUser: "user_cross",
    pppoePass: "150326",
    namaPelanggan: "Cross Tab",
    selectedC600Type: "unr_v130", // previously on UNR V130
    selectedUgrType: "ugr_pjk_c600_bridge",
  };

  // UGR PJK C600 Bridge must produce VLAN 1000/1001
  const ugrBridgeResult = generateUGR(crossTabData);
  assert.ok(ugrBridgeResult.includes("service-port 1 user-vlan 1000 vlan 1000"));
  assert.ok(ugrBridgeResult.includes("service-port 2 user-vlan 1001 vlan 1001"));
  assert.ok(ugrBridgeResult.includes("vlan-profile v1000 host 1"));

  // Switch back to UNR tab on "bridge"
  const unrBridgeResult = generateC600({ ...crossTabData, selectedC600Type: "bridge" });
  assert.ok(unrBridgeResult.includes("service-port 1 user-vlan 134 vlan 134"), "UNR Bridge must use VLAN 134");
  assert.ok(unrBridgeResult.includes("service-port 2 user-vlan 129 vlan 129"), "UNR Bridge must use VLAN 129");
  assert.ok(unrBridgeResult.includes("vlan-profile v134 host 1"), "UNR Bridge must use profile v134");

  // Verify PJK C600 non-bridge still produces VLAN 1000
  const pjkNonBridgeResult = generateUGR({ ...crossTabData, selectedUgrType: "ugr_pjk_c600" });
  assert.ok(pjkNonBridgeResult.includes("service-port 1 user-vlan 1000 vlan 1000"));
  assert.strictEqual(pjkNonBridgeResult.includes("service-port 2"), false, "PJK non-bridge must have only 1 service-port");
});
