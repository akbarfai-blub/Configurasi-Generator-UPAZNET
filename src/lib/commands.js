import { isValidOltInterface } from "./validation.js";

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

/**
 * Menghasilkan daftar perintah operasional Command Hub berdasarkan target form
 * dan tipe OLT (C600 atau C300/C320).
 */
export function getCommandList(data = {}, oltType = "c600") {
  const isIfaceValid = isValidOltInterface(data?.interfaceOlt);
  const rawOnu = (data?.onuId ?? "").toString().trim();
  const isOnuValid = isIfaceValid && /^\d+$/.test(rawOnu);
  const rawSn = (data?.sn ?? "").toString().trim();
  const isSnValid = rawSn.length > 0;

  const iface = isIfaceValid ? data.interfaceOlt.trim() : "<interface>";
  const onu = isOnuValid ? rawOnu : "<onu>";
  const sn = isSnValid ? rawSn : "<sn>";

  if (oltType === "c600") {
    return [
      {
        id: "c600_rx_power",
        label: "Cek Redaman 1 Port",
        cmd: `sho pon power onu-rx gpon_olt-${iface}`,
        isReady: isIfaceValid,
        missingHint: "Butuh Interface valid",
      },
      {
        id: "c600_attenuation",
        label: "Cek Redaman Pelanggan",
        cmd: `sho pon power attenuation gpon_onu-${iface}:${onu}`,
        isReady: isOnuValid,
        missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
      },
      {
        id: "c600_reboot",
        label: "Reboot Modem",
        cmd: `conf t\npon-onu-mng gpon_onu-${iface}:${onu}\nreboot`,
        isReady: isOnuValid,
        missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
      },
      {
        id: "c600_delete_onu",
        label: "Hapus ONU",
        cmd: `conf t\ninterface gpon_olt-${iface}\nno onu ${onu}`,
        isReady: isOnuValid,
        missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
      },
      {
        id: "c600_activate_port",
        label: "Aktivasi Port OLT",
        cmd: `conf t\ninterface gpon_olt-${iface}\nno shutdown`,
        isReady: isIfaceValid,
        missingHint: "Butuh Interface valid",
      },
      {
        id: "c600_onu_state",
        label: "Cek Status 1 Port",
        cmd: `sho gpon onu state gpon_olt-${iface}`,
        isReady: isIfaceValid,
        missingHint: "Butuh Interface valid",
      },
      {
        id: "c600_uncfg_sn",
        label: "Cek SN Belum Config",
        cmd: "sho pon onu un",
        isReady: true,
        missingHint: null,
      },
      {
        id: "c600_detail_info",
        label: "Detail Info Pelanggan",
        cmd: `sho gpon onu detail-info gpon_onu-${iface}:${onu}`,
        isReady: isOnuValid,
        missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
      },
      {
        id: "c600_detail_wan",
        label: "Cek Detail WAN",
        cmd: `show gpon remote-onu wan-ip gpon_onu-${iface}:${onu}`,
        isReady: isOnuValid,
        missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
      },
      {
        id: "c600_config_wan",
        label: "Cek Config WAN",
        cmd: `show running-config interface gpon_onu-${iface}:${onu}`,
        isReady: isOnuValid,
        missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
      },
    ];
  }

  return [
    {
      id: "c300_rx_power",
      label: "Cek Redaman 1 Port",
      cmd: `show pon power onu-rx gpon-olt_${iface}`,
      isReady: isIfaceValid,
      missingHint: "Butuh Interface valid",
    },
    {
      id: "c300_attenuation",
      label: "Cek Redaman Pelanggan",
      cmd: `show pon power attenuation gpon-onu_${iface}:${onu}`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
    {
      id: "c300_reboot",
      label: "Reboot Modem",
      cmd: `conf t\npon-onu-mng gpon-onu_${iface}:${onu}\nreboot`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
    {
      id: "c300_restore_factory",
      label: "Restore Factory",
      cmd: `conf t\npon-onu-mng gpon-onu_${iface}:${onu}\nrestore factory`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
    {
      id: "c300_change_sn",
      label: "Ganti SN Modem",
      cmd: `conf t\ninterface gpon-onu_${iface}:${onu}\nregistration-method sn ${sn}`,
      isReady: isOnuValid && isSnValid,
      missingHint: !isOnuValid
        ? (!isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID")
        : "Butuh SN",
    },
    {
      id: "c300_delete_onu",
      label: "Hapus ONU (OLT)",
      cmd: `conf t\ninterface gpon-olt_${iface}\nno onu ${onu}`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
    {
      id: "c300_activate_port",
      label: "Aktivasi Port OLT",
      cmd: `conf t\ninterface gpon-olt_${iface}\nno shutdown`,
      isReady: isIfaceValid,
      missingHint: "Butuh Interface valid",
    },
    {
      id: "c300_onu_state",
      label: "Cek Status 1 Port",
      cmd: `show gpon onu state gpon-olt_${iface}`,
      isReady: isIfaceValid,
      missingHint: "Butuh Interface valid",
    },
    {
      id: "c300_run_config",
      label: "Cek Running Config",
      cmd: `show run interface gpon-onu_${iface}:${onu}`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
    {
      id: "c300_wan_config",
      label: "Cek WAN Pelanggan",
      cmd: `show onu running config gpon-onu_${iface}:${onu}`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
    {
      id: "c300_uncfg_sn",
      label: "Cek SN Belum Config",
      cmd: "show gpon onu uncfg",
      isReady: true,
      missingHint: null,
    },
    {
      id: "c300_detail_info",
      label: "Detail Info Pelanggan",
      cmd: `show gpon onu detail-info gpon-onu_${iface}:${onu}`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
    {
      id: "c300_by_sn",
      label: "Cek Interface by SN",
      cmd: `show gpon onu by sn ${sn}`,
      isReady: isSnValid,
      missingHint: "Butuh SN",
    },
    {
      id: "c300_ip_onu",
      label: "Cek IP ONU",
      cmd: `show gpon remote-onu ip-host gpon-onu_${iface}:${onu}`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
    {
      id: "c300_detail_wan",
      label: "Cek Detail WAN",
      cmd: `show gpon remote-onu wan-ip gpon-onu_${iface}:${onu}`,
      isReady: isOnuValid,
      missingHint: !isIfaceValid ? "Butuh Interface valid" : "Butuh ONU ID",
    },
  ];
}