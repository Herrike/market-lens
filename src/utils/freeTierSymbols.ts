// Free tier symbols available for historical data on Financial Modeling Prep
export const FREE_TIER_SYMBOLS = [
  "^GSPC", // S&P 500
  "^DJI", // Dow Jones Industrial Average
  "^IXIC", // NASDAQ Composite
  "^RUT", // Russell 2000
  "^FTSE", // FTSE 100
  "^N225", // Nikkei 225
  "^HSI", // Hang Seng Index
  "^STOXX50E", // Euro Stoxx 50
  "^VIX", // CBOE Volatility Index
] as const;

// Symbol display names for better UX
export const SYMBOL_NAMES: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^DJI": "Dow Jones",
  "^IXIC": "NASDAQ",
  "^RUT": "Russell 2000",
  "^FTSE": "FTSE 100",
  "^N225": "Nikkei 225",
  "^HSI": "Hang Seng",
  "^STOXX50E": "Euro Stoxx 50",
  "^VIX": "VIX",
};

/**
 * Check if a symbol is available for historical data on the free tier
 */
export function isFreeTierSymbol(symbol: string): boolean {
  return FREE_TIER_SYMBOLS.includes(
    symbol as (typeof FREE_TIER_SYMBOLS)[number]
  );
}

/**
 * Get display name for a symbol
 */
export function getSymbolDisplayName(symbol: string): string {
  return SYMBOL_NAMES[symbol] || symbol;
}
