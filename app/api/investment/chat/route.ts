import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateFinancialMetrics, generateSmartInsights } from "@/features/investment/services/financialCalculator";
import { generateAssetAllocation } from "@/features/investment/services/assetAllocator";
import { buildInvestmentChatPrompt } from "@/features/investment/services/promptBuilder";
import { fetchAllMarketData } from "@/features/investment/services/marketDataService";
import type { RiskProfile } from "@/features/investment/types";

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
    const { question, history = [], riskProfile = null } = body as {
      question: string;
      history?: Array<{ role: "user" | "model"; content: string }>;
      riskProfile?: RiskProfile | null;
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // 1. Fetch ALL historical transactions (no date cap) so AI can answer yearly/monthly questions
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      orderBy: { date: "desc" },
    });

    // Compute per-month and year-to-date summaries for the prompt
    const now = new Date();
    const currentYear = now.getFullYear();

    // Helper: group transactions by YYYY-MM
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
      const amt = typeof t.amount === "object" && (t.amount as any).toNumber ? (t.amount as any).toNumber() : Number(t.amount);
      if (t.type === "INCOME") monthlyMap[key].income += amt;
      else monthlyMap[key].expense += amt;
    }

    // Year-to-date totals for current year
    const ytdEntries = Object.entries(monthlyMap).filter(([k]) => k.startsWith(String(currentYear)));
    const ytdIncome = ytdEntries.reduce((s, [, v]) => s + v.income, 0);
    const ytdExpense = ytdEntries.reduce((s, [, v]) => s + v.expense, 0);
    const ytdSavings = ytdIncome - ytdExpense;

    // Last 12 months breakdown for the AI
    const last12Months = Object.entries(monthlyMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12)
      .map(([month, { income, expense }]) => ({
        month,
        income: Math.round(income),
        expense: Math.round(expense),
        savings: Math.round(income - expense),
      }));

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

    const budget = await db.budget.findUnique({ where: { userId: user.id } });
    const serializedBudget = budget
      ? { amount: typeof budget.amount === "object" && (budget.amount as any).toNumber ? (budget.amount as any).toNumber() : Number(budget.amount) }
      : null;

    // 2. Calculate metrics
    const metrics = calculateFinancialMetrics(serializedTx, serializedAccounts, serializedBudget, 3, activeAccountId);
    const insights = generateSmartInsights(metrics);
    const allocation = generateAssetAllocation(riskProfile, metrics);

    // 3. Market data
    const marketData = await fetchAllMarketData();

    // 4. Build context-rich prompt and call Gemini
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "AI service not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env",
      });
    }

    const historicalContext = {
      ytdIncome: Math.round(ytdIncome),
      ytdExpense: Math.round(ytdExpense),
      ytdSavings: Math.round(ytdSavings),
      currentYear,
      last12Months,
    };

    const systemPrompt = buildInvestmentChatPrompt(metrics, riskProfile, marketData, allocation, insights, historicalContext);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    // Build chat history (convert "assistant" role to "model" for Gemini)
    const geminiHistory = history.slice(-10).map((h) => ({
      role: h.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: h.content }],
    }));

    let answer = "";
    try {
      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessage(question);
      const response = await result.response;
      answer = response.text();
    } catch (apiError) {
      console.warn("Investment chat Gemini call failed, returning fallback:", apiError);
      answer = `*(Running in local fallback mode because the Gemini API free-tier daily quota of 20 requests has been exceeded)*
      
Hello! Although the Google Gemini API is currently rate-limited, I can still analyze your finances locally using your data:

* **Risk Tolerance Profile**: **${riskProfile?.riskTolerance || "Moderate"}**
* **Monthly Savings Capacity**: **₹${metrics.monthlySavings.toLocaleString("en-IN")}**
* **Target Allocations**: We recommend allocating to Equities (${allocation[0]?.percentage || 45}%) and Debt (${allocation[1]?.percentage || 25}%).
* Please try again shortly once your Google Gemini quota resets!`;
    }

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("[Investment Chat] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    );
  }
}
