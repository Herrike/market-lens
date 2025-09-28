import SearchContext from "@/contexts/SearchContext";
import { useCallback, useContext, lazy } from "react";
import SearchModal from "../search-modal/SearchModal";
import { useStockDetails } from "@/hooks/useStocks";

// Lazy load Chart component to reduce initial bundle size
const Chart = lazy(() => import("../chart/Chart"));
import StockLoadingState from "./states/StockLoadingState";
import StockInfoDisplay from "./states/StockInfoDisplay";
import SelectedStockFallback from "./states/SelectedStockFallback";
import BackButton from "./ui/BackButton";
import HomeState from "./states/HomeState";

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
              <StockLoadingState />
            ) : stock ? (
              <StockInfoDisplay stock={stock} />
            ) : (
              <SelectedStockFallback selectedStock={selectedStock} />
            )}

            {/* Chart Component with built-in Suspense */}
            <Chart />

            {/* Back button footer */}
            <BackButton onClick={handleBackToHome} />
          </div>
        ) : (
          <HomeState />
        )}
        {searchModalToggle && <SearchModal />}
      </div>
    </div>
  );
};

export default Section;
