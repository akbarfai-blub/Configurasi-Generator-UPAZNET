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
    selectedVlan: '100' // Default VLAN untuk UNB
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

      // Auto-Masking / Auto-Separator untuk interfaceOlt
      if (name === "interfaceOlt") {
        let val = value;
        const prevVal = prev.interfaceOlt || "";

        // Mencegah infinite loop backspace saat menghapus '/'
        // Jika length berkurang 1 dan karakter yang terhapus tepat di posisi '/', potong digit asli
        if (prevVal.length - val.length === 1 && prevVal[val.length] === '/') {
          val = val.slice(0, -1);
        }

        // Bersihkan seluruh karakter non-angka secara real-time
        let digits = val.replace(/\D/g, "");

        let formatted = "";
        if (digits.length > 0) {
          if (digits.length === 1) formatted = digits;
          else if (digits.length === 2) formatted = `${digits[0]}/${digits[1]}`;
          else if (digits.length === 3) formatted = `${digits[0]}/${digits[1]}/${digits[2]}`;
          else if (digits.length === 4) {
            // Handle ambiguitas 4 digit:
            // Jika digit ke-2 adalah 1 (kemungkinan Slot 10-17), format jadi Rack/Slot(2digit)/Port(1digit)
            // Selain itu, format jadi Rack/Slot(1digit)/Port(2digit)
            if (digits[1] === "1" && parseInt(digits[2]) <= 7) {
              formatted = `${digits[0]}/${digits[1]}${digits[2]}/${digits[3]}`;
            } else {
              formatted = `${digits[0]}/${digits[1]}/${digits[2]}${digits[3]}`;
            }
          } else if (digits.length >= 5) {
            // max length 5 digit. contoh 11216 -> 1/12/16
            formatted = `${digits[0]}/${digits[1]}${digits[2]}/${digits[3]}${digits[4]}`;
          }
        }
        newData[name] = formatted;
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            CONFIGURASI GPON UPAZNET
          </h1>
          <p className="text-slate-500 text-sm">
            Helpdesk Tool - Script Generator
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-6">
            <div className="flex bg-gray-200 p-1 rounded-lg w-full overflow-x-auto no-scrollbar">
              {["standard", "uho", "ubl", "ugr", "unb"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTabChange(type)}
                  className={`flex-1 py-2 px-4 text-xs font-bold rounded-md transition uppercase tracking-wider ${configType === type ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
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
                {/* Dropdown Khusus UNB */}
                {configType === 'unb' && (
                  <div className="space-y-1 mb-4 pb-4 border-b">
                    <label className="text-xs font-bold uppercase tracking-wider text-blue-600">Opsi Konfigurasi UNB</label>
                    <select
                      name="selectedVlanType"
                      value={formData.selectedVlanType}
                      onChange={handleChange}
                      className="w-full p-2.5 border-2 border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-sm"
                    >
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
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                    className="w-full p-2.5 border rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                      className="w-full p-2.5 border bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                      className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-[0.98]"
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
                      className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-md transition ${copied ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
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
                  className="w-full flex-grow p-5 font-mono text-[13px] leading-relaxed border border-slate-200 rounded-xl bg-slate-900 text-slate-300 shadow-inner focus:outline-none min-h-[400px]"
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
