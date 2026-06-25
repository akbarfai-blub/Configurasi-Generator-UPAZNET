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

export function useScriptGenerator() {
  const [oltScript, setOltScript] = useState("");
  const [mikrotikScript, setMikrotikScript] = useState("");

  const generate = useCallback((formData, configType) => {
    let resultOlt = "";

    switch (configType) {
      case "standard":
      case "unr_v130":
        resultOlt = generateC600(formData);
        break;
      case "uho":
        resultOlt = generateUHO(formData);
        break;
      case "ubl":
        resultOlt = generateUBL(formData);
        break;
      case "ugr":
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
  }, []);

  return {
    oltScript,
    mikrotikScript,
    generate,
  };
}