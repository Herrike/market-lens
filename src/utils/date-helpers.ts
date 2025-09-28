/**
 * Helper function to calculate date N days ago
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

/**
 * Helper function to calculate date 15 days ago
 * Used for historical stock data API calls
 */
export function getFifteenDaysAgo(): string {
  return getDaysAgo(15);
}

/**
 * Helper function to get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

/**
 * Helper function to format a date object to YYYY-MM-DD
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get date range for historical data (from 15 days ago to today)
 */
export function getHistoricalDateRange(): { fromDate: string; toDate: string } {
  return {
    fromDate: getFifteenDaysAgo(),
    toDate: getToday(),
  };
}
