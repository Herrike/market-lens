import type { ApiError } from "@/types/api.types";
import { cacheFailure } from "./stock-quote-cache";
import type { cacheConfig } from "@/config/cache";

type CacheCategory = keyof typeof cacheConfig.durations;

/**
 * Create an API error with proper typing and metadata
 */
function createApiError(
  message: string,
  name: string,
  status: number,
  retryable: boolean = false,
): ApiError {
  const error = new Error(message);
  // Type-safe way to extend Error with ApiError properties
  Object.assign(error, {
    name,
    status,
    retryable,
  });
  return error as ApiError;
}

/**
 * Create a cached failure error with proper ApiError properties
 */
export function createCachedFailureError(message: string): ApiError {
  return createApiError(message, "CachedFailure", 0, false);
}

/**
 * Handle HTTP response errors and cache failures appropriately
 * Reusable across different stock API endpoints
 */
export function handleHttpError(
  response: Response,
  cacheCategory: CacheCategory,
  symbol: string,
  baseErrorMessage?: string,
): never {
  const errorMessage =
    baseErrorMessage ||
    `API request failed: ${response.status} ${response.statusText}`;

  if (response.status === 402) {
    const errorMsg = `${errorMessage} - API usage limit reached`;
    cacheFailure(cacheCategory, symbol, errorMsg);
    throw createApiError(errorMsg, "PaymentRequiredError", 402, false);
  }

  if (response.status === 403) {
    const errorMsg = `${errorMessage} - Check your API key permissions`;
    cacheFailure(cacheCategory, symbol, errorMsg);
    throw createApiError(errorMsg, "ForbiddenError", 403, false);
  }

  if (response.status === 401) {
    const errorMsg = `${errorMessage} - Invalid API key`;
    cacheFailure(cacheCategory, symbol, errorMsg);
    throw createApiError(errorMsg, "UnauthorizedError", 401, false);
  }

  if (response.status === 404) {
    const errorMsg = `${errorMessage} - Stock symbol not found`;
    cacheFailure(cacheCategory, symbol, errorMsg);
    throw createApiError(errorMsg, "NotFoundError", 404, false);
  }

  if (response.status >= 500) {
    // Server errors are retryable, don't cache them
    throw createApiError(
      `${errorMessage} - Server error, will retry`,
      "ServerError",
      response.status,
      true,
    );
  }

  // Other client errors are not retryable
  throw createApiError(errorMessage, "ClientError", response.status, false);
}

/**
 * Check if an error status code should prevent retries
 */
export function isPermanentError(status: number): boolean {
  return [401, 402, 403, 404].includes(status);
}

/**
 * Check if an error should be retried based on its properties
 */
export function shouldRetryError(error: ApiError): boolean {
  if (error.retryable === false) {
    return false;
  }

  if (error.status && isPermanentError(error.status)) {
    return false;
  }

  return true;
}
