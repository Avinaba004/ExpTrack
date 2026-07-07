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
      case "positive": return <CheckCircle className="text-emerald-500 h-5 w-5 mt-0.5 flex-shrink-0" />;
      case "warning": return <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0" />;
      case "suggestion": return <Lightbulb className="text-blue-500 h-5 w-5 mt-0.5 flex-shrink-0" />;
      default: return <Info className="text-muted-foreground h-5 w-5 mt-0.5 flex-shrink-0" />;
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
    <Card className="h-full bg-card/60 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl">
      <CardHeader className="pb-3 border-b border-border/40 bg-primary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Smart Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`group flex items-start gap-3 p-4 rounded-xl border border-l-[6px] bg-background shadow-sm hover:shadow-md transition-all duration-300 ${getBorderColor(insight.type)}`}
          >
            <div className="bg-muted p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
              {getIcon(insight.type)}
            </div>
            <div className="space-y-1.5 pt-1">
              <h4 className="font-semibold text-sm leading-none text-foreground">{insight.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
