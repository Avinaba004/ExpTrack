"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight } from "lucide-react";
import type { WhatIfScenario, FinancialMetrics, RiskProfile } from "../types";

interface WhatIfSimulatorProps {
  baseMetrics: FinancialMetrics;
  profile?: RiskProfile | null;
  onSimulate: (scenario: WhatIfScenario | null) => void;
  onSaveProfileValues?: (values: { monthlyIncome: number; monthlyExpenses: number }) => void;
  isLoading: boolean;
}

export function WhatIfSimulator({ baseMetrics, profile, onSimulate, onSaveProfileValues, isLoading }: WhatIfSimulatorProps) {
  const [isActive, setIsActive] = useState(false);
  const defaultIncome = profile?.monthlyIncome ?? baseMetrics.monthlyIncome;
  const defaultExpenses = profile?.monthlyExpenses ?? baseMetrics.monthlyExpenses;

  const [income, setIncome] = useState(defaultIncome);
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [investment, setInvestment] = useState(baseMetrics.investmentCapacity);
  const [horizon, setHorizon] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  // Sync state if base metrics or profile values change and not active
  useEffect(() => {
    if (!isActive) {
      setIncome(defaultIncome);
      setExpenses(defaultExpenses);
      setInvestment(baseMetrics.investmentCapacity);
    }
  }, [defaultIncome, defaultExpenses, baseMetrics, isActive]);

  const handleSimulate = () => {
    setIsActive(true);
    onSimulate({
      monthlyIncome: income,
      monthlyExpenses: expenses,
      monthlySavings: income - expenses,
      monthlyInvestment: investment,
      investmentHorizon: horizon,
      expectedReturn: expectedReturn,
      riskTolerance: "moderate", // Default for simulation
    });
  };

  const handleReset = () => {
    setIsActive(false);
    setIncome(defaultIncome);
    setExpenses(defaultExpenses);
    setInvestment(baseMetrics.investmentCapacity);
    onSimulate(null);
  };

  const projectedValue = () => {
    const r = expectedReturn / 100 / 12;
    const n = horizon * 12;
    if (r === 0) return investment * n;
    return Math.round(investment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  };

  return (
    <Card className={`transition-all duration-300 bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden h-full flex flex-col ${isActive ? "border-primary/50 shadow-lg ring-1 ring-primary/20" : "hover:shadow-lg hover:border-primary/30 shadow-sm"}`}>
      <CardHeader className="pb-4 border-b border-border/40 bg-primary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          What-If Scenario Simulator
        </CardTitle>
        <CardDescription>Adjust sliders to see how changes affect your AI recommendations</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-6">
        <div className="space-y-6">
          {/* Income Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-foreground">Monthly Income</label>
              <span className="text-primary font-semibold">₹{income.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(200000, baseMetrics.monthlyIncome * 2)}
              step={5000}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer hover:accent-primary/80 transition-colors"
            />
          </div>

          {/* Expenses Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <label className="font-medium text-foreground">Monthly Expenses</label>
              <span className="text-primary font-semibold">₹{expenses.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(150000, baseMetrics.monthlyExpenses * 2)}
              step={2000}
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer hover:accent-primary/80 transition-colors"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 bg-background shadow-sm rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">New Savings Rate</span>
              <span className={`text-2xl font-bold tracking-tight ${income - expenses > 0 ? "text-emerald-600" : "text-red-600"}`}>
                {income > 0 ? Math.round(((income - expenses) / income) * 100) : 0}%
              </span>
            </div>
            <div className="p-4 bg-background shadow-sm rounded-xl border border-border/50 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 font-semibold">New Capacity</span>
              <span className="text-2xl font-bold tracking-tight text-primary">
                ₹{Math.max(0, income - expenses).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col gap-2.5">
          <Button 
            className="w-full rounded-xl shadow-sm hover:shadow transition-all font-semibold h-10 gap-1.5"
            onClick={handleSimulate} 
            disabled={isLoading}
          >
            {isLoading ? "Analyzing..." : "Re-Analyze Profile"} <ArrowRight className="h-4 w-4" />
          </Button>
          {isActive && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors font-semibold h-9" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
              {profile && onSaveProfileValues && (
                <Button variant="secondary" className="rounded-xl bg-primary/10 text-primary hover:bg-primary/15 font-semibold h-9" onClick={() => onSaveProfileValues({ monthlyIncome: income, monthlyExpenses: expenses })} disabled={isLoading}>
                  Save Values
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
