/**
 * Helper validasi & pemformatan untuk konfigurasi OLT, form input, dan target Command Hub.
 */

const OLT_INTERFACE_REGEX = /^\d+\/\d+\/\d+$/;

/**
 * Validasi apakah interface OLT memiliki tepat 3 segmen angka yang dipisahkan '/'
 * Contoh valid: 1/4/2, 1/2/16
 * Contoh tidak valid: 1/4, 1.2.16, 1216, 1/4/2/1, ""
 */
export function isValidOltInterface(value) {
  if (typeof value !== "string") return false;
  return OLT_INTERFACE_REGEX.test(value.trim());
}

/**
 * Normalisasi input interface OLT saat diketik / ditempel:
 * - Mengubah delimiter alternatif eksplisit (titik, koma, strip, spasi) menjadi '/'
 * - TIDAK membuang karakter non-digit/non-slash (contoh: 1a/2b/16c tetap 1a/2b/16c)
 * - TIDAK memotong segmen berlebih (contoh: 1/2/16/99 tetap 1/2/16/99)
 * - TIDAK memotong atau menggeser digit antar segmen (contoh: 1/2/16 tetap 1/2/16)
 * - Input tanpa delimiter (contoh: 1216) TIDAK ditebak menjadi target tertentu
 */
export function formatOltInterfaceInput(value) {
  if (typeof value !== "string") return "";

  // Konversi separator alternatif eksplisit (titik, koma, strip, spasi) menjadi slash secara 1-to-1.
  // Pemisah berulang (misal ".." atau ",,") tidak digabungkan agar segmen kosong tetap terdeteksi
  // dan ditolak oleh validasi interface.
  return value.replace(/[.,\s-]/g, "/");
}

/**
 * Validasi seluruh field yang dibutuhkan untuk menghasilkan skrip konfigurasi.
 */
export function validateConfigForm(formData) {
  const errors = {};

  const iface = formData?.interfaceOlt;
  if (!iface || !isValidOltInterface(iface)) {
    errors.interfaceOlt = "Interface OLT harus berupa 3 segmen angka dipisahkan '/' (contoh: 1/4/2)";
  }

  const onuStr = (formData?.onuId ?? "").toString().trim();
  if (!onuStr || !/^\d+$/.test(onuStr)) {
    errors.onuId = "ONU ID harus diisi angka";
  }

  const snStr = (formData?.sn ?? "").toString().trim();
  if (!snStr) {
    errors.sn = "Serial Number (SN) wajib diisi";
  }

  const idPelangganStr = (formData?.idPelanggan ?? "").toString().trim();
  if (!idPelangganStr) {
    errors.idPelanggan = "ID Pelanggan wajib diisi";
  }

  const pppoeUserStr = (formData?.pppoeUser ?? "").toString().trim();
  if (!pppoeUserStr) {
    errors.pppoeUser = "PPPoE Username wajib diisi";
  }

  const pppoePassStr = (formData?.pppoePass ?? "").toString().trim();
  if (!pppoePassStr) {
    errors.pppoePass = "PPPoE Password wajib diisi";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Memeriksa apakah output konfigurasi sebelumnya sudah tidak sinkron (stale)
 * dengan parameter input atau tab yang aktif saat ini.
 */
export function isOutputStale(snapshot, currentFormData, currentConfigType) {
  if (!snapshot) return false;

  if (snapshot.configType !== currentConfigType) return true;

  const fieldsToCheck = [
    "interfaceOlt",
    "onuId",
    "sn",
    "idPelanggan",
    "namaPelanggan",
    "pppoeUser",
    "pppoePass",
    "paketLayanan",
    "selectedC600Type",
    "selectedUcdType",
    "selectedUgrType",
    "selectedUhoType",
    "selectedVlanType",
    "metroProfile",
  ];

  for (const field of fieldsToCheck) {
    const prevVal = snapshot[field] ?? "";
    const currVal = currentFormData?.[field] ?? "";
    if (prevVal !== currVal) {
      return true;
    }
  }

  return false;
}
