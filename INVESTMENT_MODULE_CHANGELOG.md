# Scalable AI Investment Guidance Module

A comprehensive, production-ready AI investment guidance system has been integrated natively into the existing ExpTrack application. This module extends the app's capabilities by analyzing existing user financial data and live market context to provide personalized investment recommendations—all without altering the database schema.

---

## 🌟 Key Features Added

### 1. Personalized AI Investment Analysis
- **AI Recommendation Engine**: Uses Google Gemini to generate educational financial planning advice based on the user's specific context.
- **Dynamic Asset Allocation**: Calculates a tailored portfolio breakdown (e.g., NIFTY Index Funds, PPF, Gold) based on the user's age, risk tolerance, investment horizon, and disposable income.
- **Smart Financial Insights**: Programmatically generated metrics explaining the user's savings rate, budget efficiency, and emergency fund readiness before AI processing.
- **What-If Simulator**: Interactive sliders allowing users to instantly project how changes in their income, expenses, or savings rate will impact their investment capacity and AI recommendations.

### 2. Live Market Data Orchestration
- Built a provider-based abstraction layer (`MarketDataService`) to fetch data safely and in parallel without blocking the UI.
- **Supported Providers**:
  - **Yahoo Finance (RapidAPI)** for stock indices (NIFTY 50, SENSEX).
  - **MFAPI** for Indian mutual fund NAVs (no API key required).
  - **GoldAPI** for live commodity pricing.
  - **NewsAPI** for current financial news.
- **Robust Caching & Fallbacks**: Features server-side in-memory caching to avoid rate limits and graceful degradation if a provider fails or keys are missing.

### 3. Dedicated Investment UI
- **Investment Dashboard (`/investment`)**: 
  - Real-time **Financial Health Score** animated gauge.
  - Interactive **Recharts Donut Chart** visualizing the recommended portfolio mix.
  - Side-panel highlighting live market activity (Indices, Gold, MF NAVs).
- **Investment Options Comparison (`/investment/compare`)**:
  - A clean, detailed table comparing popular Indian investment vehicles (PPF, NPS, ETFs, Fixed Deposits) by expected return, risk, lock-in period, and tax benefits.
- **AI Investment Chat (`/investment/chat`)**:
  - A specialized conversational assistant dedicated to investment questions. It secretly injects the user's live financial context and market data into the AI prompt to ensure hyper-personalized, accurate answers.

### 4. Zero-Schema Database Strategy
- **Risk Profile Questionnaire**: Since database schema changes were prohibited, user risk profiles (age, tolerance, experience) are captured via a beautiful 3-step modal and persisted securely using localized `localStorage` mapped to the user's Clerk ID.
- **Data Re-Use**: Fetches transaction histories, budgets, and account balances directly from the existing Supabase instance to calculate disposable income and savings rate in real-time.

---

## 📂 Architecture & File Structure

The implementation follows Clean Architecture principles, completely contained within a new feature module folder:

```text
app/(main)/investment/               # Next.js Pages & Routing
  ├── page.tsx                       # Main Dashboard Page
  ├── chat/page.tsx                  # Dedicated AI Chat Page
  └── compare/page.tsx               # Investment Comparison Page

app/api/investment/                  # Server-Side API Routes
  ├── analyze/route.ts               # Core AI analysis endpoint
  ├── chat/route.ts                  # Context-enriched Gemini chat endpoint
  └── market/route.ts                # Client-facing market data proxy

features/investment/                 # Self-contained Feature Module
  ├── components/                    # Reusable UI Components
  │     ├── InvestmentDashboard.tsx
  │     ├── FinancialHealthCard.tsx
  │     ├── AssetAllocationChart.tsx
  │     ├── RiskProfileQuestionnaire.tsx
  │     ├── SmartInsights.tsx
  │     ├── WhatIfSimulator.tsx
  │     ├── InvestmentChat.tsx
  │     ├── InvestmentComparison.tsx
  │     └── MarketHighlights.tsx
  ├── hooks/                         # Custom React Hooks
  │     ├── useRiskProfile.ts        # Syncs questionnaire to localStorage
  │     ├── useInvestmentAnalysis.ts # Manages /analyze AI fetching state
  │     └── useMarketData.ts         # Manages /market data fetching state
  ├── services/                      # Core Business Logic & Abstractions
  │     ├── assetAllocator.ts        # Rule-based portfolio generation
  │     ├── financialCalculator.ts   # Pure functions for health metrics
  │     ├── marketDataService.ts     # Multi-provider fetching & caching
  │     └── promptBuilder.ts         # Structures the exact JSON context for Gemini
  └── types/                         # Shared TypeScript Interfaces
        └── index.ts                 # Full type safety for all models
```

---

## 🔒 Security & Performance
- **Server-Side AI execution**: Gemini is only invoked securely from `app/api/` routes.
- **Clerk Authentication Protection**: Investment endpoints verify user sessions before executing Prisma queries.
- **Tailwind Native Loading States**: Refactored away from missing Shadcn UI `Skeleton` components in favor of robust, zero-dependency Tailwind CSS `animate-pulse` utilities to ensure immediate build success.
- **Modular Data Fetching**: Market data is fetched independently from AI analysis to prevent cascading UI blockages.

---

## ⚙️ Environment Configuration

To unlock full live market data, add the following to your `.env`:

```env
# Existing
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key

# Optional: Unlocks live stock indices
RAPIDAPI_KEY=your_rapidapi_key

# Optional: Unlocks live gold prices
GOLD_API_KEY=your_gold_key

# Optional: Unlocks financial news
NEWS_API_KEY=your_newsapi_key
```
*(If omitted, the system gracefully falls back and informs the AI that live data is currently unavailable).*
