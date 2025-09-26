import { useCallback, useContext } from "react";
import type { Stock } from "@/types/api";
import SearchContext from "@/contexts/SearchContext";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface SearchResultItemProps {
  stock: Stock;
}

const SearchResultItem = ({ stock }: SearchResultItemProps) => {
  const { searchModalToggle, setSelectedStock, setSearchModalToggle } =
    useContext(SearchContext);

  const handleClick = useCallback(() => {
    // Save selected stock symbol to context
    setSelectedStock(stock.symbol);
    // Close the modal
    if (searchModalToggle) setSearchModalToggle(false);
  }, [searchModalToggle, setSearchModalToggle, setSelectedStock, stock]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {/* Stock Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {stock.symbol}
              </h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {stock.currency}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {stock.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {stock.exchangeFullName}
            </p>
          </div>
        </div>

        {/* Chevron Icon */}
        <div className="flex-shrink-0 ml-2">
          <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
    </button>
  );
};

export default SearchResultItem;
