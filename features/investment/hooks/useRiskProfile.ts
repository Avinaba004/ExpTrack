"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import type { RiskProfile } from "../types";

const STORAGE_KEY = "exptrack_risk_profile";

export function useRiskProfile() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load risk profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  // Save to localStorage
  const saveProfile = (newProfile: Omit<RiskProfile, "completedAt">) => {
    if (!user) return false;

    const fullProfile: RiskProfile = {
      ...newProfile,
      completedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        `${STORAGE_KEY}_${user.id}`,
        JSON.stringify(fullProfile)
      );
      setProfile(fullProfile);
      return true;
    } catch (error) {
      console.error("Failed to save risk profile:", error);
      return false;
    }
  };

  const clearProfile = () => {
    if (!user) return;
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
      setProfile(null);
    } catch (error) {
      console.error("Failed to clear risk profile:", error);
    }
  };

  return {
    profile,
    isLoading,
    saveProfile,
    clearProfile,
    hasProfile: profile !== null,
  };
}
