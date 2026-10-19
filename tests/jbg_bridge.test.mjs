import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateC600, generateMikrotikSecret } from "../src/lib/generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set synthetic test ACS credentials
process.env.NEXT_PUBLIC_ACS_USER = "test_acs_user";
process.env.NEXT_PUBLIC_ACS_PASS = "test_acs_pass";

test("AC1: ConfigTypeSelect includes JBG Bridge option right below Bridge Mode", () => {
  const selectFile = path.resolve(__dirname, "../src/components/form/ConfigTypeSelect.js");
  const content = fs.readFileSync(selectFile, "utf-8");

  // Check presence of unr_jbg_bridge option
  assert.ok(
    content.includes('<option value="unr_jbg_bridge">JBG Bridge</option>'),
    'ConfigTypeSelect.js must contain <option value="unr_jbg_bridge">JBG Bridge</option>'
  );

  // Check placement right below bridge option
  const bridgeIdx = content.indexOf('<option value="bridge">Bridge Mode</option>');
  const jbgIdx = content.indexOf('<option value="unr_jbg_bridge">JBG Bridge</option>');
  const bridgeOptgroupEnd = content.indexOf("</optgroup>", bridgeIdx);

  assert.ok(bridgeIdx !== -1, "bridge option must exist");
  assert.ok(jbgIdx !== -1, "unr_jbg_bridge option must exist");
  assert.ok(bridgeOptgroupEnd !== -1, "Bridge Mode optgroup closing tag must exist");

  assert.ok(jbgIdx > bridgeIdx, "unr_jbg_bridge must appear after bridge");
  assert.ok(jbgIdx < bridgeOptgroupEnd, "unr_jbg_bridge must appear inside Bridge Mode optgroup right after bridge");
});

test("AC2: generateC600 with unr_jbg_bridge produces exact expected CLI output", () => {
  const dummyData = {
    interfaceOlt: "1/4/2",
    onuId: "88",
    sn: "ZTEGD2327302",
    idPelanggan: "1010112678",
    pppoeUser: "1010112678@upaz",
    pppoePass: "upaz12345",
    namaPelanggan: "Budi Santoso",
    selectedC600Type: "unr_jbg_bridge",
  };

  const expectedScript = `conf t
interface gpon_olt-1/4/2
onu 88 type ALL sn ZTEGD2327302
exit
interface gpon_onu-1/4/2:88
name 1010112678
description 1010112678 - BUDI SANTOSO
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
exit
interface vport-1/4/2.88:1
service-port 1 user-vlan 1001 vlan 1001
exit
interface vport-1/4/2.88:2
service-port 2 user-vlan 131 vlan 131
exit
pon-onu-mng gpon_onu-1/4/2:88
service 1 gemport 1 vlan 1001
service 2 gemport 2 vlan 131
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username 1010112678@upaz password upaz12345 vlan-profile v1001 host 1
wan 1 service tr069 internet
tr069-mgmt 1 state unlock
tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username test_acs_user password test_acs_pass
exit
exit
write`;

  const result = generateC600(dummyData);
  assert.strictEqual(result, expectedScript);
});

test("AC3: Data containing 1001 or 131 in ID/Name is preserved, cleanId sliced to 10 chars, no undefined/null", () => {
  const edgeCaseData = {
    interfaceOlt: "1/2/16",
    onuId: "131",
    sn: "ZTEG10011310",
    idPelanggan: "10011319999999", // > 10 chars
    pppoeUser: "user_1001@upaz",
    pppoePass: "pass_131",
    namaPelanggan: "Ahmad 1001 vlan 131",
    selectedC600Type: "unr_jbg_bridge",
  };

  const result = generateC600(edgeCaseData);

  // cleanId should be exactly first 10 digits
  assert.ok(result.includes("name 1001131999"), "cleanId must be sliced to 10 chars");
  assert.ok(
    result.includes("description 1001131999 - AHMAD 1001 VLAN 131"),
    "description must uppercase name and keep 1001/131 intact"
  );
  assert.ok(!result.includes("undefined"), "Output must not contain undefined");
  assert.ok(!result.includes("null"), "Output must not contain null");

  // Empty namaPelanggan test
  const emptyNameData = {
    ...edgeCaseData,
    namaPelanggan: "",
  };
  const resultEmptyName = generateC600(emptyNameData);
  assert.ok(
    resultEmptyName.includes("description 1001131999\n"),
    "When namaPelanggan is empty, description should be cleanId only"
  );
});

test("AC4: Regression tests for other UNR C600 options, UGR bridge, and MikroTik secret", () => {
  const baseData = {
    interfaceOlt: "1/4/2",
    onuId: "10",
    sn: "ZTEG11223344",
    idPelanggan: "1234567890",
    pppoeUser: "user123",
    pppoePass: "pass123",
    namaPelanggan: "Test User",
    paketLayanan: "KUSUMA 1",
  };

  // 1. standard (PPPoE) - VLAN 134
  const standardScript = generateC600({ ...baseData, selectedC600Type: "standard" });
  assert.ok(standardScript.includes("service-port 1 user-vlan 134 vlan 134"));
  assert.ok(standardScript.includes("vlan-profile v134"));

  // 2. unr_v130 - VLAN 130
  const v130Script = generateC600({ ...baseData, selectedC600Type: "unr_v130" });
  assert.ok(v130Script.includes("service-port 1 user-vlan 130 vlan 130"));

  // 3. bridge - uses config terminal, ! delimiter, vlan 134 and 129
  const bridgeScript = generateC600({ ...baseData, selectedC600Type: "bridge" });
  assert.ok(bridgeScript.startsWith("config terminal"));
  assert.ok(bridgeScript.includes("service-port 1 user-vlan 134 vlan 134"));
  assert.ok(bridgeScript.includes("service-port 2 user-vlan 129 vlan 129"));
  assert.ok(bridgeScript.includes("!"));

  // 4. unr_v1001
  const v1001Script = generateC600({ ...baseData, selectedC600Type: "unr_v1001" });
  assert.ok(v1001Script.includes("service-port 1 vport 1 user-vlan 1001 vlan 1001"));

  // 5. unr_v131
  const v131Script = generateC600({ ...baseData, selectedC600Type: "unr_v131" });
  assert.ok(v131Script.includes("service-port 1 vport 1 user-vlan 131 vlan 131"));

  // 6. unr_ddr
  const ddrScript = generateC600({ ...baseData, selectedC600Type: "unr_ddr" });
  assert.ok(ddrScript.includes("service-port 1 user-vlan 2104 vlan 2104"));

  // 7. ugr_pjk_c600_bridge
  const pjkBridgeScript = generateC600({ ...baseData, selectedC600Type: "ugr_pjk_c600_bridge" });
  assert.ok(pjkBridgeScript.includes("service-port 1 user-vlan 1000 vlan 1000"));
  assert.ok(pjkBridgeScript.includes("service-port 2 user-vlan 200 vlan 200"));

  // 8. MikroTik secret
  const mikrotikSecret = generateMikrotikSecret(baseData);
  assert.strictEqual(
    mikrotikSecret,
    '/ppp secret add name=user123 password=pass123 service=pppoe profile="KUSUMA 1" comment="1234567890-TEST USER"'
  );
});
