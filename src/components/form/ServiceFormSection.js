"use client";

export default function ServiceFormSection({ formData, onChange }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Paket Layanan
          </label>
          <select
            name="paketLayanan"
            value={formData.paketLayanan}
            onChange={onChange}
            className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition font-semibold text-sm text-slate-800"
          >
            <optgroup label="Paket Kusuma">
              <option value="KUSUMA 0">KUSUMA 0</option>
              <option value="KUSUMA 1">KUSUMA 1</option>
              <option value="KUSUMA 2">KUSUMA 2</option>
              <option value="KUSUMA 3">KUSUMA 3</option>
              <option value="KUSUMA 4">KUSUMA 4</option>
            </optgroup>
            <optgroup label="Paket Puspa">
              <option value="PUSPA 0">PUSPA 0</option>
              <option value="PUSPA 1">PUSPA 1</option>
              <option value="PUSPA 2">PUSPA 2</option>
              <option value="PUSPA 3">PUSPA 3</option>
              <option value="PUSPA 4">PUSPA 4</option>
            </optgroup>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            PPPoE User
          </label>
          <input
            required
            name="pppoeUser"
            value={formData.pppoeUser}
            onChange={onChange}
            className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            PPPoE Pass
          </label>
          <input
            required
            name="pppoePass"
            value={formData.pppoePass}
            onChange={onChange}
            className="w-full p-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
          />
        </div>
      </div>
    </>
  );
}
