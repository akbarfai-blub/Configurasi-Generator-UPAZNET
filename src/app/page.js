"use client";

import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import CommandSidebar from "@/components/CommandSidebar";
import { useClipboard } from "@/hooks/useClipboard";
import { useOltInterfaceMask } from "@/hooks/useOltInterfaceMask";
import { useScriptGenerator } from "@/hooks/useScriptGenerator";
import { INITIAL_FORM_DATA } from "@/lib/constants";
import ScriptOutput from "@/components/output/ScriptOutput";
import ConfigTypeTabs from "@/components/form/ConfigTypeTabs";
import ConfigTypeSelect from "@/components/form/ConfigTypeSelect";
import OltFormSection from "@/components/form/OltFormSection";
import CustomerFormSection from "@/components/form/CustomerFormSection";
import ServiceFormSection from "@/components/form/ServiceFormSection";

export default function Home() {
  // state untuk memilih tipe config (Menu)
  const [configType, setConfigType] = useState("standard"); // default ke UNR C600 Biasa

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const { copied, copiedMikrotik, copyOlt, copyMikrotik } = useClipboard();
  const { handleOltInterfaceChange, handleIdPelangganChange } =
    useOltInterfaceMask(setFormData);
  const { oltScript, mikrotikScript, generate } = useScriptGenerator();

  const handleTabChange = (type) => {
    setConfigType(type);
    generate(formData, type);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "interfaceOlt") {
      handleOltInterfaceChange(e);
      return;
    }

    if (name === "idPelanggan") {
      handleIdPelangganChange(e);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    generate(formData, configType);
  };

  const handleCopyOlt = useCallback(
    () => copyOlt(oltScript),
    [oltScript, copyOlt],
  );

  const handleCopyMikrotik = useCallback(
    () => copyMikrotik(mikrotikScript),
    [mikrotikScript, copyMikrotik],
  );

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
            <ConfigTypeTabs
              currentType={configType}
              onChange={handleTabChange}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              {/* Form Section */}
              <form
                onSubmit={handleGenerate}
                className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-5 h-fit sticky top-8"
              >
                {/* Opsi Konfigurasi Dinamis (UNR C600 / UNB / UGR / UCD) */}
                {(configType === "standard" || configType === "unb" || configType === "ugr" || configType === "ucd") && (
                  <ConfigTypeSelect
                    configType={configType}
                    formData={formData}
                    onChange={handleChange}
                  />
                )}

                <OltFormSection
                  formData={formData}
                  onChange={handleChange}
                  onOltInterfaceChange={handleOltInterfaceChange}
                />

                <CustomerFormSection
                  formData={formData}
                  onChange={handleChange}
                  onIdPelangganChange={handleIdPelangganChange}
                />

                <ServiceFormSection
                  formData={formData}
                  onChange={handleChange}
                />

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
                <ScriptOutput
                  label="Script OLT (ZTE)"
                  output={oltScript}
                  onCopy={handleCopyOlt}
                  copied={copied}
                  minHeight="320px"
                />

                {/* Box 2: MikroTik Script */}
                <ScriptOutput
                  label="Script MikroTik (PPPoE Secret)"
                  output={mikrotikScript}
                  onCopy={handleCopyMikrotik}
                  copied={copiedMikrotik}
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
