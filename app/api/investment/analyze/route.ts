import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateFinancialMetrics, generateSmartInsights, recalculateForScenario } from "@/features/investment/services/financialCalculator";
import { generateAssetAllocation } from "@/features/investment/services/assetAllocator";
import { buildInvestmentSystemPrompt } from "@/features/investment/services/promptBuilder";
import { fetchAllMarketData } from "@/features/investment/services/marketDataService";
import type { RiskProfile, WhatIfScenario } from "@/features/investment/types";
import { getAvailableInvestmentProfileColumns } from "../investmentProfileSchema";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const riskProfile: RiskProfile | null = body.riskProfile ?? null;
    const whatIfScenario: WhatIfScenario | null = body.whatIfScenario ?? null;

    // 1. Fetch transactions (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        date: { gte: sixMonthsAgo },
      },
      orderBy: { date: "desc" },
    });

    const serializedTx = transactions.map((t: any) => ({
      type: t.type,
      amount: typeof t.amount === "object" && t.amount.toNumber ? t.amount.toNumber() : Number(t.amount),
      category: t.category,
      date: t.date,
      isRecurring: t.isRecurring,
      accountId: t.accountId,
    }));

    const serializedAccounts = user.accounts.map((a: any) => ({
      balance: typeof a.balance === "object" && a.balance.toNumber ? a.balance.toNumber() : Number(a.balance),
      name: a.name,
      type: a.type,
      id: a.id,
    }));

    const activeAccount = user.accounts.find((a: any) => a.isDefault) || user.accounts[0];
    const activeAccountId = activeAccount?.id;

    // 2. Fetch budget
    const budget = await db.budget.findUnique({ where: { userId: user.id } });
    const serializedBudget = budget
      ? { amount: typeof budget.amount === "object" && (budget.amount as any).toNumber ? (budget.amount as any).toNumber() : Number(budget.amount) }
      : null;

    // 3. Calculate metrics
    let metrics = calculateFinancialMetrics(serializedTx, serializedAccounts, serializedBudget, 3, activeAccountId);

    // Apply what-if scenario if provided
    if (whatIfScenario) {
      metrics = recalculateForScenario(metrics, {
        monthlyIncome: whatIfScenario.monthlyIncome,
        monthlyExpenses: whatIfScenario.monthlyExpenses,
      });
    }

    // 4. Generate smart insights
    const insights = generateSmartInsights(metrics);

    // 5. Generate asset allocation
    const allocation = generateAssetAllocation(riskProfile, metrics);

    // 6. Fetch market data
    const marketData = await fetchAllMarketData();

    // 7. Build prompt and call Gemini
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        metrics,
        insights,
        allocation,
        marketData,
        analysis: null,
        error: "Gemini API key not configured. Showing calculated data only.",
      });
    }

    const systemPrompt = buildInvestmentSystemPrompt(metrics, riskProfile, marketData, allocation, insights);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const userPrompt = whatIfScenario
      ? `Analyze this what-if scenario: Monthly income ₹${whatIfScenario.monthlyIncome.toLocaleString("en-IN")}, expenses ₹${whatIfScenario.monthlyExpenses.toLocaleString("en-IN")}, planned investment ₹${whatIfScenario.monthlyInvestment.toLocaleString("en-IN")}/month for ${whatIfScenario.investmentHorizon} years at ${whatIfScenario.expectedReturn}% expected return. Provide a full analysis with asset allocation recommendations.`
      : "Provide a comprehensive investment analysis based on the user's current financial data. Include: 1) Financial health summary, 2) Investment readiness assessment, 3) Suggested monthly investment amount, 4) Asset allocation explanation, 5) Key risks, 6) Personalized strategy recommendation.";

    let aiAnalysis = "";
    try {
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      aiAnalysis = response.text();
    } catch (apiError) {
      console.warn("Investment analysis Gemini call failed, returning structured fallback:", apiError);

      const targetAllocationText = allocation.map(a => `- **${a.category}**: ${a.percentage}% (₹${a.amount.toLocaleString("en-IN")}/mo)`).join("\n");

      aiAnalysis = `### Executive Summary
Based on your **${riskProfile?.riskTolerance || "Moderate"}** risk profile, monthly income of **₹${metrics.monthlyIncome.toLocaleString("en-IN")}**, and spending of **₹${metrics.monthlyExpenses.toLocaleString("en-IN")}**, your computed portfolio health score is **${metrics.healthScore}/100**. We have generated a programmatic plan to optimize your assets.

### Core Investment Strategy
To maximize returns while managing risk, we recommend distributing your monthly investment capacity of **₹${metrics.investmentCapacity.toLocaleString("en-IN")}** as follows:
${targetAllocationText}

### Risk & Diversification Factors
* **Market Exposure**: Equities (domestic and international) provide growth but bring volatility. Diversify across index tracking funds.
* **Inflation Hedge**: Gold and commodities provide security during high inflation periods.
* **Liquidity Maintenance**: Keep cash equivalents available to avoid premature redemption of compounding assets.

### Actionable Next Steps
1. **Setup Auto-Investments**: Setup auto-debit plans (SIPs) for your target mutual funds or index ETFs at the beginning of each month.
2. **Review Annually**: Rebalance target allocations if market movements cause shifts greater than 5%.
3. **Build Buffer**: Confirm that you have 3 to 6 months of living expenses saved in your primary account before scaling risk investments.

*(Note: Structured fallback generated due to temporary AI service rate limits)*`;
    }

    const profileData: Record<string, any> = { riskProfile };
    const availableColumns = await getAvailableInvestmentProfileColumns();

    if (availableColumns.has("age") && riskProfile) {
      profileData.age = riskProfile.age;
    }
    if (availableColumns.has("riskTolerance") && riskProfile) {
      profileData.riskTolerance = riskProfile.riskTolerance;
    }
    if (availableColumns.has("investmentHorizon") && riskProfile) {
      profileData.investmentHorizon = riskProfile.investmentHorizon;
    }
    if (availableColumns.has("experience") && riskProfile) {
      profileData.experience = riskProfile.experience;
    }
    if (availableColumns.has("monthlyInvestmentBudget") && riskProfile) {
      profileData.monthlyInvestmentBudget = riskProfile.monthlyInvestmentBudget;
    }
    if (availableColumns.has("monthlyIncome") && riskProfile) {
      profileData.monthlyIncome = riskProfile.monthlyIncome;
    }
    if (availableColumns.has("monthlyExpenses") && riskProfile) {
      profileData.monthlyExpenses = riskProfile.monthlyExpenses;
    }
    if (availableColumns.has("financialGoals") && riskProfile) {
      profileData.financialGoals = riskProfile.financialGoals;
    }
    if (availableColumns.has("completedAt") && riskProfile) {
      profileData.completedAt = riskProfile.completedAt ? new Date(riskProfile.completedAt) : null;
    }

    await db.investmentProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...profileData,
        metrics,
        insights,
        allocation,
        marketData,
        analysis: aiAnalysis,
      },
      update: {
        ...profileData,
        metrics,
        insights,
        allocation,
        marketData,
        analysis: aiAnalysis,
      },
    });

    return NextResponse.json({
      success: true,
      metrics,
      insights,
      allocation,
      marketData,
      analysis: aiAnalysis,
    });
  } catch (error) {
    console.error("[Investment Analyze] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze" },
      { status: 500 }
    );
  }
}
