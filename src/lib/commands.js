export const OLT_COMMANDS_C600 = [
    { label: "Cek Redaman 1 Port", cmd: "sho pon power onu-rx gpon_olt-1/2/11" },
    { label: "Cek Redaman Pelanggan", cmd: "sho pon power attenuation gpon_onu-1/2/11:5" },
    { label: "Reboot Modem", cmd: "conf t\npon-onu-mng gpon_onu-1/4/9:10\nreboot" },
    { label: "Hapus ONU", cmd: "conf t\ninterface gpon_olt-1/4/9\nno onu 10" },
    { label: "Aktivasi Port OLT", cmd: "conf t\ninterface gpon_olt-1/2/11\nno shutdown" },
    { label: "Cek Status 1 Port", cmd: "sho gpon onu state gpon_olt-1/6/5" },
    { label: "Cek SN Belum Config", cmd: "sho pon onu un" },
    { label: "Cek Detail Pelanggan", cmd: "sho gpon onu detail-info gpon_onu-1/1/6:12" },
];