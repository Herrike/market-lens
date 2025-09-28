import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getDaysAgo,
  getFifteenDaysAgo,
  getToday,
  formatDateForAPI,
  getHistoricalDateRange,
} from "./date-helpers";

describe("date-helpers", () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z")); // January 15, 2024
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getDaysAgo", () => {
    it("should return date N days ago in YYYY-MM-DD format", () => {
      expect(getDaysAgo(1)).toBe("2024-01-14"); // Yesterday
      expect(getDaysAgo(7)).toBe("2024-01-08"); // 1 week ago
      expect(getDaysAgo(30)).toBe("2023-12-16"); // ~1 month ago
      expect(getDaysAgo(365)).toBe("2023-01-15"); // 1 year ago
    });

    it("should handle zero days (today)", () => {
      expect(getDaysAgo(0)).toBe("2024-01-15");
    });

    it("should handle large numbers of days", () => {
      expect(getDaysAgo(1000)).toBe("2021-04-20");
    });

    it("should handle month boundaries correctly", () => {
      // Test when subtracting days crosses month boundary
      vi.setSystemTime(new Date("2024-03-01T12:00:00Z")); // March 1
      expect(getDaysAgo(1)).toBe("2024-02-29"); // Leap year Feb 29
      expect(getDaysAgo(2)).toBe("2024-02-28");
    });

    it("should handle year boundaries correctly", () => {
      vi.setSystemTime(new Date("2024-01-01T12:00:00Z")); // New Year's Day
      expect(getDaysAgo(1)).toBe("2023-12-31"); // Previous year
      expect(getDaysAgo(365)).toBe("2023-01-01"); // 1 year ago (leap year)
    });
  });

  describe("getFifteenDaysAgo", () => {
    it("should return date 15 days ago", () => {
      expect(getFifteenDaysAgo()).toBe("2023-12-31"); // 15 days before Jan 15, 2024
    });

    it("should be consistent with getDaysAgo(15)", () => {
      expect(getFifteenDaysAgo()).toBe(getDaysAgo(15));
    });

    it("should handle different current dates", () => {
      vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
      expect(getFifteenDaysAgo()).toBe("2024-05-31");

      vi.setSystemTime(new Date("2024-12-15T12:00:00Z"));
      expect(getFifteenDaysAgo()).toBe("2024-11-30");
    });
  });

  describe("getToday", () => {
    it("should return current date in YYYY-MM-DD format", () => {
      expect(getToday()).toBe("2024-01-15");
    });

    it("should work with different dates", () => {
      vi.setSystemTime(new Date("2023-07-04T12:00:00Z"));
      expect(getToday()).toBe("2023-07-04");

      vi.setSystemTime(new Date("2025-12-25T23:59:59Z"));
      expect(getToday()).toBe("2025-12-25");
    });

    it("should handle timezone consistently (UTC)", () => {
      // Test edge case around midnight
      vi.setSystemTime(new Date("2024-01-15T00:00:00Z"));
      expect(getToday()).toBe("2024-01-15");

      vi.setSystemTime(new Date("2024-01-15T23:59:59Z"));
      expect(getToday()).toBe("2024-01-15");
    });
  });

  describe("formatDateForAPI", () => {
    it("should format Date object to YYYY-MM-DD", () => {
      const date1 = new Date("2024-01-15T12:00:00Z");
      expect(formatDateForAPI(date1)).toBe("2024-01-15");

      const date2 = new Date("2023-07-04T00:00:00Z");
      expect(formatDateForAPI(date2)).toBe("2023-07-04");

      const date3 = new Date("2025-12-25T23:59:59Z");
      expect(formatDateForAPI(date3)).toBe("2025-12-25");
    });

    it("should handle leap year dates correctly", () => {
      const leapYearDate = new Date("2024-02-29T12:00:00Z");
      expect(formatDateForAPI(leapYearDate)).toBe("2024-02-29");
    });

    it("should be consistent with getToday for current date", () => {
      const now = new Date();
      expect(formatDateForAPI(now)).toBe(getToday());
    });
  });

  describe("getHistoricalDateRange", () => {
    it("should return object with fromDate and toDate", () => {
      const range = getHistoricalDateRange();

      expect(range).toHaveProperty("fromDate");
      expect(range).toHaveProperty("toDate");
      expect(typeof range.fromDate).toBe("string");
      expect(typeof range.toDate).toBe("string");
    });

    it("should have fromDate as 15 days ago and toDate as today", () => {
      const range = getHistoricalDateRange();

      expect(range.fromDate).toBe(getFifteenDaysAgo());
      expect(range.toDate).toBe(getToday());
    });

    it("should return valid date range for API calls", () => {
      const range = getHistoricalDateRange();

      // Verify date format (YYYY-MM-DD)
      expect(range.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.toDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify fromDate is before toDate
      expect(new Date(range.fromDate) < new Date(range.toDate)).toBe(true);
    });

    it("should work across different time periods", () => {
      // Test at beginning of year
      vi.setSystemTime(new Date("2024-01-05T12:00:00Z"));
      let range = getHistoricalDateRange();
      expect(range.fromDate).toBe("2023-12-21"); // Crosses year boundary
      expect(range.toDate).toBe("2024-01-05");

      // Test at end of year
      vi.setSystemTime(new Date("2024-12-30T12:00:00Z"));
      range = getHistoricalDateRange();
      expect(range.fromDate).toBe("2024-12-15");
      expect(range.toDate).toBe("2024-12-30");
    });

    it("should handle month boundaries correctly", () => {
      vi.setSystemTime(new Date("2024-03-05T12:00:00Z"));
      const range = getHistoricalDateRange();
      expect(range.fromDate).toBe("2024-02-19"); // February (leap year)
      expect(range.toDate).toBe("2024-03-05");
    });
  });

  describe("Date format consistency", () => {
    it("all functions should return consistent YYYY-MM-DD format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      expect(getToday()).toMatch(dateRegex);
      expect(getFifteenDaysAgo()).toMatch(dateRegex);
      expect(getDaysAgo(5)).toMatch(dateRegex);

      const range = getHistoricalDateRange();
      expect(range.fromDate).toMatch(dateRegex);
      expect(range.toDate).toMatch(dateRegex);

      const customDate = new Date("2024-06-15");
      expect(formatDateForAPI(customDate)).toMatch(dateRegex);
    });
  });

  describe("Edge cases and robustness", () => {
    it("should handle leap years correctly", () => {
      vi.setSystemTime(new Date("2024-03-01T12:00:00Z")); // Day after leap day
      expect(getDaysAgo(1)).toBe("2024-02-29"); // Leap day
      expect(getDaysAgo(2)).toBe("2024-02-28");
    });

    it("should handle non-leap years correctly", () => {
      vi.setSystemTime(new Date("2023-03-01T12:00:00Z")); // Non-leap year
      expect(getDaysAgo(1)).toBe("2023-02-28"); // No leap day
      expect(getDaysAgo(29)).toBe("2023-01-31"); // Skip Feb 29
    });

    it("should handle DST transitions gracefully", () => {
      // Test around typical DST transition dates
      vi.setSystemTime(new Date("2024-03-11T12:00:00Z")); // DST start in US
      const range = getHistoricalDateRange();
      expect(range.fromDate).toBe("2024-02-25");
      expect(range.toDate).toBe("2024-03-11");
    });
  });
});
