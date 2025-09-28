/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import {
  getApiErrorMessage,
  formatErrorMessage,
  isRetryableError,
  getErrorSuggestion,
  extractStatusCode,
  handleApiError,
} from "./api-errors";

describe("API Error Utility", () => {
  describe("getApiErrorMessage", () => {
    it("should return correct error message for 400 Bad Request", () => {
      const result = getApiErrorMessage(400, "Bad Request");

      expect(result).toEqual({
        code: 400,
        message: "Bad Request",
        name: "BadRequestError",
        status: 400,
        userMessage: "Invalid request. Please check your input and try again.",
        retryable: false,
        suggestion:
          "Verify that you've entered a valid stock symbol (e.g., AAPL, MSFT).",
      });
    });

    it("should return correct error message for 401 Unauthorized", () => {
      const result = getApiErrorMessage(401);

      expect(result.code).toBe(401);
      expect(result.userMessage).toBe(
        "Authentication required. Please check your API credentials.",
      );
      expect(result.retryable).toBe(false);
      expect(result.suggestion).toContain("API key");
    });

    it("should return correct error message for 403 Forbidden", () => {
      const result = getApiErrorMessage(403);

      expect(result.code).toBe(403);
      expect(result.userMessage).toBe(
        "Access denied. Please check your permissions or try again later.",
      );
      expect(result.retryable).toBe(true);
      expect(result.suggestion).toContain("API quota");
    });

    it("should return correct error message for 404 Not Found", () => {
      const result = getApiErrorMessage(404);

      expect(result.code).toBe(404);
      expect(result.userMessage).toBe("The requested data was not found.");
      expect(result.retryable).toBe(false);
      expect(result.suggestion).toContain("stock symbol");
    });

    it("should return correct error message for 429 Too Many Requests", () => {
      const result = getApiErrorMessage(429);

      expect(result.code).toBe(429);
      expect(result.userMessage).toBe(
        "Too many requests. Please wait a moment and try again.",
      );
      expect(result.retryable).toBe(true);
      expect(result.suggestion).toContain("30-60 seconds");
    });

    it("should return correct error message for 500 Internal Server Error", () => {
      const result = getApiErrorMessage(500);

      expect(result.code).toBe(500);
      expect(result.userMessage).toBe(
        "Server error occurred. Please try again later.",
      );
      expect(result.retryable).toBe(true);
      expect(result.suggestion).toContain("temporary server issue");
    });

    it("should return correct error message for 502 Bad Gateway", () => {
      const result = getApiErrorMessage(502);

      expect(result.code).toBe(502);
      expect(result.userMessage).toBe(
        "Service temporarily unavailable. Please try again later.",
      );
      expect(result.retryable).toBe(true);
    });

    it("should return correct error message for 503 Service Unavailable", () => {
      const result = getApiErrorMessage(503);

      expect(result.code).toBe(503);
      expect(result.userMessage).toBe(
        "Service unavailable. Please try again later.",
      );
      expect(result.retryable).toBe(true);
      expect(result.suggestion).toContain("maintenance");
    });

    it("should return correct error message for 504 Gateway Timeout", () => {
      const result = getApiErrorMessage(504);

      expect(result.code).toBe(504);
      expect(result.userMessage).toBe("Request timeout. Please try again.");
      expect(result.retryable).toBe(true);
      expect(result.suggestion).toContain("timed out");
    });

    it("should handle unknown client error codes (4xx)", () => {
      const result = getApiErrorMessage(418); // I'm a teapot

      expect(result.code).toBe(418);
      expect(result.userMessage).toBe(
        "An unexpected error occurred. Please try again.",
      );
      expect(result.retryable).toBe(false);
      expect(result.suggestion).toContain("refresh the page");
    });

    it("should handle unknown server error codes (5xx)", () => {
      const result = getApiErrorMessage(599); // Unknown server error

      expect(result.code).toBe(599);
      expect(result.userMessage).toBe(
        "Server error occurred. Please try again later.",
      );
      expect(result.retryable).toBe(true);
      expect(result.suggestion).toContain("server issue");
    });

    it("should use default message when no original message provided", () => {
      const result = getApiErrorMessage(400);

      expect(result.message).toBe("HTTP 400 Error");
    });

    it("should use provided original message", () => {
      const result = getApiErrorMessage(400, "Custom error message");

      expect(result.message).toBe("Custom error message");
    });
  });

  describe("formatErrorMessage", () => {
    it("should return user message without error code by default", () => {
      const result = formatErrorMessage(404, "Not Found");

      expect(result).toBe("The requested data was not found.");
    });

    it("should include error code when requested", () => {
      const result = formatErrorMessage(404, "Not Found", true);

      expect(result).toBe("The requested data was not found. (Error 404)");
    });

    it("should work without original message", () => {
      const result = formatErrorMessage(500);

      expect(result).toBe("Server error occurred. Please try again later.");
    });
  });

  describe("retryableError", () => {
    it("should return true for retryable error codes", () => {
      const retryableCodes = [403, 429, 500, 502, 503, 504];

      retryableCodes.forEach((code) => {
        expect(isRetryableError(code)).toBe(true);
      });
    });

    it("should return false for non-retryable error codes", () => {
      const nonRetryableCodes = [400, 401, 404];

      nonRetryableCodes.forEach((code) => {
        expect(isRetryableError(code)).toBe(false);
      });
    });

    it("should return true for unknown server errors (5xx)", () => {
      expect(isRetryableError(599)).toBe(true);
    });

    it("should return false for unknown client errors (4xx)", () => {
      expect(isRetryableError(418)).toBe(false);
    });
  });

  describe("getErrorSuggestion", () => {
    it("should return suggestion for errors that have one", () => {
      const suggestion = getErrorSuggestion(403);

      expect(suggestion).toBeDefined();
      expect(suggestion).toContain("API quota");
    });

    it("should return suggestion for all defined error codes", () => {
      const codesWithSuggestions = [
        400, 401, 403, 404, 429, 500, 502, 503, 504,
      ];

      codesWithSuggestions.forEach((code) => {
        const suggestion = getErrorSuggestion(code);
        expect(suggestion).toBeDefined();
        expect(typeof suggestion).toBe("string");
        expect(suggestion!.length).toBeGreaterThan(0);
      });
    });

    it("should return suggestion for unknown error codes", () => {
      const suggestion = getErrorSuggestion(999);

      expect(suggestion).toBeDefined();
      expect(typeof suggestion).toBe("string");
    });
  });

  describe("extractStatusCode", () => {
    it("should extract status from Response-like objects", () => {
      const mockResponse = { status: 404 };

      expect(extractStatusCode(mockResponse)).toBe(404);
    });

    it("should extract statusCode from Error objects", () => {
      const mockError = { statusCode: 500 };

      expect(extractStatusCode(mockError)).toBe(500);
    });

    it("should extract code from ApiError objects", () => {
      const mockApiError = { code: 403 };

      expect(extractStatusCode(mockApiError)).toBe(403);
    });

    it("should return 500 for null", () => {
      expect(extractStatusCode(null)).toBe(500);
    });

    it("should return 500 for undefined", () => {
      expect(extractStatusCode(undefined)).toBe(500);
    });

    it("should return 500 for strings", () => {
      expect(extractStatusCode("some error")).toBe(500);
    });

    it("should return 500 for numbers", () => {
      expect(extractStatusCode(123)).toBe(500);
    });

    it("should return 500 for objects without status properties", () => {
      const mockObject = { message: "error", data: {} };

      expect(extractStatusCode(mockObject)).toBe(500);
    });

    it("should handle objects with non-number status properties", () => {
      const mockObject = { status: "404" };

      expect(extractStatusCode(mockObject)).toBe(500);
    });
  });

  describe("handleApiError", () => {
    it("should handle Error objects", () => {
      const error = new Error("Network error");
      const result = handleApiError(error);

      expect(result.code).toBe(500);
      expect(result.message).toBe("Network error");
      expect(result.userMessage).toContain("Server error");
    });

    it("should handle Response-like objects with status", () => {
      const mockResponse = { status: 403, statusText: "Forbidden" };
      const result = handleApiError(mockResponse);

      expect(result.code).toBe(403);
      expect(result.userMessage).toContain("Access denied");
      expect(result.retryable).toBe(true);
    });

    it("should handle objects with statusCode property", () => {
      const mockError = { statusCode: 429, message: "Rate limited" };
      const result = handleApiError(mockError);

      expect(result.code).toBe(429);
      expect(result.userMessage).toContain("Too many requests");
      expect(result.retryable).toBe(true);
    });

    it("should handle objects with code property", () => {
      const mockApiError = { code: 404, message: "Not found" };
      const result = handleApiError(mockApiError);

      expect(result.code).toBe(404);
      expect(result.userMessage).toContain("not found");
      expect(result.retryable).toBe(false);
    });

    it("should use string error as message", () => {
      const result = handleApiError("unknown error", "Custom fallback");

      expect(result.code).toBe(500);
      expect(result.message).toBe("unknown error"); // String error becomes the message
    });

    it("should use fallback message for null errors", () => {
      const result = handleApiError(null, "Custom fallback");

      expect(result.code).toBe(500);
      expect(result.message).toBe("Custom fallback");
    });

    it("should use default fallback when none provided", () => {
      const result = handleApiError(null);

      expect(result.code).toBe(500);
      expect(result.message).toBe("An unexpected error occurred");
    });

    it("should convert non-Error objects to string", () => {
      const result = handleApiError({ custom: "error object" });

      expect(result.code).toBe(500);
      expect(result.message).toBe("[object Object]");
    });

    it("should handle complex error scenarios", () => {
      // Simulate fetch error with custom properties
      const complexError = {
        name: "FetchError",
        message: "Network request failed",
        status: 0,
        code: "NETWORK_ERROR",
      };

      const result = handleApiError(complexError);

      expect(result.code).toBe(500); // Falls back to 500 since status is 0
      expect(result.retryable).toBe(true);
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle circular reference objects", () => {
      const circularObj: Record<string, unknown> = { name: "circular" };
      circularObj.self = circularObj;

      expect(() => extractStatusCode(circularObj)).not.toThrow();
      expect(extractStatusCode(circularObj)).toBe(500);
    });

    it("should handle very large status codes", () => {
      const result = getApiErrorMessage(99999);

      expect(result.code).toBe(99999);
      expect(result.retryable).toBe(true); // Large codes >= 500 are treated as server errors
    });

    it("should handle negative status codes", () => {
      const result = getApiErrorMessage(-1);

      expect(result.code).toBe(-1);
      expect(result.retryable).toBe(false);
    });

    it("should handle zero status code", () => {
      const result = getApiErrorMessage(0);

      expect(result.code).toBe(0);
      expect(result.retryable).toBe(false);
    });
  });

  describe("Type Safety and Interface Compliance", () => {
    it("should return ApiErrorResponse interface compliant objects", () => {
      const result = getApiErrorMessage(404);

      // Check all required properties exist
      expect(result).toHaveProperty("code");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("userMessage");
      expect(result).toHaveProperty("retryable");

      // Check types
      expect(typeof result.code).toBe("number");
      expect(typeof result.message).toBe("string");
      expect(typeof result.userMessage).toBe("string");
      expect(typeof result.retryable).toBe("boolean");

      // Optional property
      if (result.suggestion) {
        expect(typeof result.suggestion).toBe("string");
      }
    });

    it("should maintain consistent interface across all status codes", () => {
      const testCodes = [200, 400, 401, 403, 404, 429, 500, 502, 503, 504, 999];

      testCodes.forEach((code) => {
        const result = getApiErrorMessage(code);

        expect(result).toHaveProperty("code");
        expect(result).toHaveProperty("message");
        expect(result).toHaveProperty("userMessage");
        expect(result).toHaveProperty("retryable");
        expect(typeof result.code).toBe("number");
        expect(typeof result.message).toBe("string");
        expect(typeof result.userMessage).toBe("string");
        expect(typeof result.retryable).toBe("boolean");
      });
    });
  });
});
