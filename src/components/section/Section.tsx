import SearchContext from "@/contexts/SearchContext";
import { useCallback, useContext } from "react";
import SearchModal from "../search-modal/SearchModal";
import Chart from "../chart/Chart";
import FreeTierSuggestions from "../free-tier-suggestions/FreeTierSuggestions";
import { useStockDetails } from "@/hooks/useStocks";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

const Section = () => {
  const { selectedStock, searchModalToggle, setSelectedStock } =
    useContext(SearchContext);

  // Get full stock details from cache or fetch if needed
  const { stock, isLoading: stockLoading } = useStockDetails(selectedStock);

  // Handler to go back to homepage
  const handleBackToHome = useCallback(() => {
    setSelectedStock(""); // Clear selected stock from context
  }, [setSelectedStock]);

  return (
    <div
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      data-testid="section-container"
    >
      {/* Stock content will go here */}
      <div className="text-center py-12" data-testid="section-content">
        {selectedStock ? (
          <div
            className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto"
            data-testid="stock-selected-container"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-indigo-100 rounded-full p-3">
                <svg
                  className="h-8 w-8 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>

            {stockLoading ? (
              <div className="animate-pulse" data-testid="stock-loading">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-6 w-3/4 mx-auto"></div>
              </div>
            ) : stock ? (
              <>
                <h1
                  className="text-3xl font-bold text-gray-900 mb-2"
                  data-testid="stock-name"
                >
                  {stock.name}
                </h1>
                <p className="text-gray-600 mb-4" data-testid="stock-info">
                  <span
                    className="font-semibold text-indigo-600"
                    data-testid="stock-symbol"
                  >
                    {stock.symbol}
                  </span>
                  {stock.currency && (
                    <span
                      className="text-gray-500"
                      data-testid="stock-currency"
                    >
                      {" "}
                      • {stock.currency}
                    </span>
                  )}
                </p>
                {stock.exchange && (
                  <div
                    className="bg-gray-50 rounded-lg p-3 mb-6"
                    data-testid="stock-exchange-container"
                  >
                    <div
                      className="text-sm text-gray-600"
                      data-testid="stock-exchange"
                    >
                      <span className="font-medium">Exchange:</span>{" "}
                      {stock.exchangeFullName || stock.exchange}
                      {stock.exchangeFullName &&
                        stock.exchange !== stock.exchangeFullName && (
                          <span
                            className="text-gray-400"
                            data-testid="stock-exchange-short"
                          >
                            {" "}
                            ({stock.exchange})
                          </span>
                        )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h1
                  className="text-3xl font-bold text-gray-900 mb-2"
                  data-testid="selected-stock-symbol"
                >
                  {selectedStock}
                </h1>
                <p
                  className="text-gray-600 mb-6"
                  data-testid="selected-stock-description"
                >
                  Selected Stock Symbol <strong>{selectedStock}</strong>
                </p>
              </>
            )}

            {/* Chart Component with Suspense */}
            <Chart />

            {/* Back button footer */}
            <div
              className="mt-8 pt-6 border-t border-gray-200"
              data-testid="back-button-container"
            >
              <button
                onClick={handleBackToHome}
                data-testid="back-to-home-button"
                className="inline-flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200 cursor-pointer dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
              >
                <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" />
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1
              className="text-2xl font-semibold text-gray-900"
              data-testid="app-title"
            >
              Market Lens
            </h1>
            <p
              className="mt-2 text-gray-600 dark:text-gray-400"
              data-testid="app-description"
            >
              Search for a stock to get started
            </p>

            {/* Show free tier suggestions */}
            <FreeTierSuggestions />
          </>
        )}
        {searchModalToggle && <SearchModal />}
      </div>
    </div>
  );
};

export default Section;
