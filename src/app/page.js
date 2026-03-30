"use client";

import { useState } from "react";
import {
  generateC600,
  generateUHO,
  generateUBL,
  generateUGR,
  generateUNB,
  generateMikrotikSecret,
} from "@/lib/generator";
import { Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import CommandSidebar from "@/components/CommandSidebar";

export default function Home() {
  // state untuk memilih tipe config (Menu)
  const [configType, setConfigType] = useState("standard"); // default ke UNR C600 Biasa

  const [formData, setFormData] = useState({
    interfaceOlt: "1/4/2",
    onuId: "",
    sn: "",
    idPelanggan: "",
    namaPelanggan: "",
    pppoeUser: "",
    pppoePass: "", // Default password
    paketLayanan: "KUSUMA 1", // Default Paket Layanan
    selectedVlanType: "100", // Default VLAN untuk UNB
    selectedC600Type: "standard" // Default konfigurasi C600
  });

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [mikrotikOutput, setMikrotikOutput] = useState("");
  const [copiedMikrotik, setCopiedMikrotik] = useState(false);

  // Fungsi untuk handle perpindahan menu/tab
  const handleTabChange = (type) => {
    setConfigType(type);
    setOutput(""); // Bersihkan output saat pindah menu
    setMikrotikOutput("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-Separator & Auto-Masking OLT (Lebih Natural & Fleksibel)
      if (name === "interfaceOlt") {
        // Toleransi angka dan garis miring (slash) agar user bebas melakukan intervensi (contoh ketik 1/1/10 manual)
        let cleaned = value.replace(/[^\d/]/g, "").replace(/\/+/g, "/");
        let parts = cleaned.split("/");

        // Maksimal 3 bagian (Rack / Shelf / Port)
        if (parts.length > 3) {
          parts = parts.slice(0, 3);
        }

        // 1. Rack selalu 1 digit
        if (parts[0] && parts[0].length > 1) {
          let overflow = parts[0].substring(1);
          parts[0] = parts[0].substring(0, 1);
          parts[1] = overflow + (parts[1] || "");
        }

        // 2. Slot/Shelf logic (Maksimum 2 digit jika slot diawali 1 atau 2. Jika 3 dst, slot cuma 1 digit)
        if (parts[1]) {
          let maxSlotLength = (parts[1][0] === "1" || parts[1][0] === "2") ? 2 : 1;

          if (parts[1].length > maxSlotLength) {
            let overflow = parts[1].substring(maxSlotLength);
            parts[1] = parts[1].substring(0, maxSlotLength);
            parts[2] = overflow + (parts[2] || "");
          }
        }

        // 3. Port logic: maksimal 2 digit
        if (parts[2] && parts[2].length > 2) {
          parts[2] = parts[2].substring(0, 2);
        }

        newData[name] = parts.join("/");
      }

      // Auto-fill PPPoE User saat ID Pelanggan diketik
      if (name === "idPelanggan") {
        newData.pppoeUser = value;
      }

      return newData;
    });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    let resultOlt = "";
    let resultMikrotik = "";

    switch (configType) {
      case "standard":
        resultOlt = generateC600(formData);
        break;
      case "uho":
        resultOlt = generateUHO(formData);
        break;
      case "ubl":
        resultOlt = generateUBL(formData);
        break;
      case "ugr":
        resultOlt = generateUGR(formData);
        break;
      case "unb":
        resultOlt = generateUNB(formData);
        break;
      default:
        resultOlt = "";
    }

    // Selalu generate Mikrotik Script terlepas dari tipe config OLT
    resultMikrotik = generateMikrotikSecret(formData);

    setOutput(resultOlt);
    setMikrotikOutput(resultMikrotik);
  };

  const copyToClipboard = (text, type = "olt") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "mikrotik") {
      setCopiedMikrotik(true);
      setTimeout(() => setCopiedMikrotik(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-upaz-bg p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-upaz-blue">
            CONFIGURASI GPON UPAZNET
          </h1>
          <p className="text-slate-500 text-sm">
            Helpdesk Tool - Script Generator
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-6">
            <div className="flex bg-slate-100 p-1 rounded-xl w-full overflow-x-auto no-scrollbar gap-1">
              {["standard", "unb", "uho", "ubl", "ugr"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTabChange(type)}
                  className={`flex-1 py-2 px-4 text-xs uppercase tracking-wider transition-all ${configType === type ? "bg-upaz-blue text-white shadow-md font-bold rounded-lg" : "text-slate-500 hover:text-upaz-blue hover:bg-white font-medium rounded-lg"}`}
                >
                  {type === "standard" ? "UNR C600" : type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              {/* Form Section */}
              <form
                onSubmit={handleGenerate}
                className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-5 h-fit sticky top-8"
              >
                {/* Opsi Konfigurasi Dinamis (UNR C600 / UNB) */}
                {(configType === 'standard' || configType === 'unb') && (
                  <div className="space-y-1 mb-4 pb-4 border-b border-slate-200">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Tipe Konfigurasi
                    </label>
                    <select
                      name={configType === 'standard' ? "selectedC600Type" : "selectedVlanType"}
                      value={configType === 'standard' ? formData.selectedC600Type : formData.selectedVlanType}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition font-bold text-sm text-slate-800"
                    >
                      {configType === 'standard' ? (
                        <>
                          <option value="standard">Standard (PPPoE)</option>
                          <option value="bridge">Bridge Mode</option>
                        </>
                      ) : (
                        <>
                          <optgroup label="Standard (PPPoE)">
                            <option value="100">UNB V100</option>
                            <option value="1600">UNB V1600 (AL KHOIRIYAH)</option>
                            <option value="1501">UNB V1501 (BOLO)</option>
                            <option value="602">UNB V602 (ALNET)</option>
                            <option value="903">UNB V903 (LEXXA)</option>
                            <option value="511">UNB V511 (CADAR)</option>
                          </optgroup>
                          <optgroup label="Bridge Mode">
                            <option value="bridge_unb">UNB Bridge</option>
                            <option value="bridge_bolo">Bridge Bolo</option>
                          </optgroup>
                        </>
                      )}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Interface OLT
                    </label>
                    <input
                      required
                      name="interfaceOlt"
                      value={formData.interfaceOlt}
                      onChange={handleChange}
                      placeholder="1/4/2"
                      inputMode="numeric"
                      className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      ONU ID
                    </label>
                    <input
                      required
                      name="onuId"
                      value={formData.onuId}
                      onChange={handleChange}
                      placeholder="88"
                      className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Serial Number (SN)
                  </label>
                  <input
                    required
                    name="sn"
                    value={formData.sn}
                    onChange={handleChange}
                    placeholder="ZTEGD2327302"
                    className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg font-mono focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
                  />
                </div>

                <div className="space-y-4 border-t pt-5 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    {/* <CheckCircle2 size={16} className="text-upaz-green" /> */}
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Konfigurasi PPPoE Secret & Pelanggan
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        ID Pelanggan
                      </label>
                      <input
                        required
                        name="idPelanggan"
                        value={formData.idPelanggan}
                        onChange={handleChange}
                        maxLength={10}
                        placeholder="1010112678"
                        className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Nama Pelanggan
                      </label>
                      <input
                        name="namaPelanggan"
                        value={formData.namaPelanggan}
                        onChange={handleChange}
                        placeholder="BUDI SANTOSO"
                        className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Paket Layanan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Paket Layanan
                    </label>
                    <select
                      name="paketLayanan"
                      value={formData.paketLayanan}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition font-semibold text-sm text-slate-800"
                    >
                      <optgroup label="Paket Kusuma">
                        <option value="KUSUMA 1">KUSUMA 1</option>
                        <option value="KUSUMA 2">KUSUMA 2</option>
                        <option value="KUSUMA 3">KUSUMA 3</option>
                        <option value="KUSUMA 4">KUSUMA 4</option>
                      </optgroup>
                      <optgroup label="Paket Puspa">
                        <option value="PUSPA 1">PUSPA 1</option>
                        <option value="PUSPA 2">PUSPA 2</option>
                        <option value="PUSPA 3">PUSPA 3</option>
                        <option value="PUSPA 4">PUSPA 4</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      PPPoE User
                    </label>
                    <input
                      required
                      name="pppoeUser"
                      value={formData.pppoeUser}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      PPPoE Pass
                    </label>
                    <input
                      required
                      name="pppoePass"
                      value={formData.pppoePass}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-upaz-green text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#008c44] transition-colors shadow-md hover:shadow-lg"
                >
                  <RefreshCw size={18} /> Generate Script
                </button>
              </form>

              {/* Output Section (2 Boxes) */}
              <div className="flex-grow flex flex-col gap-4">
                {/* Box 1: OLT Script */}
                <div className="w-full bg-upaz-blue p-5 rounded-xl shadow-xl border border-blue-900/50 flex flex-col flex-grow" style={{ minHeight: '320px' }}>
                  <div className="flex justify-between items-center mb-4 border-b border-blue-800 pb-2">
                    <span className="font-bold text-xs flex items-center gap-2 uppercase tracking-tight text-white"><CheckCircle2 size={14} className="text-upaz-green" /> Script OLT (ZTE)</span>
                    <button onClick={() => copyToClipboard(output, "olt")} className={`text-xs font-bold transition flex items-center gap-1 ${copied ? "text-white" : "text-upaz-green hover:text-white"}`}>
                      {copied ? "COPIED!" : "COPY"}
                    </button>
                  </div>
                  <pre className="font-mono text-[13px] whitespace-pre-wrap leading-relaxed text-blue-100 overflow-y-auto flex-grow">{output || 'Script OLT akan muncul di sini...'}</pre>
                </div>

                {/* Box 2: MikroTik Script */}
                <div className="w-full bg-upaz-blue p-5 rounded-xl shadow-xl border border-blue-900/50 flex flex-col flex-grow" style={{ minHeight: '130px' }}>
                  <div className="flex justify-between items-center mb-4 border-b border-blue-800 pb-2">
                    <span className="font-bold text-xs flex items-center gap-2 uppercase tracking-tight text-white"><CheckCircle2 size={14} className="text-upaz-green" /> Script MikroTik (PPPoE Secret)</span>
                    <button onClick={() => copyToClipboard(mikrotikOutput, "mikrotik")} className={`text-xs font-bold transition flex items-center gap-1 ${copiedMikrotik ? "text-white" : "text-upaz-green hover:text-white"}`}>
                      {copiedMikrotik ? "COPIED!" : "COPY"}
                    </button>
                  </div>
                  <pre className="font-mono text-[13px] whitespace-pre-wrap leading-relaxed text-blue-100 overflow-y-auto">{mikrotikOutput || 'Script MikroTik akan muncul di sini...'}</pre>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:block w-full lg:w-80 xl:w-96 shrink-0">
            <CommandSidebar data={formData} />
          </aside>
        </div>
      </div>
    </div>
  );
}
