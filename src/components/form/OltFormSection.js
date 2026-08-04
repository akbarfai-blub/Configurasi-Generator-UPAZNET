"use client";

export default function OltFormSection({ formData, onChange, onOltInterfaceChange }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="interfaceOlt" className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
            Interface OLT
          </label>
          <input
            required
            id="interfaceOlt"
            name="interfaceOlt"
            value={formData.interfaceOlt}
            onChange={onOltInterfaceChange}
            placeholder="1/4/2"
            inputMode="numeric"
            className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="onuId" className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
            ONU ID
          </label>
          <input
            required
            id="onuId"
            name="onuId"
            value={formData.onuId}
            onChange={onChange}
            placeholder="88"
            className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
          />
        </div>
      </div>

        <div className="space-y-1">
          <label htmlFor="sn" className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
            Serial Number (SN)
          </label>
          <input
            required
            id="sn"
            name="sn"
          value={formData.sn}
          onChange={onChange}
          placeholder="ZTEGD2327302"
          className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg font-mono focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
        />
      </div>
    </>
  );
}