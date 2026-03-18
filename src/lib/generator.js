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
  } = data;

  const cleanId = idPelanggan.toString().slice(0, 10);
  const vlan = "134";
  const vlanProfile = `v${vlan}`;

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
exit`.trim();
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
