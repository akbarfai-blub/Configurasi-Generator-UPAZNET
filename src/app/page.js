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
  const [configType, setConfigType] = useState("standard");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [oltModel, setOltModel] = useState("c600");

  const { copied, copiedMikrotik, copyOlt, copyMikrotik, copyError } = useClipboard();
  const { handleOltInterfaceChange, handleIdPelangganChange } =
    useOltInterfaceMask(setFormData);
  const { oltScript, mikrotikScript, generate, checkStale } =
    useScriptGenerator();

  const isStale = checkStale(formData, configType);

  const clearFieldError = useCallback((fieldName) => {
    setFormErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const handleTabChange = (type) => {
    setConfigType(type);
    generate(formData, type);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);

    if (name === "interfaceOlt") {
      handleOltInterfaceChange(e);
      return;
    }

    if (name === "idPelanggan") {
      clearFieldError("pppoeUser");
      handleIdPelangganChange(e);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const result = generate(formData, configType);
    if (!result.success) {
      setFormErrors(result.errors);
    } else {
      setFormErrors({});
    }
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
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-upaz-bg p-4 sm:p-6 md:p-8 font-sans text-neutral-ink"
    >
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-upaz-blue tracking-tight">
            KONFIGURASI GPON UPAZNET
          </h1>
          <p className="text-neutral-muted text-sm mt-0.5">
            Alat Bantu Helpdesk & NOC - Generator Skrip
          </p>
        </header>

        <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-start">
          {/* Main Workspace (Tabs, Form, Output, and Laptop Command Hub) */}
          <div className="flex-grow w-full min-w-0 space-y-6">
            <ConfigTypeTabs
              currentType={configType}
              onChange={handleTabChange}
            />

            {/* Form & Output Grid: 1 col on mobile (<1024px), 2 cols on laptop (>=1024px) */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 items-start w-full min-w-0">
              {/* Form Section */}
              <form
                onSubmit={handleGenerate}
                id="config-form-panel"
                className="w-full bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-neutral-divider space-y-5 h-fit lg:sticky lg:top-8"
              >
                {(configType === "standard" ||
                  configType === "unb" ||
                  configType === "ugr" ||
                  configType === "ucd" ||
                  configType === "uho") && (
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
                  errors={formErrors}
                />

                <CustomerFormSection
                  formData={formData}
                  onChange={handleChange}
                  onIdPelangganChange={handleIdPelangganChange}
                  errors={formErrors}
                />

                <ServiceFormSection
                  formData={formData}
                  onChange={handleChange}
                  configType={configType}
                  errors={formErrors}
                />

                <button
                  type="submit"
                  className="w-full bg-upaz-green text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#008c44] transition-colors shadow-md hover:shadow-lg cursor-pointer text-sm tracking-wide"
                >
                  <RefreshCw size={18} /> Buat Skrip
                </button>
              </form>

              {/* Output Section */}
              <div className="w-full min-w-0 flex flex-col gap-4">
                <ScriptOutput
                  label="Skrip OLT (ZTE)"
                  output={oltScript}
                  onCopy={handleCopyOlt}
                  copied={copied}
                  isStale={isStale}
                  errorMessage={copyError?.key === "olt" ? copyError.message : null}
                  minHeight="320px"
                />

                <ScriptOutput
                  label="Skrip MikroTik (PPPoE Secret)"
                  output={mikrotikScript}
                  onCopy={handleCopyMikrotik}
                  copied={copiedMikrotik}
                  isStale={isStale}
                  errorMessage={copyError?.key === "mikrotik" ? copyError.message : null}
                />
              </div>
            </div>

            {/* Command Hub - Mobile accordion (<1024px) */}
            <div className="lg:hidden w-full min-w-0">
              <CommandSidebar
                data={formData}
                isAccordion
                idPrefix="mobile"
                oltType={oltModel}
                onOltTypeChange={setOltModel}
              />
            </div>

            {/* Command Hub - Medium / Laptop (1024px - 1279px) full-width panel under Form/Output */}
            <div className="hidden lg:block xl:hidden w-full min-w-0 pt-2">
              <CommandSidebar
                data={formData}
                idPrefix="laptop"
                oltType={oltModel}
                onOltTypeChange={setOltModel}
              />
            </div>
          </div>

          {/* Command Hub - Desktop Sidebar (>=1280px) */}
          <aside className="hidden xl:block w-80 shrink-0 sticky xl:top-8">
            <CommandSidebar
              data={formData}
              idPrefix="desktop"
              oltType={oltModel}
              onOltTypeChange={setOltModel}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}