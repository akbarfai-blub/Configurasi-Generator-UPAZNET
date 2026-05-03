"use client";

export default function ConfigTypeSelect({ configType, formData, onChange }) {
  const selectName = configType === "standard" 
    ? "selectedC600Type" 
    : configType === "ucd" 
      ? "selectedUcdType" 
      : configType === "ugr"
        ? "selectedUgrType"
        : "selectedVlanType";
  
  const selectValue = configType === "standard" 
    ? formData.selectedC600Type 
    : configType === "ucd"
      ? formData.selectedUcdType
      : configType === "ugr"
        ? formData.selectedUgrType
        : formData.selectedVlanType;

  return (
    <div className="space-y-1 mb-4 pb-4 border-b border-slate-200">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
        Tipe Konfigurasi
      </label>
      <select
        name={selectName}
        value={selectValue}
        onChange={onChange}
        className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition font-bold text-sm text-slate-800"
      >
        {configType === "standard" ? (
          <>
            <option value="standard">Standard (PPPoE)</option>
            <option value="bridge">Bridge Mode</option>
            <option value="unr_v1001">V1001</option>
          </>
        ) : configType === "ucd" ? (
          <>
            <option value="ucd_standard">Standard (PPPoE)</option>
            <option value="ucd_bridge">Bridge Mode</option>
          </>
        ) : configType === "ugr" ? (
          <>
            <option value="ugr_standard">Standard (PPPoE)</option>
            <option value="ugr_bridge">Bridge Mode</option>
          </>
        ) : (
          <>
            <optgroup label="Standard (PPPoE)">
              <option value="100">UNB V100</option>
              <option value="1600">UNB V1600 (AL KHOIRIYAH)</option>
              <option value="1501">UNB V1501 (BOLO)</option>
              <option value="602">UNB V602 (ALNET)</option>
              <option value="903">UNB V903 (LEXXA)</option>
              <option value="511">UNB V511 (CADAR)</option>
            </optgroup>
            <optgroup label="Bridge Mode">
              <option value="bridge_unb">UNB Bridge</option>
              <option value="bridge_bolo">Bridge Bolo</option>
            </optgroup>
          </>
        )}
      </select>
    </div>
  );
}