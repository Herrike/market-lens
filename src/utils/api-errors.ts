/**
 * API Error Handling Utility
 * Provides user-friendly error messages for common HTTP status codes
 */

import type { ApiError } from "@/types/api.types";

export interface ApiErrorResponse extends ApiError {
  code: number;
  userMessage: string;
  suggestion?: string;
}

/**
 * Maps HTTP status codes to user-friendly error messages
 */
export const getApiErrorMessage = (
  statusCode: number,
  originalMessage?: string,
): ApiErrorResponse => {
  const baseError = {
    code: statusCode,
    message: originalMessage || `HTTP ${statusCode} Error`,
  };

  switch (statusCode) {
    case 400:
      return {
        ...baseError,
        name: "BadRequestError",
        status: statusCode,
        userMessage: "Invalid request. Please check your input and try again.",
        retryable: false,
        suggestion:
          "Verify that you've entered a valid stock symbol (e.g., AAPL, MSFT).",
      };

    case 401:
      return {
        ...baseError,
        name: "UnauthorizedError",
        status: statusCode,
        userMessage:
          "Authentication required. Please check your API credentials.",
        retryable: false,
        suggestion: "Your API key may be invalid or expired.",
      };

    case 403:
      return {
        ...baseError,
        name: "ForbiddenError",
        status: statusCode,
        userMessage:
          "Access denied. Please check your permissions or try again later.",
        retryable: true,
        suggestion:
          "You may have exceeded your API quota. Consider upgrading your plan or try popular stocks like AAPL, MSFT, GOOGL.",
      };

    case 404:
      return {
        ...baseError,
        name: "NotFoundError",
        status: statusCode,
        userMessage: "The requested data was not found.",
        retryable: false,
        suggestion: "Please check the stock symbol and try again.",
      };

    case 429:
      return {
        ...baseError,
        name: "TooManyRequestsError",
        status: statusCode,
        userMessage: "Too many requests. Please wait a moment and try again.",
        retryable: true,
        suggestion: "Wait 30-60 seconds before making another request.",
      };

    case 500:
      return {
        ...baseError,
        name: "InternalServerError",
        status: statusCode,
        userMessage: "Server error occurred. Please try again later.",
        retryable: true,
        suggestion:
          "This is a temporary server issue. Please retry in a few minutes.",
      };

    case 502:
      return {
        ...baseError,
        name: "BadGatewayError",
        status: statusCode,
        userMessage: "Service temporarily unavailable. Please try again later.",
        retryable: true,
        suggestion:
          "The service is experiencing issues. Please try again in a few minutes.",
      };

    case 503:
      return {
        ...baseError,
        name: "ServiceUnavailableError",
        status: statusCode,
        userMessage: "Service unavailable. Please try again later.",
        retryable: true,
        suggestion:
          "The service is under maintenance or overloaded. Please try again later.",
      };

    case 504:
      return {
        ...baseError,
        name: "GatewayTimeoutError",
        status: statusCode,
        userMessage: "Request timeout. Please try again.",
        retryable: true,
        suggestion:
          "The request timed out. Please try again with a more stable connection.",
      };

    default:
      return {
        ...baseError,
        name: statusCode >= 500 ? "ServerError" : "ClientError",
        status: statusCode,
        userMessage:
          statusCode >= 500
            ? "Server error occurred. Please try again later."
            : "An unexpected error occurred. Please try again.",
        retryable: statusCode >= 500,
        suggestion:
          statusCode >= 500
            ? "This appears to be a server issue. Please try again later."
            : "Please refresh the page and try again.",
      };
  }
};

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
