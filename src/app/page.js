"use client";

import { useState } from "react";
import {
  generateC600,
  generateUHO,
  generateUBL,
  generateUGR,
} from "@/lib/generator";
import { Copy, RefreshCw, CheckCircle2 } from "lucide-react";

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
  });

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  // Fungsi untuk handle perpindahan menu/tab
  const handleTabChange = (type) => {
    setConfigType(type);
    setOutput(""); // Bersihkan output saat pindah menu agar tidak bingung
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

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
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            CONFIGURASI GPON UPAZNET
          </h1>
          <p className="text-slate-500 text-sm">
            Helpdesk Tool - Script Generator
          </p>
        </header>

        <div className="flex bg-gray-200 p-1 rounded-lg mb-6 w-full overflow-x-auto no-scrollbar">
          {["standard", "uho", "ubl", "ugr"].map((type) => (
            <button
              key={type}
              onClick={() => handleTabChange(type)}
              className={`flex-1 py-2 px-4 text-xs font-bold rounded-md transition uppercase tracking-wider ${configType === type ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              {type === "standard" ? "UNR C600" : type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <form
            onSubmit={handleGenerate}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5"
          >
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
    </div>
  );
}
