"use client";
import { Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function CommandSidebar({ data, isAccordion = false }) {
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [oltType, setOltType] = useState("c600");
    const [isOpen, setIsOpen] = useState(false);

    const iface = data.interfaceOlt || "1/1/1";
    const onu = data.onuId || "1";
    const sn = data.sn || "SN_HERE";

    const commands = oltType === "c600" ? [
        { label: "Cek Redaman 1 Port", cmd: `sho pon power onu-rx gpon_olt-${iface}` },
        { label: "Cek Redaman Pelanggan", cmd: `sho pon power attenuation gpon_onu-${iface}:${onu}` },
        { label: "Reboot Modem", cmd: `conf t\npon-onu-mng gpon_onu-${iface}:${onu}\nreboot` },
        { label: "Hapus ONU", cmd: `conf t\ninterface gpon_olt-${iface}\nno onu ${onu}` },
        { label: "Aktivasi Port OLT", cmd: `conf t\ninterface gpon_olt-${iface}\nno shutdown` },
        { label: "Cek Status 1 Port", cmd: `sho gpon onu state gpon_olt-${iface}` },
        { label: "Cek SN Belum Config", cmd: "sho pon onu un" },
        { label: "Detail Info Pelanggan", cmd: `sho gpon onu detail-info gpon_onu-${iface}:${onu}` },
        { label: "Cek Detail WAN", cmd: `show gpon remote-onu wan-ip gpon_onu-${iface}:${onu}` },
        { label: "Cek Config WAN", cmd: `show running-config interface gpon_onu-${iface}:${onu}` },
    ] : [
        { label: "Cek Redaman 1 Port", cmd: `show pon power onu-rx gpon-olt_${iface}` },
        { label: "Cek Redaman Pelanggan", cmd: `show pon power attenuation gpon-onu_${iface}:${onu}` },
        { label: "Reboot Modem", cmd: `conf t\npon-onu-mng gpon-onu_${iface}:${onu}\nreboot` },
        { label: "Restore Factory", cmd: `conf t\npon-onu-mng gpon-onu_${iface}:${onu}\nrestore factory` },
        { label: "Ganti SN Modem", cmd: `conf t\ninterface gpon-onu_${iface}:${onu}\nregistration-method sn ${sn}` },
        { label: "Hapus ONU (OLT)", cmd: `conf t\ninterface gpon-olt_${iface}\nno onu ${onu}` },
        { label: "Aktivasi Port OLT", cmd: `conf t\ninterface gpon-olt_${iface}\nno shutdown` },
        { label: "Cek Status 1 Port", cmd: `show gpon onu state gpon-olt_${iface}` },
        { label: "Cek Running Config", cmd: `show run interface gpon-onu_${iface}:${onu}` },
        { label: "Cek WAN Pelanggan", cmd: `show onu running config gpon-onu_${iface}:${onu}` },
        { label: "Cek SN Belum Config", cmd: "show gpon onu uncfg" },
        { label: "Detail Info Pelanggan", cmd: `show gpon onu detail-info gpon-onu_${iface}:${onu}` },
        { label: "Cek Interface by SN", cmd: `show gpon onu by sn ${sn}` },
        { label: "Cek IP ONU", cmd: `show gpon remote-onu ip-host gpon-onu_${iface}:${onu}` },
        { label: "Cek Detail WAN", cmd: `show gpon remote-onu wan-ip gpon-onu_${iface}:${onu}` },
    ];

    const handleCopy = (cmd, idx) => {
        navigator.clipboard.writeText(cmd);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="w-full bg-upaz-blue text-panel-on-navy rounded-xl shadow-xl h-fit">
            <div className="flex items-center justify-between mb-4 border-b border-panel-on-navy/10 pb-3 p-5">
                <div className="flex items-center gap-2 text-panel-on-navy">
                    <Terminal size={18} className="text-upaz-green" />
                    <span className="font-bold text-xs uppercase tracking-tight">
                        {isAccordion ? ">_ Command Hub" : "Command Hub"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {isAccordion && (
                        <button
                            onClick={toggleOpen}
                            className="flex items-center gap-1 px-3 py-1.5 bg-upaz-blue/80 border border-upaz-green/50 rounded-lg text-xs font-bold text-upaz-green hover:bg-upaz-green hover:text-white transition-colors xl:hidden"
                        >
                            {isOpen ? (
                                <>TUTUP <ChevronUp size={12} /></>
                            ) : (
                                <>BUKA <ChevronDown size={12} /></>
                            )}
                        </button>
                    )}

                    <div role="tablist" aria-label="Mode OLT" className="flex bg-panel-on-navy/10 rounded-lg p-1 scale-90">
                        <button
                            role="tab"
                            id="olt-tab-c600"
                            aria-selected={oltType === "c600"}
                            aria-controls="command-list"
                            onClick={() => setOltType("c600")}
                            className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                                oltType === "c600"
                                    ? "bg-upaz-green text-white"
                                    : "text-panel-on-navy/60 hover:text-panel-on-navy"
                            }`}
                        >
                            C600
                        </button>
                        <button
                            role="tab"
                            id="olt-tab-c300"
                            aria-selected={oltType === "c300"}
                            aria-controls="command-list"
                            onClick={() => setOltType("c300")}
                            className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                                oltType === "c300"
                                    ? "bg-upaz-green text-white"
                                    : "text-panel-on-navy/60 hover:text-panel-on-navy"
                            }`}
                        >
                            C300/C320
                        </button>
                    </div>
                </div>
            </div>

            {(isAccordion ? isOpen : true) && (
                <div
                    id="command-list"
                    role="tabpanel"
                    aria-labelledby={oltType === "c600" ? "olt-tab-c600" : "olt-tab-c300"}
                    className="px-5 pb-5 space-y-3 max-h-[600px] overflow-y-auto no-scrollbar"
                >
                    {commands.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleCopy(item.cmd, idx)}
                            className="w-full text-left group transition-all relative"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] uppercase tracking-widest text-panel-on-navy/60 font-bold group-hover:text-upaz-green transition-colors">
                                    {item.label}
                                </span>
                                {copiedIdx === idx && (
                                    <span className="text-[9px] text-upaz-green font-bold animate-pulse">
                                        COPIED!
                                    </span>
                                )}
                            </div>
                            <div
                                className={`p-2 rounded bg-panel-on-navy/5 border ${
                                    copiedIdx === idx
                                        ? "border-upaz-green/50"
                                        : "border-transparent group-hover:border-panel-on-navy/20"
                                } transition-all`}
                            >
                                <code className="text-[10px] font-mono block break-all leading-tight text-panel-on-navy/90 whitespace-pre-wrap">
                                    {item.cmd}
                                </code>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}