import { hasValidCache, getCache, setCache } from "@/services/cache";
import type { cacheConfig } from "@/config/cache";

type CacheCategory = keyof typeof cacheConfig.durations;

/**
 * Check if a stock has a cached failure for the given cache category
 */
export function hasCachedFailure(
  category: CacheCategory,
  symbol: string,
): boolean {
  return hasValidCache(category, `failed-${symbol}`);
}

/**
 * Cache a failure for a stock in the given category
 */
export function cacheFailure(
  category: CacheCategory,
  symbol: string,
  error: string,
): void {
  setCache(category, `failed-${symbol}`, {
    error,
    timestamp: Date.now(),
  });
}

/**
 * Get cached failure data for a stock
 */
export function getCachedFailure(
  category: CacheCategory,
  symbol: string,
): { error: string; timestamp: number } | null {
  return getCache<{ error: string; timestamp: number }>(
    category,
    `failed-${symbol}`,
  );
}

/**
 * Check if we have valid cached success data for a stock
 */
export function hasCachedSuccess(
  category: CacheCategory,
  symbol: string,
): boolean {
  return hasValidCache(category, symbol);
}

/**
 * Get cached success data for a stock
 */
export function getCachedSuccess<T>(
  category: CacheCategory,
  symbol: string,
): T | null {
  return getCache<T>(category, symbol);
}

/**
 * Cache successful API response for a stock
 */
export function cacheSuccess<T>(
  category: CacheCategory,
  symbol: string,
  data: T,
): void {
  setCache(category, symbol, data);
}
