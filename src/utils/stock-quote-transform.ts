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

// Raw API response structure for quote data
interface RawQuoteApiResponse {
  symbol: string;
  name?: string;
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
  timestamp?: number;
}

// API error response structure
interface ApiErrorResponse {
  Error?: {
    Message: string;
  };
  "Error Message"?: string;
}

export interface StockQuoteData {
  quote: StockQuote;
  symbol: string;
  fallbackMode: true; // Indicates this is fallback data
}

/**
 * Type guard to check if response contains API error
 */
function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  if (typeof data !== "object" || data === null) return false;

  const errorData = data as Record<string, unknown>;

  return (
    (typeof errorData.Error === "object" &&
      errorData.Error !== null &&
      typeof (errorData.Error as Record<string, unknown>).Message ===
        "string") ||
    typeof errorData["Error Message"] === "string"
  );
}

/**
 * Type guard to check if data is a valid quote API response array
 */
function isQuoteResponseArray(data: unknown): data is RawQuoteApiResponse[] {
  if (!Array.isArray(data) || data.length === 0) return false;

  const firstItem = data[0];
  if (typeof firstItem !== "object" || firstItem === null) return false;

  const quote = firstItem as Record<string, unknown>;

  return (
    typeof quote.symbol === "string" &&
    typeof quote.price === "number" &&
    typeof quote.changesPercentage === "number" &&
    typeof quote.change === "number" &&
    typeof quote.dayLow === "number" &&
    typeof quote.dayHigh === "number" &&
    typeof quote.yearHigh === "number" &&
    typeof quote.yearLow === "number" &&
    typeof quote.marketCap === "number" &&
    typeof quote.priceAvg50 === "number" &&
    typeof quote.priceAvg200 === "number" &&
    typeof quote.volume === "number" &&
    typeof quote.avgVolume === "number"
  );
}

/**
 * Validate API response format and check for error messages
 */
export function validateApiResponse(
  data: unknown,
): asserts data is RawQuoteApiResponse[] {
  // Check for API error messages first
  if (isApiErrorResponse(data)) {
    const errorData = data as ApiErrorResponse;
    if (errorData.Error?.Message) {
      throw new Error(errorData.Error.Message);
    }
    if (errorData["Error Message"]) {
      throw new Error(errorData["Error Message"]);
    }
  }

  // Validate the quote response structure
  if (!isQuoteResponseArray(data)) {
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
  validateApiResponse(data); // This ensures data is RawQuoteApiResponse[]

  const dataArray = data; // Already validated as RawQuoteApiResponse[]
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
