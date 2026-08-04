"use client";

export default function ServiceFormSection({ formData, onChange, configType }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label htmlFor="paketLayanan" className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
            Paket Layanan
          </label>
          <select
            id="paketLayanan"
            name="paketLayanan"
            value={formData.paketLayanan}
            onChange={onChange}
            className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition font-semibold text-sm text-neutral-ink"
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
        {configType === "unb" && formData.selectedVlanType === "602" && (
          <div className="space-y-1">
            <label htmlFor="metroProfile" className="text-xs font-bold uppercase tracking-wider text-neutral-ink">
              Metro Profile
            </label>
            <select
              id="metroProfile"
              name="metroProfile"
              value={formData.metroProfile}
              onChange={onChange}
              className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition font-bold text-sm text-neutral-ink"
            >
              <option value="metro10">Metro 10</option>
              <option value="metro30">Metro 30</option>
              <option value="metro100">Metro 100</option>
            </select>
          </div>
        )}
        <div className="space-y-1">
          <label htmlFor="pppoeUser" className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
            PPPoE User
          </label>
          <input
            required
            id="pppoeUser"
            name="pppoeUser"
            value={formData.pppoeUser}
            onChange={onChange}
            className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="pppoePass" className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
            PPPoE Pass
          </label>
          <input
            required
            id="pppoePass"
            name="pppoePass"
            value={formData.pppoePass}
            onChange={onChange}
            className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
          />
        </div>
      </div>
    </>
  );
}
