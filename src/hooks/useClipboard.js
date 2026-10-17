"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Fungsi core clipboard untuk melakukan writeText dengan penanganan error,
 * timeout cleanup, dan callback status. Dapat diuji secara independen di unit test.
 */
export async function copyToClipboard(
  text,
  {
    clipboard = typeof navigator !== "undefined" ? navigator.clipboard : undefined,
    key = "default",
    duration = 2000,
    timers = {},
    onSuccess,
    onError,
  } = {}
) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return false;
  }

  if (!clipboard?.writeText) {
    const errorObj = {
      key,
      message: "Clipboard API tidak didukung di lingkungan ini",
    };
    if (onError) onError(errorObj);
    if (timers[key]) clearTimeout(timers[key]);
    timers[key] = setTimeout(() => {
      if (onError) onError(null);
    }, duration);
    return false;
  }

  try {
    await clipboard.writeText(text);

    if (timers[key]) {
      clearTimeout(timers[key]);
    }

    if (onSuccess) onSuccess({ key, copied: true });
    if (onError) onError(null);

    timers[key] = setTimeout(() => {
      if (onSuccess) onSuccess({ key, copied: false });
    }, duration);

    return true;
  } catch (err) {
    if (timers[key]) {
      clearTimeout(timers[key]);
    }

    if (onSuccess) onSuccess({ key, copied: false });
    if (onError)
      onError({
        key,
        message: err?.message || "Gagal menyalin teks ke clipboard",
      });

    timers[key] = setTimeout(() => {
      if (onError) onError(null);
    }, duration);

    return false;
  }
}

export function useClipboard() {
  const [copiedState, setCopiedState] = useState({});
  const [copyError, setCopyError] = useState(null);
  const timersRef = useRef({});

  const copy = useCallback((text, key = "default", duration = 2000) => {
    return copyToClipboard(text, {
      clipboard: typeof navigator !== "undefined" ? navigator.clipboard : undefined,
      key,
      duration,
      timers: timersRef.current,
      onSuccess: ({ key: k, copied }) => {
        setCopiedState((prev) => ({ ...prev, [k]: copied }));
      },
      onError: (err) => {
        setCopyError(err);
      },
    });
  }, []);

  const copyOlt = useCallback((text) => copy(text, "olt", 2000), [copy]);
  const copyMikrotik = useCallback((text) => copy(text, "mikrotik", 2000), [copy]);
  const copyCommand = useCallback(
    (text, commandId) => copy(text, commandId, 1500),
    [copy]
  );

  const isCopied = useCallback((key) => Boolean(copiedState[key]), [copiedState]);
  const getError = useCallback(
    (key) => {
      if (!copyError) return null;
      return copyError.key === key ? copyError.message : null;
    },
    [copyError]
  );

  return {
    copied: Boolean(copiedState["olt"]),
    copiedMikrotik: Boolean(copiedState["mikrotik"]),
    copiedState,
    copyError,
    copy,
    copyOlt,
    copyMikrotik,
    copyCommand,
    isCopied,
    getError,
  };
}