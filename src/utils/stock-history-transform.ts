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

  const item = firstItem as Record<string, unknown>;

  return (
    typeof item.symbol === "string" &&
    typeof item.date === "string" &&
    typeof item.price === "number"
    // volume is optional
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
    const errorData = data as HistoricalApiErrorResponse;
    if (errorData.Error?.Message) {
      throw new Error(errorData.Error.Message);
    }
    if (errorData["Error Message"]) {
      throw new Error(errorData["Error Message"]);
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
