import type { Stock } from "@/types/api.types";
import type { ApiError } from "@/types/api.types";
import { handleApiError, getErrorSuggestion } from "@/utils/api-errors";
import SearchResultItem from "./SearchResultItem";
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface SearchResultsListProps {
  results: Stock[];
  isLoading: boolean;
  error: ApiError | null;
  query: string;
}

const SearchResultsList = ({
  results,
  isLoading,
  error,
  query,
}: SearchResultsListProps) => {
  // Don't show anything if no query
  if (!query || query.length < 1) {
    return null;
  }

  // Loading state and skeletons (3 placeholders)
  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded-lg h-16"
            ></div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          Searching for "{query}"...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorInfo = handleApiError(error, "Failed to search stocks");
    const suggestion = getErrorSuggestion(errorInfo.code);

    return (
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 dark:text-red-300 mt-0.5 flex-shrink-0" />
          <div className="ml-3 flex-1">
            <h2 className="text-sm font-medium text-red-800 dark:text-red-200">
              Search failed
            </h2>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {errorInfo.userMessage}
            </p>
            {suggestion && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 leading-relaxed">
                💡 {suggestion}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No results
  if (!results || results.length === 0) {
    return (
      <div className="mt-4 py-8 px-6 text-center">
        <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
        <h2 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">
          No stocks found
        </h2>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          No results for "{query}". Try a different symbol or company name.
        </p>
      </div>
    );
  }

  // Results list
  return (
    <div className="mt-4">
      {/* Results counter above the list */}
      <div className="mb-3 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {results.length} result{results.length !== 1 ? "s" : ""} found for "
          {query}"
        </span>
      </div>

      {/* Scrollable results list */}
      <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50">
        {results.map((stock) => (
          <SearchResultItem
            key={`${stock.symbol}-${stock.exchange}`}
            stock={stock}
          />
        ))}
      </div>

      {results.length >= 10 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Showing first {results.length} results
        </p>
      )}
    </div>
  );
};

export default SearchResultsList;
