"use client";

import { useEffect, useState } from "react";
import { LMStatus } from "../types";

const MODELS = ["gpt-4", "gpt-3.5-turbo", "llama-2", "clip"];

export function useLMStatus() {
  const [status, setStatus] = useState<LMStatus>({
    online: false,
    model: MODELS[0],
    requestsPerMin: 0,
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
  });

  useEffect(() => {
    const check = () => {
      const next: LMStatus = {
        online: Math.random() > 0.1,
        model: MODELS[Math.floor(Math.random() * MODELS.length)],
        requestsPerMin: Math.round(20 + Math.random() * 80),
        latencyMs: Math.round(50 + Math.random() * 180),
        lastChecked: new Date().toISOString(),
      };
      setStatus(next);
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  return status;
}
