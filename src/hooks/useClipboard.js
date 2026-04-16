"use client";

import { useState, useCallback } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [copiedMikrotik, setCopiedMikrotik] = useState(false);

  const copyOlt = useCallback((text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const copyMikrotik = useCallback((text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedMikrotik(true);
    setTimeout(() => setCopiedMikrotik(false), 2000);
  }, []);

  return {
    copied,
    copiedMikrotik,
    copyOlt,
    copyMikrotik,
  };
}