"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
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

  return (
    <Card className="h-full bg-card/60 backdrop-blur-sm border-border/50 shadow-sm rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-4 bg-primary/5 border-b border-border/40">
        <CardTitle className="text-lg">Recommended Portfolio</CardTitle>
        <CardDescription>Based on your profile and capacity</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[250px] w-full relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="block text-2xl font-bold text-foreground">100%</span>
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Allocated</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-sm hover:opacity-85 transition-opacity outline-none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value}% (₹${props.payload.amount.toLocaleString("en-IN")}/mo)`,
                  name,
                ]}
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", padding: "8px 12px" }}
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
