import SearchContext from "@/contexts/SearchContext";
import { useCallback, useContext, useState } from "react";
import clsx from "clsx";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useStockSearch } from "@/hooks/useStocks";
import { handleApiError } from "@/utils/api-errors";
import { validateStockQuery } from "@/services/api";

const SearchModalForm = () => {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Use SWR hook for API calls - only search when query is submitted
  const { data: _data, error, isLoading } = useStockSearch(searchQuery);

  // Base input styling - flat right border for unified appearance
  const baseInputClasses =
    "flex-1 block w-full rounded-l-md rounded-r-none bg-white py-1.5 px-3 text-gray-900 placeholder:text-gray-400 focus:z-10 sm:text-sm/6 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500/70";

  // Error state overrides
  const errorClasses =
    "!text-red-900 !placeholder:text-red-300 dark:!bg-white/5 dark:!text-red-400 dark:!placeholder:text-red-400/70";

  // Loading state overrides - disabled appearance
  const loadingClasses =
    "!bg-gray-100 !text-gray-400 !cursor-not-allowed dark:!bg-gray-800/50 dark:!text-gray-600";

  // Search button styling - flat left border for unified appearance
  const searchButtonClasses =
    "inline-flex items-center rounded-l-none rounded-r-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 cursor-pointer dark:bg-indigo-500 dark:hover:bg-indigo-400";

  // Disabled button styling
  const disabledButtonClasses =
    "inline-flex items-center rounded-l-none rounded-r-md bg-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-500 shadow-xs cursor-not-allowed dark:bg-gray-700 dark:text-gray-500";

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const formSearch = formData.get("search");
      const query = typeof formSearch === "string" ? formSearch : ""; // ensure it's a string

      // Clear previous validation error
      setValidationError(null);

      if (query) {
        try {
          // Validate the query format before searching
          validateStockQuery(query);

          // Only set search query if validation passes and it's different
          if (query !== searchQuery) {
            setSearchQuery(query);
          }
        } catch (validationErr) {
          // Handle validation error with user-friendly message
          const errorMessage =
            validationErr instanceof Error
              ? validationErr.message
              : "Invalid stock symbol format";

          // Convert technical error to user-friendly message
          const userFriendlyMessage = errorMessage.includes(
            "Invalid stock symbol format",
          )
            ? "Please enter a valid stock symbol (e.g., AAPL, MSFT, ^DJI)"
            : errorMessage.includes("empty")
              ? "Please enter a stock symbol"
              : "Invalid ticker format - please use letters, numbers, dots, or dashes only";

          setValidationError(userFriendlyMessage);
        }
      }
    },
    [searchQuery, setSearchQuery],
  );

  return (
    <form onSubmit={handleSearchSubmit}>
      <div>
        <label
          htmlFor="search"
          className="block text-sm/6 font-medium text-gray-900 dark:text-white"
        >
          Search a stock by their code.
        </label>
        <div className="mt-2 flex">
          <input
            defaultValue=""
            id="search"
            name="search"
            type="search"
            placeholder="Enter stock symbol (e.g., AAPL)"
            disabled={isLoading}
            aria-invalid={!!(validationError || error)}
            aria-describedby={
              validationError || error ? "search-error" : undefined
            }
            className={clsx(
              baseInputClasses,
              (validationError || error) && errorClasses,
              isLoading && loadingClasses,
            )}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={isLoading ? disabledButtonClasses : searchButtonClasses}
            aria-label={isLoading ? "Searching..." : "Search for stock"}
          >
            <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {(validationError || error) && (
          <p
            id="search-error"
            className="mt-2 text-sm text-red-600 dark:text-red-400"
          >
            {validationError ||
              handleApiError(error, "Search failed. Please try again.")
                .userMessage}
          </p>
        )}
      </div>
    </form>
  );
};

export default SearchModalForm;
