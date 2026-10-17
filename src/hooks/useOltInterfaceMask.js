"use client";

import { useCallback } from "react";
import { formatOltInterfaceInput } from "@/lib/validation";

export function useOltInterfaceMask(setFormData) {
  const handleOltInterfaceChange = useCallback((e) => {
    const { value } = e.target;
    const formatted = formatOltInterfaceInput(value);

    setFormData((prev) => ({
      ...prev,
      interfaceOlt: formatted,
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