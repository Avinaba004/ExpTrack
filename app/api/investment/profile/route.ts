import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { getAvailableInvestmentProfileColumns, investmentProfileExplicitFields } from "../investmentProfileSchema";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!loggedInUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const availableColumns = await getAvailableInvestmentProfileColumns();
        const selectFields: Record<string, boolean> = {
            riskProfile: true,
            analysis: true,
            metrics: true,
            insights: true,
            allocation: true,
            marketData: true,
        };

        for (const field of investmentProfileExplicitFields) {
            if (availableColumns.has(field)) {
                selectFields[field] = true;
            }
        }

        const investmentProfile = await db.investmentProfile.findUnique({
            where: { userId: loggedInUser.id },
            select: selectFields,
        });

        const profile = investmentProfile?.riskProfile
            ? investmentProfile.riskProfile
            : investmentProfile
                ? {
                    age: availableColumns.has("age") ? investmentProfile.age : undefined,
                    riskTolerance: availableColumns.has("riskTolerance") ? investmentProfile.riskTolerance : undefined,
                    investmentHorizon: availableColumns.has("investmentHorizon") ? investmentProfile.investmentHorizon : undefined,
                    experience: availableColumns.has("experience") ? investmentProfile.experience : undefined,
                    monthlyInvestmentBudget: availableColumns.has("monthlyInvestmentBudget") ? investmentProfile.monthlyInvestmentBudget : undefined,
                    monthlyIncome: availableColumns.has("monthlyIncome") ? investmentProfile.monthlyIncome : undefined,
                    monthlyExpenses: availableColumns.has("monthlyExpenses") ? investmentProfile.monthlyExpenses : undefined,
                    financialGoals: availableColumns.has("financialGoals") ? investmentProfile.financialGoals : undefined,
                    completedAt: availableColumns.has("completedAt") && investmentProfile.completedAt ? investmentProfile.completedAt.toISOString() : undefined,
                }
                : null;

        return NextResponse.json({
            success: true,
            profile,
            storedAnalysis:
                investmentProfile && investmentProfile.analysis
                    ? {
                        success: true,
                        analysis: investmentProfile.analysis,
                        metrics: investmentProfile.metrics,
                        insights: investmentProfile.insights,
                        allocation: investmentProfile.allocation,
                        marketData: investmentProfile.marketData,
                    }
                    : null,
        });
    } catch (error) {
        console.error("[Investment Profile Route] Error:", error);
        return NextResponse.json(
            { error: "Failed to load investment profile" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!loggedInUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const riskProfile = body.riskProfile ?? null;

        if (!riskProfile) {
            return NextResponse.json({ error: "Risk profile is required" }, { status: 400 });
        }

        const availableColumns = await getAvailableInvestmentProfileColumns();

        const createPayload: Record<string, any> = {
            userId: loggedInUser.id,
            riskProfile,
            analysis: null,
        };
        const updatePayload: Record<string, any> = {
            riskProfile,
            analysis: null,
        };

        if (availableColumns.has("age")) {
            createPayload.age = riskProfile.age;
            updatePayload.age = riskProfile.age;
        }
        if (availableColumns.has("riskTolerance")) {
            createPayload.riskTolerance = riskProfile.riskTolerance;
            updatePayload.riskTolerance = riskProfile.riskTolerance;
        }
        if (availableColumns.has("investmentHorizon")) {
            createPayload.investmentHorizon = riskProfile.investmentHorizon;
            updatePayload.investmentHorizon = riskProfile.investmentHorizon;
        }
        if (availableColumns.has("experience")) {
            createPayload.experience = riskProfile.experience;
            updatePayload.experience = riskProfile.experience;
        }
        if (availableColumns.has("monthlyInvestmentBudget")) {
            createPayload.monthlyInvestmentBudget = riskProfile.monthlyInvestmentBudget;
            updatePayload.monthlyInvestmentBudget = riskProfile.monthlyInvestmentBudget;
        }
        if (availableColumns.has("monthlyIncome")) {
            createPayload.monthlyIncome = riskProfile.monthlyIncome;
            updatePayload.monthlyIncome = riskProfile.monthlyIncome;
        }
        if (availableColumns.has("monthlyExpenses")) {
            createPayload.monthlyExpenses = riskProfile.monthlyExpenses;
            updatePayload.monthlyExpenses = riskProfile.monthlyExpenses;
        }
        if (availableColumns.has("financialGoals")) {
            createPayload.financialGoals = riskProfile.financialGoals;
            updatePayload.financialGoals = riskProfile.financialGoals;
        }
        if (availableColumns.has("completedAt")) {
            createPayload.completedAt = riskProfile.completedAt ? new Date(riskProfile.completedAt) : null;
            updatePayload.completedAt = riskProfile.completedAt ? new Date(riskProfile.completedAt) : null;
        }

        const updatedProfile = await db.investmentProfile.upsert({
            where: { userId: loggedInUser.id },
            create: createPayload,
            update: updatePayload,
        });

        return NextResponse.json({
            success: true,
            profile: updatedProfile.riskProfile,
        });
    } catch (error) {
        console.error("[Investment Profile Route] Error:", error);
        return NextResponse.json(
            { error: "Failed to save investment profile" },
            { status: 500 }
        );
    }
}
