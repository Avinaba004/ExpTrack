"use client";

import { useState, useCallback } from "react";
import type { RiskProfile, WhatIfScenario, AnalyzeResponse } from "../types";

export function useInvestmentAnalysis() {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(
    async (riskProfile?: RiskProfile | null, whatIfScenario?: WhatIfScenario | null) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/investment/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ riskProfile, whatIfScenario }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch analysis");
        }

        const result: AnalyzeResponse = await response.json();
        setData(result);
      } catch (err) {
        console.error("Analysis fetch error:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    data,
    isLoading,
    error,
    fetchAnalysis,
  };
}
