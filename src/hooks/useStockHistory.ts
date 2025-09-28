import useSWR from "swr";
import type { ApiError } from "@/types/api.types";
import {
  hasCachedFailure,
  getCachedFailure,
  hasCachedSuccess,
  getCachedSuccess,
  cacheSuccess,
} from "@/utils/stock-quote-cache";
import {
  handleHttpError,
  createCachedFailureError,
} from "@/utils/stock-api-errors";
import {
  transformHistoricalResponse,
  type HistoricalPrice,
  type StockHistoryData,
} from "@/utils/stock-history-transform";
import {
  createStockRetryConfig,
  stockSwrConfig,
} from "@/utils/stock-swr-retry";
import { getHistoricalDateRange } from "@/utils/date-helpers";

// Re-export types for backward compatibility
export type { HistoricalPrice, StockHistoryData };

// API service function for historical price data
async function fetchHistoricalData(symbol: string): Promise<StockHistoryData> {
  if (!symbol) {
    throw new Error("Stock symbol is required");
  }

  // Check for cached failure first to avoid repeated API calls
  if (hasCachedFailure("stockHistory1Day", symbol)) {
    const failureData = getCachedFailure("stockHistory1Day", symbol);
    if (failureData) {
      throw createCachedFailureError(failureData.error);
    }
  }

  // Check cache for successful data
  if (hasCachedSuccess("stockHistory1Day", symbol)) {
    const cachedData = getCachedSuccess<StockHistoryData>(
      "stockHistory1Day",
      symbol,
    );
    if (cachedData) {
      return cachedData;
    }
  }

  const API_KEY = import.meta.env.VITE_FMP_API_KEY;
  if (!API_KEY) {
    throw new Error("API key is not configured");
  }

  // Use the new historical-price-eod/light endpoint with 15-day lookback
  const { fromDate, toDate } = getHistoricalDateRange();
  const url = `https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&from=${fromDate}&to=${toDate}&apikey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    handleHttpError(response, "stockHistory1Day", symbol);
  }

  const data = await response.json();

  // Transform and validate the response
  const result = transformHistoricalResponse(data, symbol);

  // Cache successful response
  cacheSuccess("stockHistory1Day", symbol, result);

  return result;
}

// Track permanently failed stocks to prevent unnecessary API calls
const permanentlyFailedStocks = new Set<string>();

// Custom hook for stock historical data
export function useStockHistory(symbol: string) {
  const shouldFetch = Boolean(
    symbol &&
      symbol.length > 0 &&
      !permanentlyFailedStocks.has(symbol.toLowerCase()),
  );

  const { data, error, isLoading, mutate } = useSWR<StockHistoryData, ApiError>(
    shouldFetch ? ["stock-history", symbol] : null,
    () => fetchHistoricalData(symbol),
    {
      ...stockSwrConfig,
      dedupingInterval: 10 * 60 * 1000, // 10 minutes - longer deduping for history
      errorRetryInterval: 15000, // Wait longer between retries for history
      onErrorRetry: createStockRetryConfig(
        symbol,
        permanentlyFailedStocks,
        2,
        5000,
      ),
    },
  );

  return {
    data: data || { data: [], symbol: symbol },
    error,
    isLoading,
    mutate,
  };
}
