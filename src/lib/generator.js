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
    pppoePass = "150326",
    namaPelanggan,
    selectedC600Type = "standard",
  } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const vlan = "134";
  const vlanBridge = "129";
  const vlanProfile = `v${vlan}`;
  const descText = namaPelanggan
    ? `${cleanId} - ${namaPelanggan.toUpperCase()}`
    : cleanId;

  if (selectedC600Type === "bridge") {
    return `config terminal
interface gpon_olt-${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
!
interface gpon_onu-${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
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

  if (selectedC600Type === "unr_v1001") {
    return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan 1001 vlan 1001
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service 1 gemport 1 vlan 1001
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${cleanId} password ${pppoePass} vlan-profile v1001 host 1
exit
exit
write`.trim();
  }

  if (selectedC600Type === "unr_ddr") {
    const namaBersih = namaPelanggan?.trim() || "";
    const dialText = namaBersih ? `${cleanId}_${namaBersih}` : cleanId;

    return `conf t
interface gpon_olt-${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon_onu-${interfaceOlt}:${onuId}
name ${dialText}
description ${dialText}
tcont 1 profile kusuma
gemport 1 tcont 1
exit
interface vport-${interfaceOlt}.${onuId}:1
service-port 1 user-vlan 2104 vlan 2104
qos traffic-policy DDR direction egress
exit
pon-onu-mng gpon_onu-${interfaceOlt}:${onuId}
service 1 gemport 1 vlan 2104
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v2104 host 1
wan 1 service tr069 internet
tr069-mgmt 1 state unlock
tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username ${process.env.NEXT_PUBLIC_ACS_USER} password ${process.env.NEXT_PUBLIC_ACS_PASS}
exit
exit
write`.trim();
  }

  if (selectedC600Type === "unr_v130") {
    return `conf t
interface gpon_olt-${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon_onu-${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
tcont 1 profile kusuma
gemport 1 tcont 1
exit
interface vport-${interfaceOlt}.${onuId}:1
service-port 1 user-vlan 130 vlan 130
exit
pon-onu-mng gpon_onu-${interfaceOlt}:${onuId}
service 1 gemport 1 vlan 130
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v130 host 1
wan 1 service tr069 internet
tr069-mgmt 1 state unlock
tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username ${process.env.NEXT_PUBLIC_ACS_USER} password ${process.env.NEXT_PUBLIC_ACS_PASS}
exit
exit
write`.trim();
  }

  return `conf t
interface gpon_olt-${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon_onu-${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
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
  const {
    interfaceOlt,
    onuId,
    sn,
    idPelanggan,
    pppoeUser,
    pppoePass,
    namaPelanggan,
    selectedUhoType,
  } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const vlan = "110";
  const vlanProfile = `v${vlan}`;
  const descText = namaPelanggan
    ? `${cleanId} - ${namaPelanggan.toUpperCase()}`
    : cleanId;

  if (selectedUhoType === "uho_ddr") {
    const namaBersih = namaPelanggan?.trim() || "";
    const dialText = namaBersih ? `${cleanId}_${namaBersih}` : cleanId;

    return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${dialText}
description ${dialText}
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 1 traffic-limit downstream DDR
service-port 1 vport 1 user-vlan 2104 vlan 2104
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service 1 gemport 1 vlan 2104
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${cleanId} password ${pppoePass} vlan-profile v2104 host 1
exit
exit
write`.trim();
  }

  return `config terminal
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
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
  const {
    interfaceOlt,
    onuId,
    sn,
    idPelanggan,
    pppoeUser,
    pppoePass,
    namaPelanggan,
  } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const vlan = "1002";
  const descText = namaPelanggan
    ? `${cleanId} - ${namaPelanggan.toUpperCase()}`
    : cleanId;

  return `config terminal
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
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
  const {
    interfaceOlt,
    onuId,
    sn,
    idPelanggan,
    pppoeUser,
    pppoePass,
    namaPelanggan,
    selectedUgrType,
  } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const descText = namaPelanggan
    ? `${cleanId} - ${namaPelanggan.toUpperCase()}`
    : cleanId;

  if (selectedUgrType === "ugr_bridge") {
    return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
service-port 1 vport 1 user-vlan 1000 vlan 1000
service-port 2 vport 2 user-vlan 200 vlan 200
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service 1 gemport 1 vlan 1000
service 2 gemport 2 vlan 200
vlan port eth_0/1 mode tag vlan 200
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v1000 host 1
exit
exit
write`.trim();
  }

  if (selectedUgrType === "ugr_babadan_bridge") {
    return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
service-port 1 vport 1 user-vlan 207 vlan 207
service-port 2 vport 2 user-vlan 206 vlan 206
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service 1 gemport 1 vlan 207
service 2 gemport 2 vlan 206
vlan port eth_0/1 mode tag vlan 206
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v207 host 1
exit
exit
write`.trim();
  }

  if (selectedUgrType === "ugr_babadan_pppoe") {
    return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
tcont 1 profile kusuma
gemport 1 tcont 1
service-port 1 vport 1 user-vlan 207 vlan 207
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service 1 gemport 1 vlan 207
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v207 host 1
exit
exit
write`.trim();
  }

  // KWD PPPoE — VLAN 1006
  if (selectedUgrType === "ugr_kwd_pppoe") {
    const kwdCleanId = idPelanggan?.toString().trim() || "";
    const kwdDescText = namaPelanggan
      ? `${kwdCleanId} - ${namaPelanggan.trim().toUpperCase()}`
      : kwdCleanId;

    return `conf t
interface gpon-olt_${interfaceOlt}
  onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
  name ${kwdCleanId}
  description ${kwdDescText}
  tcont 1 profile kusuma
  gemport 1 tcont 1
  service-port 1 vport 1 user-vlan 1006 vlan 1006
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
  service 1 gemport 1 vlan 1006
  security-mgmt 1 state enable mode forward protocol web
  wan-ip 1 mode pppoe username ${kwdCleanId} password ${pppoePass} vlan-profile v1006 host 1
exit
exit
write`.trim();
  }

  // KWD Bridge — VLAN 1006 + 1007
  if (selectedUgrType === "ugr_kwd_bridge") {
    const kwdCleanId = idPelanggan?.toString().trim() || "";
    const kwdDescText = namaPelanggan
      ? `${kwdCleanId} - ${namaPelanggan.trim().toUpperCase()}`
      : kwdCleanId;

    return `conf t
interface gpon-olt_${interfaceOlt}
  onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
  name ${kwdCleanId}
  description ${kwdDescText}
  tcont 1 profile kusuma
  gemport 1 tcont 1
  gemport 2 tcont 1
  service-port 1 vport 1 user-vlan 1006 vlan 1006
  service-port 2 vport 2 user-vlan 1007 vlan 1007
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
  service 1 gemport 1 vlan 1006
  service 2 gemport 2 vlan 1007
  vlan port eth_0/1 mode tag vlan 1007
  vlan port eth_0/2 mode tag vlan 1007
  vlan port eth_0/3 mode tag vlan 1007
  vlan port eth_0/4 mode tag vlan 1007
  security-mgmt 1 state enable mode forward protocol web
  wan-ip 1 mode pppoe username ${kwdCleanId} password ${pppoePass} vlan-profile v1006 host 1
exit
exit
write`.trim();
  }

  const vlan = "1000";

  return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
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
 * Logic generator khusus UCD (PPPoE Standard)
 */
export const generateUCD = (data) => {
  const {
    interfaceOlt,
    onuId,
    sn,
    idPelanggan,
    pppoeUser,
    pppoePass,
    namaPelanggan,
    selectedUcdType,
  } = data;
  const cleanId = idPelanggan.toString().slice(0, 10);
  const descText = namaPelanggan
    ? `${cleanId} - ${namaPelanggan.toUpperCase()}`
    : cleanId;

  if (selectedUcdType === "ucd_bridge") {
    return `conf t
interface gpon-olt_${interfaceOlt}
  onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
  name ${cleanId}
  description ${descText}
  sn-bind enable sn
  tcont 1 profile kusuma
  gemport 1 tcont 1
  gemport 2 tcont 1
  service-port 1 vport 1 user-vlan 514 vlan 514
  service-port 2 vport 2 user-vlan 511 vlan 511
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
  service 514 gemport 1 vlan 514
  service pppoe gemport 2 vlan 511
  vlan port eth_0/1 mode tag vlan 514
  vlan port eth_0/2 mode tag vlan 514
  vlan port eth_0/3 mode tag vlan 514
  wan-ip 1 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile 511 host 1
  security-mgmt 1 state enable mode forward protocol web
exit
exit
write`.trim();
  }

  return `conf t
interface gpon-olt_${interfaceOlt}
  onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
  name ${cleanId}
  description ${descText}
  sn-bind enable sn
  tcont 1 name PPPOE profile kusuma
  gemport 1 name PPPOE tcont 1
  switchport mode hybrid vport 1
  service-port 1 vport 1 user-vlan 511 vlan 511
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
  service ServiceName gemport 1 cos 0 vlan 511
  wan-ip mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile 511 host 1
  wan-ip 1 ping-response enable traceroute-response enable
  security-mgmt 212 state enable mode forward protocol web
exit
exit
write`.trim();
};

/**
 * Logic generator khusus UNB dengan Mapping VLAN
 */
export const generateUNB = (data) => {
  const {
    interfaceOlt,
    onuId,
    sn,
    idPelanggan,
    pppoeUser,
    pppoePass,
    namaPelanggan,
    selectedVlanType,
  } = data;
  const cleanId = idPelanggan.toString().slice(0, 10);
  const descText = namaPelanggan
    ? `${cleanId} - ${namaPelanggan.toUpperCase()}`
    : cleanId;

  const unbConfigs = {
    100: {
      vlan: "100",
      profile: "pppoe",
      type: "standard",
      tcontProfile: "kusuma",
      onuType: "ALL",
      useC300Syntax: true,
    },
    1600: {
      vlan: "1600",
      profile: "vlan1600",
      type: "standard",
      tcontProfile: "kusuma",
      onuType: "ALL",
      useC300Syntax: true,
    },
    1501: {
      vlan: "1501",
      profile: "bolo",
      type: "standard",
      tcontProfile: "kusuma",
      onuType: "ALL",
      useC300Syntax: true,
    },
    602: {
      vlan: "602",
      profile: "vlan602",
      type: "standard",
      tcontProfile: "metro10",
      onuType: "ALL-ONT",
      useC300Syntax: true,
    },
    903: {
      vlan: "903",
      profile: "vlan903",
      type: "lexxa",
      tcontProfile: "default",
      onuType: "ALL-ONT",
      useC300Syntax: true,
    },
    511: {
      vlan: "511",
      profile: "vlan511",
      type: "standard",
      tcontProfile: "kusuma",
      onuType: "ALL",
      useC300Syntax: true,
    },
    bridge_unb: {
      vlan1: "105",
      vlan2: "102",
      profile: "pppoe_vlan102",
      type: "bridge",
    },
    bridge_bolo: {
      vlan1: "1500",
      vlan2: "1501",
      profile: "bolo",
      type: "bridge_bolo",
    },
  };

  const conf = unbConfigs[selectedVlanType];
  const oltPrefix = conf && conf.useC300Syntax ? "gpon-olt_" : "gpon_olt-";
  const onuPrefix = conf && conf.useC300Syntax ? "gpon-onu_" : "gpon_onu-";

  // Dedicated template for UNB V100
  if (String(selectedVlanType) === "100") {
    const v100CleanId = idPelanggan?.toString().trim() || "";
    const v100DescText = namaPelanggan
      ? `${v100CleanId} - ${namaPelanggan.trim().toUpperCase()}`
      : v100CleanId;

    return `conf t
interface gpon-olt_${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon-onu_${interfaceOlt}:${onuId}
name ${v100CleanId}
description ${v100DescText}
sn-bind enable sn
tcont 1 name PPPOE profile kusuma
gemport 1 name PPPOE tcont 1
service-port 1 vport 1 user-vlan 100 vlan 100
exit
pon-onu-mng gpon-onu_${interfaceOlt}:${onuId}
service ServiceName gemport 1 vlan 100
wan-ip 1 mode pppoe username ${v100CleanId} password ${pppoePass} vlan-profile pppoe host 1
wan-ip 1 ping-response enable traceroute-response enable
security-mgmt 212 state enable mode forward protocol web
exit
exit
write`.trim();
  }

  if (conf.type === "bridge") {
    return `conf t
interface ${oltPrefix}${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface ${onuPrefix}${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
sn-bind enable sn
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
service-port 1 vport 1 user-vlan ${conf.vlan1} vlan ${conf.vlan1}
service-port 2 vport 2 user-vlan ${conf.vlan2} vlan ${conf.vlan2}
exit
pon-onu-mng ${onuPrefix}${interfaceOlt}:${onuId}
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

  if (conf.type === "bridge_bolo") {
    return `conf t
interface ${oltPrefix}${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface ${onuPrefix}${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
sn-bind enable sn
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
service-port 1 vport 1 user-vlan ${conf.vlan1} vlan ${conf.vlan1}
service-port 2 vport 2 user-vlan ${conf.vlan2} vlan ${conf.vlan2}
exit
pon-onu-mng ${onuPrefix}${interfaceOlt}:${onuId}
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

  const onuType = conf.onuType || "ALL";
  const tcontProfile = conf.tcontProfile || "kusuma";
  const isLexxa = conf.type === "lexxa";

  return `conf t
interface ${oltPrefix}${interfaceOlt}
onu ${onuId} type ${onuType} sn ${sn}
exit
interface ${onuPrefix}${interfaceOlt}:${onuId}
name ${cleanId}
description ${descText}
sn-bind enable sn
tcont 1 name PPPOE profile ${tcontProfile}
gemport 1 name PPPOE tcont 1
${isLexxa ? "encrypt 1 enable downstream\n" : ""}switchport mode hybrid vport 1
service-port 1 vport 1 user-vlan ${conf.vlan} vlan ${conf.vlan}
exit
pon-onu-mng ${onuPrefix}${interfaceOlt}:${onuId}
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
  const { idPelanggan, namaPelanggan, pppoeUser, pppoePass, paketLayanan } =
    data;

  const commentText = namaPelanggan
    ? `${idPelanggan}-${namaPelanggan.toUpperCase()}`
    : idPelanggan;

  return `/ppp secret add name=${pppoeUser} password=${pppoePass} service=pppoe profile="${paketLayanan}" comment="${commentText}"`;
};
