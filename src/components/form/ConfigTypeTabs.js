"use client";

const CONFIG_TYPES = ["standard", "unb", "uho", "ubl", "ugr", "ucd"];

const TAB_LABELS = {
  standard: "UNR C600",
  unb: "unb",
  uho: "uho",
  ubl: "ubl",
  ugr: "ugr",
  ucd: "ucd",
};

export default function ConfigTypeTabs({ currentType, onChange }) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl w-full overflow-x-auto no-scrollbar gap-1">
      {CONFIG_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex-1 py-2 px-4 text-xs uppercase tracking-wider transition-all ${
            currentType === type
              ? "bg-upaz-blue text-white shadow-md font-bold rounded-lg"
              : "text-slate-500 hover:text-upaz-blue hover:bg-white font-medium rounded-lg"
          }`}
        >
          {TAB_LABELS[type]}
        </button>
      ))}
    </div>
  );
}