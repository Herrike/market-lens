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

/**
 * Validate historical API response format and check for error messages
 */
export function validateHistoricalResponse(data: unknown): void {
  // Type guard for error checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorData = data as any;

  // Check for API error messages
  if (errorData?.Error?.Message) {
    throw new Error(errorData.Error.Message);
  }

  if (errorData?.["Error Message"]) {
    throw new Error(errorData["Error Message"]);
  }

  // The historical-price-eod endpoint returns a direct array
  if (!Array.isArray(data)) {
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
  validateHistoricalResponse(data);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataArray = data as any[];

  // Transform the data to match our HistoricalPrice interface
  const historicalData: HistoricalPrice[] = dataArray.map(
    (item: {
      symbol: string;
      date: string;
      price: number;
      volume?: number;
    }) => ({
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
