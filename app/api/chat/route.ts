import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { convertCurrency, formatCurrencyAmount } from "@/lib/currency";
import { GoogleGenerativeAI } from "@google/generative-ai";


// ============================================
// TYPE DEFINITIONS
// ============================================

interface ParsedIntent {
  type: "spending" | "income" | "category" | "comparison" | "insight" | "unknown";
  category: string | null;
  timeRange: "day" | "week" | "month" | "year" | "all" | "specific";
  period: "current" | "previous" | "all";
  specificDate?: {
    month: number; // 0-11
    year: number;
  };
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate date range based on time range type
 */
function calculateDateRange(timeRange: "day" | "week" | "month" | "year" | "all" | "specific", specificDate?: { month: number; year: number }): DateRange {
  // Handle specific month/year
  if (timeRange === "specific" && specificDate) {
    const startDate = new Date(specificDate.year, specificDate.month, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(specificDate.year, specificDate.month + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  let startDate: Date;

  switch (timeRange) {
    case "day":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;

    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "all":
      startDate = new Date("2000-01-01");
      break;

    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate };
}

/**
 * Get previous period date range (for comparisons)
 */
function getPreviousPeriodRange(timeRange: "day" | "week" | "month" | "year"): DateRange {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (timeRange) {
    case "day":
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "week":
      endDate = new Date(now);
      endDate.setDate(now.getDate() - now.getDay() - 1);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "month":
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "year":
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;

    default:
      return calculateDateRange("month");
  }

  return { startDate, endDate };
}

/**
 * Detect user intent from question
 */
function parseIntent(question: string): ParsedIntent {
  const q = question.toLowerCase();

  // Check for specific date (December 2025, etc.)
  const specificDate = parseSpecificDate(question);
  if (specificDate) {
    // Determine intent type
    let type: ParsedIntent["type"] = "spending";
    if (q.includes("income") || q.includes("earned")) {
      type = "income";
    }

    return {
      type,
      category: null,
      timeRange: "specific",
      period: "current",
      specificDate,
    };
  }

  // Detect category
  const categoryMap: Record<string, string> = {
    food: "Food",
    eating: "Food",
    restaurant: "Food",
    grocery: "Food",
    groceries: "Food",
    travel: "Travel",
    flight: "Travel",
    hotel: "Travel",
    taxi: "Travel",
    uber: "Travel",
    transport: "Travel",
    entertainment: "Entertainment",
    movie: "Entertainment",
    netflix: "Entertainment",
    spotify: "Entertainment",
    game: "Entertainment",
    shopping: "Shopping",
    amazon: "Shopping",
    mall: "Shopping",
    utilities: "Utilities",
    electricity: "Utilities",
    internet: "Utilities",
    bill: "Utilities",
    health: "Health",
    medical: "Health",
    doctor: "Health",
    gym: "Health",
    education: "Education",
    tuition: "Education",
    course: "Education",
    book: "Education",
  };

  let detectedCategory: string | null = null;
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (q.includes(keyword)) {
      detectedCategory = category;
      break;
    }
  }

  // Detect time range
  let timeRange: "day" | "week" | "month" | "year" | "all" = "month";
  if (q.includes("today") || q.includes("this day")) {
    timeRange = "day";
  } else if (q.includes("this week") || q.includes(" week")) {
    timeRange = "week";
  } else if (q.includes("this year") || q.includes(" year")) {
    timeRange = "year";
  } else if (q.includes("all time") || q.includes("overall")) {
    timeRange = "all";
  }

  // Detect intent type
  let type: ParsedIntent["type"] = "spending";

  if (
    q.includes("income") ||
    q.includes("earned") ||
    q.includes("earning")
  ) {
    type = "income";
  } else if (
    q.includes("compared") ||
    q.includes("vs") ||
    q.includes("than last") ||
    q.includes("more than") ||
    q.includes("less than")
  ) {
    type = "comparison";
  } else if (
    q.includes("where") ||
    q.includes("most") ||
    q.includes("highest") ||
    q.includes("biggest") ||
    q.includes("largest")
  ) {
    type = "insight";
  } else if (
    q.includes("spend") ||
    q.includes("spending") ||
    q.includes("spent")
  ) {
    type = "spending";
  } else {
    type = "unknown";
  }

  return {
    type,
    category: detectedCategory,
    timeRange,
    period: "current",
  };
}

/**
 * Convert Decimal to number safely
 */
function toNumber(value: any): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return Number(value) || 0;
}

/**
 * Format currency for display based on user's preference
 */
function formatCurrency(amount: number, currency: string): string {
  return formatCurrencyAmount(amount, currency);
}

/**
 * Parse specific month/year from question
 */
function parseSpecificDate(question: string): { month: number; year: number } | null {
  const q = question.toLowerCase();

  // Month names mapping
  const months: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sept: 8, sep: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  };

  // Current year for context
  const currentYear = new Date().getFullYear();

  // Try to match "Month Year" or "Month" patterns
  for (const [monthName, monthNum] of Object.entries(months)) {
    if (q.includes(monthName)) {
      // Look for year after month
      const yearMatch = question.match(new RegExp(monthName + "\\s+(\\d{4})", "i"));
      if (yearMatch) {
        return {
          month: monthNum,
          year: parseInt(yearMatch[1]),
        };
      }

      // If no year specified, try to infer from context
      const allYearMatches = question.match(/\b(20\d{2})\b/g);
      if (allYearMatches) {
        return {
          month: monthNum,
          year: parseInt(allYearMatches[allYearMatches.length - 1]),
        };
      }

      // If still no year, default to current year
      return {
        month: monthNum,
        year: currentYear,
      };
    }
  }

  return null;
}

// ============================================
// QUERY HANDLERS
// ============================================

/**
 * Handle spending query
 */
async function handleSpendingQuery(
  userId: string,
  category: string | null,
  timeRange: "day" | "week" | "month" | "year" | "all" | "specific",
  specificDate?: { month: number; year: number },
  userCurrency: string = "INR"
): Promise<string> {
  const { startDate, endDate } = calculateDateRange(timeRange as any, specificDate);

  const filter: any = {
    userId,
    type: "EXPENSE",
    status: "COMPLETED",
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (category) {
    filter.category = {
      contains: category,
      mode: "insensitive",
    };
  }

  const transactions = await db.transaction.findMany({
    where: filter,
    select: { amount: true },
  });

  const totalSpend = transactions.reduce(
    (sum, tx) => sum + toNumber(tx.amount),
    0
  );

  if (totalSpend === 0) {
    const periodText = timeRange === "specific" && specificDate
      ? `in ${new Date(specificDate.year, specificDate.month).toLocaleString("default", { month: "long", year: "numeric" })}`
      : timeRange === "day" ? "today"
      : `this ${timeRange}`;
    const categoryText = category ? ` on ${category}` : "";
    return `You didn't spend anything${categoryText} ${periodText}.`;
  }

  // Convert to user's preferred currency
  const convertedAmount = convertCurrency(totalSpend, userCurrency);

  const periodText = timeRange === "specific" && specificDate
    ? `in ${new Date(specificDate.year, specificDate.month).toLocaleString("default", { month: "long", year: "numeric" })}`
    : timeRange === "day" ? "today"
    : `this ${timeRange}`;
  const categoryText = category ? ` on ${category}` : "";
  return `You spent ${formatCurrency(convertedAmount, userCurrency)}${categoryText} ${periodText}`;
}

/**
 * Handle income query
 */
async function handleIncomeQuery(
  userId: string,
  timeRange: "day" | "week" | "month" | "year" | "all" | "specific",
  specificDate?: { month: number; year: number },
  userCurrency: string = "INR"
): Promise<string> {
  const { startDate, endDate } = calculateDateRange(timeRange as any, specificDate);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      type: "INCOME",
      status: "COMPLETED",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { amount: true },
  });

  const totalIncome = transactions.reduce(
    (sum, tx) => sum + toNumber(tx.amount),
    0
  );

  if (totalIncome === 0) {
    const periodText = timeRange === "specific" && specificDate
      ? `in ${new Date(specificDate.year, specificDate.month).toLocaleString("default", { month: "long", year: "numeric" })}`
      : timeRange === "day" ? "today"
      : `this ${timeRange}`;
    return `You didn't have any income ${periodText}.`;
  }

  // Convert to user's preferred currency
  const convertedIncome = convertCurrency(totalIncome, userCurrency);

  const periodText = timeRange === "specific" && specificDate
    ? `in ${new Date(specificDate.year, specificDate.month).toLocaleString("default", { month: "long", year: "numeric" })}`
    : timeRange === "day" ? "today"
    : `this ${timeRange}`;
  return `Your income ${periodText} is ${formatCurrency(convertedIncome, userCurrency)}.`;
}

/**
 * Handle comparison query (current vs previous period)
 */
async function handleComparisonQuery(
  userId: string,
  timeRange: "day" | "week" | "month" | "year" | "all" | "specific",
  userCurrency: string = "INR"
): Promise<string> {
  if (timeRange === "all" || timeRange === "specific") {
    return "Can't compare this time period. Please ask about a specific day, week, month, or year.";
  }

  const { startDate: currentStart, endDate: currentEnd } = calculateDateRange(timeRange as "day" | "week" | "month" | "year" | "all");
  const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(timeRange as "day" | "week" | "month" | "year");

  const currentTx = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: { gte: currentStart, lte: currentEnd },
    },
    select: { amount: true },
  });

  const prevTx = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: { gte: prevStart, lte: prevEnd },
    },
    select: { amount: true },
  });

  const currentSpend = currentTx.reduce((sum, tx) => sum + toNumber(tx.amount), 0);
  const prevSpend = prevTx.reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  if (currentSpend === 0 && prevSpend === 0) {
    return "No spending data in either period.";
  }

  // Convert to user's preferred currency
  const convertedCurrentSpend = convertCurrency(currentSpend, userCurrency);
  const convertedPrevSpend = convertCurrency(prevSpend, userCurrency);
  const diff = convertedCurrentSpend - convertedPrevSpend;
  const percentChange = convertedPrevSpend > 0 ? ((diff / convertedPrevSpend) * 100).toFixed(1) : 0;

  if (diff > 0) {
    return `You spent ${formatCurrency(convertedCurrentSpend, userCurrency)} this ${timeRange}, which is ${formatCurrency(Math.abs(diff), userCurrency)} more than last ${timeRange} (+${percentChange}%).`;
  } else if (diff < 0) {
    return `You spent ${formatCurrency(convertedCurrentSpend, userCurrency)} this ${timeRange}, which is ${formatCurrency(Math.abs(diff), userCurrency)} less than last ${timeRange} (${percentChange}%).`;
  } else {
    return `You spent the same this ${timeRange} as last ${timeRange} (${formatCurrency(convertedCurrentSpend, userCurrency)}).`;
  }
}

/**
 * Handle insight query (highest spending category)
 */
async function handleInsightQuery(
  userId: string,
  timeRange: "day" | "week" | "month" | "year" | "all" | "specific",
  specificDate?: { month: number; year: number },
  userCurrency: string = "INR"
): Promise<string> {
  const { startDate, endDate } = calculateDateRange(timeRange as any, specificDate);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      status: "COMPLETED",
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { category: true, amount: true },
  });

  if (transactions.length === 0) {
    return "No spending data available for this period.";
  }

  const categorySpend: Record<string, number> = {};
  transactions.forEach((tx) => {
    categorySpend[tx.category] = (categorySpend[tx.category] || 0) + toNumber(tx.amount);
  });

  const topCategory = Object.entries(categorySpend).sort(
    ([, a], [, b]) => b - a
  )[0];

  // Convert to user's preferred currency
  const convertedCategoryAmount = convertCurrency(topCategory[1], userCurrency);

  const periodText = timeRange === "specific" && specificDate
    ? `in ${new Date(specificDate.year, specificDate.month).toLocaleString("default", { month: "long", year: "numeric" })}`
    : timeRange === "day" ? "today"
    : `this ${timeRange}`;
  return `Your highest spending category ${periodText} is ${topCategory[0]} with ${formatCurrency(convertedCategoryAmount, userCurrency)}.`;
}

// ============================================
// MAIN API HANDLER
// ============================================

/**
 * Fetch transactions based on user query to build a rich context
 */
async function fetchTransactionsForContext(userId: string, question: string) {
  const q = question.toLowerCase();
  const specificDate = parseSpecificDate(question);
  
  // 1. Fetch latest 150 transactions
  const latestTx = await db.transaction.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    orderBy: {
      date: "desc",
    },
    take: 150,
    include: {
      account: true,
    },
  });

  // 2. Fetch specific period transactions if requested
  let specificTx: any[] = [];
  if (specificDate) {
    const { startDate, endDate } = calculateDateRange("specific", specificDate);
    specificTx = await db.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 150,
      include: {
        account: true,
      },
    });
  } else if (q.includes("this month")) {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    specificTx = await db.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        date: { gte: startOfMonth },
      },
      orderBy: { date: "desc" },
      take: 150,
      include: { account: true },
    });
  } else if (q.includes("last month") || q.includes("previous month")) {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    specificTx = await db.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      orderBy: { date: "desc" },
      take: 150,
      include: { account: true },
    });
  } else if (q.includes("this year")) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    specificTx = await db.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        date: { gte: startOfYear },
      },
      orderBy: { date: "desc" },
      take: 200,
      include: { account: true },
    });
  }

  // Merge and deduplicate by ID
  const allTxMap = new Map();
  latestTx.forEach(tx => allTxMap.set(tx.id, tx));
  specificTx.forEach(tx => allTxMap.set(tx.id, tx));

  // Sort merged transactions by date descending
  return Array.from(allTxMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database with accounts
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { question, history } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid request: 'question' field is required" },
        { status: 400 }
      );
    }

    // Parse intent from question (keep for backward compatibility / metrics)
    const intent = parseIntent(question);
    const userCurrency = user.currency || "INR";

    // Check if Gemini API key exists
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set. Falling back to rule-based parser.");
      // Fallback implementation
      let answer: string;
      if (intent.type === "spending") {
        answer = await handleSpendingQuery(user.id, intent.category, intent.timeRange, intent.specificDate, userCurrency);
      } else if (intent.type === "income") {
        answer = await handleIncomeQuery(user.id, intent.timeRange, intent.specificDate, userCurrency);
      } else if (intent.type === "comparison") {
        answer = await handleComparisonQuery(user.id, intent.timeRange, userCurrency);
      } else if (intent.type === "insight") {
        answer = await handleInsightQuery(user.id, intent.timeRange, intent.specificDate, userCurrency);
      } else {
        answer = "Sorry, I couldn't understand your query. Try asking about spending, income, or categories.";
      }
      return NextResponse.json({
        success: true,
        question,
        answer: `${answer} (Note: Running in rule-based fallback mode as Gemini API is not configured)`,
        intent: intent.type,
      });
    }

    // Gemini API integration
    // 1. Fetch user's financial details
    const budget = await db.budget.findUnique({
      where: { userId: user.id },
    });

    const transactions = await fetchTransactionsForContext(user.id, question);

    // Calculate current month's start/end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthName = now.toLocaleString("default", { month: "long" });

    // Aggregate monthly numbers
    const currentMonthIncome = transactions
      .filter(t => t.date >= startOfMonth && t.type === "INCOME")
      .reduce((sum, t) => sum + toNumber(t.amount), 0);
    const currentMonthSpend = transactions
      .filter(t => t.date >= startOfMonth && t.type === "EXPENSE")
      .reduce((sum, t) => sum + toNumber(t.amount), 0);

    // Budget configuration
    const budgetLimit = budget ? toNumber(budget.amount) : 0;
    const budgetContext = budgetLimit > 0
      ? `Budget Limit: ${formatCurrency(budgetLimit, userCurrency)}`
      : "No budget limit configured.";

    // Accounts configuration
    const accountsContext = user.accounts.map((acc: any) =>
      `- ${acc.name} (${acc.type}): Balance ${formatCurrency(toNumber(acc.balance), userCurrency)}`
    ).join("\n") || "No accounts configured.";

    // Category breakdown for current month
    const categorySum: Record<string, number> = {};
    transactions
      .filter(t => t.date >= startOfMonth && t.type === "EXPENSE")
      .forEach(t => {
        categorySum[t.category] = (categorySum[t.category] || 0) + toNumber(t.amount);
      });
    const categoryBreakdownContext = Object.entries(categorySum)
      .map(([cat, amt]) => `- ${cat}: ${formatCurrency(amt, userCurrency)}`)
      .join("\n") || "No spending recorded this month.";

    // Format transactions context (maximum details for LLM context, but keeping it compact)
    const transactionsContext = transactions.map((t: any) => {
      const dateStr = new Date(t.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return `- Date: ${dateStr}, Type: ${t.type}, Amount: ${formatCurrency(toNumber(t.amount), userCurrency)}, Category: ${t.category}, Desc: ${t.description || "N/A"}, Account: ${t.account?.name || "N/A"}`;
    }).join("\n") || "No transactions found.";

    // Create prompt instructions
    const systemPrompt = `You are "Antigravity Financial Assistant", a helpful, friendly, and expert AI-powered personal finance assistant inside the ExpTrack app.
Your goal is to help the user understand their spending, income, account balances, budgets, and overall financial health.

CRITICAL INFORMATION:
- The current local time is: ${now.toString()}.
- The user's preferred currency is: ${userCurrency}.
- Use clean Markdown formatting in your response. When providing breakdowns, comparisons, or tables, structure them in clean Markdown tables (e.g. Columns: Category, Amount, % of Total).
- Use bullet points for list items. Make important numbers bold.

USER FINANCIAL DATA:
Here is the real-time financial data for the user from their database. Use this data as the sole source of truth for their specific financial questions:

1. ACCOUNTS:
${accountsContext}

2. BUDGET:
${budgetContext}

3. MONTHLY SUMMARY (Current Month: ${currentMonthName} ${now.getFullYear()}):
- Total Income: ${formatCurrency(currentMonthIncome, userCurrency)}
- Total Spending: ${formatCurrency(currentMonthSpend, userCurrency)}
- Net Savings: ${formatCurrency(currentMonthIncome - currentMonthSpend, userCurrency)}
- Budget Usage: ${budgetLimit > 0 ? `${((currentMonthSpend / budgetLimit) * 100).toFixed(1)}% of ${formatCurrency(budgetLimit, userCurrency)}` : "No budget set"}

4. CATEGORY BREAKDOWN (Current Month):
${categoryBreakdownContext}

5. RECENT & FILTERED TRANSACTIONS (Up to 300 entries):
${transactionsContext}

INSTRUCTIONS:
1. **Grounded Answers**: When the user asks about their specific expenses, income, balances, budget, or transactions, you MUST base your response strictly on the USER FINANCIAL DATA provided above. If the data is not present or insufficient to answer, state: "I don't have that information in your records." or "You don't have any transaction recorded for that category/period." Do not make up transactions or balances.
2. **General Financial Advice**: If the user asks for general financial advice, savings tips, definitions of financial terms, or generic conversational questions (e.g. "how can I save money?", "hello", "what is inflation?"), answer them using your general intelligence. Be insightful, helpful, and professional.
3. **Format**: Format numbers nicely with the user's preferred currency symbol (${userCurrency}). Use markdown bold, lists, and tables to present details clearly and make it look premium.
4. **Accuracy**: Be extremely precise with math. When calculations are required (e.g. averages, comparisons, percentages), perform them carefully based on the provided data.
5. **Politeness**: Keep a friendly, professional, and encouraging tone. Use financial emojis sparingly to keep the UI clean and readable (e.g. 💰, 📈, 📊, 💳, 🏦).`;

    let answer: string;
    try {
      // Initialize Gemini client and get model
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt,
      });

      // Map history to Gemini API format
      const geminiHistory = (history || []).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // Start chat session with history
      const chat = model.startChat({
        history: geminiHistory,
      });

      const result = await chat.sendMessage(question);
      const response = await result.response;
      answer = response.text();
    } catch (apiError) {
      console.warn("Gemini API call failed, falling back to rule-based responder:", apiError);
      // Fallback implementation
      if (intent.type === "spending") {
        answer = await handleSpendingQuery(user.id, intent.category, intent.timeRange, intent.specificDate, userCurrency);
      } else if (intent.type === "income") {
        answer = await handleIncomeQuery(user.id, intent.timeRange, intent.specificDate, userCurrency);
      } else if (intent.type === "comparison") {
        answer = await handleComparisonQuery(user.id, intent.timeRange, userCurrency);
      } else if (intent.type === "insight") {
        answer = await handleInsightQuery(user.id, intent.timeRange, intent.specificDate, userCurrency);
      } else {
        answer = "I'm currently experiencing high demand. Based on your records, you can ask about your monthly spending, category highlights, or income, and I'll fetch the exact figures from your accounts.";
      }
      answer += "\n\n*(Note: Running in rule-based fallback mode due to AI service rate limits)*";
    }

    return NextResponse.json({
      success: true,
      question,
      answer,
      intent: intent.type,
      context: {
        total_spend: currentMonthSpend,
        total_income: currentMonthIncome,
        net_balance: currentMonthIncome - currentMonthSpend,
        category_breakdown: categorySum,
        budget_limit: budgetLimit,
        currency: userCurrency,
      }
    });

  } catch (error) {
    console.error("Chat API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to process query";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    message: "Chat API is running (Gemini AI-powered)",
    endpoint: "/api/chat",
    method: "POST",
    body: {
      question: "string (required)",
      history: "array (optional, format: [{ role: 'user' | 'assistant', content: 'string' }])"
    },
    examples: [
      "How much did I spend this month?",
      "How much on food this month?",
      "What's my highest spending category?",
      "Did I spend more than last month?",
      "How much income did I have?",
      "What did I spend in December 2025?",
      "How much on food in November?",
      "What was my spending in January 2025?",
    ],
  });
}

