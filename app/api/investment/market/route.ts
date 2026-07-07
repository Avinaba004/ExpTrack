import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchAllMarketData } from "@/features/investment/services/marketDataService";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketData = await fetchAllMarketData();
    
    return NextResponse.json({
      success: true,
      data: marketData,
    });
  } catch (error) {
    console.error("[Market Data Route] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
