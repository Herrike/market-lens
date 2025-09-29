import type { ApiError, Stock } from "@/types/api.types";

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
}

// Default configuration from environment
export const getDefaultConfig = (): ApiConfig => ({
  baseUrl: import.meta.env.VITE_FMP_BASE_URL,
  apiKey: import.meta.env.VITE_FMP_API_KEY || "demo", // Use demo for testing and it will fail miserably :)
});

// Pure function to build API URLs - easily testable
export function buildApiUrl(
  config: ApiConfig,
  endpoint: string,
  params?: Record<string, string | number>,
): string {
  let baseUrl = config.baseUrl;

  // Special case: remove v3 from base URL for search-symbol endpoint
  if (endpoint.includes("search-symbol")) {
    baseUrl = baseUrl.replace("/v3", "");
  }

  const url = new URL(`${baseUrl}${endpoint}`);

  // Add API key
  url.searchParams.append("apikey", config.apiKey);

  // Add additional parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
  }

  return url.toString();
}

// Pure function to validate stock query - easily testable
export function validateStockQuery(query: string): string {
  if (!query || query.trim().length === 0) {
    throw new Error("Search query cannot be empty");
  }

  // Validate query format (basic stock symbol validation)
  const cleanQuery = query.trim().toUpperCase();
  if (!/^[A-Z0-9^.\-:]{1,10}$/i.test(cleanQuery)) {
    throw new Error("Invalid stock symbol format");
  }

  return cleanQuery;
}

// Generic HTTP request function - easily mockable for tests
export async function makeApiRequest<T>(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<T> {
  try {
    const response = await fetchFn(url);

    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const apiError: ApiError = {
      name: error instanceof Error ? error.name : "ApiError",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      status: error instanceof Response ? error.status : undefined,
    };

    throw apiError;
  }
}

// Main search function - combines all the pieces
export async function searchStocks(
  query: string,
  limit: number = 10,
  config: ApiConfig = getDefaultConfig(),
  fetchFn: typeof fetch = fetch,
): Promise<Stock[]> {
  const cleanQuery = validateStockQuery(query);
  const url = buildApiUrl(config, "/stable/search-symbol", {
    query: cleanQuery,
    limit,
  });

  return makeApiRequest<Stock[]>(url, fetchFn);
}

// Convenience export using default config - maintains backward compatibility
export const apiService = {
  searchStocks: (query: string, limit?: number) =>
    searchStocks(query, limit, getDefaultConfig()),
};
