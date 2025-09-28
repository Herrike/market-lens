// Types for Financial Modeling Prep API responses

// Stock type for search results and stock details
export type Stock = {
  symbol: string;
  name: string;
  currency: string;
  exchangeFullName: string;
  exchange: string;
};

// Error response type
export interface ApiError extends Error {
  name: string;
  message: string;
  status?: number;
  retryable?: boolean;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data?: T; // we technically know it will be Stocks but keeping generic for flexibility
  error?: ApiError;
}
