import SearchContext from "@/contexts/SearchContext";
import { useCallback, useContext, lazy } from "react";
import SearchModal from "../search-modal/SearchModal";
import { useStockDetails } from "@/hooks/useStocks";
import { ChartBarIcon } from "@heroicons/react/24/outline";

// Lazy load Chart component to reduce initial bundle size
const Chart = lazy(() => import("../chart/Chart"));
import StockLoading from "./states/StockLoading";
import StockInfoDisplay from "./states/StockInfoDisplay";
import SelectedStockFallback from "./states/SelectedStockFallback";
import BackButton from "./ui/BackButton";
import HomeDisplay from "./states/HomeDisplay";

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
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
            </div>

            {stockLoading ? (
              <StockLoading />
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
          <HomeDisplay />
        )}
        {searchModalToggle && <SearchModal />}
      </div>
    </div>
  );
};

export default Section;
