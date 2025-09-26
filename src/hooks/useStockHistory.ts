import useSWR from "swr";
import type { ApiError } from "@/types/api";
import { hasValidCache, getCache, setCache } from "@/services/cache";

// Historical price data type for the new EOD endpoint
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

// Helper function to calculate date 15 days ago
function getFifteenDaysAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 15);
  return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

// Helper function to get today's date
function getToday(): string {
  return new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

// Check if a stock has a cached failure
function hasCachedFailure(symbol: string): boolean {
  return hasValidCache("stockHistory1Day", `failed-${symbol}`);
}

// Cache a failure for a stock
function cacheFailure(symbol: string, error: string): void {
  setCache("stockHistory1Day", `failed-${symbol}`, {
    error,
    timestamp: Date.now(),
  });
}

// API service function for historical price data
async function fetchHistoricalData(symbol: string): Promise<StockHistoryData> {
  if (!symbol) {
    throw new Error("Stock symbol is required");
  }

  // Check for cached failure first to avoid repeated API calls
  if (hasCachedFailure(symbol)) {
    const failureData = getCache<{ error: string; timestamp: number }>(
      "stockHistory1Day",
      `failed-${symbol}`,
    );
    if (failureData) {
      const error = new Error(failureData.error) as ApiError;
      error.name = "CachedFailure";
      error.retryable = false;
      throw error;
    }
  }

  // Check cache for successful data
  if (hasValidCache("stockHistory1Day", symbol)) {
    const cachedData = getCache<StockHistoryData>("stockHistory1Day", symbol);
    if (cachedData) {
      return cachedData;
    }
  }

  const API_KEY = import.meta.env.VITE_FMP_API_KEY;
  if (!API_KEY) {
    throw new Error("API key is not configured");
  }

  // Use the new historical-price-eod/light endpoint with 15-day lookback
  const fromDate = getFifteenDaysAgo();
  const toDate = getToday();
  const url = `https://financialmodelingprep.com/stable/historical-price-eod/light?symbol=${symbol}&from=${fromDate}&to=${toDate}&apikey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    // Create specific error types to prevent retries on permanent failures
    const errorMessage = `API request failed: ${response.status} ${response.statusText}`;

    if (response.status === 402) {
      // 402 Payment Required - don't retry, upgrade needed
      const errorMsg = `${errorMessage} - API usage limit reached. Please upgrade your Financial Modeling Prep subscription for historical data access`;
      cacheFailure(symbol, errorMsg);
      const error = new Error(errorMsg) as ApiError;
      error.name = "PaymentRequiredError";
      error.status = 402;
      error.retryable = false;
      throw error;
    } else if (response.status === 403) {
      // 403 Forbidden - don't retry, likely API key issue
      const errorMsg = `${errorMessage} - Check your API key permissions`;
      cacheFailure(symbol, errorMsg);
      const error = new Error(errorMsg) as ApiError;
      error.name = "ForbiddenError";
      error.status = 403;
      error.retryable = false;
      throw error;
    } else if (response.status === 401) {
      // 401 Unauthorized - don't retry, API key invalid
      const errorMsg = `${errorMessage} - Invalid API key`;
      cacheFailure(symbol, errorMsg);
      const error = new Error(errorMsg) as ApiError;
      error.name = "UnauthorizedError";
      error.status = 401;
      error.retryable = false;
      throw error;
    } else if (response.status === 404) {
      // 404 Not Found - don't retry, symbol doesn't exist
      const errorMsg = `${errorMessage} - Stock symbol not found`;
      cacheFailure(symbol, errorMsg);
      const error = new Error(errorMsg) as ApiError;
      error.name = "NotFoundError";
      error.status = 404;
      error.retryable = false;
      throw error;
    } else if (response.status >= 500) {
      // 5xx Server errors - can retry these
      const error = new Error(
        `${errorMessage} - Server error, will retry`,
      ) as ApiError;
      error.name = "ServerError";
      error.status = response.status;
      error.retryable = true;
      throw error;
    } else {
      // Other 4xx errors - don't retry
      const error = new Error(errorMessage) as ApiError;
      error.name = "ClientError";
      error.status = response.status;
      error.retryable = false;
      throw error;
    }
  }

  const data = await response.json();

  // Check for API error messages
  if (data.Error && data.Error.Message) {
    throw new Error(data.Error.Message);
  }

  if (data["Error Message"]) {
    throw new Error(data["Error Message"]);
  }

  // The historical-price-eod endpoint returns a direct array
  if (!Array.isArray(data)) {
    throw new Error("No historical data found in API response");
  }

  // Transform the data to match our HistoricalPrice interface
  const historicalData = data.map(
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

  // Cache successful response
  setCache("stockHistory1Day", symbol, result);

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
      revalidateOnFocus: false,
      revalidateOnReconnect: false, // Don't retry on reconnect for failed requests
      dedupingInterval: 10 * 60 * 1000, // 10 minutes - longer deduping
      errorRetryInterval: 15000, // Wait longer between retries
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Never retry if error is marked as non-retryable
        if (error.retryable === false) {
          permanentlyFailedStocks.add(symbol.toLowerCase());
          return;
        }

        // Don't retry for specific status codes - mark as permanently failed
        if (error.status && [401, 402, 403, 404].includes(error.status)) {
          permanentlyFailedStocks.add(symbol.toLowerCase());
          return;
        }

        // Only retry up to 2 times for server errors
        if (retryCount >= 2) {
          return;
        }

        // Only retry 5xx errors
        if (error.status && error.status >= 500) {
          setTimeout(() => revalidate({ retryCount }), 5000);
        }
      },
    },
  );

  return {
    data: data || { data: [], symbol: symbol },
    error,
    isLoading,
    mutate,
  };
}
