// StockChart component

import SearchContext from "@/contexts/SearchContext";
import { useStockHistory } from "@/hooks/useStockHistory";
import { useStockQuote } from "@/hooks/useStockQuote";
import { handleApiError, getErrorSuggestion } from "@/utils/api-errors";
import { createStockChartOptions } from "@/utils/stock-chart-options";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { useContext } from "react";
import ChartLoading from "./ChartLoading";
import PaymentRequiredError from "./errors/PaymentRequiredError";
import ChartErrorDisplay from "./errors/ChartErrorDisplay";
import QuoteFallbackCard from "./states/QuoteFallbackCard";
import EmptyChartState from "./states/EmptyChartState";

const StockChart = () => {
  const { selectedStock, setSelectedStock } = useContext(SearchContext);
  const {
    data: historicalData,
    error: historyError,
    isLoading: historyLoading,
  } = useStockHistory(selectedStock);

  // Use quote data as fallback when historical data fails with 402 error
  const shouldUseFallback = historyError?.status === 402;
  const {
    data: quoteData,
    error: quoteError,
    isLoading: quoteLoading,
  } = useStockQuote(shouldUseFallback ? selectedStock : "");

  // Determine loading state
  const isLoading = historyLoading || (shouldUseFallback && quoteLoading);

  // Determine error state
  const error = shouldUseFallback ? quoteError : historyError;

  // Show loading state
  if (isLoading) {
    return <ChartLoading symbol={selectedStock} />;
  }

  // Show error state (but only if not falling back to quote data)
  if (error && !(shouldUseFallback && quoteData)) {
    const errorInfo = handleApiError(error, "Failed to load chart data");
    const suggestion = getErrorSuggestion(errorInfo.code);

    // Special handling for 402 Payment Required error with educational content
    if (errorInfo.code === 402 || error.message.includes("402")) {
      return (
        <PaymentRequiredError
          selectedStock={selectedStock}
          onSymbolSelect={setSelectedStock}
        />
      );
    }

    // Regular error handling for other errors
    return <ChartErrorDisplay errorInfo={errorInfo} suggestion={suggestion} />;
  }

  // Handle fallback to quote data when historical data fails with 402
  if (shouldUseFallback && quoteData) {
    return (
      <QuoteFallbackCard selectedStock={selectedStock} quoteData={quoteData} />
    );
  }

  // Show empty state for historical data
  if (!historicalData || historicalData.data.length === 0) {
    return <EmptyChartState selectedStock={selectedStock} />;
  }

  // Create chart options using our utility
  const options = createStockChartOptions(selectedStock, historicalData);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default StockChart;
