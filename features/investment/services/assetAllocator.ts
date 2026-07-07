// ============================================
// ASSET ALLOCATION ENGINE
// Rule-based allocation based on risk profile + financial metrics
// ============================================

import type { AssetAllocation, RiskProfile, FinancialMetrics } from "../types";

interface AllocationTemplate {
  category: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  expectedReturn: string;
}

const ALLOCATION_TEMPLATES: AllocationTemplate[] = [
  { category: "Emergency Fund", description: "Liquid fund / savings account for 6-month expenses", riskLevel: "low", expectedReturn: "4-5% p.a." },
  { category: "PPF / EPF", description: "Public Provident Fund — tax-free, long-term", riskLevel: "low", expectedReturn: "7-7.5% p.a." },
  { category: "Government Bonds", description: "RBI bonds, SGBs — sovereign guarantee", riskLevel: "low", expectedReturn: "7-8% p.a." },
  { category: "Large Cap Funds", description: "NIFTY 50 / Sensex index funds — stable growth", riskLevel: "medium", expectedReturn: "10-12% p.a." },
  { category: "Mid Cap Funds", description: "Mid-cap mutual funds — moderate growth", riskLevel: "medium", expectedReturn: "12-15% p.a." },
  { category: "Small Cap Funds", description: "Small-cap mutual funds — high growth potential", riskLevel: "high", expectedReturn: "15-20% p.a." },
  { category: "Gold / SGBs", description: "Sovereign Gold Bonds or Gold ETFs — hedge", riskLevel: "low", expectedReturn: "8-10% p.a." },
  { category: "NPS", description: "National Pension System — retirement corpus", riskLevel: "medium", expectedReturn: "9-12% p.a." },
  { category: "Index ETFs", description: "NIFTY/Sensex ETFs — low-cost market exposure", riskLevel: "medium", expectedReturn: "10-12% p.a." },
  { category: "Cash Reserve", description: "Immediate liquidity for short-term needs", riskLevel: "low", expectedReturn: "3-4% p.a." },
];

/**
 * Conservative allocation weights (percentages)
 */
const CONSERVATIVE: Record<string, number> = {
  "Emergency Fund": 15,
  "PPF / EPF": 20,
  "Government Bonds": 15,
  "Large Cap Funds": 15,
  "Mid Cap Funds": 5,
  "Small Cap Funds": 0,
  "Gold / SGBs": 15,
  "NPS": 10,
  "Index ETFs": 0,
  "Cash Reserve": 5,
};

const MODERATE: Record<string, number> = {
  "Emergency Fund": 10,
  "PPF / EPF": 15,
  "Government Bonds": 10,
  "Large Cap Funds": 20,
  "Mid Cap Funds": 10,
  "Small Cap Funds": 5,
  "Gold / SGBs": 10,
  "NPS": 10,
  "Index ETFs": 5,
  "Cash Reserve": 5,
};

const AGGRESSIVE: Record<string, number> = {
  "Emergency Fund": 5,
  "PPF / EPF": 10,
  "Government Bonds": 5,
  "Large Cap Funds": 20,
  "Mid Cap Funds": 15,
  "Small Cap Funds": 15,
  "Gold / SGBs": 5,
  "NPS": 10,
  "Index ETFs": 10,
  "Cash Reserve": 5,
};

/**
 * Generate personalized asset allocation
 */
export function generateAssetAllocation(
  riskProfile: RiskProfile | null,
  metrics: FinancialMetrics
): AssetAllocation[] {
  const tolerance = riskProfile?.riskTolerance ?? "moderate";
  const horizon = riskProfile?.investmentHorizon ?? "medium";
  const age = riskProfile?.age ?? 30;

  // Select base allocation by risk tolerance
  let baseWeights: Record<string, number>;
  if (tolerance === "conservative") {
    baseWeights = { ...CONSERVATIVE };
  } else if (tolerance === "aggressive") {
    baseWeights = { ...AGGRESSIVE };
  } else {
    baseWeights = { ...MODERATE };
  }

  // Adjust for age: older = more conservative
  if (age > 50) {
    baseWeights["Large Cap Funds"] = Math.max(0, baseWeights["Large Cap Funds"] - 5);
    baseWeights["Small Cap Funds"] = Math.max(0, baseWeights["Small Cap Funds"] - 5);
    baseWeights["Government Bonds"] += 5;
    baseWeights["PPF / EPF"] += 5;
  } else if (age < 25) {
    baseWeights["Small Cap Funds"] = Math.min(20, baseWeights["Small Cap Funds"] + 5);
    baseWeights["Index ETFs"] = Math.min(15, baseWeights["Index ETFs"] + 5);
    baseWeights["Government Bonds"] = Math.max(0, baseWeights["Government Bonds"] - 5);
    baseWeights["Cash Reserve"] = Math.max(0, baseWeights["Cash Reserve"] - 5);
  }

  // Adjust for horizon
  if (horizon === "short") {
    baseWeights["Emergency Fund"] += 5;
    baseWeights["Cash Reserve"] += 5;
    baseWeights["Small Cap Funds"] = Math.max(0, baseWeights["Small Cap Funds"] - 5);
    baseWeights["Mid Cap Funds"] = Math.max(0, baseWeights["Mid Cap Funds"] - 5);
  } else if (horizon === "long") {
    baseWeights["NPS"] += 5;
    baseWeights["Large Cap Funds"] += 5;
    baseWeights["Emergency Fund"] = Math.max(5, baseWeights["Emergency Fund"] - 5);
    baseWeights["Cash Reserve"] = Math.max(0, baseWeights["Cash Reserve"] - 5);
  }

  // Normalize to 100%
  const totalWeight = Object.values(baseWeights).reduce((a, b) => a + b, 0);
  const normalizedWeights: Record<string, number> = {};
  for (const [key, val] of Object.entries(baseWeights)) {
    normalizedWeights[key] = Math.round((val / totalWeight) * 100);
  }

  // Fix rounding to exactly 100
  const sum = Object.values(normalizedWeights).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    const largest = Object.entries(normalizedWeights).sort(([, a], [, b]) => b - a)[0][0];
    normalizedWeights[largest] += 100 - sum;
  }

  // Monthly investment amount
  const monthlyBudget = riskProfile?.monthlyInvestmentBudget ?? metrics.investmentCapacity;

  // Build allocation objects
  return ALLOCATION_TEMPLATES
    .filter((t) => (normalizedWeights[t.category] ?? 0) > 0)
    .map((template) => ({
      category: template.category,
      percentage: normalizedWeights[template.category],
      amount: Math.round((normalizedWeights[template.category] / 100) * monthlyBudget),
      description: template.description,
      riskLevel: template.riskLevel,
      expectedReturn: template.expectedReturn,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Get predefined investment comparison options for Indian market
 */
export function getInvestmentOptions() {
  return [
    {
      name: "NIFTY 50 Index Fund",
      type: "mutual_fund" as const,
      expectedReturn: "10-12% p.a.",
      riskLevel: "medium" as const,
      liquidity: "high" as const,
      minInvestment: 500,
      expenseRatio: 0.1,
      lockInPeriod: "None",
      taxBenefit: false,
      pros: ["Low cost", "Diversified", "Easy to invest via SIP", "Tracks market"],
      cons: ["Market risk", "No guaranteed returns", "No tax benefit"],
      suitableFor: ["Beginners", "Long-term investors", "Passive investors"],
    },
    {
      name: "PPF (Public Provident Fund)",
      type: "government_scheme" as const,
      expectedReturn: "7.1% p.a. (current)",
      riskLevel: "low" as const,
      liquidity: "low" as const,
      minInvestment: 500,
      lockInPeriod: "15 years",
      taxBenefit: true,
      pros: ["Tax-free returns", "Government guarantee", "EEE tax status", "Compounding"],
      cons: ["15-year lock-in", "Low returns vs equity", "₹1.5L annual limit"],
      suitableFor: ["Conservative investors", "Tax savers", "Retirement planning"],
    },
    {
      name: "Sovereign Gold Bonds",
      type: "gold" as const,
      expectedReturn: "8-10% p.a. (gold + 2.5% interest)",
      riskLevel: "low" as const,
      liquidity: "medium" as const,
      minInvestment: 4800,
      lockInPeriod: "8 years (exit after 5)",
      taxBenefit: true,
      pros: ["No storage hassle", "2.5% annual interest", "Tax-free on maturity", "Government backed"],
      cons: ["8-year lock-in", "Limited liquidity", "Gold price risk"],
      suitableFor: ["Gold investors", "Portfolio diversifiers", "Long-term hedgers"],
    },
    {
      name: "ELSS Mutual Fund",
      type: "mutual_fund" as const,
      expectedReturn: "12-15% p.a.",
      riskLevel: "high" as const,
      liquidity: "medium" as const,
      minInvestment: 500,
      expenseRatio: 0.5,
      lockInPeriod: "3 years",
      taxBenefit: true,
      pros: ["Tax deduction u/s 80C", "Shortest lock-in among 80C", "Equity growth", "SIP available"],
      cons: ["Market risk", "3-year lock-in", "LTCG tax after ₹1L"],
      suitableFor: ["Tax savers", "Moderate risk takers", "3-5 year investors"],
    },
    {
      name: "NPS (National Pension System)",
      type: "government_scheme" as const,
      expectedReturn: "9-12% p.a.",
      riskLevel: "medium" as const,
      liquidity: "low" as const,
      minInvestment: 500,
      lockInPeriod: "Until 60",
      taxBenefit: true,
      pros: ["Extra ₹50K deduction u/s 80CCD(1B)", "Professional management", "Equity+debt mix", "Low cost"],
      cons: ["Locked until 60", "Partial withdrawal rules", "Annuity mandatory on 40%"],
      suitableFor: ["Retirement planners", "Tax optimizers", "Long-term investors"],
    },
    {
      name: "Fixed Deposit",
      type: "bond" as const,
      expectedReturn: "6-7.5% p.a.",
      riskLevel: "low" as const,
      liquidity: "medium" as const,
      minInvestment: 1000,
      lockInPeriod: "7 days to 10 years",
      taxBenefit: false,
      pros: ["Guaranteed returns", "DICGC insured up to ₹5L", "Flexible tenure", "Simple"],
      cons: ["Interest taxable", "Low real returns after inflation", "Premature withdrawal penalty"],
      suitableFor: ["Risk-averse investors", "Emergency fund", "Short-term parking"],
    },
  ];
}
