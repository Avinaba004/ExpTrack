"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, ShieldAlert, CheckCircle2 } from "lucide-react";

interface FinancialHealthCardProps {
  score: number;
  savingsRate: number;
  budgetEfficiency: number;
}

export function FinancialHealthCard({ score, savingsRate, budgetEfficiency }: FinancialHealthCardProps) {
  let status = "Needs Attention";
  let color = "text-red-600";
  let bg = "bg-red-500/10";
  let strokeColor = "text-red-500";

  if (score >= 70) {
    status = "Excellent";
    color = "text-emerald-600";
    bg = "bg-emerald-500/10";
    strokeColor = "text-emerald-500";
  } else if (score >= 40) {
    status = "Good";
    color = "text-amber-600";
    bg = "bg-amber-500/10";
    strokeColor = "text-amber-500";
  }

  return (
    <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 h-full bg-card/60 backdrop-blur-sm border-border/50 rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-primary/5 border-b border-border/40">
        <CardTitle className="text-lg flex items-center justify-between font-semibold">
          Financial Health
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${bg} ${color} border border-current/10`}>
            {status}
          </span>
        </CardTitle>
        <CardDescription>Based on your recent transaction history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 283} 283`}
                strokeLinecap="round"
                className={`${strokeColor} transition-all duration-1000 ease-in-out drop-shadow-sm`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp size={14} /> Savings Rate
              </span>
              <span className="font-medium">{savingsRate}%</span>
            </div>
            <Progress value={Math.max(0, Math.min(100, savingsRate * 3.33))} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 size={14} /> Budget Efficiency
              </span>
              <span className="font-medium">{budgetEfficiency}%</span>
            </div>
            <Progress value={budgetEfficiency} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
