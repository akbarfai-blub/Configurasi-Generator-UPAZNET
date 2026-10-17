"use client";

export default function CustomerFormSection({
  formData,
  onChange,
  onIdPelangganChange,
  errors = {},
}) {
  return (
    <div className="space-y-4 border-t border-neutral-divider pt-4 mt-2">
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-neutral-divider">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-ink">
          Konfigurasi PPPoE Secret & Pelanggan
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 min-w-0">
          <label
            htmlFor="idPelanggan"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-muted"
          >
            ID Pelanggan
          </label>
          <input
            required
            id="idPelanggan"
            name="idPelanggan"
            value={formData.idPelanggan}
            onChange={onIdPelangganChange}
            maxLength={10}
            placeholder="1010112678"
            className={`w-full min-w-0 p-2.5 border rounded-lg outline-none transition bg-neutral-field text-sm text-neutral-ink ${
              errors.idPelanggan
                ? "border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-500"
                : "border-neutral-stroke focus:ring-2 focus:ring-upaz-green focus:border-upaz-green"
            }`}
          />
          {errors.idPelanggan && (
            <p role="alert" className="text-xs text-red-600 font-semibold leading-tight mt-1">
              {errors.idPelanggan}
            </p>
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <label
            htmlFor="namaPelanggan"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-muted"
          >
            Nama Pelanggan
          </label>
          <input
            id="namaPelanggan"
            name="namaPelanggan"
            value={formData.namaPelanggan}
            onChange={onChange}
            placeholder="BUDI SANTOSO"
            className="w-full min-w-0 p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition uppercase text-sm text-neutral-ink"
          />
        </div>
      </div>
    </div>
  );
}