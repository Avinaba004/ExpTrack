"use client";

import { useState, useEffect } from "react";
import type { MarketData } from "../types";

export function useMarketData() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMarket() {
      try {
        const response = await fetch("/api/investment/market");
        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }
        const result = await response.json();
        if (isMounted && result.success) {
          setMarketData(result.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error fetching market data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMarket();

    return () => {
      isMounted = false;
    };
  }, []);

  return { marketData, isLoading, error };
}
