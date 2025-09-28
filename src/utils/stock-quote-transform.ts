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

  // Use proper type checking without casting
  const hasNestedError =
    "Error" in data &&
    typeof data.Error === "object" &&
    data.Error !== null &&
    "Message" in data.Error &&
    typeof data.Error.Message === "string";

  const hasDirectError =
    "Error Message" in data && typeof data["Error Message"] === "string";

  return hasNestedError || hasDirectError;
}

/**
 * Type guard to check if data is a valid quote API response array
 */
function isQuoteResponseArray(data: unknown): data is RawQuoteApiResponse[] {
  if (!Array.isArray(data) || data.length === 0) return false;

  const firstItem = data[0];
  if (typeof firstItem !== "object" || firstItem === null) return false;

  // Use proper type checking with 'in' operator instead of casting
  return (
    "symbol" in firstItem &&
    typeof firstItem.symbol === "string" &&
    "price" in firstItem &&
    typeof firstItem.price === "number" &&
    "changesPercentage" in firstItem &&
    typeof firstItem.changesPercentage === "number" &&
    "change" in firstItem &&
    typeof firstItem.change === "number" &&
    "dayLow" in firstItem &&
    typeof firstItem.dayLow === "number" &&
    "dayHigh" in firstItem &&
    typeof firstItem.dayHigh === "number" &&
    "yearHigh" in firstItem &&
    typeof firstItem.yearHigh === "number" &&
    "yearLow" in firstItem &&
    typeof firstItem.yearLow === "number" &&
    "marketCap" in firstItem &&
    typeof firstItem.marketCap === "number" &&
    "priceAvg50" in firstItem &&
    typeof firstItem.priceAvg50 === "number" &&
    "priceAvg200" in firstItem &&
    typeof firstItem.priceAvg200 === "number" &&
    "volume" in firstItem &&
    typeof firstItem.volume === "number" &&
    "avgVolume" in firstItem &&
    typeof firstItem.avgVolume === "number"
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
    // Type guard ensures data is ApiErrorResponse, no casting needed
    if (data.Error?.Message) {
      throw new Error(data.Error.Message);
    }
    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
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
