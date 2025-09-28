import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleHttpError,
  isPermanentError,
  shouldRetryError,
} from "./stock-api-errors";
import * as stockQuoteCache from "./stock-quote-cache";
import type { ApiError } from "@/types/api.types";

// Mock the stock-quote-cache module
vi.mock("./stock-quote-cache", () => ({
  cacheFailure: vi.fn(),
}));

describe("stock-api-errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("handleHttpError", () => {
    const mockResponse = (status: number, statusText = "Test Error") =>
      ({
        status,
        statusText,
      }) as Response;

    describe("402 Payment Required", () => {
      it("should handle 402 error and cache failure", () => {
        const response = mockResponse(402, "Payment Required");
        const cacheFailureSpy = vi.spyOn(stockQuoteCache, "cacheFailure");

        expect(() => handleHttpError(response, "stockDetails", "AAPL")).toThrow(
          "API request failed: 402 Payment Required - API usage limit reached",
        );

        expect(cacheFailureSpy).toHaveBeenCalledWith(
          "stockDetails",
          "AAPL",
          "API request failed: 402 Payment Required - API usage limit reached",
        );
      });

      it("should create PaymentRequiredError with correct properties", () => {
        const response = mockResponse(402);

        try {
          handleHttpError(response, "stockDetails", "MSFT");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.name).toBe("PaymentRequiredError");
          expect(apiError.status).toBe(402);
          expect(apiError.retryable).toBe(false);
        }
      });

      it("should use custom base error message", () => {
        const response = mockResponse(402);

        expect(() =>
          handleHttpError(
            response,
            "stockDetails",
            "GOOGL",
            "Custom error message",
          ),
        ).toThrow("Custom error message - API usage limit reached");
      });
    });

    describe("403 Forbidden", () => {
      it("should handle 403 error and cache failure", () => {
        const response = mockResponse(403, "Forbidden");
        const cacheFailureSpy = vi.spyOn(stockQuoteCache, "cacheFailure");

        expect(() =>
          handleHttpError(response, "stockHistory1Day", "TSLA"),
        ).toThrow(
          "API request failed: 403 Forbidden - Check your API key permissions",
        );

        expect(cacheFailureSpy).toHaveBeenCalledWith(
          "stockHistory1Day",
          "TSLA",
          "API request failed: 403 Forbidden - Check your API key permissions",
        );
      });

      it("should create ForbiddenError with correct properties", () => {
        const response = mockResponse(403);

        try {
          handleHttpError(response, "stockDetails", "AMZN");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.name).toBe("ForbiddenError");
          expect(apiError.status).toBe(403);
          expect(apiError.retryable).toBe(false);
        }
      });
    });

    describe("401 Unauthorized", () => {
      it("should handle 401 error and cache failure", () => {
        const response = mockResponse(401, "Unauthorized");
        const cacheFailureSpy = vi.spyOn(stockQuoteCache, "cacheFailure");

        expect(() => handleHttpError(response, "stockDetails", "NFLX")).toThrow(
          "API request failed: 401 Unauthorized - Invalid API key",
        );

        expect(cacheFailureSpy).toHaveBeenCalledWith(
          "stockDetails",
          "NFLX",
          "API request failed: 401 Unauthorized - Invalid API key",
        );
      });

      it("should create UnauthorizedError with correct properties", () => {
        const response = mockResponse(401);

        try {
          handleHttpError(response, "stockDetails", "META");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.name).toBe("UnauthorizedError");
          expect(apiError.status).toBe(401);
          expect(apiError.retryable).toBe(false);
        }
      });
    });

    describe("404 Not Found", () => {
      it("should handle 404 error and cache failure", () => {
        const response = mockResponse(404, "Not Found");
        const cacheFailureSpy = vi.spyOn(stockQuoteCache, "cacheFailure");

        expect(() =>
          handleHttpError(response, "stockDetails", "INVALID"),
        ).toThrow("API request failed: 404 Not Found - Stock symbol not found");

        expect(cacheFailureSpy).toHaveBeenCalledWith(
          "stockDetails",
          "INVALID",
          "API request failed: 404 Not Found - Stock symbol not found",
        );
      });

      it("should create NotFoundError with correct properties", () => {
        const response = mockResponse(404);

        try {
          handleHttpError(response, "stockDetails", "BADSTOCK");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.name).toBe("NotFoundError");
          expect(apiError.status).toBe(404);
          expect(apiError.retryable).toBe(false);
        }
      });
    });

    describe("5xx Server Errors", () => {
      it("should handle 500 error without caching (retryable)", () => {
        const response = mockResponse(500, "Internal Server Error");
        const cacheFailureSpy = vi.spyOn(stockQuoteCache, "cacheFailure");

        expect(() => handleHttpError(response, "stockDetails", "AAPL")).toThrow(
          "API request failed: 500 Internal Server Error - Server error, will retry",
        );

        // Server errors should NOT be cached
        expect(cacheFailureSpy).not.toHaveBeenCalled();
      });

      it("should create ServerError with retryable=true", () => {
        const response = mockResponse(503, "Service Unavailable");

        try {
          handleHttpError(response, "stockDetails", "MSFT");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.name).toBe("ServerError");
          expect(apiError.status).toBe(503);
          expect(apiError.retryable).toBe(true);
        }
      });

      it("should handle different 5xx status codes", () => {
        [500, 502, 503, 504].forEach((statusCode) => {
          const response = mockResponse(statusCode);

          try {
            handleHttpError(response, "stockDetails", "TEST");
          } catch (error) {
            const apiError = error as ApiError;
            expect(apiError.name).toBe("ServerError");
            expect(apiError.status).toBe(statusCode);
            expect(apiError.retryable).toBe(true);
          }
        });
      });
    });

    describe("Other Client Errors", () => {
      it("should handle 400 Bad Request as ClientError", () => {
        const response = mockResponse(400, "Bad Request");

        try {
          handleHttpError(response, "stockDetails", "AAPL");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.name).toBe("ClientError");
          expect(apiError.status).toBe(400);
          expect(apiError.retryable).toBe(false);
          expect(apiError.message).toBe("API request failed: 400 Bad Request");
        }
      });

      it("should handle 429 Too Many Requests as ClientError", () => {
        const response = mockResponse(429, "Too Many Requests");

        try {
          handleHttpError(response, "stockDetails", "MSFT");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.name).toBe("ClientError");
          expect(apiError.status).toBe(429);
          expect(apiError.retryable).toBe(false);
        }
      });
    });
  });

  describe("isPermanentError", () => {
    it("should return true for permanent error status codes", () => {
      expect(isPermanentError(401)).toBe(true);
      expect(isPermanentError(402)).toBe(true);
      expect(isPermanentError(403)).toBe(true);
      expect(isPermanentError(404)).toBe(true);
    });

    it("should return false for non-permanent error status codes", () => {
      expect(isPermanentError(400)).toBe(false);
      expect(isPermanentError(429)).toBe(false);
      expect(isPermanentError(500)).toBe(false);
      expect(isPermanentError(502)).toBe(false);
      expect(isPermanentError(503)).toBe(false);
    });
  });

  describe("shouldRetryError", () => {
    const createApiError = (status: number, retryable?: boolean): ApiError => {
      const error = new Error("Test error") as ApiError;
      error.status = status;
      if (retryable !== undefined) {
        error.retryable = retryable;
      }
      return error;
    };

    it("should return false when error.retryable is explicitly false", () => {
      const error = createApiError(500, false);
      expect(shouldRetryError(error)).toBe(false);
    });

    it("should return false for permanent error status codes", () => {
      expect(shouldRetryError(createApiError(401))).toBe(false);
      expect(shouldRetryError(createApiError(402))).toBe(false);
      expect(shouldRetryError(createApiError(403))).toBe(false);
      expect(shouldRetryError(createApiError(404))).toBe(false);
    });

    it("should return true for retryable errors", () => {
      expect(shouldRetryError(createApiError(500))).toBe(true);
      expect(shouldRetryError(createApiError(502))).toBe(true);
      expect(shouldRetryError(createApiError(503))).toBe(true);
    });

    it("should return false for permanent errors even when retryable=true", () => {
      // This test reflects the current implementation where permanent error status
      // takes precedence over the retryable flag
      const error = createApiError(401, true);
      expect(shouldRetryError(error)).toBe(false);
    });

    it("should return true for errors without status", () => {
      const error = new Error("Network error") as ApiError;
      expect(shouldRetryError(error)).toBe(true);
    });
  });
});
