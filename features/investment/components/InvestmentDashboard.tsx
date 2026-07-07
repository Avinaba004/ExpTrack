"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AlertCircle, RefreshCcw, TrendingUp } from "lucide-react";
import { FinancialHealthCard } from "./FinancialHealthCard";
import { AssetAllocationChart } from "./AssetAllocationChart";
import { RiskProfileQuestionnaire } from "./RiskProfileQuestionnaire";
import { SmartInsights } from "./SmartInsights";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { AIExplanationAccordion } from "./AIExplanationAccordion";
import { useRiskProfile } from "../hooks/useRiskProfile";
import { useInvestmentAnalysis } from "../hooks/useInvestmentAnalysis";
import type { WhatIfScenario } from "../types";

export function InvestmentDashboard() {
  const { isLoaded } = useUser();
  const { profile, hasProfile, isLoading: isProfileLoading, saveProfile } = useRiskProfile();
  const { data, isLoading: isAnalysisLoading, error, fetchAnalysis } = useInvestmentAnalysis();

  useEffect(() => {
    if (isLoaded && !isProfileLoading && hasProfile) {
      fetchAnalysis(profile, null);
    }
  }, [isLoaded, isProfileLoading, hasProfile, profile, fetchAnalysis]);

  const handleSimulate = (scenario: WhatIfScenario | null) => {
    fetchAnalysis(profile, scenario);
  };

  if (!isLoaded || isProfileLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-[300px] w-full bg-muted rounded-xl" />
          <div className="h-[300px] w-full bg-muted rounded-xl" />
          <div className="h-[300px] w-full bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // 1. Show questionnaire if no profile exists
  if (!hasProfile) {
    return (
      <div className="py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to your AI Investment Planner</h1>
          <p className="text-muted-foreground">Let's start by understanding your financial goals and risk tolerance.</p>
        </div>
        <RiskProfileQuestionnaire onComplete={saveProfile} />
      </div>
    );
  }

  // 2. Loading state for analysis
  if (isAnalysisLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary font-medium">
          <RefreshCcw className="h-5 w-5 animate-spin" />
          Analyzing your finances and market data...
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" />
          <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" />
          <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  // 3. Error state
  if (error || (data && !data.success)) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-red-700">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error || data?.error || "We couldn't generate your investment analysis. Please try again."}
          </p>
          <Button onClick={() => fetchAnalysis(profile, null)} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 4. Main Dashboard
  if (!data?.metrics || !data?.analysis) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => fetchAnalysis(profile, null)} variant="outline" size="sm" disabled={isAnalysisLoading} className="rounded-xl text-xs font-semibold border-border/60 hover:border-primary/30 hover:bg-primary/5 hover:text-primary">
          <RefreshCcw className={`mr-2 h-4 w-4 ${isAnalysisLoading ? "animate-spin" : ""}`} /> 
          Refresh Analysis
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Score */}
        <div className="lg:col-span-1">
          <FinancialHealthCard 
            score={data.metrics.healthScore} 
            savingsRate={data.metrics.savingsRate}
            budgetEfficiency={data.metrics.budgetEfficiency}
          />
        </div>

        {/* Asset Allocation */}
        <div className="md:col-span-1 lg:col-span-1">
          <AssetAllocationChart allocation={data.allocation || []} />
        </div>

        {/* What-If Simulator */}
        <div className="md:col-span-2 lg:col-span-1">
          <WhatIfSimulator 
            baseMetrics={data.metrics} 
            onSimulate={handleSimulate}
            isLoading={isAnalysisLoading} 
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Smart Insights (Left column) */}
        <div className="md:col-span-1 lg:col-span-1">
          <SmartInsights insights={data.insights || []} />
        </div>

        {/* AI Analysis Report (Right columns) */}
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="h-full bg-card/60 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-primary" />
                AI Investment Guidance
              </CardTitle>
              <CardDescription>Generated specifically for your financial situation</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <AIExplanationAccordion content={data.analysis} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
