/**
 * Logic generator khusus UNR C600 - Pelanggan Biasa
 */
export const generateC600 = (data) => {
  const {
    interfaceOlt,
    onuId,
    sn,
    idPelanggan,
    pppoeUser,
    pppoePass,
    selectedC600Type = "standard",
  } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const vlan = "134";
  const vlanBridge = "129"; // VLAN Bridge untuk C600
  const vlanProfile = `v${vlan}`;

  if (selectedC600Type === "bridge") {
    // Memanggil kredensial server ACS dari file .env.local 
    // Menerapkan security best practice agar username & password tidak ter-hardcode di kode
    return `config terminal
interface gpon_olt-${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
!
interface gpon_onu-${interfaceOlt}:${onuId}
name ${cleanId}
description ${cleanId}
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
!
interface vport-${interfaceOlt}.${onuId}:1
service-port 1 user-vlan ${vlan} vlan ${vlan}
!
interface vport-${interfaceOlt}.${onuId}:2
service-port 2 user-vlan ${vlanBridge} vlan ${vlanBridge}
!
pon-onu-mng gpon_onu-${interfaceOlt}:${onuId}
service 1 gemport 1 vlan ${vlan}
service 2 gemport 2 vlan ${vlanBridge}
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v${vlan} host 1
wan 1 service tr069 internet
tr069-mgmt 1 state unlock
tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username ${process.env.NEXT_PUBLIC_ACS_USER} password ${process.env.NEXT_PUBLIC_ACS_PASS}
!
!
write`.trim();
  }

  // Memanggil kredensial server ACS dari file .env.local 
  // Menerapkan security best practice agar username & password tidak ter-hardcode di kode
  return `conf t
interface gpon_olt-${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon_onu-${interfaceOlt}:${onuId}
name ${cleanId}
description ${cleanId}
tcont 1 profile kusuma
gemport 1 tcont 1
exit
interface vport-${interfaceOlt}.${onuId}:1
service-port 1 user-vlan ${vlan} vlan ${vlan}
exit
pon-onu-mng gpon_onu-${interfaceOlt}:${onuId}
service 1 gemport 1 vlan ${vlan}
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile ${vlanProfile} host 1
wan 1 service tr069 internet
tr069-mgmt 1 state unlock
tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username ${process.env.NEXT_PUBLIC_ACS_USER} password ${process.env.NEXT_PUBLIC_ACS_PASS}
exit
exit
write`.trim();
};

/**
 * Logic generator khusus UHO
 */
export const generateUHO = (data) => {
  const { interfaceOlt, onuId, sn, idPelanggan, pppoeUser, pppoePass } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const vlan = "110";
  const vlanProfile = `v${vlan}`;

  return `config terminal
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${cleanId}
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan ${vlan} vlan ${vlan}
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service 1 gemport 1 vlan ${vlan}
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile ${vlanProfile} host 1
exit
exit
write`.trim();
};

/**
 * Logic generator khusus UBL
 */
export const generateUBL = (data) => {
  const { interfaceOlt, onuId, sn, idPelanggan, pppoeUser, pppoePass } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const vlan = "1002"; // VLAN khusus UBL

  return `config terminal
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${cleanId}
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan ${vlan} vlan ${vlan}
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service 1 gemport 1 vlan ${vlan}
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile 1 host 1
exit
exit
write`.trim();
};

/**
 * Logic generator khusus UGR
 */
export const generateUGR = (data) => {
  const { interfaceOlt, onuId, sn, idPelanggan, pppoeUser, pppoePass } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const vlan = "1000"; // VLAN khusus UGR

  return `interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${cleanId}
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan ${vlan} vlan ${vlan}
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service 1 gemport 1 vlan ${vlan}
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v${vlan} host 1
exit
exit
write`.trim();
};


/**
 * Logic generator khusus UNB dengan Mapping VLAN
 */
export const generateUNB = (data) => {
  const { interfaceOlt, onuId, sn, idPelanggan, pppoeUser, pppoePass, selectedVlanType } = data;
  const cleanId = idPelanggan.toString().slice(0, 10);
  const ifaceUnderscore = interfaceOlt.replace(/\//g, '_');

  // Mapping Detail untuk setiap jenis UNB
  const unbConfigs = {
    "100": { vlan: "100", profile: "pppoe", type: "standard", tcontProfile: "kusuma", onuType: "ALL" },
    "1600": { vlan: "1600", profile: "vlan1600", type: "standard", tcontProfile: "kusuma", onuType: "ALL" },
    "1501": { vlan: "1501", profile: "bolo", type: "standard", tcontProfile: "kusuma", onuType: "ALL" },
    "602": { vlan: "602", profile: "vlan602", type: "standard", tcontProfile: "metro10", onuType: "ALL-ONT" },
    "903": { vlan: "903", profile: "vlan903", type: "lexxa", tcontProfile: "default", onuType: "ALL-ONT" },
    "511": { vlan: "511", profile: "vlan511", type: "standard", tcontProfile: "kusuma", onuType: "ALL" },
    "bridge_unb": { vlan1: "105", vlan2: "102", profile: "pppoe_vlan102", type: "bridge" },
    "bridge_bolo": { vlan1: "1500", vlan2: "1501", profile: "bolo", type: "bridge_bolo" }
  };

  const conf = unbConfigs[selectedVlanType];

  // LOGIK UNB BRIDGE STANDAR
  if (conf.type === "bridge") {
    return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${ifaceUnderscore}:${onuId}
name ${cleanId}
description ${cleanId}_bridge
sn-bind enable sn
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
service-port 1 vport 1 user-vlan ${conf.vlan1} vlan ${conf.vlan1}
service-port 2 vport 2 user-vlan ${conf.vlan2} vlan ${conf.vlan2}
exit
pon-onu-mng gpon-onu_${ifaceUnderscore}:${onuId}
service ${conf.vlan1} gemport 1 vlan ${conf.vlan1}
service pppoe gemport 2 vlan ${conf.vlan2}
vlan port eth_0/1 mode tag vlan ${conf.vlan1}
vlan port eth_0/2 mode tag vlan ${conf.vlan1}
vlan port eth_0/3 mode tag vlan ${conf.vlan1}
vlan port eth_0/4 mode tag vlan ${conf.vlan1}
wan-ip mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile ${conf.profile} host 1
security-mgmt 1 state enable mode forward protocol web
exit
exit
write`.trim();
  }

  // LOGIK UNB BRIDGE BOLO
  if (conf.type === "bridge_bolo") {
    return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${ifaceUnderscore}:${onuId}
name ${cleanId}
description ${cleanId}
sn-bind enable sn
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
service-port 1 vport 1 user-vlan ${conf.vlan1} vlan ${conf.vlan1}
service-port 2 vport 2 user-vlan ${conf.vlan2} vlan ${conf.vlan2}
exit
pon-onu-mng gpon-onu_${ifaceUnderscore}:${onuId}
service ${conf.vlan1} gemport 1 vlan ${conf.vlan1}
service pppoe gemport 2 vlan ${conf.vlan2}
vlan port eth_0/1 mode hybrid def-vlan ${conf.vlan1}
vlan port eth_0/2 mode hybrid def-vlan ${conf.vlan1}
vlan port eth_0/3 mode hybrid def-vlan ${conf.vlan1}
wan-ip mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile ${conf.profile} host 1
security-mgmt 1 state enable mode forward protocol web
exit
exit
write`.trim();
  }

  // LOGIK UNB STANDARD (V100, V1600, V1501, 602, 903)
  const onuType = conf.onuType || "ALL";
  const tcontProfile = conf.tcontProfile || "kusuma";
  const isLexxa = conf.type === "lexxa";

  return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ${onuType} sn ${sn}
exit
interface gpon-onu_${ifaceUnderscore}:${onuId}
name ${cleanId}
description ${cleanId}
sn-bind enable sn
tcont 1 name PPPOE profile ${tcontProfile}
gemport 1 name PPPOE tcont 1
${isLexxa ? "encrypt 1 enable downstream\n" : ""}switchport mode hybrid vport 1
service-port 1 vport 1 user-vlan ${conf.vlan} vlan ${conf.vlan}
exit
pon-onu-mng gpon-onu_${ifaceUnderscore}:${onuId}
service ServiceName gemport 1 cos 0 vlan ${conf.vlan}
wan-ip 1 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile ${conf.profile} host 1
wan-ip 1 ping-response enable traceroute-response enable
security-mgmt 212 state enable mode forward protocol web
exit
exit
write`.trim();
};

/**
 * Logic generator khusus untuk MikroTik PPPoE Secret
 */
export const generateMikrotikSecret = (data) => {
  const { idPelanggan, namaPelanggan, pppoeUser, pppoePass, paketLayanan } = data;

  // Format Comment: "ID-NAMA"
  const commentText = namaPelanggan ? `${idPelanggan}-${namaPelanggan.toUpperCase()}` : idPelanggan;

  return `/ppp secret add name=${pppoeUser} password=${pppoePass} service=pppoe profile="${paketLayanan}" comment="${commentText}"`;
};