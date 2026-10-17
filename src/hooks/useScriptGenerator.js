"use client";

import { useState, useCallback } from "react";
import {
  generateC600,
  generateUHO,
  generateUBL,
  generateUGR,
  generateUNB,
  generateUCD,
  generateMikrotikSecret,
} from "@/lib/generator";
import { validateConfigForm, isOutputStale } from "@/lib/validation";

export function useScriptGenerator() {
  const [oltScript, setOltScript] = useState("");
  const [mikrotikScript, setMikrotikScript] = useState("");
  const [lastSnapshot, setLastSnapshot] = useState(null);

  const generate = useCallback((formData, configType) => {
    const validation = validateConfigForm(formData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    let resultOlt = "";

    switch (configType) {
      case "standard":
      case "unr_v130":
      case "unr_v131":
        resultOlt = generateC600(formData);
        break;
      case "uho":
        resultOlt = generateUHO(formData);
        break;
      case "ubl":
        resultOlt = generateUBL(formData);
        break;
      case "ugr":
      case "ugr_kwd_pppoe":
      case "ugr_kwd_bridge":
        resultOlt = generateUGR(formData);
        break;
      case "unb":
        resultOlt = generateUNB(formData);
        break;
      case "ucd":
        resultOlt = generateUCD(formData);
        break;
      default:
        resultOlt = "";
    }

    const resultMikrotik = generateMikrotikSecret(formData);

    setOltScript(resultOlt);
    setMikrotikScript(resultMikrotik);
    setLastSnapshot({
      ...formData,
      configType,
    });

    return {
      success: true,
      errors: {},
    };
  }, []);

  const checkStale = useCallback(
    (currentFormData, currentConfigType) => {
      // Only considered stale if output has been generated before
      if (!lastSnapshot || (!oltScript && !mikrotikScript)) {
        return false;
      }
      return isOutputStale(lastSnapshot, currentFormData, currentConfigType);
    },
    [lastSnapshot, oltScript, mikrotikScript]
  );

  const clearOutput = useCallback(() => {
    setOltScript("");
    setMikrotikScript("");
    setLastSnapshot(null);
  }, []);

  return {
    oltScript,
    mikrotikScript,
    lastSnapshot,
    generate,
    checkStale,
    clearOutput,
  };
}