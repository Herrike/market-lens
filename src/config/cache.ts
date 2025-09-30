// Cache configuration for the Market Lens application

export const cacheConfig = {
  // localStorage key prefix to avoid conflicts
  keyPrefix: "market-lens",

  // Cache durations in milliseconds
  durations: {
    // Stock search results - relatively static data
    stockSearch: 24 * 60 * 60 * 1000, // 24 hours

    // Stock details - more dynamic, shorter cache
    stockDetails: 4 * 60 * 60 * 1000, // 4 hours

    stockHistory1Day: 6 * 60 * 60 * 1000, // 6 hours (daily data is fairly stable)
  },

  // SWR configuration
  swr: {
    // How long SWR should deduplicate identical requests
    dedupingInterval: 30 * 1000, // 30 seconds

    // Error retry configuration
    errorRetryCount: 2,
    errorRetryInterval: 1000, // 1 second

    // Revalidation settings
    revalidateOnFocus: false,
    revalidateOnReconnect: false, // We rely on localStorage for the time being
  },
};

export type CacheConfig = typeof cacheConfig;
