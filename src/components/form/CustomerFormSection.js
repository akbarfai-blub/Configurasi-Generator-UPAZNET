"use client";

export default function CustomerFormSection({ formData, onChange, onIdPelangganChange }) {
  return (
    <div className="space-y-4 border-t pt-5 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-ink">
          Konfigurasi PPPoE Secret & Pelanggan
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="idPelanggan" className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
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
            className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="namaPelanggan" className="text-xs font-semibold uppercase tracking-wider text-neutral-muted">
            Nama Pelanggan
          </label>
          <input
            id="namaPelanggan"
            name="namaPelanggan"
            value={formData.namaPelanggan}
            onChange={onChange}
            placeholder="BUDI SANTOSO"
            className="w-full p-2.5 border border-neutral-stroke bg-neutral-field rounded-lg focus:ring-2 focus:ring-upaz-green focus:border-upaz-green outline-none transition uppercase"
          />
        </div>
      </div>
    </div>
  );
}