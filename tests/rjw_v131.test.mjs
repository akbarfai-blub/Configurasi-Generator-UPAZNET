import test from "node:test";
import assert from "node:assert/strict";
import { generateC600, generateMikrotikSecret } from "../src/lib/generator.js";

test("AC1 & AC2: generateC600 with unr_v131 produces exact expected CLI output", () => {
  const dummyData = {
    interfaceOlt: "1/4/2",
    onuId: "12",
    sn: "ZTEGC1234567",
    idPelanggan: "1010112678",
    pppoeUser: "custom_user",
    pppoePass: "150326",
    namaPelanggan: "Budi Santoso",
    selectedC600Type: "unr_v131",
  };

  const expectedScript = `conf t
interface gpon-olt_1/4/2
onu 12 type ALL sn ZTEGC1234567
exit
interface gpon-onu_1/4/2:12
name 1010112678
description 1010112678 - BUDI SANTOSO
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan 131 vlan 131
exit
pon-onu-mng gpon-onu_1/4/2:12
service 1 gemport 1 vlan 131
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username 1010112678 password 150326 vlan-profile v131 host 1
exit
exit
write`;

  const result = generateC600(dummyData);
  assert.strictEqual(result, expectedScript);
});

test("AC2 & AC4: unr_v1001 existing regression and structural parity with unr_v131", () => {
  const dummyData = {
    interfaceOlt: "1/2/3",
    onuId: "5",
    sn: "ZTEGCAABBCCD",
    idPelanggan: "2020223344",
    pppoeUser: "random_user",
    pppoePass: "secret99",
    namaPelanggan: "Ani Wijaya",
  };

  const resultV1001 = generateC600({ ...dummyData, selectedC600Type: "unr_v1001" });
  const resultV131 = generateC600({ ...dummyData, selectedC600Type: "unr_v131" });

  const expectedV1001 = `conf t
interface gpon-olt_1/2/3
onu 5 type ALL sn ZTEGCAABBCCD
exit
interface gpon-onu_1/2/3:5
name 2020223344
description 2020223344 - ANI WIJAYA
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan 1001 vlan 1001
exit
pon-onu-mng gpon-onu_1/2/3:5
service 1 gemport 1 vlan 1001
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username 2020223344 password secret99 vlan-profile v1001 host 1
exit
exit
write`;

  assert.strictEqual(resultV1001, expectedV1001, "unr_v1001 output must strictly match existing baseline");

  // Parity check: replacing 131 -> 1001 in V131 output yields exact V1001 output
  const v131Normalized = resultV131.replaceAll("131", "1001");
  assert.strictEqual(v131Normalized, resultV1001, "unr_v131 structure must be identical to unr_v1001 except for VLAN 131 vs 1001");
});

test("AC3 & AC5: Customer ID containing '1001' or '131' is NOT corrupted by global replacement", () => {
  const customerWith1001 = {
    interfaceOlt: "1/1/1",
    onuId: "1",
    sn: "ZTEG00100100",
    idPelanggan: "1001001234",
    pppoeUser: "ignored_user",
    pppoePass: "150326",
    namaPelanggan: "Cabang 1001 Swalayan",
    selectedC600Type: "unr_v131",
  };

  const result = generateC600(customerWith1001);

  // Name and description must retain 1001
  assert.ok(result.includes("name 1001001234"), "name must retain customer ID with 1001");
  assert.ok(result.includes("description 1001001234 - CABANG 1001 SWALAYAN"), "description must retain 1001");
  assert.ok(result.includes("wan-ip 1 mode pppoe username 1001001234"), "wan-ip username must retain cleanId 1001001234");

  // VLAN settings must be 131
  assert.ok(result.includes("service-port 1 vport 1 user-vlan 131 vlan 131"), "service-port must use VLAN 131");
  assert.ok(result.includes("service 1 gemport 1 vlan 131"), "service gemport must use VLAN 131");
  assert.ok(result.includes("vlan-profile v131 host 1"), "vlan-profile must be v131");

  // Verify no undefined or null
  assert.strictEqual(result.includes("undefined"), false, "Output must not contain 'undefined'");
  assert.strictEqual(result.includes("null"), false, "Output must not contain 'null'");
});

test("AC3: Customer ID longer than 10 digits is safely sliced to 10 digits (cleanId rule)", () => {
  const longIdData = {
    interfaceOlt: "1/4/2",
    onuId: "10",
    sn: "ZTEG12341234",
    idPelanggan: "1234567890EXTRA",
    pppoePass: "pass123",
    namaPelanggan: "Test Slicing",
    selectedC600Type: "unr_v131",
  };

  const result = generateC600(longIdData);
  assert.ok(result.includes("name 1234567890\n"), "name must be sliced to 10 digits");
  assert.ok(result.includes("description 1234567890 - TEST SLICING"), "description must use cleanId");
  assert.ok(result.includes("username 1234567890 password pass123"), "username must use cleanId");
});

test("AC3: Missing namaPelanggan defaults description to cleanId", () => {
  const noNameData = {
    interfaceOlt: "1/4/2",
    onuId: "10",
    sn: "ZTEG12341234",
    idPelanggan: "1234567890",
    pppoePass: "pass123",
    namaPelanggan: "",
    selectedC600Type: "unr_v131",
  };

  const result = generateC600(noNameData);
  assert.ok(result.includes("description 1234567890\n"), "description should be cleanId when namaPelanggan is empty");
});

test("AC4: Regression test for other UNR types and MikroTik script", () => {
  const testData = {
    interfaceOlt: "1/4/2",
    onuId: "1",
    sn: "ZTEG11223344",
    idPelanggan: "1112223334",
    pppoeUser: "pppoe_user1",
    pppoePass: "secret",
    namaPelanggan: "Budi",
    paketLayanan: "KUSUMA 1",
  };

  // standard C600
  const standardResult = generateC600({ ...testData, selectedC600Type: "standard" });
  assert.ok(standardResult.includes("interface gpon_olt-1/4/2"), "UNR Standard uses C600 syntax");
  assert.ok(standardResult.includes("user-vlan 134 vlan 134"), "UNR Standard uses VLAN 134");

  // unr_v130
  const v130Result = generateC600({ ...testData, selectedC600Type: "unr_v130" });
  assert.ok(v130Result.includes("user-vlan 130 vlan 130"), "UNR V130 uses VLAN 130");

  // MikroTik
  const mikrotikResult = generateMikrotikSecret(testData);
  assert.strictEqual(
    mikrotikResult,
    `/ppp secret add name=pppoe_user1 password=secret service=pppoe profile="KUSUMA 1" comment="1112223334-BUDI"`,
    "MikroTik secret generation must be untouched"
  );
});
