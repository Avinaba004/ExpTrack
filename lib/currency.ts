/**
 * Currency conversion utilities
 * 
 * Exchange rates against INR (base currency for this application)
 * These are approximate rates - in production, you'd use a real exchange rate API
 */

export const EXCHANGE_RATES: Record<string, number> = {
  INR: 1, // Base currency
  USD: 83.2,
  EUR: 90.5,
  GBP: 104.8,
  JPY: 0.56,
  AUD: 54.5,
  CAD: 61.2,
  CHF: 93.8,
  CNY: 11.5,
  AED: 22.65,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "¥",
  AED: "د.إ",
};

export const CURRENCY_NAMES: Record<string, string> = {
  INR: "Indian Rupee",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  AED: "UAE Dirham",
};

/**
 * Convert amount from one currency to another
 * Assumes all amounts in the database are stored in INR
 * 
 * @param amount - Amount to convert (in INR)
 * @param targetCurrency - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  targetCurrency: string
): number {
  if (targetCurrency === "INR") {
    return amount;
  }

  const rate = EXCHANGE_RATES[targetCurrency];
  if (!rate) {
    console.warn(`Unknown currency: ${targetCurrency}, returning original amount`);
    return amount;
  }

  // Convert from INR to target currency
  return amount / rate;
}

/**
 * Format amount with currency symbol
 * 
 * @param amount - Amount in the target currency
 * @param currency - Currency code
 * @returns Formatted string
 */
export function formatCurrencyAmount(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const decimalPlaces = currency === "JPY" ? 0 : 2; // JPY doesn't use decimals
  return `${symbol}${amount.toFixed(decimalPlaces)}`;
}

/**
 * Validate if currency is supported
 */
export function isValidCurrency(currency: string): boolean {
  return currency in EXCHANGE_RATES;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
  return Object.keys(EXCHANGE_RATES).map((code) => ({
    code,
    name: CURRENCY_NAMES[code],
    symbol: CURRENCY_SYMBOLS[code],
  }));
}
