import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildApiUrl,
  validateStockQuery,
  makeApiRequest,
  searchStocks,
  getDefaultConfig,
  apiService,
  type ApiConfig,
} from "./api";
import type { Stock, ApiError } from "@/types/api.types";

// Environment variables are mocked in test setup

describe("API Service", () => {
  const mockConfig: ApiConfig = {
    baseUrl: "https://test-api.com/v3",
    apiKey: "test-key",
  };

  const mockStock: Stock = {
    symbol: "AAPL",
    name: "Apple Inc.",
    currency: "USD",
    exchangeFullName: "NASDAQ Global Select",
    exchange: "NASDAQ",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDefaultConfig", () => {
    it("should return config from environment variables", () => {
      const config = getDefaultConfig();
      expect(config.baseUrl).toBeDefined();
      expect(config.apiKey).toBeDefined();
    });

    it("should use provided API key or fallback to demo", () => {
      const config = getDefaultConfig();
      expect(config.apiKey).toBeDefined();
      expect(typeof config.apiKey).toBe("string");
      expect(config.apiKey.length).toBeGreaterThan(0);
    });
  });

  describe("buildApiUrl", () => {
    it("should build correct URL with endpoint and API key", () => {
      const url = buildApiUrl(mockConfig, "/stable/search-symbol");

      expect(url).toBe(
        "https://test-api.com/stable/search-symbol?apikey=test-key",
      );
    });

    it("should include additional parameters", () => {
      const url = buildApiUrl(mockConfig, "/stable/search-symbol", {
        query: "AAPL",
        limit: 10,
      });

      expect(url).toContain("query=AAPL");
      expect(url).toContain("limit=10");
      expect(url).toContain("apikey=test-key");
    });

    it("should handle numeric parameters correctly", () => {
      const url = buildApiUrl(mockConfig, "/test", { limit: 5, page: 1 });

      expect(url).toContain("limit=5");
      expect(url).toContain("page=1");
    });

    it("should handle special characters in parameters", () => {
      const url = buildApiUrl(mockConfig, "/test", { query: "^GSPC" });

      expect(url).toContain("query=%5EGSPC"); // URL encoded ^
    });
  });

  describe("validateStockQuery", () => {
    it("should validate and clean valid stock symbols", () => {
      expect(validateStockQuery("aapl")).toBe("AAPL");
      expect(validateStockQuery(" MSFT ")).toBe("MSFT");
      expect(validateStockQuery("BRK.A")).toBe("BRK.A");
      expect(validateStockQuery("^GSPC")).toBe("^GSPC");
    });

    it("should throw error for empty queries", () => {
      expect(() => validateStockQuery("")).toThrow(
        "Search query cannot be empty",
      );
      expect(() => validateStockQuery("   ")).toThrow(
        "Search query cannot be empty",
      );
    });

    it("should throw error for invalid formats", () => {
      expect(() => validateStockQuery("invalid symbol with spaces")).toThrow(
        "Invalid stock symbol format",
      );
      expect(() => validateStockQuery("toolongstocksymbol")).toThrow(
        "Invalid stock symbol format",
      );
      expect(() => validateStockQuery("123@#$")).toThrow(
        "Invalid stock symbol format",
      );
    });

    it("should accept valid special characters", () => {
      expect(() => validateStockQuery("BRK.B")).not.toThrow();
      expect(() => validateStockQuery("^DJI")).not.toThrow();
      expect(() => validateStockQuery("SPY-")).not.toThrow();
    });
  });

  describe("makeApiRequest", () => {
    it("should make successful API request", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockStock]),
      });

      const result = await makeApiRequest<Stock[]>(
        "https://test.com",
        mockFetch,
      );

      expect(mockFetch).toHaveBeenCalledWith("https://test.com");
      expect(result).toEqual([mockStock]);
    });

    it("should handle HTTP errors correctly", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(
        makeApiRequest("https://test.com", mockFetch),
      ).rejects.toThrow("HTTP 404: Not Found");
    });

    it("should handle network errors", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(
        makeApiRequest("https://test.com", mockFetch),
      ).rejects.toMatchObject({
        name: "Error",
        message: "Network error",
      });
    });

    it("should handle JSON parsing errors", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(
        makeApiRequest("https://test.com", mockFetch),
      ).rejects.toMatchObject({
        name: "Error",
        message: "Invalid JSON",
      });
    });

    it("should create proper ApiError structure", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Test error"));

      try {
        await makeApiRequest("https://test.com", mockFetch);
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.name).toBe("Error");
        expect(apiError.message).toBe("Test error");
        expect(apiError.status).toBeUndefined();
      }
    });
  });

  describe("searchStocks", () => {
    it("should search stocks with valid query", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockStock]),
      });

      const result = await searchStocks("aapl", 10, mockConfig, mockFetch);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-api.com/stable/search-symbol?apikey=test-key&query=AAPL&limit=10",
      );
      expect(result).toEqual([mockStock]);
    });

    it("should use default limit when not provided", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockStock]),
      });

      await searchStocks("aapl", undefined, mockConfig, mockFetch);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10"),
      );
    });

    it("should throw validation error for invalid query", async () => {
      const mockFetch = vi.fn();

      await expect(searchStocks("", 10, mockConfig, mockFetch)).rejects.toThrow(
        "Search query cannot be empty",
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should use default config when not provided", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockStock]),
      });

      // Test the function uses getDefaultConfig internally
      await searchStocks("aapl", 10, undefined, mockFetch);

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe("apiService", () => {
    it("should provide convenience method for searching stocks", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockStock]),
      });

      // Mock the global fetch
      vi.stubGlobal("fetch", mockFetch);

      const result = await apiService.searchStocks("aapl");

      expect(result).toEqual([mockStock]);
      expect(mockFetch).toHaveBeenCalled();

      vi.unstubAllGlobals();
    });

    it("should use default limit in convenience method", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([mockStock]),
      });

      vi.stubGlobal("fetch", mockFetch);

      await apiService.searchStocks("aapl");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10"),
      );

      vi.unstubAllGlobals();
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle unknown error types gracefully", async () => {
      const mockFetch = vi.fn().mockRejectedValue("string error");

      try {
        await makeApiRequest("https://test.com", mockFetch);
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.name).toBe("ApiError");
        expect(apiError.message).toBe("An unknown error occurred");
      }
    });

    it("should handle Response object as error", async () => {
      const mockResponse = new Response("", { status: 500 });
      const mockFetch = vi.fn().mockRejectedValue(mockResponse);

      try {
        await makeApiRequest("https://test.com", mockFetch);
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.status).toBe(500);
      }
    });
  });
});
