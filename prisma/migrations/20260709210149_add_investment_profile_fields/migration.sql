-- AlterTable
ALTER TABLE "investment_profiles" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "financialGoals" JSONB,
ADD COLUMN     "investmentHorizon" TEXT,
ADD COLUMN     "monthlyExpenses" INTEGER,
ADD COLUMN     "monthlyIncome" INTEGER,
ADD COLUMN     "monthlyInvestmentBudget" INTEGER,
ADD COLUMN     "riskTolerance" TEXT;
