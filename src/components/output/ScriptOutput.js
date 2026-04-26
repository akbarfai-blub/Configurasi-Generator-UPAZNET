"use client";

import { CheckCircle2 } from "lucide-react";

export default function ScriptOutput({ label, output, onCopy, copied, minHeight = "130px" }) {
  return (
    <div
      className="w-full bg-upaz-blue p-5 rounded-xl shadow-xl border border-blue-900/50 flex flex-col overflow-hidden"
      style={{ minHeight }}
    >
      <div className="flex justify-between items-center mb-4 border-b border-blue-800 pb-2">
        <span className="font-bold text-xs flex items-center gap-2 uppercase tracking-tight text-white">
          <CheckCircle2 size={14} className="text-upaz-green" />
          {label}
        </span>
        <button
          onClick={onCopy}
          className={`text-xs font-bold transition flex items-center gap-1 ${
            copied ? "text-white" : "text-upaz-green hover:text-white"
          }`}
        >
          {copied ? "COPIED!" : "COPY"}
        </button>
      </div>
      <pre className="font-mono text-[13px] whitespace-pre leading-relaxed text-blue-100 overflow-x-auto flex-1">
        {output || `Script ${label} akan muncul di sini...`}
      </pre>
    </div>
  );
}