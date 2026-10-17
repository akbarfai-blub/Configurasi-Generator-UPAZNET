"use client";

const CONFIG_TYPES = ["standard", "unb", "uho", "ubl", "ugr", "ucd"];

const TAB_LABELS = {
  standard: "UNR C600",
  unb: "UNB",
  uho: "UHO",
  ubl: "UBL",
  ugr: "UGR",
  ucd: "UCD",
};

export default function ConfigTypeTabs({ currentType, onChange }) {
  return (
    <div className="relative w-full">
      <div
        role="tablist"
        aria-label="Tipe Konfigurasi"
        className="flex bg-neutral-rail p-1 rounded-xl w-full overflow-x-auto gap-1 scroll-smooth custom-scrollbar"
      >
        {CONFIG_TYPES.map((type) => (
          <button
            key={type}
            role="tab"
            id={`tab-${type}`}
            aria-selected={currentType === type}
            aria-controls="config-form-panel"
            onClick={() => onChange(type)}
            className={`shrink-0 whitespace-nowrap min-h-[40px] flex-1 py-2 px-3.5 text-xs uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-upaz-green focus-visible:outline-none ${
              currentType === type
                ? "bg-upaz-blue text-panel-on-navy shadow-md font-bold rounded-lg"
                : "text-neutral-muted-strong hover:text-upaz-blue hover:bg-white font-medium rounded-lg"
            }`}
          >
            {TAB_LABELS[type]}
          </button>
        ))}
      </div>
      {/* Subtle right fade hint for mobile horizontal scroll */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 rounded-r-xl bg-gradient-to-l from-neutral-rail to-transparent sm:hidden opacity-80"
      />
    </div>
  );
}