"use client";

import { endOfDay, format, startOfDay, subDays } from "date-fns";
import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

const AccountChart = ({ transactions }) => {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += Number(transaction.amount);
      } else {
        acc[date].expense += Number(transaction.amount);
      }
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  const chartOption = useMemo(() => ({
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        return `<div style="font-size:12px;line-height:1.5"><strong>${params.seriesName}</strong><br/>${params.name}: ₹${Number(params.value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`;
      },
    },
    legend: {
      data: ["Income", "Expense"],
      textStyle: { color: "hsl(var(--muted-foreground))" },
    },
    grid: {
      left: "3%",
      right: "3%",
      top: "10%",
      bottom: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: filteredData.map((item) => item.date),
      axisLabel: { color: "hsl(var(--muted-foreground))", fontSize: 11 },
      axisLine: { show: true, lineStyle: { color: "hsl(var(--border))", width: 1 } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "hsl(var(--muted-foreground))",
        fontSize: 11,
        formatter: (value) => `₹${value}`,
      },
      axisLine: { show: true, lineStyle: { color: "hsl(var(--border))", width: 1 } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        name: "Income",
        type: "bar",
        data: filteredData.map((item) => item.income),
        barWidth: "36%",
        itemStyle: { color: "#16a34a", borderRadius: [6, 6, 0, 0] },
        emphasis: {
          itemStyle: { color: "rgba(22, 163, 74, 0.65)" },
        },
      },
      {
        name: "Expense",
        type: "bar",
        data: filteredData.map((item) => item.expense),
        barWidth: "36%",
        itemStyle: { color: "#ef4444", borderRadius: [6, 6, 0, 0] },
        emphasis: {
          itemStyle: { color: "rgba(239, 68, 68, 0.65)" },
        },
      },
    ],
  }), [filteredData]);

  return (
    <div className="p-6 space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">Transactions Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Income vs Expenses for the selected period</p>
        </div>
        <Select onValueChange={setDateRange} defaultValue={dateRange}>
          <SelectTrigger className="w-[150px] rounded-xl h-9 text-sm bg-muted/30 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Income</span>
          </div>
          <p className="text-xl font-bold text-emerald-600">
            ₹{totals.income.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Expenses</span>
          </div>
          <p className="text-xl font-bold text-red-600">
            ₹{totals.expense.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">Net</span>
          </div>
          <p className={`text-xl font-bold ${totals.income - totals.expense >= 0 ? "text-primary" : "text-red-600"}`}>
            {totals.income - totals.expense >= 0 ? "+" : "-"}₹{Math.abs(totals.income - totals.expense).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-[280px] w-full">
        <ReactECharts option={chartOption} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
};

export default AccountChart;
