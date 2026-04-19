import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Update user's preferred currency
 * POST /api/user/currency
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { currency } = body;

    if (!currency || typeof currency !== "string" || currency.length === 0) {
      return NextResponse.json(
        { error: "Invalid currency" },
        { status: 400 }
      );
    }

    // Validate currency code (ISO 4217)
    const validCurrencies = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "AED"];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      return NextResponse.json(
        { error: `Currency not supported. Supported: ${validCurrencies.join(", ")}` },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { clerkUserId: userId },
      data: { currency: currency.toUpperCase() },
      select: { 
        id: true, 
        email: true, 
        name: true,
        currency: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Currency updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update currency error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update currency";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Get user's preferred currency
 * GET /api/user/currency
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { currency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      currency: user.currency,
      supportedCurrencies: ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "AED"],
    });
  } catch (error) {
    console.error("Get currency error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get currency";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
