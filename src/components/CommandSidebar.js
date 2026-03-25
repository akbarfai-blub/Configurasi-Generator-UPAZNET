'use client';
import { Terminal, Copy, Check, Settings2 } from 'lucide-react';
import { useState } from 'react';

export default function CommandSidebar({ data }) {
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [oltType, setOltType] = useState('c600'); // 'c600' atau 'c300'

    const iface = data.interfaceOlt || '1/1/1';
    const onu = data.onuId || '1';
    const sn = data.sn || 'SN_HERE';

    // Mapping Perintah berdasarkan Tipe OLT
    const commands = oltType === 'c600' ? [
        { label: "Cek Redaman 1 Port", cmd: `sho pon power onu-rx gpon_olt-${iface}` },
        { label: "Cek Redaman Pelanggan", cmd: `sho pon power attenuation gpon_onu-${iface}:${onu}` },
        { label: "Reboot Modem", cmd: `conf t\npon-onu-mng gpon_onu-${iface}:${onu}\nreboot` },
        { label: "Hapus ONU", cmd: `conf t\ninterface gpon_olt-${iface}\nno onu ${onu}` },
        { label: "Cek SN Belum Config", cmd: "sho pon onu un" },
        { label: "Detail Info Pelanggan", cmd: `sho gpon onu detail-info gpon_onu-${iface}:${onu}` },
    ] : [
        // MODE C300 / C320
        { label: "Cek Redaman 1 Port", cmd: `show pon power onu-rx gpon-olt_${iface}` },
        { label: "Cek Redaman Pelanggan", cmd: `show pon power attenuation gpon-onu_${iface}:${onu}` },
        { label: "Reboot Modem", cmd: `conf t\npon-onu-mng gpon-onu_${iface}:${onu}\nreboot` },
        { label: "Restore Factory", cmd: `conf t\npon-onu-mng gpon-onu_${iface}:${onu}\nrestore factory` },
        { label: "Ganti SN Modem", cmd: `conf t\ninterface gpon-onu_${iface}:${onu}\nregistration-method sn ${sn}` },
        { label: "Cek Running Config", cmd: `show run interface gpon-onu_${iface}:${onu}` },
        { label: "Cek WAN Pelanggan", cmd: `show onu running config gpon-onu_${iface}:${onu}` },
        { label: "Cek SN Belum Config", cmd: "show gpon onu uncfg" },
        { label: "Cek IP ONU", cmd: `show gpon remote-onu ip-host gpon-onu_${iface}:${onu}` },
        { label: "Cek Interface by SN", cmd: `show gpon onu by sn ${sn}` },
    ];

    const handleCopy = (cmd, idx) => {
        navigator.clipboard.writeText(cmd);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
    };

    return (
        <div className="w-full lg:w-80 bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-700 shadow-xl h-fit sticky top-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2 text-white">
                    <Terminal size={18} className="text-blue-400" />
                    <span className="font-bold text-xs uppercase tracking-tight">Command Hub</span>
                </div>

                {/* Switcher Tipe OLT di Sidebar */}
                <div className="flex bg-slate-800 rounded-lg p-1 scale-90">
                    <button
                        onClick={() => setOltType('c600')}
                        className={`px-3 py-1 text-[10px] font-bold rounded ${oltType === 'c600' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                        C600
                    </button>
                    <button
                        onClick={() => setOltType('c300')}
                        className={`px-3 py-1 text-[10px] font-bold rounded ${oltType === 'c300' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                        C300/C320
                    </button>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 no-scrollbar">
                {commands.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleCopy(item.cmd, idx)}
                        className="w-full text-left group transition-all relative"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-blue-400 transition-colors">
                                {item.label}
                            </span>
                            {copiedIdx === idx && (
                                <span className="text-[9px] text-green-500 font-bold animate-pulse">COPIED!</span>
                            )}
                        </div>
                        <div className={`p-2 rounded bg-slate-800/50 border ${copiedIdx === idx ? 'border-green-500/50' : 'border-slate-800 group-hover:border-slate-600'} transition-all`}>
                            <code className="text-[10px] font-mono block break-all leading-tight text-blue-300/80">
                                {item.cmd.split('\n')[0]}
                            </code>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}