"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInvestmentOptions } from "../services/assetAllocator";

export function InvestmentComparison() {
  const options = getInvestmentOptions();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20";
      case "medium": return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20";
      case "high": return "bg-red-500/10 text-red-600 hover:bg-red-500/20";
      case "very_high": return "bg-red-600/10 text-red-700 hover:bg-red-600/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="w-full bg-card/60 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border/40 pb-6">
        <CardTitle className="text-xl">Compare Investment Options</CardTitle>
        <CardDescription>A quick overview of popular investment avenues in India</CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[220px] py-4 pl-6 font-semibold">Investment Type</TableHead>
              <TableHead className="py-4 font-semibold">Expected Return</TableHead>
              <TableHead className="py-4 font-semibold">Risk</TableHead>
              <TableHead className="py-4 font-semibold">Lock-in Period</TableHead>
              <TableHead className="py-4 font-semibold">Tax Benefit</TableHead>
              <TableHead className="hidden md:table-cell py-4 pr-6 font-semibold">Suitable For</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option) => (
              <TableRow key={option.name} className="hover:bg-muted/20 transition-colors group">
                <TableCell className="font-medium pl-6 py-4">
                  <div className="text-foreground/90">{option.name}</div>
                  <div className="text-[10px] text-muted-foreground hidden sm:block uppercase mt-1 tracking-wider font-semibold">
                    {option.type.replace("_", " ")}
                  </div>
                </TableCell>
                <TableCell className="py-4 font-medium">{option.expectedReturn}</TableCell>
                <TableCell className="py-4">
                  <Badge variant="secondary" className={`capitalize font-medium ${getRiskColor(option.riskLevel)}`}>
                    {option.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 text-muted-foreground">{option.lockInPeriod}</TableCell>
                <TableCell className="py-4">
                  {option.taxBenefit ? (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-500/10 font-medium">Yes</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">No</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground py-4 pr-6">
                  <div className="flex flex-wrap gap-1.5">
                    {option.suitableFor.slice(0, 2).map((s) => (
                      <span key={s} className="bg-background border px-2 py-0.5 rounded-full text-[11px] shadow-sm whitespace-nowrap group-hover:border-primary/20 transition-colors">
                        {s}
                      </span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
