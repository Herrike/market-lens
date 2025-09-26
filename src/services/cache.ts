import { cacheConfig } from "@/config/cache";

// Helper function to build cache keys
function buildKey(
  type: keyof typeof cacheConfig.durations,
  identifier: string
): string {
  return `${cacheConfig.keyPrefix}-${type}-${identifier}`;
}

// Check if cached data exists and is not stale
export function hasValidCache(
  type: keyof typeof cacheConfig.durations,
  identifier: string
): boolean {
  const key = buildKey(type, identifier);
  const duration = cacheConfig.durations[type];

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return false;

    const { timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > duration;

    if (isExpired) {
      // Clean up stale data
      localStorage.removeItem(key);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(`Cache validation failed for ${key}:`, error);
    return false;
  }
}

// Get cached data if valid
export function getCache<T>(
  type: keyof typeof cacheConfig.durations,
  identifier: string
): T | null {
  const key = buildKey(type, identifier);

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const duration = cacheConfig.durations[type];
    const age = Date.now() - timestamp;
    const isExpired = age > duration;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.warn(`Cache read failed for ${key}:`, error);
    return null;
  }
}

// Get cache metadata for debugging
export function getCacheMetadata(
  type: keyof typeof cacheConfig.durations,
  identifier: string
): { age: number; remaining: number; timestamp: number } | null {
  const key = buildKey(type, identifier);

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { timestamp } = JSON.parse(cached);
    const duration = cacheConfig.durations[type];
    const age = Date.now() - timestamp;
    const remaining = duration - age;

    return { age, remaining, timestamp };
  } catch (_error) {
    return null;
  }
}

// Set cache data
export function setCache<T>(
  type: keyof typeof cacheConfig.durations,
  identifier: string,
  data: T
): void {
  const key = buildKey(type, identifier);

  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.warn(`Cache write failed for ${key}:`, error);
  }
}

// Clear specific cache
export function clearCache(
  type: keyof typeof cacheConfig.durations,
  identifier: string
): void {
  const key = buildKey(type, identifier);
  localStorage.removeItem(key);
}

// Clear all app caches
export function clearAllCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith(cacheConfig.keyPrefix)) {
      localStorage.removeItem(key);
    }
  });
}

// Get cache info for debugging
export function getCacheInfo(): { key: string; size: number; age: number }[] {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter((key) => key.startsWith(cacheConfig.keyPrefix));

  return cacheKeys.map((key) => {
    const value = localStorage.getItem(key) || "";
    let age = 0;

    try {
      const { timestamp } = JSON.parse(value);
      age = Date.now() - timestamp;
    } catch {
      // Invalid cache entry
    }

    return {
      key,
      size: value.length,
      age,
    };
  });
}
