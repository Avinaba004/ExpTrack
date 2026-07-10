import { db } from "@/lib/prisma";

export const investmentProfileExplicitFields = [
    "age",
    "riskTolerance",
    "investmentHorizon",
    "experience",
    "monthlyInvestmentBudget",
    "monthlyIncome",
    "monthlyExpenses",
    "financialGoals",
    "completedAt",
] as const;

let cachedInvestmentProfileColumns: Set<string> | null = null;

export async function getAvailableInvestmentProfileColumns() {
    if (cachedInvestmentProfileColumns) {
        return cachedInvestmentProfileColumns;
    }

    const inClause = investmentProfileExplicitFields.map((field) => `'${field}'`).join(", ");
    const rows = await db.$queryRawUnsafe(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_name = 'investment_profiles'
           AND column_name IN (${inClause})`
    ) as Array<{ column_name: string }>;

    cachedInvestmentProfileColumns = new Set(rows.map((row) => row.column_name));
    return cachedInvestmentProfileColumns;
}
