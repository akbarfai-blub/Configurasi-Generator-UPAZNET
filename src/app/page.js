"use client";

import { useState } from "react";
import {
  generateC600,
  generateUHO,
  generateUBL,
  generateUGR,
  generateUNB,
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
    pppoeUser: "",
    pppoePass: "150326", // Default password
    selectedVlanType: "100", // Default VLAN untuk UNB
    selectedC600Type: "standard" // Default konfigurasi C600
  });

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  // Fungsi untuk handle perpindahan menu/tab
  const handleTabChange = (type) => {
    setConfigType(type);
    setOutput(""); // Bersihkan output saat pindah menu
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
    let result = "";

    switch (configType) {
      case "standard":
        result = generateC600(formData);
        break;
      case "uho":
        result = generateUHO(formData);
        break;
      case "ubl":
        result = generateUBL(formData);
        break;
      case "ugr":
        result = generateUGR(formData);
        break;
      case "unb":
        result = generateUNB(formData);
        break;
      default:
        result = "";
    }

    setOutput(result);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="flex bg-gray-200 p-1 rounded-lg w-full overflow-x-auto no-scrollbar">
              {["standard", "unb", "uho", "ubl", "ugr"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTabChange(type)}
                  className={`flex-1 py-2 px-4 text-xs font-bold rounded-md transition uppercase tracking-wider ${configType === type ? "bg-white shadow text-upaz-blue" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {type === "standard" ? "UNR C600" : type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Form Section */}
              <form
                onSubmit={handleGenerate}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5"
              >
                {/* Opsi Konfigurasi Dinamis (UNR C600 / UNB) */}
                {(configType === 'standard' || configType === 'unb') && (
                  <div className="space-y-1 mb-4 pb-4 border-b border-slate-200">
                    <label className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Tipe Konfigurasi
                    </label>
                    <select
                      name={configType === 'standard' ? "selectedC600Type" : "selectedVlanType"}
                      value={configType === 'standard' ? formData.selectedC600Type : formData.selectedVlanType}
                      onChange={handleChange}
                      className="w-full p-2.5 border-2 border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-sm text-slate-800"
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
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-upaz-blue/50 focus:border-upaz-blue outline-none transition"
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
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-upaz-blue/50 focus:border-upaz-blue outline-none transition"
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
                    className="w-full p-2.5 border rounded-lg font-mono focus:ring-2 focus:ring-upaz-blue/50 focus:border-upaz-blue outline-none transition"
                  />
                </div>

                <div className="space-y-1 border-t pt-4">
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
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-upaz-blue/50 focus:border-upaz-blue outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      PPPoE User
                    </label>
                    <input
                      required
                      name="pppoeUser"
                      value={formData.pppoeUser}
                      onChange={handleChange}
                      className="w-full p-2.5 border bg-gray-50 rounded-lg focus:ring-2 focus:ring-upaz-blue/50 focus:border-upaz-blue outline-none transition"
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
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-upaz-blue/50 focus:border-upaz-blue outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-upaz-green text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-upaz-green/90 transition active:scale-[0.98] shadow-md hover:shadow-lg"
                >
                  <RefreshCw size={18} /> Generate Script
                </button>
              </form>

              {/* Output Section */}
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Generated Script
                  </label>
                  {output && (
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-md transition ${copied ? "bg-upaz-green/10 text-upaz-green" : "bg-upaz-blue/10 text-upaz-blue hover:bg-upaz-blue/20"}`}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Script"}
                </button>
              )}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Script akan muncul di sini..."
              className="w-full flex-grow p-5 font-mono text-[13px] leading-relaxed border border-upaz-blue/20 rounded-xl bg-upaz-blue text-white shadow-inner focus:outline-none min-h-[400px]"
            />
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
