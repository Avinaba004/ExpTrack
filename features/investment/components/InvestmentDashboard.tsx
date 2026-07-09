"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AlertCircle, RefreshCcw, TrendingUp, Sparkles, Bot, LineChart } from "lucide-react";
import { FinancialHealthCard } from "./FinancialHealthCard";
import { AssetAllocationChart } from "./AssetAllocationChart";
import { RiskProfileQuestionnaire } from "./RiskProfileQuestionnaire";
import { SmartInsights } from "./SmartInsights";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { AIExplanationAccordion } from "./AIExplanationAccordion";
import { MarketHighlights } from "./MarketHighlights";
import { useRiskProfile } from "../hooks/useRiskProfile";
import { useInvestmentAnalysis } from "../hooks/useInvestmentAnalysis";
import type { WhatIfScenario, RiskProfile } from "../types";

export function InvestmentDashboard() {
  const { isLoaded } = useUser();
  const { profile, hasProfile, isLoading: isProfileLoading, saveProfile } = useRiskProfile();
  const { data, isLoading: isAnalysisLoading, error, fetchAnalysis } = useInvestmentAnalysis();
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (isLoaded && !isProfileLoading && hasProfile) {
      fetchAnalysis(profile, null);
    }
  }, [isLoaded, isProfileLoading, hasProfile, profile, fetchAnalysis]);

  const handleProfileSave = (newProfile: Omit<RiskProfile, "completedAt">) => {
    saveProfile(newProfile);
    setEditingProfile(false);
  };

  const handleSaveProfileValues = (values: { monthlyIncome: number; monthlyExpenses: number }) => {
    if (!profile) return;
    saveProfile({ ...profile, monthlyIncome: values.monthlyIncome, monthlyExpenses: values.monthlyExpenses });
  };

  const handleSimulate = (scenario: WhatIfScenario | null) => {
    fetchAnalysis(profile, scenario);
  };

  if (!isLoaded || isProfileLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Growth Engine</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Investment Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time analysis and projection of your financial growth.</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-3 space-y-6 animate-pulse">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-[300px] w-full bg-muted rounded-2xl" />
              <div className="h-[300px] w-full bg-muted rounded-2xl" />
              <div className="h-[300px] w-full bg-muted rounded-2xl" />
            </div>
          </div>
          <div className="md:col-span-1 space-y-6 animate-pulse">
            <div className="h-[250px] w-full bg-muted rounded-2xl" />
            <div className="h-[180px] w-full bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (editingProfile) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/10 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Investment Profile</h1>
            <p className="text-sm text-muted-foreground">Update your profile values and monthly income/expenses.</p>
          </div>
          <Button variant="outline" className="rounded-xl font-semibold border-border/60 hover:bg-muted/40" onClick={() => setEditingProfile(false)}>
            Cancel
          </Button>
        </div>
        <RiskProfileQuestionnaire
          initialProfile={profile ?? undefined}
          onComplete={handleProfileSave}
          onCancel={() => setEditingProfile(false)}
        />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="py-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to your AI Investment Planner</h1>
          <p className="text-muted-foreground text-sm">Let's start by understanding your financial goals and risk tolerance.</p>
        </div>
        <RiskProfileQuestionnaire onComplete={saveProfile} />
      </div>
    );
  }

  // 2. Loading state for analysis
  if (isAnalysisLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Growth Engine</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Investment Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time analysis and projection of your financial growth.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary font-semibold text-sm px-1 animate-pulse">
          <RefreshCcw className="h-4.5 w-4.5 animate-spin" />
          Analyzing your finances and market data...
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-3 space-y-6 animate-pulse">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-[300px] w-full bg-muted rounded-2xl" />
              <div className="h-[300px] w-full bg-muted rounded-2xl" />
              <div className="h-[300px] w-full bg-muted rounded-2xl" />
            </div>
          </div>
          <div className="md:col-span-1 space-y-6 animate-pulse">
            <div className="h-[250px] w-full bg-muted rounded-2xl" />
            <div className="h-[180px] w-full bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Error state
  if (error || (data && !data.success)) {
    return (
      <Card className="border-red-200 bg-red-50/50 rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-red-700">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-sm">
            {error || data?.error || "We couldn't generate your investment analysis. Please try again."}
          </p>
          <Button onClick={() => fetchAnalysis(profile, null)} variant="outline" className="rounded-xl border-border/60 hover:bg-muted/40 font-semibold text-xs h-9">
            <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 4. Main Dashboard
  if (!data?.metrics) return null;

  return (
    <div className="space-y-6">
      {/* Combined Page Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/10 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Growth Engine</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Investment Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time analysis and projection of your financial growth.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl text-xs font-semibold border-border/60 hover:border-primary/30 hover:bg-primary/5 hover:text-primary h-9 px-3.5" 
            onClick={() => setEditingProfile(true)}
          >
            Edit Profile
          </Button>
          <Button 
            onClick={() => fetchAnalysis(profile, null)} 
            variant="outline" 
            size="sm" 
            disabled={isAnalysisLoading} 
            className="rounded-xl text-xs font-semibold border-border/60 hover:border-primary/30 hover:bg-primary/5 hover:text-primary h-9 px-3.5"
          >
            <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 ${isAnalysisLoading ? "animate-spin" : ""}`} /> 
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Main Content Grid - stacks on mobile, side-by-side on md+ */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        {/* Main Dashboard Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {/* Health Score */}
            <div className="col-span-1">
              <FinancialHealthCard 
                score={data.metrics.healthScore} 
                savingsRate={data.metrics.savingsRate}
                budgetEfficiency={data.metrics.budgetEfficiency}
              />
            </div>

            {/* Asset Allocation */}
            <div className="col-span-1">
              <AssetAllocationChart allocation={data.allocation || []} />
            </div>

            {/* What-If Simulator */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <WhatIfSimulator 
                baseMetrics={data.metrics} 
                profile={profile}
                onSimulate={handleSimulate}
                onSaveProfileValues={handleSaveProfileValues}
                isLoading={isAnalysisLoading} 
              />
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            {/* Smart Insights (Left column) */}
            <div className="col-span-1">
              <SmartInsights insights={data.insights || []} />
            </div>

            {/* AI Analysis Report (Right columns) */}
            <div className="col-span-1 md:col-span-3">
              <Card className="bg-card/60 backdrop-blur-xs border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4 border-b border-border/40">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    AI Investment Guidance
                  </CardTitle>
                  <CardDescription>Generated specifically for your financial situation</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <AIExplanationAccordion content={data.analysis || ""} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Market Sidebar - moves below on mobile */}
        <div className="col-span-1 md:col-span-1 space-y-6">
          <MarketHighlights />
          {/* Investment Tools Deck */}
          <div className="p-5 border border-primary/10 rounded-2xl bg-gradient-to-b from-primary/5 via-card to-card backdrop-blur-xs shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">AI Research Deck</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore portfolios, query allocations, or match financial vehicles.
            </p>

            <div className="space-y-2.5 flex flex-col pt-1">
              <a href="/investment/chat" className="w-full">
                <Button className="w-full text-xs font-semibold rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-2.5 h-auto gap-1.5 shadow-sm">
                  <Bot className="h-3.5 w-3.5" /> AI Chat Assistant
                </Button>
              </a>
              
              <a href="/investment/compare" className="w-full">
                <Button variant="outline" className="w-full text-xs font-semibold rounded-xl border-border/60 hover:bg-muted/40 py-2.5 h-auto gap-1.5">
                  <LineChart className="h-3.5 w-3.5" /> Compare Options
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
