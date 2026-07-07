"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCcw, Activity } from "lucide-react";
import { useMarketData } from "../hooks/useMarketData";

export function MarketHighlights() {
  const { marketData, isLoading, error } = useMarketData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Highlights</CardTitle>
          <CardDescription>Fetching live data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !marketData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Highlights</CardTitle>
          <CardDescription>Unable to load market data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { indices, gold, mutualFunds } = marketData;
  const hasData = indices.length > 0 || gold !== null || mutualFunds.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <Card className="h-full bg-card/60 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3 border-b border-border/40 bg-primary/5 p-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Activity className="h-4.5 w-4.5 text-primary" />
          Live Market
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Indices */}
        {indices.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Indices</h4>
            <div className="grid grid-cols-2 gap-2">
              {indices.map((idx) => (
                <div key={idx.symbol} className="p-2 bg-background shadow-xs rounded-xl border border-border/50 flex flex-col hover:border-primary/30 transition-colors">
                  <span className="text-[11px] font-semibold text-foreground/80">{idx.name}</span>
                  <div className="mt-1.5 flex items-end justify-between">
                    <span className="font-bold text-xs tracking-tight">{idx.value.toLocaleString("en-IN")}</span>
                    <span className={`text-[9px] flex items-center font-bold px-1 rounded ${idx.change >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                      {idx.change >= 0 ? <TrendingUp size={8} className="mr-0.5" /> : <TrendingDown size={8} className="mr-0.5" />}
                      {Math.abs(idx.changePercent).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gold & Top Mutual Funds side by side or compact list */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Commodities & Funds</h4>
          <div className="space-y-1.5 bg-background p-2.5 rounded-xl shadow-xs border border-border/50">
            {/* Gold row */}
            {gold && (
              <div className="flex justify-between items-center text-xs border-b border-border/30 pb-1.5">
                <span className="font-medium text-foreground/80">Gold (1g)</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">₹{gold.pricePerGram.toLocaleString("en-IN")}</span>
                  <span className={`text-[9px] font-bold px-1 rounded ${gold.changePercent24h >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                    {gold.changePercent24h >= 0 ? "+" : "-"}{Math.abs(gold.changePercent24h).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
            
            {/* MF rows */}
            {mutualFunds.slice(0, 2).map((mf) => (
              <div key={mf.schemeCode} className="flex justify-between items-center text-xs border-b border-border/30 pb-1.5 last:border-0 last:pb-0 pt-1.5">
                <span className="truncate pr-2 font-medium text-foreground/80 text-[11px]" title={mf.schemeName}>{mf.schemeName.split(" - ")[0]}</span>
                <span className="font-bold tracking-tight whitespace-nowrap">₹{mf.nav}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
