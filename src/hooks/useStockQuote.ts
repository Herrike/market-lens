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
  transformQuoteResponse,
  type StockQuote,
  type StockQuoteData,
} from "@/utils/stock-quote-transform";
import {
  createStockRetryConfig,
  stockSwrConfig,
} from "@/utils/stock-swr-retry";

// Re-export types for backward compatibility
export type { StockQuote, StockQuoteData };

// API service function for stock quote (free tier endpoint)
async function fetchStockQuote(symbol: string): Promise<StockQuoteData> {
  if (!symbol) {
    throw new Error("Stock symbol is required");
  }

  // Check for cached failure first
  if (hasCachedFailure("stockDetails", symbol)) {
    const failureData = getCachedFailure("stockDetails", symbol);
    if (failureData) {
      console.log(
        `❌ Using cached failure for quote ${symbol}: ${failureData.error}`,
      );
      throw createCachedFailureError(failureData.error);
    }
  }

  // Check cache for successful data
  if (hasCachedSuccess("stockDetails", symbol)) {
    const cachedData = getCachedSuccess<StockQuoteData>("stockDetails", symbol);
    if (cachedData) {
      console.log(`📦 Using cached quote data for ${symbol}`);
      return cachedData;
    }
  }

  const API_KEY = import.meta.env.VITE_FMP_API_KEY;
  if (!API_KEY) {
    throw new Error("API key is not configured");
  }

  console.log(`🔍 Fetching quote data for ${symbol}...`);

  // Use the quote endpoint which is available on free tier
  const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`;

  console.log(`📡 API URL: ${url.replace(API_KEY, "XXXXX")}`);

  const response = await fetch(url);

  console.log(`📈 Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    handleHttpError(response, "stockDetails", symbol);
  }

  const data = await response.json();

  console.log(`📊 Raw quote response:`, data);

  // Transform and validate the response
  const result = transformQuoteResponse(data, symbol);

  console.log(`✅ Processed quote data for ${symbol}: $${result.quote.price}`);

  // Cache successful response
  cacheSuccess("stockDetails", symbol, result);

  return result;
}

// Track permanently failed stocks
const permanentlyFailedStocks = new Set<string>();

// Custom hook for stock quote data (fallback when historical data fails)
export function useStockQuote(symbol: string) {
  const shouldFetch = Boolean(
    symbol &&
      symbol.length > 0 &&
      !permanentlyFailedStocks.has(symbol.toLowerCase()),
  );

  const { data, error, isLoading, mutate } = useSWR<StockQuoteData, ApiError>(
    shouldFetch ? ["stock-quote", symbol] : null,
    () => fetchStockQuote(symbol),
    {
      ...stockSwrConfig,
      onErrorRetry: createStockRetryConfig(symbol, permanentlyFailedStocks),
    },
  );

  return {
    data: data || null,
    error,
    isLoading,
    mutate,
  };
}
