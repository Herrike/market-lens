import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  hasCachedFailure,
  cacheFailure,
  getCachedFailure,
  hasCachedSuccess,
  getCachedSuccess,
  cacheSuccess,
} from "./stock-quote-cache";

describe("stock-quote-cache", () => {
  const mockQuoteData = {
    symbol: "AAPL",
    price: 150.25,
    change: 2.5,
    changePercent: 1.69,
    previousClose: 147.75,
    dayHigh: 151.0,
    dayLow: 148.5,
    volume: 50000000,
    marketCap: 2500000000,
    timestamp: "2024-01-15T16:00:00Z",
  };

  beforeEach(() => {
    // Clear localStorage to prevent test interference
    localStorage.clear();

    // Mock timers for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe("Success Data Caching", () => {
    it("should cache successful stock details data", () => {
      cacheSuccess("stockDetails", "AAPL", mockQuoteData);

      expect(hasCachedSuccess("stockDetails", "AAPL")).toBe(true);
      expect(getCachedSuccess("stockDetails", "AAPL")).toEqual(mockQuoteData);
    });

    it("should return null for non-cached symbol", () => {
      expect(hasCachedSuccess("stockDetails", "NONEXISTENT")).toBe(false);
      expect(getCachedSuccess("stockDetails", "NONEXISTENT")).toBeNull();
    });

    it("should override existing cached data", () => {
      const initialData = { ...mockQuoteData, price: 100 };
      const updatedData = { ...mockQuoteData, price: 200 };

      cacheSuccess("stockDetails", "AAPL", initialData);
      cacheSuccess("stockDetails", "AAPL", updatedData);

      const cached = getCachedSuccess<typeof mockQuoteData>(
        "stockDetails",
        "AAPL",
      );
      expect(cached?.price).toBe(200);
    });

    it("should handle multiple symbols independently", () => {
      const aaplData = { ...mockQuoteData, symbol: "AAPL", price: 150 };
      const googlData = { ...mockQuoteData, symbol: "GOOGL", price: 2800 };

      cacheSuccess("stockDetails", "AAPL", aaplData);
      cacheSuccess("stockDetails", "GOOGL", googlData);

      expect(
        getCachedSuccess<typeof mockQuoteData>("stockDetails", "AAPL")?.price,
      ).toBe(150);
      expect(
        getCachedSuccess<typeof mockQuoteData>("stockDetails", "GOOGL")?.price,
      ).toBe(2800);
    });

    it("should handle different cache categories independently", () => {
      cacheSuccess("stockDetails", "AAPL", mockQuoteData);
      cacheSuccess("stockHistory1Day", "AAPL", { data: "history" });

      expect(hasCachedSuccess("stockDetails", "AAPL")).toBe(true);
      expect(hasCachedSuccess("stockHistory1Day", "AAPL")).toBe(true);
      expect(getCachedSuccess("stockDetails", "AAPL")).toEqual(mockQuoteData);
      expect(getCachedSuccess("stockHistory1Day", "AAPL")).toEqual({
        data: "history",
      });
    });
  });

  describe("Failure Status Management", () => {
    it("should cache failure status", () => {
      const errorMessage = "API rate limit exceeded";
      cacheFailure("stockDetails", "AAPL", errorMessage);

      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(true);
      expect(getCachedFailure("stockDetails", "AAPL")?.error).toBe(
        errorMessage,
      );
    });

    it("should return false for non-failed symbols", () => {
      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(false);
      expect(getCachedFailure("stockDetails", "AAPL")).toBeNull();
    });

    it("should handle multiple failed symbols", () => {
      cacheFailure("stockDetails", "AAPL", "Rate limit");
      cacheFailure("stockDetails", "GOOGL", "Invalid API key");

      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(true);
      expect(hasCachedFailure("stockDetails", "GOOGL")).toBe(true);
      expect(hasCachedFailure("stockDetails", "TSLA")).toBe(false);
    });

    it("should include timestamp in failure data", () => {
      const errorMessage = "Server error";
      const beforeTimestamp = Date.now();

      cacheFailure("stockDetails", "AAPL", errorMessage);

      const failure = getCachedFailure("stockDetails", "AAPL");
      expect(failure?.error).toBe(errorMessage);
      expect(failure?.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(failure?.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it("should handle different failure categories independently", () => {
      cacheFailure("stockDetails", "AAPL", "Details API error");
      cacheFailure("stockHistory1Day", "AAPL", "History API error");

      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(true);
      expect(hasCachedFailure("stockHistory1Day", "AAPL")).toBe(true);
      expect(getCachedFailure("stockDetails", "AAPL")?.error).toBe(
        "Details API error",
      );
      expect(getCachedFailure("stockHistory1Day", "AAPL")?.error).toBe(
        "History API error",
      );
    });

    it("should override existing failure data", () => {
      cacheFailure("stockDetails", "AAPL", "Initial error");
      cacheFailure("stockDetails", "AAPL", "Updated error");

      const failure = getCachedFailure("stockDetails", "AAPL");
      expect(failure?.error).toBe("Updated error");
    });
  });

  describe("Cache and Failure Interaction", () => {
    it("should maintain cached data independent of failure status", () => {
      cacheSuccess("stockDetails", "AAPL", mockQuoteData);
      cacheFailure("stockDetails", "AAPL", "Later API error");

      // Both cache and failure status should be independent
      expect(getCachedSuccess("stockDetails", "AAPL")).toEqual(mockQuoteData);
      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(true);
    });

    it("should handle success after previous failure", () => {
      // Cache failure first
      cacheFailure("stockDetails", "AAPL", "Initial error");
      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(true);

      // Cache successful data (simulating recovery)
      cacheSuccess("stockDetails", "AAPL", mockQuoteData);

      expect(getCachedSuccess("stockDetails", "AAPL")).toEqual(mockQuoteData);
      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(true); // Failure still cached
    });

    it("should handle failure after successful cache", () => {
      // Cache successful data first
      cacheSuccess("stockDetails", "AAPL", mockQuoteData);
      expect(getCachedSuccess("stockDetails", "AAPL")).toEqual(mockQuoteData);

      // Later cache failure (different request scenario)
      cacheFailure("stockDetails", "AAPL", "Subsequent error");

      // Both should coexist
      expect(getCachedSuccess("stockDetails", "AAPL")).toEqual(mockQuoteData);
      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(true);
    });
  });

  describe("Edge Cases and Robustness", () => {
    it("should handle empty string symbol", () => {
      cacheSuccess("stockDetails", "", mockQuoteData);
      cacheFailure("stockDetails", "", "Empty symbol error");

      expect(getCachedSuccess("stockDetails", "")).toEqual(mockQuoteData);
      expect(hasCachedFailure("stockDetails", "")).toBe(true);
    });

    it("should handle case sensitivity", () => {
      cacheSuccess("stockDetails", "AAPL", mockQuoteData);
      cacheFailure("stockDetails", "aapl", "Lowercase error");

      // Symbols should be case-sensitive
      expect(getCachedSuccess("stockDetails", "AAPL")).toEqual(mockQuoteData);
      expect(getCachedSuccess("stockDetails", "aapl")).toBeNull();
      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(false);
      expect(hasCachedFailure("stockDetails", "aapl")).toBe(true);
    });

    it("should handle special characters in symbols", () => {
      const specialSymbol = "BRK.B";
      const specialData = { ...mockQuoteData, symbol: specialSymbol };

      cacheSuccess("stockDetails", specialSymbol, specialData);
      cacheFailure("stockDetails", specialSymbol, "Special char error");

      expect(getCachedSuccess("stockDetails", specialSymbol)).toEqual(
        specialData,
      );
      expect(hasCachedFailure("stockDetails", specialSymbol)).toBe(true);
    });

    it("should handle long symbol names", () => {
      const longSymbol = "A".repeat(100);
      const longData = { ...mockQuoteData, symbol: longSymbol };

      cacheSuccess("stockDetails", longSymbol, longData);
      cacheFailure("stockDetails", longSymbol, "Long symbol error");

      expect(getCachedSuccess("stockDetails", longSymbol)).toEqual(longData);
      expect(hasCachedFailure("stockDetails", longSymbol)).toBe(true);
    });

    it("should handle empty error messages", () => {
      cacheFailure("stockDetails", "AAPL", "");

      expect(hasCachedFailure("stockDetails", "AAPL")).toBe(true);
      expect(getCachedFailure("stockDetails", "AAPL")?.error).toBe("");
    });

    it("should handle very long error messages", () => {
      const longError = "Error: ".repeat(1000);
      cacheFailure("stockDetails", "AAPL", longError);

      expect(getCachedFailure("stockDetails", "AAPL")?.error).toBe(longError);
    });
  });

  describe("Type Safety", () => {
    it("should maintain type safety for cached data", () => {
      interface CustomQuoteData {
        symbol: string;
        customField: number;
      }

      const customData: CustomQuoteData = { symbol: "AAPL", customField: 123 };

      cacheSuccess("stockDetails", "AAPL", customData);
      const cached = getCachedSuccess<CustomQuoteData>("stockDetails", "AAPL");

      expect(cached?.customField).toBe(123);
      expect(cached?.symbol).toBe("AAPL");
    });

    it("should handle null and undefined data gracefully", () => {
      // These should not throw errors
      expect(() =>
        cacheSuccess("stockDetails", "NULL_TEST", null),
      ).not.toThrow();
      expect(() => getCachedSuccess("stockDetails", "NULL_TEST")).not.toThrow();

      cacheSuccess("stockDetails", "NULL_TEST", null);
      expect(getCachedSuccess("stockDetails", "NULL_TEST")).toBe(null);
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle many symbols efficiently", () => {
      // Cache many symbols to test performance
      for (let i = 0; i < 100; i++) {
        const symbol = `STOCK${i}`;
        const data = { ...mockQuoteData, symbol, price: i };

        cacheSuccess("stockDetails", symbol, data);

        if (i % 2 === 0) {
          cacheFailure("stockDetails", symbol, `Error for ${symbol}`);
        }
      }

      // Verify random samples work correctly
      expect(
        getCachedSuccess<typeof mockQuoteData>("stockDetails", "STOCK50")
          ?.price,
      ).toBe(50);
      expect(hasCachedFailure("stockDetails", "STOCK50")).toBe(true); // Even numbers have failures
      expect(hasCachedFailure("stockDetails", "STOCK51")).toBe(false); // Odd numbers don't
    });

    it("should handle rapid successive operations", () => {
      // Simulate rapid operations
      for (let i = 0; i < 10; i++) {
        cacheSuccess("stockDetails", "AAPL", { ...mockQuoteData, price: i });
        const cached = getCachedSuccess<typeof mockQuoteData>(
          "stockDetails",
          "AAPL",
        );
        expect(cached?.price).toBe(i);
      }
    });
  });
});
