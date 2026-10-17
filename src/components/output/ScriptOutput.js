"use client";

import { CheckCircle2, AlertTriangle, Terminal, Check, Copy, AlertCircle } from "lucide-react";

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
      className="w-full bg-upaz-blue p-4 sm:p-5 rounded-xl shadow-xl border border-panel-border/50 flex flex-col overflow-hidden"
      style={{ minHeight }}
    >
      <div className="flex justify-between items-center mb-4 border-b border-panel-divider pb-2.5 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {output && !isStale ? (
            <CheckCircle2 size={16} className="text-upaz-green shrink-0" />
          ) : output && isStale ? (
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          ) : (
            <Terminal size={16} className="text-panel-on-navy/40 shrink-0" />
          )}
          <span className="font-bold text-xs uppercase tracking-tight text-panel-on-navy whitespace-nowrap">
            {label}
          </span>
          {output && !isStale ? (
            <span className="text-[10px] font-semibold text-upaz-green bg-upaz-green/10 px-2 py-0.5 rounded border border-upaz-green/20 uppercase tracking-wider whitespace-nowrap">
              Siap Salin
            </span>
          ) : output && isStale ? (
            <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider whitespace-nowrap">
              Kedaluwarsa
            </span>
          ) : (
            <span className="text-[10px] font-medium text-panel-on-navy/40 bg-panel-on-navy/5 px-2 py-0.5 rounded border border-panel-on-navy/10 uppercase tracking-wider whitespace-nowrap">
              Belum Dibuat
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={canCopy ? onCopy : undefined}
            disabled={!canCopy}
            title={
              isStale
                ? "Parameter berubah. Buat skrip ulang untuk menyalin."
                : !output
                ? "Belum ada skrip untuk disalin"
                : "Salin skrip ke clipboard"
            }
            className={`text-xs font-bold transition flex items-center gap-1.5 px-2 py-1 rounded ${
              !canCopy
                ? "text-panel-on-navy/30 cursor-not-allowed"
                : copied
                ? "text-upaz-green"
                : "text-upaz-green hover:text-white hover:bg-panel-on-navy/10 cursor-pointer"
            }`}
          >
            {copied && canCopy ? (
              <span
                role="status"
                aria-live="polite"
                className="flex items-center gap-1 font-bold animate-pulse"
              >
                <Check size={14} /> TERSALIN!
              </span>
            ) : (
              <>
                <Copy size={13} /> SALIN
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-3 px-3 py-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium flex items-start gap-2"
        >
          <AlertCircle size={15} className="shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1 leading-relaxed break-words">
            <span className="font-semibold text-red-200">Gagal menyalin: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {isStale && output && (
        <div
          role="alert"
          className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2"
        >
          <AlertTriangle size={15} className="shrink-0 text-amber-400" />
          <span>
            Parameter input berubah. Klik <strong>Buat Skrip</strong> untuk memperbarui konfigurasi sebelum menyalin.
          </span>
        </div>
      )}

      {output ? (
        <pre
          className={`font-mono text-xs sm:text-[13px] whitespace-pre leading-relaxed text-panel-text overflow-x-auto flex-1 custom-scrollbar ${
            isStale ? "opacity-50 select-none" : "select-all"
          }`}
        >
          {output}
        </pre>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-panel-divider/40 rounded-lg bg-panel-on-navy/[0.02]">
          <Terminal size={22} className="text-panel-on-navy/25 mb-2" />
          <p className="text-xs text-panel-on-navy/60 max-w-[280px] leading-relaxed">
            Isi formulir dan klik <strong className="text-panel-on-navy/80 font-semibold">Buat Skrip</strong> untuk menghasilkan konfigurasi {label.toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
}