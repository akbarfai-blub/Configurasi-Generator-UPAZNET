/**
 * Logic generator khusus UNR C600 - Pelanggan Biasa
 */
export const generateC600 = (data) => {
    const {
        interfaceOlt,
        onuId,
        sn,
        idPelanggan,
        profile = 'kusuma',
        vlan = '134',
        pppoeUser,
        pppoePass = '150326'
    } = data;

    // Format vlanProfile biasanya diawali huruf 'v' + angka vlan
    const vlanProfile = `v${vlan}`;

    return `conf t
interface gpon_olt-${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
exit
interface gpon_onu-${interfaceOlt}:${onuId}
name ${idPelanggan}
description ${idPelanggan}
tcont 1 profile ${profile}
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


// Generator untuk C600 V132
export const generateC600V132 = (data) => {
    const { interfaceOlt, onuId, sn, idPelanggan, pppoeUser, pppoePass } = data;

    return `config terminal
interface gpon_olt-${interfaceOlt}
onu ${onuId} type ALL sn ${sn}
!
interface gpon_onu-${interfaceOlt}:${onuId}
name ${idPelanggan}
description ${idPelanggan}
tcont 1 profile kusuma
gemport 1 tcont 1
gemport 2 tcont 1
!
interface vport-${interfaceOlt}.${onuId}:1
service-port 1 user-vlan 134 vlan 134
!
interface vport-${interfaceOlt}.${onuId}:2
service-port 2 user-vlan 129 vlan 129
!
pon-onu-mng gpon_onu-${interfaceOlt}:${onuId}
service 1 gemport 1 vlan 134
service 2 gemport 2 vlan 129
security-mgmt 1 state enable mode forward protocol web
wan-ip 1 ipv4 mode pppoe username ${pppoeUser} password ${pppoePass} vlan-profile v134 host 1
wan 1 service tr069 internet
tr069-mgmt 1 state unlock
tr069-mgmt 1 acs http://acs.upaz.net.id:9999/ validate basic username acs@upaz.net.id password upaz8ersinar
!
!
write`.trim();
};