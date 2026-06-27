"use client";

/**
 * Custom hook for parsing "Detail Koneksi Gpon" text
 * into structured form data fields.
 */
export function useQuickFill() {
  const parseDetailKoneksi = (text) => {
    const result = {};

    // Parse ID & Nama Pelanggan
    // Format: "Nama/ID Pelanggan: 0010100011 | LAILA ZULFATUN NABILAH"
    const namaIdMatch = text.match(
      /Nama\/ID Pelanggan:\s*(\S+)\s*\|\s*(.+)/i
    );
    if (namaIdMatch) {
      result.idPelanggan = namaIdMatch[1].trim();
      result.namaPelanggan = namaIdMatch[2].trim();
      result.pppoeUser = namaIdMatch[1].trim();
    }

    // Parse Serial Number
    // Format: "SN: XPON1DDDF652"
    const snMatch = text.match(/SN:\s*(\S+)/i);
    if (snMatch) {
      result.sn = snMatch[1].trim();
    }

    // Parse Index ONU
    // Format: "Index Onu: 2"
    const onuMatch = text.match(/Index\s*Onu:\s*(\d+)/i);
    if (onuMatch) {
      result.onuId = onuMatch[1].trim();
    }

    return result;
  };

  const parseDetailOnu = (text) => {
    const result = {};
    
    // Parse ONU Interface -> interfaceOlt + onuId
    // Handle kedua format: gpon-onu_ dan gpon_onu-
    const ifaceMatch = text.match(
      /ONU interface:\s*gpon[_-]onu[_-](\d+\/\d+\/\d+):(\d+)/i
    );
    if (ifaceMatch) {
      result.interfaceOlt = ifaceMatch[1].trim();
      result.onuId = ifaceMatch[2].trim();
    }

    // Parse Serial Number
    const snMatch = text.match(/Serial number:\s*(\S+)/i);
    if (snMatch) result.sn = snMatch[1].trim();

    return result;
  };

  return { parseDetailKoneksi, parseDetailOnu };
}
