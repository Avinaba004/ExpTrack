"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { RiskProfile, RiskTolerance, InvestmentHorizon, InvestmentExperience } from "../types";

interface Props {
  onComplete: (profile: Omit<RiskProfile, "completedAt">) => void;
  onCancel?: () => void;
  initialProfile?: Partial<RiskProfile>;
}

export function RiskProfileQuestionnaire({ onComplete, onCancel, initialProfile }: Props) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<RiskProfile>>(initialProfile ?? {});

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    if (
      profile.age &&
      profile.riskTolerance &&
      profile.investmentHorizon &&
      profile.experience &&
      profile.monthlyInvestmentBudget !== undefined
    ) {
      onComplete({
        age: Number(profile.age),
        riskTolerance: profile.riskTolerance,
        investmentHorizon: profile.investmentHorizon,
        experience: profile.experience,
        monthlyInvestmentBudget: Number(profile.monthlyInvestmentBudget),
        monthlyIncome: Number(profile.monthlyIncome || 0),
        monthlyExpenses: Number(profile.monthlyExpenses || 0),
        financialGoals: profile.financialGoals || [],
      });
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle>Investment Profile Setup</CardTitle>
        <CardDescription>
          Help us understand your goals so our AI can personalize its recommendations.
          Step {step} of 3
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px]">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What is your age?</label>
              <Input
                type="number"
                placeholder="e.g. 30"
                value={profile.age || ""}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Monthly Investment (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 10000"
                value={profile.monthlyInvestmentBudget || ""}
                onChange={(e) => setProfile({ ...profile, monthlyInvestmentBudget: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">You can change this later through the investment profile section.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Monthly Income (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={profile.monthlyIncome || ""}
                  onChange={(e) => setProfile({ ...profile, monthlyIncome: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Monthly Expenses (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 20000"
                  value={profile.monthlyExpenses || ""}
                  onChange={(e) => setProfile({ ...profile, monthlyExpenses: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">How long do you plan to stay invested?</label>
              <Select
                value={profile.investmentHorizon}
                onValueChange={(v: InvestmentHorizon) => setProfile({ ...profile, investmentHorizon: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short term (&lt; 3 years)</SelectItem>
                  <SelectItem value="medium">Medium term (3-7 years)</SelectItem>
                  <SelectItem value="long">Long term (7+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">How would you describe your risk tolerance?</label>
              <Select
                value={profile.riskTolerance}
                onValueChange={(v: RiskTolerance) => setProfile({ ...profile, riskTolerance: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (Prefer capital protection)</SelectItem>
                  <SelectItem value="moderate">Moderate (Balance of growth and safety)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (Willing to take risks for high growth)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What is your investment experience?</label>
              <Select
                value={profile.experience}
                onValueChange={(v: InvestmentExperience) => setProfile({ ...profile, experience: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (New to investing)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (Have some mutual funds/stocks)</SelectItem>
                  <SelectItem value="advanced">Advanced (Active investor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Goal (Optional)</label>
              <Input
                placeholder="e.g. Retirement, Buying a house, Education"
                value={profile.financialGoals?.[0] || ""}
                onChange={(e) => setProfile({ ...profile, financialGoals: [e.target.value] })}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack}>Back</Button>
        ) : (
          <Button variant="ghost" onClick={onCancel}>Skip for now</Button>
        )}
        
        {step < 3 ? (
          <Button onClick={handleNext} disabled={(step === 1 && !profile.age) || (step === 2 && (!profile.investmentHorizon || !profile.riskTolerance))}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!profile.experience}>
            Complete Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
