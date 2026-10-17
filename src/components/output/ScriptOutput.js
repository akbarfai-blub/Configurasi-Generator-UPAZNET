"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ScriptOutput({
  label,
  output,
  onCopy,
  copied,
  minHeight = "130px",
  isStale = false,
  errorMessage = null,
}) {
  const canCopy = Boolean(output) && !isStale;

  return (
    <div
      className="w-full bg-upaz-blue p-5 rounded-xl shadow-xl border border-panel-border/50 flex flex-col overflow-hidden"
      style={{ minHeight }}
    >
      <div className="flex justify-between items-center mb-4 border-b border-panel-divider pb-2">
        <span className="font-bold text-xs flex items-center gap-2 uppercase tracking-tight text-panel-on-navy">
          <CheckCircle2 size={14} className="text-upaz-green" />
          {label}
        </span>
        <div className="flex items-center gap-2">
          {errorMessage && (
            <span className="text-[11px] text-red-400 font-semibold">
              {errorMessage}
            </span>
          )}
          <button
            type="button"
            onClick={canCopy ? onCopy : undefined}
            disabled={!canCopy}
            title={
              isStale
                ? "Input berubah. Generate ulang untuk menyalin."
                : !output
                ? "Belum ada skrip untuk disalin"
                : "Salin skrip ke clipboard"
            }
            className={`text-xs font-bold transition flex items-center gap-1 ${
              !canCopy
                ? "text-panel-on-navy/30 cursor-not-allowed"
                : copied
                ? "text-panel-on-navy"
                : "text-upaz-green hover:text-panel-on-navy cursor-pointer"
            }`}
          >
            {copied ? "COPIED!" : "COPY"}
          </button>
        </div>
      </div>

      {isStale && (
        <div
          role="alert"
          className="mb-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5"
        >
          <AlertTriangle size={14} className="shrink-0 text-amber-400" />
          <span>Input berubah. Generate ulang.</span>
        </div>
      )}

      <pre className="font-mono text-[13px] whitespace-pre leading-relaxed text-panel-text overflow-x-auto flex-1">
        {output || `${label} akan muncul di sini...`}
      </pre>
    </div>
  );
}