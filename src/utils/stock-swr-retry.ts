import type { ApiError } from "@/types/api.types";
import { shouldRetryError, isPermanentError } from "./stock-api-errors";

/**
 * Create SWR retry configuration for stock API calls
 * Reusable across different stock hooks
 */
export function createStockRetryConfig(
  symbol: string,
  permanentlyFailedStocks: Set<string>,
  maxRetries: number = 2,
  serverErrorDelay: number = 3000,
) {
  return (
    error: ApiError,
    key: string,
    config: unknown,
    revalidate: (options: { retryCount: number }) => void,
    { retryCount }: { retryCount: number },
  ) => {
    console.log(`🔄 SWR retry attempt ${retryCount} for ${symbol}`);

    // Check if error should not be retried
    if (!shouldRetryError(error)) {
      console.log(
        `❌ Not retrying ${symbol} - error is not retryable:`,
        error.message,
      );
      permanentlyFailedStocks.add(symbol.toLowerCase());
      return;
    }

    // Check for permanent error status codes
    if (error.status && isPermanentError(error.status)) {
      console.log(
        `❌ Not retrying ${symbol} - permanent error ${error.status}`,
      );
      permanentlyFailedStocks.add(symbol.toLowerCase());
      return;
    }

    // Check retry count limit
    if (retryCount >= maxRetries) {
      console.log(`❌ Max retries reached for ${symbol}`);
      return;
    }

    // Retry server errors with delay
    if (error.status && error.status >= 500) {
      console.log(`🔄 Retrying ${symbol} - server error ${error.status}`);
      setTimeout(() => revalidate({ retryCount }), serverErrorDelay);
    }
  };
}

/**
 * Standard SWR configuration for stock API calls
 */
export const stockSwrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 5 * 60 * 1000, // 5 minutes for quote data
  errorRetryInterval: 10000,
};
