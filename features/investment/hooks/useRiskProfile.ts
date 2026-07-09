"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { RiskProfile, AnalyzeResponse } from "../types";

export function useRiskProfile() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [storedAnalysis, setStoredAnalysis] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setProfile(null);
      setStoredAnalysis(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/investment/profile");
        if (!response.ok) {
          throw new Error("Failed to load investment profile");
        }

        const result = await response.json();
        if (!isMounted) return;

        if (result.success) {
          setProfile(result.profile ?? null);
          setStoredAnalysis(result.storedAnalysis ?? null);
        }
      } catch (error) {
        console.error("Failed to load investment profile:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user, isLoaded]);

  const saveProfile = async (newProfile: Omit<RiskProfile, "completedAt">) => {
    if (!user) return false;

    const fullProfile: RiskProfile = {
      ...newProfile,
      completedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/investment/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskProfile: fullProfile }),
      });

      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(errorPayload.error || "Failed to save investment profile");
      }

      const result = await response.json();
      setProfile(result.profile ?? fullProfile);
      setStoredAnalysis(null);
      return true;
    } catch (error) {
      console.error("Failed to save risk profile:", error);
      return false;
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setStoredAnalysis(null);
  };

  return {
    profile,
    storedAnalysis,
    isLoading,
    saveProfile,
    clearProfile,
    hasProfile: profile !== null,
  };
}
