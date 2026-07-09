"use client";

import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AssetAllocation } from "../types";

interface AssetAllocationChartProps {
  allocation: AssetAllocation[];
}

const COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#d97706", // amber-600
  "#9333ea", // purple-600
  "#0891b2", // cyan-600
  "#db2777", // pink-600
  "#ea580c", // orange-600
  "#4f46e5", // indigo-600
];

export function AssetAllocationChart({ allocation }: AssetAllocationChartProps) {
  if (!allocation || allocation.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Complete the risk profile to see your recommended allocation.
        </CardContent>
      </Card>
    );
  }

  // Filter out 0% allocations and map the data into the shape Recharts expects.
  const data = allocation
    .filter((item) => item.percentage > 0)
    .map((item) => ({
      name: item.category,
      value: item.percentage,
      amount: item.amount,
      category: item.category,
    }));

  const option: EChartsOption = {
    color: COLORS,
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const amount = params.data?.amount ?? 0;
        return `${params.name}: ${params.value}%<br/>₹${Number(amount).toLocaleString("en-IN")}/mo`;
      },
    },
    legend: {
      show: false,
    },
    series: [
      {
        name: "Allocation",
        type: "pie",
        radius: ["55%", "75%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "hsl(var(--border))",
          borderWidth: 1.5,
        },
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        data: data.map((entry, index) => ({
          name: entry.name,
          value: entry.value,
          amount: entry.amount,
          itemStyle: {
            color: COLORS[index % COLORS.length],
          },
        })),
      },
    ],
  };

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-4 bg-primary/5 border-b border-border/40">
        <CardTitle className="text-lg">Recommended Portfolio</CardTitle>
        <CardDescription>Based on your profile and capacity</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between pt-6 min-h-[300px]">
        <div className="relative h-[180px] w-full shrink-0">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="block text-2xl font-bold text-foreground">100%</span>
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Allocated</span>
            </div>
          </div>
          <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-4 text-[11px]">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-start gap-1.5 min-w-0">
              <span 
                className="h-2 w-2 rounded-full shrink-0 mt-0.5" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="flex-1 min-w-0">
                <span className="text-muted-foreground font-medium break-words leading-tight block">
                  {entry.name}
                </span>
              </span>
              <span className="font-semibold text-foreground shrink-0 ml-1">
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
