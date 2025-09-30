/**
 * Maps HTTP status codes to user-friendly error messages
 */

import { getApiErrorMessage, type ApiErrorResponse } from "./api-error-cases";

// Re-export types for convenience
export type { ApiErrorResponse } from "./api-error-cases";

/**
 * Formats error message for display to users
 */
export const formatErrorMessage = (
  statusCode: number,
  originalMessage?: string,
  includeCode: boolean = false,
): string => {
  const errorInfo = getApiErrorMessage(statusCode, originalMessage);

  if (includeCode) {
    return `${errorInfo.userMessage} (Error ${statusCode})`;
  }

  return errorInfo.userMessage;
};

/**
 * Determines if an error should show a retry button
 */
export const isRetryableError = (statusCode: number): boolean => {
  const errorInfo = getApiErrorMessage(statusCode);
  return errorInfo.retryable ?? false;
};

/**
 * Gets suggestion text for an error
 */
export const getErrorSuggestion = (statusCode: number): string | undefined => {
  const errorInfo = getApiErrorMessage(statusCode);
  return errorInfo.suggestion;
};

/**
 * Extracts status code from various error objects
 */
export const extractStatusCode = (error: unknown): number => {
  if (typeof error === "object" && error !== null) {
    // Handle Response objects
    if ("status" in error && typeof error.status === "number") {
      return error.status === 0 ? 500 : error.status;
    }

    // Handle Error objects with status property
    if ("statusCode" in error && typeof error.statusCode === "number") {
      return error.statusCode;
    }

    // Handle ApiError objects
    if ("code" in error && typeof error.code === "number") {
      return error.code;
    }
  }

  // Default to 500 for unknown errors
  return 500;
};

/**
 * Main utility function to handle any error and return user-friendly message
 */
export const handleApiError = (
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred",
): ApiErrorResponse => {
  const statusCode = extractStatusCode(error);
  let originalMessage: string;

  if (error instanceof Error) {
    originalMessage = error.message;
  } else if (error === null || error === undefined) {
    originalMessage = fallbackMessage;
  } else {
    originalMessage = String(error);
  }

  return getApiErrorMessage(statusCode, originalMessage);
};
