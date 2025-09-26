import useSWR from "swr";
import type { ApiError } from "@/types/api";
import { hasValidCache, getCache, setCache } from "@/services/cache";

// Current quote data from the free tier
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

// Fallback quote data structure
export interface StockQuoteData {
  quote: StockQuote;
  symbol: string;
  fallbackMode: true; // Indicates this is fallback data
}

// Check if a stock has a cached failure
function hasCachedFailure(symbol: string): boolean {
  return hasValidCache("stockDetails", `failed-${symbol}`);
}

// Cache a failure for a stock
function cacheFailure(symbol: string, error: string): void {
  setCache("stockDetails", `failed-${symbol}`, {
    error,
    timestamp: Date.now(),
  });
}

// API service function for stock quote (free tier endpoint)
async function fetchStockQuote(symbol: string): Promise<StockQuoteData> {
  if (!symbol) {
    throw new Error("Stock symbol is required");
  }

  // Check for cached failure first
  if (hasCachedFailure(symbol)) {
    const failureData = getCache<{ error: string; timestamp: number }>(
      "stockDetails",
      `failed-${symbol}`
    );
    if (failureData) {
      console.log(
        `❌ Using cached failure for quote ${symbol}: ${failureData.error}`
      );
      const error = new Error(failureData.error) as ApiError;
      error.name = "CachedFailure";
      error.retryable = false;
      throw error;
    }
  }

  // Check cache for successful data
  if (hasValidCache("stockDetails", symbol)) {
    const cachedData = getCache<StockQuoteData>("stockDetails", symbol);
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
    const errorMessage = `API request failed: ${response.status} ${response.statusText}`;

    if (response.status === 402) {
      const errorMsg = `${errorMessage} - API usage limit reached`;
      cacheFailure(symbol, errorMsg);
      const error = new Error(errorMsg) as ApiError;
      error.name = "PaymentRequiredError";
      error.status = 402;
      error.retryable = false;
      throw error;
    } else if (response.status === 403) {
      const errorMsg = `${errorMessage} - Check your API key permissions`;
      cacheFailure(symbol, errorMsg);
      const error = new Error(errorMsg) as ApiError;
      error.name = "ForbiddenError";
      error.status = 403;
      error.retryable = false;
      throw error;
    } else if (response.status === 401) {
      const errorMsg = `${errorMessage} - Invalid API key`;
      cacheFailure(symbol, errorMsg);
      const error = new Error(errorMsg) as ApiError;
      error.name = "UnauthorizedError";
      error.status = 401;
      error.retryable = false;
      throw error;
    } else if (response.status === 404) {
      const errorMsg = `${errorMessage} - Stock symbol not found`;
      cacheFailure(symbol, errorMsg);
      const error = new Error(errorMsg) as ApiError;
      error.name = "NotFoundError";
      error.status = 404;
      error.retryable = false;
      throw error;
    } else if (response.status >= 500) {
      const error = new Error(
        `${errorMessage} - Server error, will retry`
      ) as ApiError;
      error.name = "ServerError";
      error.status = response.status;
      error.retryable = true;
      throw error;
    } else {
      const error = new Error(errorMessage) as ApiError;
      error.name = "ClientError";
      error.status = response.status;
      error.retryable = false;
      throw error;
    }
  }

  const data = await response.json();

  console.log(`📊 Raw quote response:`, data);

  // Check for API error messages
  if (data.Error && data.Error.Message) {
    throw new Error(data.Error.Message);
  }

  if (data["Error Message"]) {
    throw new Error(data["Error Message"]);
  }

  // The quote endpoint returns an array with one item
  if (!Array.isArray(data) || data.length === 0) {
    console.error("Unexpected API response format:", data);
    throw new Error("No quote data found in API response");
  }

  const quoteData = data[0];

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

  console.log(`✅ Processed quote data for ${symbol}: $${result.quote.price}`);

  // Cache successful response
  setCache("stockDetails", symbol, result);

  return result;
}

// Track permanently failed stocks
const permanentlyFailedStocks = new Set<string>();

// Custom hook for stock quote data (fallback when historical data fails)
export function useStockQuote(symbol: string) {
  const shouldFetch = Boolean(
    symbol &&
      symbol.length > 0 &&
      !permanentlyFailedStocks.has(symbol.toLowerCase())
  );

  const { data, error, isLoading, mutate } = useSWR<StockQuoteData, ApiError>(
    shouldFetch ? ["stock-quote", symbol] : null,
    () => fetchStockQuote(symbol),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes for quote data
      errorRetryInterval: 10000,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.log(`🔄 SWR retry attempt ${retryCount} for quote ${symbol}`);

        if (error.retryable === false) {
          console.log(
            `❌ Not retrying quote ${symbol} - error is not retryable:`,
            error.message
          );
          permanentlyFailedStocks.add(symbol.toLowerCase());
          return;
        }

        if (error.status && [401, 402, 403, 404].includes(error.status)) {
          console.log(
            `❌ Not retrying quote ${symbol} - permanent error ${error.status}`
          );
          permanentlyFailedStocks.add(symbol.toLowerCase());
          return;
        }

        if (retryCount >= 2) {
          console.log(`❌ Max retries reached for quote ${symbol}`);
          return;
        }

        if (error.status && error.status >= 500) {
          console.log(
            `🔄 Retrying quote ${symbol} - server error ${error.status}`
          );
          setTimeout(() => revalidate({ retryCount }), 3000);
        }
      },
    }
  );

  return {
    data: data || null,
    error,
    isLoading,
    mutate,
  };
}
