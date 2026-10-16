import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateC600, generateMikrotikSecret } from "../src/lib/generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("AC1: ConfigTypeSelect contains exact 'PJK C600' option with unr_pjk_c600 identifier", () => {
  const selectFile = path.resolve(__dirname, "../src/components/form/ConfigTypeSelect.js");
  const content = fs.readFileSync(selectFile, "utf-8");

  assert.ok(
    content.includes('<option value="unr_pjk_c600">PJK C600</option>'),
    "ConfigTypeSelect must contain <option value=\"unr_pjk_c600\">PJK C600</option>"
  );
});

test("AC1 & AC2: generateC600 produces exact expected CLI output for unr_pjk_c600", () => {
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
    selectedC600Type: "unr_pjk_c600",
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

  const result = generateC600(dummyData);
  assert.strictEqual(result, expectedScript);
});

test("AC3: Uses pppoeUser from form and truncates cleanId to 10 characters", () => {
  const dummyData = {
    interfaceOlt: "1/1/1",
    onuId: "3",
    sn: "ZTEG00112233",
    idPelanggan: "1234567890EXTRA",
    pppoeUser: "custom_pppoe_user",
    pppoePass: "pass999",
    namaPelanggan: "Agus Salim",
    selectedC600Type: "unr_pjk_c600",
  };

  const result = generateC600(dummyData);

  // cleanId should be 10 chars
  assert.ok(result.includes("name 1234567890\n"), "name must be sliced to 10 chars");
  assert.ok(result.includes("description 1234567890 - AGUS SALIM"), "description must use cleanId");
  // pppoe username must come from pppoeUser, not cleanId
  assert.ok(
    result.includes("wan-ip 1 ipv4 mode pppoe username custom_pppoe_user password pass999"),
    "PPPoE username must be pppoeUser from form"
  );
});

test("AC3: Missing namaPelanggan defaults description to cleanId in PJK C600", () => {
  const noNameData = {
    interfaceOlt: "1/4/2",
    onuId: "5",
    sn: "ZTEG55556666",
    idPelanggan: "1010112678",
    pppoeUser: "user_pjk",
    pppoePass: "150326",
    namaPelanggan: "",
    selectedC600Type: "unr_pjk_c600",
  };

  const result = generateC600(noNameData);
  assert.ok(result.includes("description 1010112678\n"), "description should be cleanId when namaPelanggan is empty");
});

test("AC3 & AC5: Customer ID containing '1000' or '130' is not altered and output has no undefined/null", () => {
  const customerWith1000 = {
    interfaceOlt: "1/2/3",
    onuId: "8",
    sn: "ZTEG10002000",
    idPelanggan: "1000123456",
    pppoeUser: "user1000",
    pppoePass: "150326",
    namaPelanggan: "Toko 1000 Jaya",
    selectedC600Type: "unr_pjk_c600",
  };

  const result = generateC600(customerWith1000);

  assert.ok(result.includes("name 1000123456"), "name must preserve customer ID with 1000");
  assert.ok(result.includes("description 1000123456 - TOKO 1000 JAYA"), "description must preserve 1000");
  assert.ok(result.includes("username user1000"), "username must preserve user1000");
  assert.strictEqual(result.includes("undefined"), false, "Output must not contain 'undefined'");
  assert.strictEqual(result.includes("null"), false, "Output must not contain 'null'");
});

test("AC4: Regression testing - unr_v130, standard, bridge, RJW, and MikroTik maintain behavior", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "acs_test";
  process.env.NEXT_PUBLIC_ACS_PASS = "pass_test";

  const baseData = {
    interfaceOlt: "1/4/2",
    onuId: "1",
    sn: "ZTEG12345678",
    idPelanggan: "1010112678",
    pppoeUser: "user_regresi",
    pppoePass: "150326",
    namaPelanggan: "Test Regresi",
    paketLayanan: "KUSUMA 1",
  };

  // 1. unr_v130 (shared template)
  const v130Result = generateC600({ ...baseData, selectedC600Type: "unr_v130" });
  assert.ok(v130Result.includes("service-port 1 user-vlan 130 vlan 130"), "V130 uses VLAN 130");
  assert.ok(v130Result.includes("vlan-profile v130 host 1"), "V130 uses vlan-profile v130");

  // 2. standard C600
  const standardResult = generateC600({ ...baseData, selectedC600Type: "standard" });
  assert.ok(standardResult.includes("service-port 1 user-vlan 134 vlan 134"), "Standard uses VLAN 134");

  // 3. RJW V1001 & V131
  const rjw1001 = generateC600({ ...baseData, selectedC600Type: "unr_v1001" });
  const rjw131 = generateC600({ ...baseData, selectedC600Type: "unr_v131" });
  assert.ok(rjw1001.includes("service-port 1 vport 1 user-vlan 1001 vlan 1001"), "RJW 1001 intact");
  assert.ok(rjw131.includes("service-port 1 vport 1 user-vlan 131 vlan 131"), "RJW 131 intact");

  // 4. MikroTik secret
  const mikrotikResult = generateMikrotikSecret(baseData);
  assert.strictEqual(
    mikrotikResult,
    `/ppp secret add name=user_regresi password=150326 service=pppoe profile="KUSUMA 1" comment="1010112678-TEST REGRESI"`,
    "MikroTik secret generation must be untouched"
  );
});
