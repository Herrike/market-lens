import useSWR from "swr";
import type { ApiError } from "@/types/api.types";
import type { Stock } from "@/types/api.types";
import { apiService } from "@/services/api";
import {
  hasValidCache,
  getCache,
  setCache,
  clearCache,
} from "@/services/cache";
import { cacheConfig } from "@/config/cache";

// Custom hook for stock search with enhanced caching
export function useStockSearch(query: string, limit: number = 10) {
  const shouldFetch = query && query.length >= 2; // Only search if query has 2+ characters
  const cacheIdentifier = `${query}-${limit}`;

  // Check if we have valid cached data
  const hasValidCacheData =
    shouldFetch && hasValidCache("stockSearch", cacheIdentifier);
  const cachedData = hasValidCacheData
    ? getCache<Stock[]>("stockSearch", cacheIdentifier)
    : null;

  // Only use SWR if we don't have valid cached data
  const shouldUseSWR = shouldFetch && !hasValidCacheData;

  const {
    data: swrData,
    error,
    isLoading,
    mutate,
  } = useSWR<Stock[], ApiError>(
    shouldUseSWR ? `/search-${query}-${limit}` : null,
    async () => {
      console.log(`📡 Fetching from API for query: "${query}"`);
      const data = await apiService.searchStocks(query, limit);

      // Cache the fresh data
      setCache("stockSearch", cacheIdentifier, data);

      console.log(
        `💾 Cached API response for query: "${query}" (${data.length} results, TTL: 24h)`,
      );

      return data;
    },
    {
      ...cacheConfig.swr,
      // SWR configuration from our config file
    },
  );

  // Return either cached data or SWR data
  const finalData = cachedData || swrData || [];
  const finalIsLoading = !hasValidCacheData && isLoading;

  return {
    data: finalData,
    error,
    isLoading: finalIsLoading,
    refetch: mutate,
    // Additional cache utilities
    clearCache: () => clearCache("stockSearch", cacheIdentifier),
    isCached: hasValidCacheData,
  };
}

// Utility function to find a stock by symbol in cached search results
export function findStockInCache(symbol: string): Stock | null {
  if (!symbol) return null;

  const normalizedSymbol = symbol.toUpperCase().trim();

  // Get all cache keys for stock search
  const cachePrefix = `${cacheConfig.keyPrefix}-stockSearch-`;

  // Search through all cached search results
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(cachePrefix)) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const duration = cacheConfig.durations.stockSearch;
          const isExpired = Date.now() - timestamp > duration;

          if (!isExpired && Array.isArray(data)) {
            // Search for the symbol in this cached result set
            const foundStock = data.find(
              (stock: Stock) => stock.symbol.toUpperCase() === normalizedSymbol,
            );

            if (foundStock) {
              console.log(
                `📦 Found ${symbol} details in cached search results:`,
                foundStock,
              );
              return foundStock;
            }
          }
        }
      } catch (error) {
        console.warn(`Error reading cache key ${key}:`, error);
      }
    }
  }

  console.log(`❌ Stock ${symbol} not found in cached search results`);
  return null;
}

// Custom hook to get stock details from cache or fetch if needed
export function useStockDetails(symbol: string): {
  stock: Stock | null;
  isLoading: boolean;
  error: ApiError | undefined;
} {
  // Always call the hook (React hooks rule)
  const {
    data: searchResults,
    error,
    isLoading,
  } = useStockSearch(symbol || "", 1);

  // First, try to find the stock in cached search results
  const cachedStock = symbol ? findStockInCache(symbol) : null;

  // If we found it in cache, return cached data
  if (cachedStock) {
    return {
      stock: cachedStock,
      isLoading: false,
      error: undefined,
    };
  }

  // If not in cache, return search results
  const stock =
    searchResults && searchResults.length > 0 ? searchResults[0] : null;

  return {
    stock,
    isLoading: symbol ? isLoading : false,
    error: symbol ? error : undefined,
  };
}

// Utility function to clear all stock-related cache data
export function clearAllStockCache(): void {
  const cachePrefix = `market-lens-`;
  const keysToRemove: string[] = [];

  // Collect all cache keys that start with our prefix
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(cachePrefix)) {
      // Clear stock search, stock details, and stock history cache
      if (
        key.includes("stockSearch") ||
        key.includes("stockDetails") ||
        key.includes("stockHistory")
      ) {
        keysToRemove.push(key);
      }
    }
  }

  // Remove all collected keys
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log(`🗑️ Cleared ${keysToRemove.length} stock cache entries`);
}
