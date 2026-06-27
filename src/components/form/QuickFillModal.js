"use client";

import { useState, useRef, useEffect } from "react";
import { ClipboardPaste, X } from "lucide-react";
import { useQuickFill } from "@/hooks/useQuickFill";

/**
 * Modal overlay that accepts pasted "Detail Koneksi Gpon" text
 * and auto-fills the form via onFill callback.
 */
export default function QuickFillModal({ onFill, onClose }) {
  const [mode, setMode] = useState("detailOnu");
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  const { parseDetailKoneksi, parseDetailOnu } = useQuickFill();

  // Auto-focus textarea when modal opens
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = () => {
    setError("");

    if (!rawText.trim()) {
      setError(`Textarea kosong, paste teks dari ${mode === "detailKoneksi" ? "Detail Koneksi Gpon" : "Detail ONU"}.`);
      return;
    }

    const parsed = mode === "detailKoneksi" 
      ? parseDetailKoneksi(rawText) 
      : parseDetailOnu(rawText);

    // Validate that at least one field was parsed successfully
    const hasData = Object.keys(parsed).length > 0;
    if (!hasData) {
      setError(`Format tidak dikenali, pastikan teks dari ${mode === "detailKoneksi" ? "Detail Koneksi Gpon" : "Detail ONU"}.`);
      return;
    }

    onFill(parsed);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in">
        {/* Header */}
        <div className="flex flex-col border-b border-slate-200 bg-upaz-blue">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <ClipboardPaste size={20} />
              <h2 className="text-base font-bold">Quick Fill</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex px-6 pb-0">
            <button
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                mode === "detailKoneksi"
                  ? "border-white text-white"
                  : "border-transparent text-white/70 hover:text-white"
              }`}
              onClick={() => { setMode("detailKoneksi"); setError(""); setRawText(""); }}
            >
              Detail Koneksi
            </button>
            <button
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                mode === "detailOnu"
                  ? "border-white text-white"
                  : "border-transparent text-white/70 hover:text-white"
              }`}
              onClick={() => { setMode("detailOnu"); setError(""); setRawText(""); }}
            >
              Detail ONU
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Paste seluruh teks dari{" "}
            {mode === "detailKoneksi" ? (
              <>
                modal <strong className="text-upaz-blue">Detail Koneksi Gpon</strong>
              </>
            ) : (
              <>
                halaman <strong className="text-upaz-blue">Detail ONU</strong>
              </>
            )}{" "}
            di sistem internal ke textarea di bawah.
          </p>

          <textarea
            ref={textareaRef}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setError("");
            }}
            placeholder={
              mode === "detailKoneksi"
                ? "Paste teks dari Detail Koneksi Gpon di sini...\n\nContoh:\nNama/ID Pelanggan: 0010100011 | LAILA ZULFATUN NABILAH\nPassword: 220425\nVLAN: 110\nSN: XPON1DDDF652\nIndex Onu: 2\nODP: ODP PDG-01 UC/03 D02(2)"
                : "Paste teks dari halaman Detail ONU di sini...\n\nContoh:\nONU interface: gpon-onu_1/1/5:2\nName: 0010100011\nSerial number: CDTCAF5F047E\nType: ALL\nConfig state: fail"
            }
            className="w-full p-3 border border-slate-300 bg-slate-50 rounded-xl text-sm text-slate-800 font-mono resize-none focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition placeholder:text-slate-400"
            rows={8}
          />

          {error && (
            <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-upaz-green text-white text-sm font-bold hover:bg-[#008c44] transition-colors shadow-md hover:shadow-lg"
          >
            <ClipboardPaste size={16} />
            Isi Form Otomatis
          </button>
        </div>
      </div>
    </div>
  );
}
