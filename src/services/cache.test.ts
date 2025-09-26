/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hasValidCache,
  getCache,
  getCacheMetadata,
  setCache,
  clearCache,
  clearAllCache,
  getCacheInfo,
} from "./cache";

// Mock the cache config
vi.mock("@/config/cache", () => ({
  cacheConfig: {
    keyPrefix: "test-market-lens",
    durations: {
      stockSearch: 24 * 60 * 60 * 1000, // 24 hours
      stockDetails: 4 * 60 * 60 * 1000, // 4 hours
      stockHistory1Hour: 2 * 60 * 60 * 1000, // 2 hours
      stockHistory1Day: 6 * 60 * 60 * 1000, // 6 hours
      stockHistory1Year: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
}));

describe("Cache Service", () => {
  // Mock console.warn to avoid noise in tests
  const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    consoleWarnSpy.mockClear();
  });

  describe("setCache and getCache", () => {
    it("should store and retrieve data correctly", () => {
      const testData = { symbol: "AAPL", name: "Apple Inc." };

      setCache("stockSearch", "AAPL", testData);
      const result = getCache("stockSearch", "AAPL");

      expect(result).toEqual(testData);
    });

    it("should return null for non-existent cache", () => {
      const result = getCache("stockSearch", "NONEXISTENT");
      expect(result).toBeNull();
    });

    it("should handle localStorage errors gracefully", () => {
      const testData = { symbol: "AAPL" };

      // Mock localStorage.setItem to throw
      const setItemSpy = vi
        .spyOn(localStorage, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage quota exceeded");
        });

      // The main assertion is that it doesn't throw
      expect(() => setCache("stockSearch", "AAPL", testData)).not.toThrow();

      // Restore
      setItemSpy.mockRestore();
    });
  });

  describe("hasValidCache", () => {
    it("should return true for valid, non-expired cache", () => {
      const testData = { symbol: "AAPL" };
      setCache("stockSearch", "AAPL", testData);

      const result = hasValidCache("stockSearch", "AAPL");
      expect(result).toBe(true);
    });

    it("should return false for non-existent cache", () => {
      const result = hasValidCache("stockSearch", "NONEXISTENT");
      expect(result).toBe(false);
    });

    it("should handle invalid JSON gracefully", () => {
      localStorage.setItem(
        "test-market-lens-stockSearch-INVALID",
        "invalid json"
      );

      const result = hasValidCache("stockSearch", "INVALID");
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe("getCacheMetadata", () => {
    it("should return correct metadata for existing cache", () => {
      const testData = { symbol: "AAPL" };
      setCache("stockDetails", "AAPL", testData);

      const result = getCacheMetadata("stockDetails", "AAPL");

      expect(result).toBeDefined();
      expect(result?.timestamp).toBeTypeOf("number");
      expect(result?.age).toBeGreaterThanOrEqual(0);
      expect(result?.remaining).toBeGreaterThan(0);
    });

    it("should return null for non-existent cache", () => {
      const result = getCacheMetadata("stockDetails", "NONEXISTENT");
      expect(result).toBeNull();
    });
  });

  describe("clearCache", () => {
    it("should remove specific cache entry", () => {
      const testData = { symbol: "AAPL" };
      setCache("stockSearch", "AAPL", testData);

      expect(getCache("stockSearch", "AAPL")).toEqual(testData);

      clearCache("stockSearch", "AAPL");

      expect(getCache("stockSearch", "AAPL")).toBeNull();
    });
  });

  describe("clearAllCache", () => {
    it("should remove only app-specific cache entries", () => {
      // Set up test data
      setCache("stockSearch", "AAPL", { symbol: "AAPL" });
      setCache("stockDetails", "MSFT", { symbol: "MSFT" });
      localStorage.setItem("other-app-data", "should remain");

      // Verify cache exists
      expect(getCache("stockSearch", "AAPL")).toBeDefined();
      expect(getCache("stockDetails", "MSFT")).toBeDefined();
      expect(localStorage.getItem("other-app-data")).toBe("should remain");

      // Clear all app cache
      clearAllCache();

      // Verify only app cache was cleared
      expect(getCache("stockSearch", "AAPL")).toBeNull();
      expect(getCache("stockDetails", "MSFT")).toBeNull();
      expect(localStorage.getItem("other-app-data")).toBe("should remain");
    });
  });

  describe("getCacheInfo", () => {
    it("should return cache info for all app caches", () => {
      // Set up test data
      setCache("stockSearch", "AAPL", { symbol: "AAPL" });
      setCache("stockDetails", "MSFT", { symbol: "MSFT" });
      localStorage.setItem("other-app-data", "should not appear");

      const result = getCacheInfo();

      expect(result.length).toBeGreaterThanOrEqual(2);

      const hasAaplCache = result.some((item) => item.key.includes("AAPL"));
      const hasMsftCache = result.some((item) => item.key.includes("MSFT"));
      const hasOtherData = result.some((item) => item.key === "other-app-data");

      expect(hasAaplCache).toBe(true);
      expect(hasMsftCache).toBe(true);
      expect(hasOtherData).toBe(false);

      // Check that each cache info has required properties
      result.forEach((cacheInfo) => {
        expect(cacheInfo.key).toBeTypeOf("string");
        expect(cacheInfo.size).toBeTypeOf("number");
        expect(cacheInfo.age).toBeTypeOf("number");
        expect(cacheInfo.size).toBeGreaterThan(0);
      });
    });
  });

  describe("Cache expiration", () => {
    it("should handle expired cache correctly", () => {
      const testData = { symbol: "AAPL" };

      // Mock Date.now to simulate cache expiration
      const originalNow = Date.now;
      const baseTime = 1000000000000; // Some base timestamp

      Date.now = vi.fn(() => baseTime);
      setCache("stockDetails", "AAPL", testData); // 4 hour duration

      // Move time forward by 5 hours (past expiration)
      Date.now = vi.fn(() => baseTime + 5 * 60 * 60 * 1000);

      const result = getCache("stockDetails", "AAPL");
      expect(result).toBeNull();

      const hasValid = hasValidCache("stockDetails", "AAPL");
      expect(hasValid).toBe(false);

      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe("Type safety", () => {
    it("should work with different data types", () => {
      const stringData = "test string";
      const numberData = 42;
      const objectData = { complex: { nested: "data" } };
      const arrayData = [1, 2, 3, { nested: "array" }];

      setCache("stockSearch", "STRING", stringData);
      setCache("stockSearch", "NUMBER", numberData);
      setCache("stockSearch", "OBJECT", objectData);
      setCache("stockSearch", "ARRAY", arrayData);

      expect(getCache("stockSearch", "STRING")).toBe(stringData);
      expect(getCache("stockSearch", "NUMBER")).toBe(numberData);
      expect(getCache("stockSearch", "OBJECT")).toEqual(objectData);
      expect(getCache("stockSearch", "ARRAY")).toEqual(arrayData);
    });
  });
});
