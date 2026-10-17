"use client";

import { Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { isValidOltInterface } from "@/lib/validation";
import { useClipboard } from "@/hooks/useClipboard";
import { getCommandList } from "@/lib/commands";

export default function CommandSidebar({ data, isAccordion = false }) {
  const [oltType, setOltType] = useState("c600");
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
    <div className="w-full bg-upaz-blue text-panel-on-navy rounded-xl shadow-xl h-fit">
      <div className="flex items-center justify-between border-b border-panel-on-navy/10 pb-3 p-5">
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

          <div
            role="tablist"
            aria-label="Mode OLT"
            className="flex bg-panel-on-navy/10 rounded-lg p-1 scale-90"
          >
            <button
              role="tab"
              id={isAccordion ? "olt-tab-c600-mobile" : "olt-tab-c600-desktop"}
              aria-selected={oltType === "c600"}
              aria-controls={isAccordion ? "command-list-mobile" : "command-list-desktop"}
              onClick={() => setOltType("c600")}
              className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${
                oltType === "c600"
                  ? "bg-upaz-green text-white"
                  : "text-panel-on-navy/60 hover:text-panel-on-navy"
              }`}
            >
              C600
            </button>
            <button
              role="tab"
              id={isAccordion ? "olt-tab-c300-mobile" : "olt-tab-c300-desktop"}
              aria-selected={oltType === "c300"}
              aria-controls={isAccordion ? "command-list-mobile" : "command-list-desktop"}
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
        <div className="p-5 pt-3 space-y-3">
          {/* Active Target Banner */}
          <div className="text-[10px] font-mono bg-panel-on-navy/5 border border-panel-on-navy/10 rounded-lg px-3 py-2 flex flex-wrap items-center justify-between gap-1 text-panel-on-navy/70">
            <span className="font-sans font-bold uppercase tracking-wider text-[9px] text-panel-on-navy/50">
              Target:
            </span>
            <span>
              Port:{" "}
              <strong className={isIfaceValid ? "text-upaz-green" : "text-panel-on-navy/40"}>
                {isIfaceValid ? data.interfaceOlt : "-"}
              </strong>
            </span>
            <span>
              ONU:{" "}
              <strong className={isOnuValid ? "text-upaz-green" : "text-panel-on-navy/40"}>
                {isOnuValid ? rawOnu : "-"}
              </strong>
            </span>
            <span>
              SN:{" "}
              <strong className={isSnValid ? "text-upaz-green" : "text-panel-on-navy/40"}>
                {isSnValid ? rawSn : "-"}
              </strong>
            </span>
          </div>

          {/* Global Clipboard Error Notification */}
          {copyError && (
            <div
              role="alert"
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] font-semibold flex items-center justify-between"
            >
              <span>Gagal menyalin: {copyError.message}</span>
            </div>
          )}

          <div
            id={isAccordion ? "command-list-mobile" : "command-list-desktop"}
            role="tabpanel"
            aria-labelledby={
              oltType === "c600"
                ? (isAccordion ? "olt-tab-c600-mobile" : "olt-tab-c600-desktop")
                : (isAccordion ? "olt-tab-c300-mobile" : "olt-tab-c300-desktop")
            }
            className="space-y-3 max-h-[560px] overflow-y-auto no-scrollbar"
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
                  className={`w-full text-left transition-all relative ${
                    item.isReady
                      ? "group cursor-pointer"
                      : "cursor-not-allowed opacity-45"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-[9px] uppercase tracking-widest font-bold transition-colors ${
                        item.isReady
                          ? "text-panel-on-navy/60 group-hover:text-upaz-green"
                          : "text-panel-on-navy/40"
                      }`}
                    >
                      {item.label}
                    </span>
                    {copied && (
                      <span className="text-[9px] text-upaz-green font-bold animate-pulse">
                        COPIED!
                      </span>
                    )}
                    {commandError && (
                      <span role="alert" className="text-[9px] text-red-400 font-semibold animate-pulse">
                        {commandError}
                      </span>
                    )}
                    {!item.isReady && item.missingHint && (
                      <span className="text-[9px] text-amber-400 font-semibold">
                        {item.missingHint}
                      </span>
                    )}
                  </div>
                  <div
                    className={`p-2 rounded bg-panel-on-navy/5 border ${
                      copied
                        ? "border-upaz-green/50"
                        : commandError
                        ? "border-red-500/50 bg-red-950/20"
                        : item.isReady
                        ? "border-transparent group-hover:border-panel-on-navy/20"
                        : "border-transparent"
                    } transition-all`}
                  >
                    <code className="text-[10px] font-mono block break-all leading-tight text-panel-on-navy/90 whitespace-pre-wrap">
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