-- CreateTable
CREATE TABLE "investment_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riskProfile" JSONB,
    "metrics" JSONB,
    "insights" JSONB,
    "allocation" JSONB,
    "marketData" JSONB,
    "analysis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "investment_profiles_userId_key" ON "investment_profiles"("userId");

-- AddForeignKey
ALTER TABLE "investment_profiles"
ADD CONSTRAINT "investment_profiles_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
