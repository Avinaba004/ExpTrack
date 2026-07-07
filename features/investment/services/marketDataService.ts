// ============================================
// MARKET DATA SERVICE — Provider orchestrator with caching
// ============================================

import type { MarketData, MarketIndex, MutualFundData, GoldPrice, NewsArticle, CacheEntry } from "../types";

// ─── In-memory cache ──────────────────────────────
const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

// ─── TTLs ─────────────────────────────────────────
const TTL = {
  STOCKS: 5 * 60 * 1000,       // 5 minutes
  GOLD: 10 * 60 * 1000,        // 10 minutes
  MUTUAL_FUNDS: 30 * 60 * 1000, // 30 minutes
  NEWS: 30 * 60 * 1000,        // 30 minutes
};

// ═══════════════════════════════════════════════════
// PROVIDER: Yahoo Finance (RapidAPI)
// ═══════════════════════════════════════════════════

async function fetchYahooFinance(): Promise<{ indices: MarketIndex[] }> {
  const cached = getCached<{ indices: MarketIndex[] }>("yahoo");
  if (cached) return cached;

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn("[MarketData] RAPIDAPI_KEY not set, skipping Yahoo Finance");
    return { indices: [] };
  }

  try {
    // Fetch NIFTY 50 and SENSEX
    const symbols = ["^NSEI", "^BSESN"];
    const indices: MarketIndex[] = [];

    for (const symbol of symbols) {
      const res = await fetch(
        `https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes?region=IN&symbols=${symbol}`,
        {
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
          },
          next: { revalidate: 300 },
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const quote = data?.quoteResponse?.result?.[0];
      if (quote) {
        indices.push({
          name: quote.shortName || symbol,
          symbol: symbol,
          value: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          lastUpdated: new Date().toISOString(),
        });
      }
    }

    const result = { indices };
    setCache("yahoo", result, TTL.STOCKS);
    return result;
  } catch (err) {
    console.error("[MarketData] Yahoo Finance error:", err);
    return { indices: [] };
  }
}

// ═══════════════════════════════════════════════════
// PROVIDER: MFAPI (Indian Mutual Funds — no key needed)
// ═══════════════════════════════════════════════════

// Popular scheme codes for illustration
const POPULAR_SCHEMES = [
  { code: 119551, name: "HDFC Index Fund NIFTY 50" },
  { code: 120503, name: "SBI Blue Chip Fund" },
  { code: 118989, name: "Axis Long Term Equity Fund" },
  { code: 100356, name: "ICICI Pru Balanced Advantage" },
  { code: 119028, name: "Mirae Asset Large Cap Fund" },
];

async function fetchMutualFunds(): Promise<{ mutualFunds: MutualFundData[] }> {
  const cached = getCached<{ mutualFunds: MutualFundData[] }>("mfapi");
  if (cached) return cached;

  try {
    const funds: MutualFundData[] = [];

    // Fetch NAV for each scheme (parallel with timeout)
    const promises = POPULAR_SCHEMES.map(async (scheme) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`https://api.mfapi.in/mf/${scheme.code}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) return null;
        const data = await res.json();
        const latest = data?.data?.[0];
        if (latest) {
          return {
            schemeCode: scheme.code,
            schemeName: data.meta?.scheme_name || scheme.name,
            nav: parseFloat(latest.nav),
            date: latest.date,
            category: data.meta?.scheme_category,
          };
        }
        return null;
      } catch {
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value) funds.push(r.value);
    });

    const result = { mutualFunds: funds };
    setCache("mfapi", result, TTL.MUTUAL_FUNDS);
    return result;
  } catch (err) {
    console.error("[MarketData] MFAPI error:", err);
    return { mutualFunds: [] };
  }
}

// ═══════════════════════════════════════════════════
// PROVIDER: GoldAPI
// ═══════════════════════════════════════════════════

async function fetchGoldPrice(): Promise<{ gold: GoldPrice | null }> {
  const cached = getCached<{ gold: GoldPrice | null }>("gold");
  if (cached) return cached;

  const apiKey = process.env.GOLD_API_KEY;
  if (!apiKey) {
    console.warn("[MarketData] GOLD_API_KEY not set, skipping gold prices");
    return { gold: null };
  }

  try {
    const res = await fetch("https://www.goldapi.io/api/XAU/INR", {
      headers: {
        "x-access-token": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("[MarketData] GoldAPI returned", res.status);
      return { gold: null };
    }

    const data = await res.json();
    const pricePerOunce = data.price || 0;
    const pricePerGram = pricePerOunce / 31.1035; // Troy ounce to gram

    const gold: GoldPrice = {
      pricePerGram: Math.round(pricePerGram),
      pricePerOunce: Math.round(pricePerOunce),
      change24h: data.ch || 0,
      changePercent24h: data.chp || 0,
      lastUpdated: new Date().toISOString(),
    };

    const result = { gold };
    setCache("gold", result, TTL.GOLD);
    return result;
  } catch (err) {
    console.error("[MarketData] GoldAPI error:", err);
    return { gold: null };
  }
}

// ═══════════════════════════════════════════════════
// PROVIDER: NewsAPI
// ═══════════════════════════════════════════════════

async function fetchFinancialNews(): Promise<{ news: NewsArticle[] }> {
  const cached = getCached<{ news: NewsArticle[] }>("news");
  if (cached) return cached;

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.warn("[MarketData] NEWS_API_KEY not set, skipping news");
    return { news: [] };
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&category=business&pageSize=5&apiKey=${apiKey}`
    );

    if (!res.ok) {
      console.error("[MarketData] NewsAPI returned", res.status);
      return { news: [] };
    }

    const data = await res.json();
    const news: NewsArticle[] = (data.articles || []).map((a: any) => ({
      title: a.title || "",
      description: a.description || "",
      url: a.url || "",
      source: a.source?.name || "Unknown",
      publishedAt: a.publishedAt || "",
      imageUrl: a.urlToImage || undefined,
    }));

    const result = { news };
    setCache("news", result, TTL.NEWS);
    return result;
  } catch (err) {
    console.error("[MarketData] NewsAPI error:", err);
    return { news: [] };
  }
}

// ═══════════════════════════════════════════════════
// ORCHESTRATOR — Fetches all providers in parallel
// ═══════════════════════════════════════════════════

export async function fetchAllMarketData(): Promise<MarketData> {
  const available: string[] = [];
  const unavailable: string[] = [];

  // Run all providers in parallel
  const [yahoo, mf, gold, news] = await Promise.allSettled([
    fetchYahooFinance(),
    fetchMutualFunds(),
    fetchGoldPrice(),
    fetchFinancialNews(),
  ]);

  // Process results
  let indices: MarketIndex[] = [];
  if (yahoo.status === "fulfilled" && yahoo.value.indices.length > 0) {
    indices = yahoo.value.indices;
    available.push("YahooFinance");
  } else {
    unavailable.push("YahooFinance");
    // Fallback Indian stock market indices
    indices = [
      {
        name: "NIFTY 50",
        symbol: "^NSEI",
        value: 24320.50,
        change: 120.45,
        changePercent: 0.50,
        lastUpdated: new Date().toISOString(),
      },
      {
        name: "SENSEX",
        symbol: "^BSESN",
        value: 79960.30,
        change: 410.80,
        changePercent: 0.52,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  let mutualFunds: MutualFundData[] = [];
  if (mf.status === "fulfilled" && mf.value.mutualFunds.length > 0) {
    mutualFunds = mf.value.mutualFunds;
    available.push("MFAPI");
  } else {
    unavailable.push("MFAPI");
    // Fallback Indian mutual fund NAVs
    mutualFunds = [
      {
        schemeCode: 120503,
        schemeName: "SBI Blue Chip Fund - Direct",
        nav: 84.25,
        date: "Today",
        category: "Equity - Large Cap",
      },
      {
        schemeCode: 119551,
        schemeName: "HDFC Index Fund NIFTY 50",
        nav: 215.10,
        date: "Today",
        category: "Equity - Index Fund",
      },
      {
        schemeCode: 118989,
        schemeName: "Axis Long Term Equity Fund",
        nav: 105.80,
        date: "Today",
        category: "Equity - ELSS",
      },
    ];
  }

  let goldData: GoldPrice | null = null;
  if (gold.status === "fulfilled" && gold.value.gold) {
    goldData = gold.value.gold;
    available.push("GoldAPI");
  } else {
    unavailable.push("GoldAPI");
    // Fallback gold prices per gram in INR
    goldData = {
      pricePerGram: 7250,
      pricePerOunce: 225480,
      change24h: 35,
      changePercent24h: 0.48,
      lastUpdated: new Date().toISOString(),
    };
  }

  let newsArticles: NewsArticle[] = [];
  if (news.status === "fulfilled" && news.value.news.length > 0) {
    newsArticles = news.value.news;
    available.push("NewsAPI");
  } else {
    unavailable.push("NewsAPI");
    // Fallback Indian financial news stories
    newsArticles = [
      {
        title: "India Retail Inflation Drops below RBI Threshold",
        description: "Retail price inflation in India cooled to a multi-month low, easing pressure on monetary policy.",
        url: "https://economictimes.indiatimes.com",
        source: "Economic Times",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "FII Inflows Drive Sensex and Nifty to All-Time Highs",
        description: "Robust domestic institutional backing and foreign portfolio investor interest spark rally.",
        url: "https://www.moneycontrol.com",
        source: "Moneycontrol",
        publishedAt: new Date().toISOString(),
      }
    ];
  }

  return {
    indices,
    mutualFunds,
    gold: goldData,
    news: newsArticles,
    availableProviders: available,
    unavailableProviders: unavailable,
    lastUpdated: new Date().toISOString(),
  };
}
