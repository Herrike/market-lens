// Historical price data type for the EOD endpoint
export interface HistoricalPrice {
  symbol: string;
  date: string;
  price: number;
  volume: number;
}

// Single timeframe historical data
export interface StockHistoryData {
  data: HistoricalPrice[];
  symbol: string;
}

// Raw API response structure for historical data
interface RawHistoricalApiResponse {
  symbol: string;
  date: string;
  price: number;
  volume?: number;
}

// API error response structure
interface HistoricalApiErrorResponse {
  Error?: {
    Message: string;
  };
  "Error Message"?: string;
}

/**
 * Type guard to check if response contains historical API error
 */
function isHistoricalApiErrorResponse(
  data: unknown,
): data is HistoricalApiErrorResponse {
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
 * Type guard to check if data is a valid historical response array
 */
function isHistoricalResponseArray(
  data: unknown,
): data is RawHistoricalApiResponse[] {
  if (!Array.isArray(data)) return false;

  // Empty array is valid for historical data (no data available)
  if (data.length === 0) return true;

  const firstItem = data[0];
  if (typeof firstItem !== "object" || firstItem === null) return false;

  // Use proper type checking with 'in' operator instead of casting
  return (
    "symbol" in firstItem &&
    typeof firstItem.symbol === "string" &&
    "date" in firstItem &&
    typeof firstItem.date === "string" &&
    "price" in firstItem &&
    typeof firstItem.price === "number"
    // volume is optional, so we don't check for it
  );
}

/**
 * Validate historical API response format and check for error messages
 */
export function validateHistoricalResponse(
  data: unknown,
): asserts data is RawHistoricalApiResponse[] {
  // Check for API error messages first
  if (isHistoricalApiErrorResponse(data)) {
    // Type guard ensures data is HistoricalApiErrorResponse, no casting needed
    if (data.Error?.Message) {
      throw new Error(data.Error.Message);
    }
    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }
  }

  // Validate the historical response structure
  if (!isHistoricalResponseArray(data)) {
    console.error("Unexpected API response format:", data);
    throw new Error("No historical data found in API response");
  }
}

/**
 * Transform raw historical API response to StockHistoryData format
 */
export function transformHistoricalResponse(
  data: unknown,
  symbol: string,
): StockHistoryData {
  validateHistoricalResponse(data); // This ensures data is RawHistoricalApiResponse[]

  const dataArray = data; // Already validated as RawHistoricalApiResponse[]

  // Transform the data to match our HistoricalPrice interface
  const historicalData: HistoricalPrice[] = dataArray.map(
    (item: RawHistoricalApiResponse) => ({
      symbol: item.symbol,
      date: item.date,
      price: item.price,
      volume: item.volume || 0,
    }),
  );

  const result: StockHistoryData = {
    data: historicalData,
    symbol: symbol,
  };

  return result;
}
