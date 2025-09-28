// Types for stock quote data
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  timestamp: number;
}

export interface StockQuoteData {
  quote: StockQuote;
  symbol: string;
  fallbackMode: true; // Indicates this is fallback data
}

/**
 * Validate API response format and check for error messages
 */
export function validateApiResponse(data: unknown): void {
  // Type guard for error checking - use any for API response validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorData = data as any;

  // Check for API error messages
  if (errorData?.Error?.Message) {
    throw new Error(errorData.Error.Message);
  }

  if (errorData?.["Error Message"]) {
    throw new Error(errorData["Error Message"]);
  }

  // The quote endpoint returns an array with one item
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Unexpected API response format:", data);
    throw new Error("No quote data found in API response");
  }
}

/**
 * Transform raw API response to StockQuoteData format
 */
export function transformQuoteResponse(
  data: unknown,
  symbol: string,
): StockQuoteData {
  validateApiResponse(data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataArray = data as any[];
  const quoteData = dataArray[0];

  const result: StockQuoteData = {
    quote: {
      symbol: quoteData.symbol,
      name: quoteData.name || symbol,
      price: quoteData.price,
      changesPercentage: quoteData.changesPercentage,
      change: quoteData.change,
      dayLow: quoteData.dayLow,
      dayHigh: quoteData.dayHigh,
      yearHigh: quoteData.yearHigh,
      yearLow: quoteData.yearLow,
      marketCap: quoteData.marketCap,
      priceAvg50: quoteData.priceAvg50,
      priceAvg200: quoteData.priceAvg200,
      volume: quoteData.volume,
      avgVolume: quoteData.avgVolume,
      timestamp: quoteData.timestamp || Date.now(),
    },
    symbol: symbol,
    fallbackMode: true,
  };

  return result;
}
