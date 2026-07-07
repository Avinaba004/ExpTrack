// ============================================
// PROMPT BUILDER — Structures all context for Gemini
// ============================================

import type {
  FinancialMetrics,
  RiskProfile,
  MarketData,
  AssetAllocation,
  SmartInsight,
} from "../types";

interface HistoricalContext {
  ytdIncome: number;
  ytdExpense: number;
  ytdSavings: number;
  currentYear: number;
  last12Months: Array<{ month: string; income: number; expense: number; savings: number }>;
}

/**
 * Build the full system instruction for investment analysis
 */
export function buildInvestmentSystemPrompt(
  metrics: FinancialMetrics,
  riskProfile: RiskProfile | null,
  marketData: MarketData | null,
  allocation: AssetAllocation[],
  insights: SmartInsight[],
  historicalContext?: HistoricalContext
): string {
  const now = new Date();

  let prompt = `You are "ExpTrack Investment Advisor", an AI-powered educational financial planner inside the ExpTrack app.
You help Indian users understand their financial health, investment readiness, and provide personalized investment guidance.

CURRENT DATE & TIME: ${now.toString()}
CURRENCY: INR (Indian Rupees ₹)

CRITICAL RULES:
1. NEVER guarantee profits or predict specific stock prices.
2. NEVER encourage speculative or risky investing beyond the user's risk profile.
3. ALWAYS state that you are an AI assistant, not a licensed financial advisor.
4. Use ONLY the provided financial data and market data. Do NOT invent facts or numbers.
5. Explain uncertainty when relevant.
6. Recommend diversification and state your assumptions.
7. Be educational — explain WHY every recommendation is made.
8. Keep language simple — avoid overly technical jargon.

**IMPORTANT OUTPUT STRUCTURE (MUST FOLLOW EXACTLY)**
You must format your entire response using the following H3 (###) headers exactly as written below. Do not deviate. This allows the UI to parse your response into beautiful expandable accordion sections.

### Summary & Health
Provide a brief 2-3 sentence summary of their current financial health and readiness to invest.

### Core Strategy
Explain the overall investment strategy based on their risk profile and horizon.

### Asset Allocation Breakdown
Provide a bulleted list explaining the logic behind the suggested asset allocation.

### Risk Factors
List the primary risks associated with this approach.

### Action Plan
Provide 3-5 concrete next steps the user should take this month.

### Disclaimer
End with a brief financial disclaimer.

═══════════════════════════════
USER FINANCIAL DATA
═══════════════════════════════

Monthly Income: ₹${metrics.monthlyIncome.toLocaleString("en-IN")}
Monthly Expenses: ₹${metrics.monthlyExpenses.toLocaleString("en-IN")}
Monthly Savings: ₹${metrics.monthlySavings.toLocaleString("en-IN")}
Savings Rate: ${metrics.savingsRate}%
Disposable Income: ₹${metrics.disposableIncome.toLocaleString("en-IN")}
Total Balance (all accounts): ₹${metrics.totalBalance.toLocaleString("en-IN")}
Number of Accounts: ${metrics.totalAccounts}
Emergency Fund Needed (6 months): ₹${metrics.emergencyFundEstimate.toLocaleString("en-IN")}
Investment Capacity: ₹${metrics.investmentCapacity.toLocaleString("en-IN")}/month
Budget Limit: ${metrics.budgetLimit > 0 ? `₹${metrics.budgetLimit.toLocaleString("en-IN")}` : "Not set"}
Budget Used This Month: ₹${metrics.budgetUsed.toLocaleString("en-IN")}
Budget Efficiency: ${metrics.budgetEfficiency}%
Financial Health Score: ${metrics.healthScore}/100
Cash Flow: ₹${metrics.cashFlow.toLocaleString("en-IN")}/month

Expense Breakdown (monthly avg):
${Object.entries(metrics.expenseBreakdown)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, amt]) => `- ${cat}: ₹${Math.round(amt).toLocaleString("en-IN")}`)
  .join("\n") || "No expense data available."}
`;

  // ── Historical data (YTD + last 12 months) ──────────────────────
  if (historicalContext) {
    const { ytdIncome, ytdExpense, ytdSavings, currentYear, last12Months } = historicalContext;
    prompt += `
═══════════════════════════════
HISTORICAL FINANCIAL DATA (FROM DATABASE)
═══════════════════════════════
Year-to-Date ${currentYear}:
- Total Income: ₹${ytdIncome.toLocaleString("en-IN")}
- Total Expenses: ₹${ytdExpense.toLocaleString("en-IN")}
- Net Savings (YTD): ₹${ytdSavings.toLocaleString("en-IN")}

Month-by-Month Breakdown (last 12 months, most recent first):
${last12Months
  .map(
    ({ month, income, expense, savings }) =>
      `- ${month}: Income ₹${income.toLocaleString("en-IN")}, Expenses ₹${expense.toLocaleString("en-IN")}, Savings ₹${savings.toLocaleString("en-IN")}`
  )
  .join("\n") || "No historical data available."}

NOTE: These are EXACT numbers from the user's database. Use them verbatim when answering questions about yearly savings, monthly income, spending history, or trends. Never say you lack historical data.
`;
  }

  // Risk profile
  if (riskProfile) {
    prompt += `
═══════════════════════════════
USER RISK PROFILE
═══════════════════════════════
Age: ${riskProfile.age}
Risk Tolerance: ${riskProfile.riskTolerance}
Investment Horizon: ${riskProfile.investmentHorizon}
Experience: ${riskProfile.experience}
Monthly Investment Budget: ₹${riskProfile.monthlyInvestmentBudget.toLocaleString("en-IN")}
Financial Goals: ${riskProfile.financialGoals.join(", ") || "Not specified"}
`;
  } else {
    prompt += `
═══════════════════════════════
USER RISK PROFILE: NOT YET COMPLETED
═══════════════════════════════
The user has not filled out their risk questionnaire yet. Provide general guidance and encourage them to complete the risk assessment.
`;
  }

  // Asset allocation
  if (allocation.length > 0) {
    prompt += `
═══════════════════════════════
SUGGESTED ASSET ALLOCATION
═══════════════════════════════
${allocation
  .map((a) => `- ${a.category}: ${a.percentage}% (₹${a.amount.toLocaleString("en-IN")}/month) — ${a.description} [Risk: ${a.riskLevel}, Expected: ${a.expectedReturn}]`)
  .join("\n")}
`;
  }

  // Smart insights
  if (insights.length > 0) {
    prompt += `
═══════════════════════════════
SMART INSIGHTS (pre-calculated)
═══════════════════════════════
${insights.map((i) => `- [${i.type.toUpperCase()}] ${i.title}: ${i.description}`).join("\n")}
`;
  }

  // Market data
  if (marketData) {
    prompt += `
═══════════════════════════════
LIVE MARKET DATA
═══════════════════════════════
`;
    if (marketData.indices.length > 0) {
      prompt += `Market Indices:\n${marketData.indices
        .map((idx) => `- ${idx.name}: ${idx.value.toLocaleString("en-IN")} (${idx.change >= 0 ? "+" : ""}${idx.changePercent.toFixed(2)}%)`)
        .join("\n")}\n\n`;
    }

    if (marketData.gold) {
      prompt += `Gold Price: ₹${marketData.gold.pricePerGram.toLocaleString("en-IN")}/gram (${marketData.gold.changePercent24h >= 0 ? "+" : ""}${marketData.gold.changePercent24h.toFixed(2)}% 24h)\n\n`;
    }

    if (marketData.mutualFunds.length > 0) {
      prompt += `Top Mutual Fund NAVs:\n${marketData.mutualFunds
        .slice(0, 5)
        .map((mf) => `- ${mf.schemeName}: NAV ₹${mf.nav}`)
        .join("\n")}\n\n`;
    }

    if (marketData.unavailableProviders.length > 0) {
      prompt += `⚠️ Data sources unavailable: ${marketData.unavailableProviders.join(", ")}. Do not make assumptions about data from these sources.\n`;
    }
  }

  return prompt;
}

/**
 * Build the system prompt specifically for investment chat
 */
export function buildInvestmentChatPrompt(
  metrics: FinancialMetrics,
  riskProfile: RiskProfile | null,
  marketData: MarketData | null,
  allocation: AssetAllocation[],
  insights: SmartInsight[],
  historicalContext?: HistoricalContext
): string {
  return buildInvestmentSystemPrompt(metrics, riskProfile, marketData, allocation, insights, historicalContext) + `

ADDITIONAL CHAT INSTRUCTIONS:
- Answer the user's specific question using ALL available data above — especially the HISTORICAL FINANCIAL DATA section.
- If the user asks "savings this year", "income last month", "spending in March", or any time-based question, ALWAYS look up the exact figure from the "Month-by-Month Breakdown" or "Year-to-Date" section and state it precisely.
- NEVER say you don't have historical data — you have exact month-by-month figures and year-to-date totals.
- If the user asks about a specific investment product, compare it using the data above.
- If the user asks "should I invest?", assess their investment readiness based on their financial health.
- If they ask about specific amounts, calculate based on their actual disposable income and investment capacity.
- After giving accurate numbers, provide strategic analysis: trends, advice, and actionable next steps.
- Keep responses concise but thorough — 150-350 words ideal.
- End with a brief disclaimer: "⚠️ This is educational guidance, not financial advice. Please consult a certified financial planner for personalized recommendations."
`;
}
