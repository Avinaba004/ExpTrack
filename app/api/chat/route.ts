import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { convertCurrency, formatCurrencyAmount } from "@/lib/currency";

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

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid request: 'question' field is required" },
        { status: 400 }
      );
    }

    // Parse intent from question
    const intent = parseIntent(question);

    // Get user's preferred currency
    const userCurrency = user.currency || "INR";

    // Handle based on intent type
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
      answer,
      intent: intent.type,
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
    message: "Chat API is running (Rule-based, no AI/LLM)",
    endpoint: "/api/chat",
    method: "POST",
    body: {
      question: "string (required)",
    },
    examples: [
      "How much did I spend this month?",
      "How much on food this month?",
      "What's my highest spending category?",
      "Did I spend more than last month?",
      "How much income did I have?",      "What did I spend in December 2025?",
      "How much on food in November?",
      "What was my spending in January 2025?",    ],
  });
}
