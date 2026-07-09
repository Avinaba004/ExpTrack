"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { SmartInsight } from "../types";

interface SmartInsightsProps {
  insights: SmartInsight[];
}

export function SmartInsights({ insights }: SmartInsightsProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "positive": return <CheckCircle className="text-emerald-500 h-4 w-4 flex-shrink-0" />;
      case "warning": return <AlertTriangle className="text-amber-500 h-4 w-4 flex-shrink-0" />;
      case "suggestion": return <Lightbulb className="text-blue-500 h-4 w-4 flex-shrink-0" />;
      default: return <Info className="text-muted-foreground h-4 w-4 flex-shrink-0" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "positive": return "border-l-emerald-500";
      case "warning": return "border-l-amber-500";
      case "suggestion": return "border-l-blue-500";
      default: return "border-l-muted-foreground";
    }
  };

  return (
    <Card className="h-full bg-card/60 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 bg-primary/5">
        <CardTitle className="text-base flex items-center gap-2 font-semibold">
          <Lightbulb className="h-4 w-4 text-primary shrink-0" />
          <span className="break-words">Smart Financial Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`flex items-start gap-2.5 p-3 rounded-xl border border-l-4 bg-background shadow-sm transition-all duration-200 ${getBorderColor(insight.type)}`}
          >
            <div className="bg-muted p-1.5 rounded-full mt-0.5 shrink-0">
              {getIcon(insight.type)}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="font-semibold text-xs leading-snug text-foreground break-words">{insight.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed break-words">{insight.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
