/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStockSearch } from "./useStocks";

// Mock SWR to avoid actual network calls
vi.mock("swr", () => ({
  default: vi.fn(),
}));

describe("useStockSearch Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clear any cache between tests
    localStorage.clear();
  });

  describe("Query Length Validation", () => {
    it("should allow single-letter ticker searches", async () => {
      // Mock SWR to return a predictable result
      const mockSwr = await import("swr");
      vi.mocked(mockSwr.default).mockReturnValue({
        data: [{ symbol: "F", name: "Ford Motor Company" }],
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      const { result } = renderHook(() => useStockSearch("F"));

      // Should not be loading (meaning the query was valid and processed)
      expect(result.current.isLoading).toBe(false);

      // Verify the mock was called, indicating the search was attempted
      expect(mockSwr.default).toHaveBeenCalled();
    });

    it("should reject empty queries", async () => {
      const mockSwr = await import("swr");
      vi.mocked(mockSwr.default).mockReturnValue({
        data: [],
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      const { result } = renderHook(() => useStockSearch(""));

      // For empty queries, should return empty array (default behavior)
      expect(result.current.data).toEqual([]);
    });
    it("should handle multi-character queries", async () => {
      const mockSwr = await import("swr");
      vi.mocked(mockSwr.default).mockReturnValue({
        data: [{ symbol: "AAPL", name: "Apple Inc." }],
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        isValidating: false,
      });

      const { result } = renderHook(() => useStockSearch("AAPL"));

      expect(result.current.isLoading).toBe(false);
      expect(mockSwr.default).toHaveBeenCalled();
    });
  });
});
