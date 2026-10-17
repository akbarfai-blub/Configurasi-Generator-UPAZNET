import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateC600, generateUGR } from "../src/lib/generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("UI verification: ConfigTypeSelect includes unr_v131 option in UNR dropdown", () => {
  const selectFile = path.resolve(__dirname, "../src/components/form/ConfigTypeSelect.js");
  const content = fs.readFileSync(selectFile, "utf-8");

  // Check presence of unr_v131 option
  assert.ok(
    content.includes('<option value="unr_v131">V131 (RJW)</option>'),
    "ConfigTypeSelect.js must contain <option value=\"unr_v131\">V131 (RJW)</option>"
  );

  // Check that it is placed adjacent to unr_v1001
  const v1001Idx = content.indexOf('value="unr_v1001"');
  const v131Idx = content.indexOf('value="unr_v131"');
  assert.ok(v1001Idx !== -1, "unr_v1001 must exist");
  assert.ok(v131Idx !== -1, "unr_v131 must exist");
  assert.ok(v131Idx > v1001Idx, "unr_v131 must be positioned right after unr_v1001");
});

test("Hook verification: useScriptGenerator handles unr_v131", () => {
  const hookFile = path.resolve(__dirname, "../src/hooks/useScriptGenerator.js");
  const content = fs.readFileSync(hookFile, "utf-8");

  assert.ok(
    content.includes('case "unr_v131":'),
    "useScriptGenerator.js must include case \"unr_v131\":"
  );
});

test("End-to-end generator flow for UNR tab with selectedC600Type=unr_v131", () => {
  const formData = {
    interfaceOlt: "1/4/2",
    onuId: "7",
    sn: "ZTEG98765432",
    idPelanggan: "1010112678",
    pppoeUser: "test_user",
    pppoePass: "150326",
    namaPelanggan: "Pak Joko",
    selectedC600Type: "unr_v131",
  };

  const script = generateC600(formData);
  assert.ok(script.startsWith("conf t"));
  assert.ok(script.includes("interface gpon-olt_1/4/2"));
  assert.ok(script.includes("interface gpon-onu_1/4/2:7"));
  assert.ok(script.includes("name 1010112678"));
  assert.ok(script.includes("description 1010112678 - PAK JOKO"));
  assert.ok(script.includes("service-port 1 vport 1 user-vlan 131 vlan 131"));
  assert.ok(script.includes("service 1 gemport 1 vlan 131"));
  assert.ok(script.includes("wan-ip 1 mode pppoe username 1010112678 password 150326 vlan-profile v131 host 1"));
  assert.ok(script.endsWith("write"));
});

test("End-to-end generator flow for UGR tab with selectedUgrType=ugr_pjk_c600", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "dummy_user";
  process.env.NEXT_PUBLIC_ACS_PASS = "dummy_pass";

  const formData = {
    interfaceOlt: "1/4/2",
    onuId: "9",
    sn: "ZTEG11112222",
    idPelanggan: "1010112678",
    pppoeUser: "pjk_operator",
    pppoePass: "150326",
    namaPelanggan: "PJK Customer",
    selectedC600Type: "unr_v130", // simulate residual UNR value
    selectedUgrType: "ugr_pjk_c600",
  };

  const script = generateUGR(formData);
  assert.ok(script.startsWith("conf t"));
  assert.ok(script.includes("interface gpon_olt-1/4/2"));
  assert.ok(script.includes("interface gpon_onu-1/4/2:9"));
  assert.ok(script.includes("name 1010112678"));
  assert.ok(script.includes("description 1010112678 - PJK CUSTOMER"));
  assert.ok(script.includes("interface vport-1/4/2.9:1"));
  assert.ok(script.includes("service-port 1 user-vlan 1000 vlan 1000"));
  assert.ok(script.includes("service 1 gemport 1 vlan 1000"));
  assert.ok(script.includes("wan-ip 1 ipv4 mode pppoe username pjk_operator password 150326 vlan-profile v1000 host 1"));
  assert.ok(script.includes("tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username dummy_user password dummy_pass"));
  assert.ok(script.endsWith("write"));
});

test("End-to-end generator flow for UGR tab with selectedUgrType=ugr_pjk_c600_bridge", () => {
  process.env.NEXT_PUBLIC_ACS_USER = "dummy_user";
  process.env.NEXT_PUBLIC_ACS_PASS = "dummy_pass";

  const formData = {
    interfaceOlt: "1/4/2",
    onuId: "14",
    sn: "ZTEG33334444",
    idPelanggan: "1010112678",
    pppoeUser: "pjk_bridge_op",
    pppoePass: "150326",
    namaPelanggan: "PJK Bridge Customer",
    selectedC600Type: "unr_v130", // simulate residual UNR value
    selectedUgrType: "ugr_pjk_c600_bridge",
  };

  const script = generateUGR(formData);
  assert.ok(script.startsWith("config terminal"));
  assert.ok(script.includes("interface gpon_olt-1/4/2"));
  assert.ok(script.includes("interface gpon_onu-1/4/2:14"));
  assert.ok(script.includes("name 1010112678"));
  assert.ok(script.includes("description 1010112678 - PJK BRIDGE CUSTOMER"));
  assert.ok(script.includes("gemport 1 tcont 1"));
  assert.ok(script.includes("gemport 2 tcont 1"));
  assert.ok(script.includes("interface vport-1/4/2.14:1"));
  assert.ok(script.includes("service-port 1 user-vlan 1000 vlan 1000"));
  assert.ok(script.includes("interface vport-1/4/2.14:2"));
  assert.ok(script.includes("service-port 2 user-vlan 1001 vlan 1001"));
  assert.ok(script.includes("service 1 gemport 1 vlan 1000"));
  assert.ok(script.includes("service 2 gemport 2 vlan 1001"));
  assert.ok(script.includes("wan-ip 1 ipv4 mode pppoe username pjk_bridge_op password 150326 vlan-profile v1000 host 1"));
  assert.ok(script.includes("tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username dummy_user password dummy_pass"));
  assert.ok(script.endsWith("write"));
});
