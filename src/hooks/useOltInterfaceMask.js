"use client";

import { useCallback } from "react";

export function useOltInterfaceMask(setFormData) {
  const handleOltInterfaceChange = useCallback((e) => {
    const { value } = e.target;
    let cleaned = value.replace(/[^\d/]/g, "").replace(/\/+/g, "/");
    let parts = cleaned.split("/");

    if (parts.length > 3) {
      parts = parts.slice(0, 3);
    }

    if (parts[0] && parts[0].length > 1) {
      let overflow = parts[0].substring(1);
      parts[0] = parts[0].substring(0, 1);
      parts[1] = overflow + (parts[1] || "");
    }

    if (parts[1]) {
      let maxSlotLength = (parts[1][0] === "1" || parts[1][0] === "2") ? 2 : 1;

      if (parts[1].length > maxSlotLength) {
        let overflow = parts[1].substring(maxSlotLength);
        parts[1] = parts[1].substring(0, maxSlotLength);
        parts[2] = overflow + (parts[2] || "");
      }
    }

    if (parts[2] && parts[2].length > 2) {
      parts[2] = parts[2].substring(0, 2);
    }

    setFormData((prev) => ({
      ...prev,
      interfaceOlt: parts.join("/"),
    }));
  }, [setFormData]);

  const handleIdPelangganChange = useCallback((e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      idPelanggan: value,
      pppoeUser: value,
    }));
  }, [setFormData]);

  return {
    handleOltInterfaceChange,
    handleIdPelangganChange,
  };
}