// ============================================
// FINANCIAL CALCULATOR — Pure utility functions
// No AI, no side effects, fully testable
// ============================================

import type { FinancialMetrics, SmartInsight } from "../types";

interface Transaction {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  date: Date | string;
  isRecurring?: boolean;
  accountId?: string;
}

interface Account {
  balance: number;
  name: string;
  type: string;
  id?: string;
}

interface Budget {
  amount: number;
}

/**
 * Calculate comprehensive financial metrics from raw DB data
 */
export function calculateFinancialMetrics(
  transactions: Transaction[],
  accounts: Account[],
  budget: Budget | null,
  monthsToAnalyze: number = 3,
  activeAccountId?: string
): FinancialMetrics {
  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToAnalyze, 1);

  // Filter transactions within analysis window
  const recentTx = transactions.filter(
    (t) => new Date(t.date) >= cutoffDate
  );

  // Monthly income & expenses (averaged over analysis period)
  const totalIncome = recentTx
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = recentTx
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  // Sum of recurring incomes for active account
  const activeAccountRecurringIncome = activeAccountId
    ? transactions
        .filter((t) => t.type === "INCOME" && t.isRecurring && t.accountId === activeAccountId)
        .reduce((sum, t) => sum + t.amount, 0)
    : 0;

  const actualMonths = Math.max(1, monthsToAnalyze);
  const monthlyIncome = activeAccountRecurringIncome > 0
    ? activeAccountRecurringIncome
    : (totalIncome / actualMonths);

  const monthlyExpenses = totalExpenses / actualMonths;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const disposableIncome = Math.max(0, monthlySavings);

  // Savings rate
  const savingsRate = monthlyIncome > 0
    ? Math.round((monthlySavings / monthlyIncome) * 100)
    : 0;

  // Emergency fund (6 months of expenses)
  const emergencyFundEstimate = monthlyExpenses * 6;

  // Investment capacity (savings minus emergency reserve contribution)
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const emergencyGap = Math.max(0, emergencyFundEstimate - totalBalance);
  const monthlyEmergencyContribution = emergencyGap > 0
    ? Math.min(disposableIncome * 0.3, emergencyGap / 12)
    : 0;
  const investmentCapacity = Math.max(0, disposableIncome - monthlyEmergencyContribution);

  // Budget efficiency
  const budgetLimit = budget ? budget.amount : 0;
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthExpenses = recentTx
    .filter((t) => t.type === "EXPENSE" && new Date(t.date) >= currentMonthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetUsed = currentMonthExpenses;
  const budgetEfficiency = budgetLimit > 0
    ? Math.round(Math.max(0, 100 - ((currentMonthExpenses / budgetLimit) * 100)))
    : 50; // neutral when no budget

  // Expense breakdown
  const expenseBreakdown: Record<string, number> = {};
  recentTx
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      expenseBreakdown[t.category] = (expenseBreakdown[t.category] || 0) + t.amount / actualMonths;
    });

  // Income breakdown
  const incomeBreakdown: Record<string, number> = {};
  recentTx
    .filter((t) => t.type === "INCOME")
    .forEach((t) => {
      incomeBreakdown[t.category] = (incomeBreakdown[t.category] || 0) + t.amount / actualMonths;
    });

  // Cash flow
  const cashFlow = monthlySavings;

  // Health score (0-100)
  const healthScore = calculateHealthScore(
    savingsRate,
    budgetEfficiency,
    totalBalance,
    emergencyFundEstimate,
    monthlyIncome
  );

  return {
    monthlyIncome: Math.round(monthlyIncome),
    monthlyExpenses: Math.round(monthlyExpenses),
    monthlySavings: Math.round(monthlySavings),
    savingsRate: Math.max(-100, Math.min(100, savingsRate)),
    disposableIncome: Math.round(disposableIncome),
    emergencyFundEstimate: Math.round(emergencyFundEstimate),
    investmentCapacity: Math.round(investmentCapacity),
    budgetEfficiency: Math.max(0, Math.min(100, budgetEfficiency)),
    healthScore,
    cashFlow: Math.round(cashFlow),
    expenseBreakdown,
    incomeBreakdown,
    totalBalance: Math.round(totalBalance),
    totalAccounts: accounts.length,
    budgetLimit: Math.round(budgetLimit),
    budgetUsed: Math.round(budgetUsed),
  };
}

/**
 * Calculate Financial Health Score (0-100)
 */
function calculateHealthScore(
  savingsRate: number,
  budgetEfficiency: number,
  totalBalance: number,
  emergencyFundEstimate: number,
  monthlyIncome: number
): number {
  // 1. Savings rate score (0-30 points)
  const savingsScore = Math.min(30, Math.max(0, savingsRate * 0.75));

  // 2. Budget discipline (0-20 points)
  const budgetScore = budgetEfficiency * 0.2;

  // 3. Emergency fund readiness (0-25 points)
  const emergencyRatio = emergencyFundEstimate > 0
    ? totalBalance / emergencyFundEstimate
    : 0;
  const emergencyScore = Math.min(25, emergencyRatio * 25);

  // 4. Income stability bonus (0-15 points)
  const incomeScore = monthlyIncome > 0 ? 15 : 0;

  // 5. Balance health (0-10 points)
  const balanceScore = totalBalance > 0 ? Math.min(10, (totalBalance / (monthlyIncome || 1)) * 2) : 0;

  return Math.round(
    Math.max(0, Math.min(100, savingsScore + budgetScore + emergencyScore + incomeScore + balanceScore))
  );
}

/**
 * Generate programmatic smart insights (no AI needed)
 */
export function generateSmartInsights(metrics: FinancialMetrics): SmartInsight[] {
  const insights: SmartInsight[] = [];

  // Savings rate insight
  if (metrics.savingsRate >= 30) {
    insights.push({
      id: "savings-excellent",
      type: "positive",
      title: "Excellent Savings Rate",
      description: `You save ${metrics.savingsRate}% of your income — above the recommended 20%.`,
      metric: "Savings Rate",
      value: `${metrics.savingsRate}%`,
    });
  } else if (metrics.savingsRate >= 10) {
    insights.push({
      id: "savings-good",
      type: "info",
      title: "Good Savings Habit",
      description: `You save ${metrics.savingsRate}% of your income. Aim for 20%+ for optimal investing.`,
      metric: "Savings Rate",
      value: `${metrics.savingsRate}%`,
    });
  } else if (metrics.savingsRate > 0) {
    insights.push({
      id: "savings-low",
      type: "warning",
      title: "Low Savings Rate",
      description: `Your savings rate is ${metrics.savingsRate}%. Try to reduce expenses to save at least 20%.`,
      metric: "Savings Rate",
      value: `${metrics.savingsRate}%`,
    });
  } else {
    insights.push({
      id: "savings-negative",
      type: "warning",
      title: "Spending Exceeds Income",
      description: `You are spending more than you earn. Focus on budgeting before investing.`,
      metric: "Cash Flow",
      value: `₹${metrics.cashFlow.toLocaleString("en-IN")}`,
    });
  }

  // Investment capacity
  if (metrics.investmentCapacity > 0) {
    insights.push({
      id: "investment-capacity",
      type: "suggestion",
      title: "Investment Capacity",
      description: `You have capacity to invest approximately ₹${metrics.investmentCapacity.toLocaleString("en-IN")}/month.`,
      metric: "Monthly Capacity",
      value: `₹${metrics.investmentCapacity.toLocaleString("en-IN")}`,
    });
  }

  // Emergency fund
  const emergencyMonths = metrics.monthlyExpenses > 0
    ? metrics.totalBalance / metrics.monthlyExpenses
    : 0;
  if (emergencyMonths < 3) {
    insights.push({
      id: "emergency-low",
      type: "warning",
      title: "Build Emergency Fund First",
      description: `Your balance covers ${emergencyMonths.toFixed(1)} months of expenses. Aim for 6 months.`,
      metric: "Emergency Coverage",
      value: `${emergencyMonths.toFixed(1)} months`,
    });
  } else if (emergencyMonths >= 6) {
    insights.push({
      id: "emergency-ready",
      type: "positive",
      title: "Emergency Fund Ready",
      description: `Your balance covers ${emergencyMonths.toFixed(1)} months — your emergency fund is solid.`,
      metric: "Emergency Coverage",
      value: `${emergencyMonths.toFixed(1)} months`,
    });
  }

  // Budget efficiency
  if (metrics.budgetLimit > 0) {
    const usage = Math.round((metrics.budgetUsed / metrics.budgetLimit) * 100);
    if (usage > 90) {
      insights.push({
        id: "budget-high",
        type: "warning",
        title: "Budget Nearly Exhausted",
        description: `You've used ${usage}% of your monthly budget. Watch your spending.`,
        metric: "Budget Usage",
        value: `${usage}%`,
      });
    } else if (usage <= 70) {
      insights.push({
        id: "budget-efficient",
        type: "positive",
        title: "Budget Discipline",
        description: `You've used ${usage}% of your budget — great discipline this month.`,
        metric: "Budget Usage",
        value: `${usage}%`,
      });
    }
  }

  // Top expense category
  const categories = Object.entries(metrics.expenseBreakdown);
  if (categories.length > 0) {
    const sorted = categories.sort(([, a], [, b]) => b - a);
    const [topCat, topAmt] = sorted[0];
    const pct = metrics.monthlyExpenses > 0
      ? Math.round((topAmt / metrics.monthlyExpenses) * 100)
      : 0;
    insights.push({
      id: "top-expense",
      type: "info",
      title: `Top Expense: ${topCat}`,
      description: `${topCat} accounts for ${pct}% of your monthly spending (₹${Math.round(topAmt).toLocaleString("en-IN")}/month).`,
      metric: "Category",
      value: `${pct}%`,
    });
  }

  // Health score
  if (metrics.healthScore >= 70) {
    insights.push({
      id: "health-good",
      type: "positive",
      title: "Strong Financial Health",
      description: `Your financial health score is ${metrics.healthScore}/100 — you're in a good position to invest.`,
      metric: "Health Score",
      value: `${metrics.healthScore}/100`,
    });
  } else if (metrics.healthScore >= 40) {
    insights.push({
      id: "health-moderate",
      type: "info",
      title: "Moderate Financial Health",
      description: `Your health score is ${metrics.healthScore}/100. There's room for improvement before aggressive investing.`,
      metric: "Health Score",
      value: `${metrics.healthScore}/100`,
    });
  }

  return insights;
}

/**
 * Recalculate metrics for a what-if scenario
 */
export function recalculateForScenario(
  baseMetrics: FinancialMetrics,
  scenario: {
    monthlyIncome?: number;
    monthlyExpenses?: number;
    monthlySavings?: number;
  }
): FinancialMetrics {
  const income = scenario.monthlyIncome ?? baseMetrics.monthlyIncome;
  const expenses = scenario.monthlyExpenses ?? baseMetrics.monthlyExpenses;
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
  const disposable = Math.max(0, savings);
  const emergency = expenses * 6;
  const emergencyGap = Math.max(0, emergency - baseMetrics.totalBalance);
  const emergencyContrib = emergencyGap > 0 ? Math.min(disposable * 0.3, emergencyGap / 12) : 0;
  const investmentCapacity = Math.max(0, disposable - emergencyContrib);

  return {
    ...baseMetrics,
    monthlyIncome: Math.round(income),
    monthlyExpenses: Math.round(expenses),
    monthlySavings: Math.round(savings),
    savingsRate: Math.max(-100, Math.min(100, savingsRate)),
    disposableIncome: Math.round(disposable),
    emergencyFundEstimate: Math.round(emergency),
    investmentCapacity: Math.round(investmentCapacity),
    cashFlow: Math.round(savings),
    healthScore: calculateHealthScore(
      savingsRate,
      baseMetrics.budgetEfficiency,
      baseMetrics.totalBalance,
      emergency,
      income
    ),
  };
}
