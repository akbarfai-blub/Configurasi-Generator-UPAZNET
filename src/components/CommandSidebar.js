"use client";

import { Terminal, ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { isValidOltInterface } from "@/lib/validation";
import { useClipboard } from "@/hooks/useClipboard";
import { getCommandList } from "@/lib/commands";

export default function CommandSidebar({
  data,
  isAccordion = false,
  idPrefix = isAccordion ? "mobile" : "desktop",
  oltType: controlledOltType,
  onOltTypeChange,
}) {
  const [internalOltType, setInternalOltType] = useState("c600");
  const oltType = controlledOltType ?? internalOltType;
  const setOltType = onOltTypeChange ?? setInternalOltType;

  const [isOpen, setIsOpen] = useState(false);
  const { copyCommand, isCopied, copyError, getError } = useClipboard();

  const isIfaceValid = isValidOltInterface(data?.interfaceOlt);
  const rawOnu = (data?.onuId ?? "").toString().trim();
  const isOnuValid = isIfaceValid && /^\d+$/.test(rawOnu);
  const rawSn = (data?.sn ?? "").toString().trim();
  const isSnValid = rawSn.length > 0;

  const commands = getCommandList(data, oltType);

  const handleCopy = (item) => {
    if (!item.isReady) return;
    copyCommand(item.cmd, item.id);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="w-full bg-upaz-blue text-panel-on-navy rounded-xl shadow-xl h-fit border border-panel-border/40">
      <div className="flex items-center justify-between border-b border-panel-on-navy/10 p-3.5 sm:p-5 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 text-panel-on-navy min-w-0">
          <Terminal size={18} className="text-upaz-green shrink-0" />
          <span className="font-bold text-xs uppercase tracking-tight truncate">
            {isAccordion ? ">_ Command Hub" : "Command Hub"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAccordion && (
            <button
              onClick={toggleOpen}
              className="flex items-center gap-1 px-2.5 py-1 bg-panel-on-navy/10 border border-panel-on-navy/20 rounded-lg text-xs font-semibold text-panel-on-navy hover:bg-upaz-green hover:border-upaz-green hover:text-white transition-colors cursor-pointer"
            >
              {isOpen ? (
                <>TUTUP <ChevronUp size={12} /></>
              ) : (
                <>BUKA <ChevronDown size={12} /></>
              )}
            </button>
          )}

          <div
            role="tablist"
            aria-label="Mode OLT"
            className="flex bg-panel-on-navy/10 rounded-lg p-0.5 border border-panel-on-navy/10 shrink-0"
          >
            <button
              role="tab"
              id={`olt-tab-c600-${idPrefix}`}
              aria-selected={oltType === "c600"}
              aria-controls={`command-list-${idPrefix}`}
              onClick={() => setOltType("c600")}
              className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                oltType === "c600"
                  ? "bg-upaz-green text-white shadow-sm"
                  : "text-panel-on-navy/60 hover:text-panel-on-navy"
              }`}
            >
              C600
            </button>
            <button
              role="tab"
              id={`olt-tab-c300-${idPrefix}`}
              aria-selected={oltType === "c300"}
              aria-controls={`command-list-${idPrefix}`}
              onClick={() => setOltType("c300")}
              className={`px-2 sm:px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                oltType === "c300"
                  ? "bg-upaz-green text-white shadow-sm"
                  : "text-panel-on-navy/60 hover:text-panel-on-navy"
              }`}
            >
              C300/C320
            </button>
          </div>
        </div>
      </div>

      {(isAccordion ? isOpen : true) && (
        <div className="p-4 sm:p-5 pt-3 sm:pt-4 space-y-3">
          {/* Active Target Banner */}
          <div className="text-xs font-mono bg-panel-on-navy/5 border border-panel-on-navy/10 rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-panel-on-navy/80">
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-panel-on-navy/60">
              Target:
            </span>
            <span>
              Port:{" "}
              <strong className={isIfaceValid ? "text-upaz-green font-semibold" : "text-panel-on-navy/40 font-normal"}>
                {isIfaceValid ? data.interfaceOlt : "-"}
              </strong>
            </span>
            <span>
              ONU:{" "}
              <strong className={isOnuValid ? "text-upaz-green font-semibold" : "text-panel-on-navy/40 font-normal"}>
                {isOnuValid ? rawOnu : "-"}
              </strong>
            </span>
            <span>
              SN:{" "}
              <strong className={isSnValid ? "text-upaz-green font-semibold" : "text-panel-on-navy/40 font-normal"}>
                {isSnValid ? rawSn : "-"}
              </strong>
            </span>
          </div>

          {/* Global Clipboard Error Notification */}
          {copyError && (
            <div
              role="alert"
              aria-live="polite"
              className="px-3 py-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium flex items-start gap-2"
            >
              <AlertCircle size={14} className="shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed break-words flex-1">Gagal menyalin: {copyError.message}</span>
            </div>
          )}

          <div
            id={`command-list-${idPrefix}`}
            role="tabpanel"
            aria-labelledby={
              oltType === "c600"
                ? `olt-tab-c600-${idPrefix}`
                : `olt-tab-c300-${idPrefix}`
            }
            className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1.5 custom-scrollbar"
          >
            {commands.map((item) => {
              const copied = isCopied(item.id);
              const commandError = getError(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!item.isReady}
                  onClick={() => handleCopy(item)}
                  title={
                    item.isReady
                      ? "Klik untuk menyalin perintah"
                      : `${item.missingHint} untuk menggunakan perintah ini`
                  }
                  className={`w-full text-left transition-all relative rounded-lg p-2 ${
                    item.isReady
                      ? "group cursor-pointer hover:bg-panel-on-navy/5 active:scale-[0.99]"
                      : "cursor-not-allowed opacity-50 bg-panel-on-navy/[0.02]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${
                        item.isReady
                          ? "text-panel-on-navy/70 group-hover:text-upaz-green"
                          : "text-panel-on-navy/40"
                      }`}
                    >
                      {item.label}
                    </span>
                    {copied && item.isReady && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="text-[10px] text-upaz-green font-bold flex items-center gap-1 animate-pulse"
                      >
                        <Check size={11} /> TERSALIN!
                      </span>
                    )}
                    {commandError && (
                      <span
                        role="alert"
                        aria-live="polite"
                        className="text-[10px] text-red-300 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30 font-medium"
                      >
                        {commandError}
                      </span>
                    )}
                    {!item.isReady && item.missingHint && (
                      <span className="text-[10px] text-amber-300 font-medium bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                        {item.missingHint}
                      </span>
                    )}
                  </div>
                  <div
                    className={`p-2.5 rounded-md border transition-all ${
                      copied
                        ? "border-upaz-green/60 bg-upaz-green/10"
                        : commandError
                        ? "border-red-500/50 bg-red-950/20"
                        : item.isReady
                        ? "border-panel-on-navy/10 bg-panel-on-navy/5 group-hover:border-panel-on-navy/25 group-hover:bg-panel-on-navy/10"
                        : "border-panel-on-navy/5 bg-panel-on-navy/[0.02]"
                    }`}
                  >
                    <code className="text-xs font-mono block break-all leading-relaxed text-panel-text whitespace-pre-wrap">
                      {item.cmd}
                    </code>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}