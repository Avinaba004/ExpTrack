// ============================================
// INVESTMENT MODULE — TYPE DEFINITIONS
// ============================================

// --- Risk Profile ---

export type RiskTolerance = "conservative" | "moderate" | "aggressive";
export type InvestmentHorizon = "short" | "medium" | "long"; // <3y, 3-7y, 7y+
export type InvestmentExperience = "beginner" | "intermediate" | "advanced";

export interface RiskProfile {
  age: number;
  riskTolerance: RiskTolerance;
  investmentHorizon: InvestmentHorizon;
  experience: InvestmentExperience;
  monthlyInvestmentBudget: number; // INR
  financialGoals: string[];
  completedAt: string; // ISO date
}

// --- Financial Metrics ---

export interface FinancialMetrics {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number; // percentage 0-100
  disposableIncome: number;
  emergencyFundEstimate: number; // 6 months of expenses
  investmentCapacity: number; // monthly
  budgetEfficiency: number; // percentage 0-100
  healthScore: number; // 0-100
  cashFlow: number;
  expenseBreakdown: Record<string, number>;
  incomeBreakdown: Record<string, number>;
  totalBalance: number;
  totalAccounts: number;
  budgetLimit: number;
  budgetUsed: number;
}

// --- Asset Allocation ---

export interface AssetAllocation {
  category: string;
  percentage: number;
  amount: number; // INR monthly
  description: string;
  riskLevel: "low" | "medium" | "high";
  expectedReturn: string; // e.g. "6-8% p.a."
}

// --- Market Data ---

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export interface MutualFundData {
  schemeCode: number;
  schemeName: string;
  nav: number;
  date: string;
  category?: string;
}

export interface GoldPrice {
  pricePerGram: number; // INR
  pricePerOunce: number; // INR
  change24h: number;
  changePercent24h: number;
  lastUpdated: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

export interface MarketData {
  indices: MarketIndex[];
  mutualFunds: MutualFundData[];
  gold: GoldPrice | null;
  news: NewsArticle[];
  availableProviders: string[];
  unavailableProviders: string[];
  lastUpdated: string;
}

// --- Investment Comparison ---

export interface InvestmentOption {
  name: string;
  type: "stock" | "mutual_fund" | "etf" | "gold" | "government_scheme" | "bond";
  expectedReturn: string;
  riskLevel: "low" | "medium" | "high" | "very_high";
  liquidity: "high" | "medium" | "low";
  minInvestment: number;
  expenseRatio?: number;
  lockInPeriod?: string;
  taxBenefit: boolean;
  pros: string[];
  cons: string[];
  suitableFor: string[];
}

// --- Smart Insights ---

export interface SmartInsight {
  id: string;
  type: "positive" | "warning" | "info" | "suggestion";
  title: string;
  description: string;
  metric?: string;
  value?: string;
  aiExplanation?: string;
}

// --- What-If Scenario ---

export interface WhatIfScenario {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  monthlyInvestment: number;
  investmentHorizon: number; // years
  expectedReturn: number; // percentage
  riskTolerance: RiskTolerance;
}

// --- AI Analysis Response ---

export interface InvestmentAnalysis {
  healthSummary: string;
  investmentReadiness: string;
  suggestedMonthlyInvestment: number;
  assetAllocation: AssetAllocation[];
  strategy: string;
  risks: string[];
  assumptions: string[];
  personalizedExplanation: string;
  disclaimer: string;
}

// --- API Request/Response ---

export interface AnalyzeRequest {
  riskProfile?: RiskProfile;
  whatIfScenario?: WhatIfScenario;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: InvestmentAnalysis;
  metrics?: FinancialMetrics;
  marketData?: MarketData;
  error?: string;
}

export interface InvestmentChatRequest {
  question: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  riskProfile?: RiskProfile;
}

export interface InvestmentChatResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

// --- Market Data Provider ---

export interface MarketDataProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  fetchData(): Promise<Partial<MarketData>>;
}

// --- Cache Entry ---

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}
