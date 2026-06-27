"use client";

import { useState, useCallback } from "react";
import { RefreshCw, ClipboardPaste } from "lucide-react";
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
import QuickFillModal from "@/components/form/QuickFillModal";

export default function Home() {
  const [configType, setConfigType] = useState("standard");

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [showQuickFill, setShowQuickFill] = useState(false);

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

  const handleQuickFill = (parsedData) => {
    setFormData((prev) => ({ ...prev, ...parsedData }));
    setShowQuickFill(false);
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

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content - Form first, then Output in HTML */}
          <div className="flex-grow space-y-6">
            <ConfigTypeTabs
              currentType={configType}
              onChange={handleTabChange}
            />

            {/* Mobile: 1 column stacked | Desktop: 2 columns */}
            <div className="flex flex-col xl:grid xl:grid-cols-2 gap-8 items-start">
              {/* Form Section - appears first in both mobile & desktop */}
              <form
                onSubmit={handleGenerate}
                className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-5 h-fit xl:sticky xl:top-8"
              >
                <button
                  type="button"
                  onClick={() => setShowQuickFill(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border-2 border-dashed border-upaz-green/50 text-upaz-green text-sm font-bold hover:bg-upaz-green/10 transition-colors mb-4"
                >
                  <ClipboardPaste size={16} />
                  Quick Fill dari Detail Koneksi
                </button>

                {(configType === "standard" || configType === "unb" || configType === "ugr" || configType === "ucd" || configType === "uho") && (
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

              {/* Output Section - appears second in both mobile & desktop */}
              <div className="w-full flex flex-col gap-4">
                <ScriptOutput
                  label="Script OLT (ZTE)"
                  output={oltScript}
                  onCopy={handleCopyOlt}
                  copied={copied}
                  minHeight="320px"
                />

                <ScriptOutput
                  label="Script MikroTik (PPPoE Secret)"
                  output={mikrotikScript}
                  onCopy={handleCopyMikrotik}
                  copied={copiedMikrotik}
                />
              </div>
            </div>

            {/* Command Hub - Mobile accordion */}
            <div className="xl:hidden">
              <CommandSidebar data={formData} isAccordion />
            </div>
          </div>

          {/* Command Hub - Desktop sidebar */}
          <aside className="hidden xl:block w-full xl:w-80 shrink-0">
            <CommandSidebar data={formData} />
          </aside>
        </div>
      </div>

      {showQuickFill && (
        <QuickFillModal
          onFill={handleQuickFill}
          onClose={() => setShowQuickFill(false)}
        />
      )}
    </div>
  );
}