"use client";

export default function OltFormSection({
  formData,
  onChange,
  onOltInterfaceChange,
  errors = {},
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-neutral-divider">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-ink">
          Parameter OLT
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1 min-w-0">
          <label
            htmlFor="interfaceOlt"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-muted"
          >
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
            className={`w-full min-w-0 p-2.5 border rounded-lg outline-none transition bg-neutral-field text-sm text-neutral-ink ${
              errors.interfaceOlt
                ? "border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-500"
                : "border-neutral-stroke focus:ring-2 focus:ring-upaz-green focus:border-upaz-green"
            }`}
          />
          {errors.interfaceOlt && (
            <p role="alert" className="text-xs text-red-600 font-semibold leading-tight mt-1">
              {errors.interfaceOlt}
            </p>
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <label
            htmlFor="onuId"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-muted"
          >
            ONU ID
          </label>
          <input
            required
            id="onuId"
            name="onuId"
            value={formData.onuId}
            onChange={onChange}
            placeholder="88"
            className={`w-full min-w-0 p-2.5 border rounded-lg outline-none transition bg-neutral-field text-sm text-neutral-ink ${
              errors.onuId
                ? "border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-500"
                : "border-neutral-stroke focus:ring-2 focus:ring-upaz-green focus:border-upaz-green"
            }`}
          />
          {errors.onuId && (
            <p role="alert" className="text-xs text-red-600 font-semibold leading-tight mt-1">
              {errors.onuId}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="sn"
          className="text-xs font-semibold uppercase tracking-wider text-neutral-muted"
        >
          Serial Number (SN)
        </label>
        <input
          required
          id="sn"
          name="sn"
          value={formData.sn}
          onChange={onChange}
          placeholder="ZTEGD2327302"
          className={`w-full min-w-0 p-2.5 border rounded-lg font-mono outline-none transition bg-neutral-field text-sm text-neutral-ink ${
            errors.sn
              ? "border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-500"
              : "border-neutral-stroke focus:ring-2 focus:ring-upaz-green focus:border-upaz-green"
          }`}
        />
        {errors.sn && (
          <p role="alert" className="text-xs text-red-600 font-semibold leading-tight mt-1">
            {errors.sn}
          </p>
        )}
      </div>
    </div>
  );
}