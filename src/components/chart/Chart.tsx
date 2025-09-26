import { useContext, Suspense } from "react";
import SearchContext from "@/contexts/SearchContext";
import { useStockHistory, type HistoricalPrice } from "@/hooks/useStockHistory";
import { useStockQuote } from "@/hooks/useStockQuote";
import {
  FREE_TIER_SYMBOLS,
  SYMBOL_NAMES,
  isFreeTierSymbol,
} from "@/utils/freeTierSymbols";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Chart loading component
const ChartLoading = ({ symbol }: { symbol: string }) => (
  <div className="bg-gray-50 rounded-lg p-8 mb-6 text-center">
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
    </div>
    <p className="text-sm text-gray-500 mb-2">
      Analysing {symbol} history trend
    </p>
    <p className="text-xs text-gray-400">Loading historical price data...</p>
  </div>
);

// Main chart component
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
    console.error("Chart error:", error);

    // Special handling for 402 Payment Required error with educational content
    if (error.message.includes("402")) {
      return (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">
              📊 Historical Charts: Free Tier Limitations
            </h3>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Individual stocks</strong> like{" "}
              <code className="bg-gray-100 px-1 rounded">{selectedStock}</code>{" "}
              require a paid Financial Modeling Prep subscription for historical
              data access.
            </p>
            <p className="text-sm text-gray-700">
              However, you can view historical charts for these{" "}
              <strong>major market indices</strong> on the free tier:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {FREE_TIER_SYMBOLS.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedStock(symbol)}
                className="bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-left transition-colors duration-200 cursor-pointer"
              >
                <div className="font-medium text-indigo-800 text-sm">
                  {symbol}
                </div>
                <div className="text-xs text-gray-600">
                  {SYMBOL_NAMES[symbol]}
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-indigo-600 mb-2">
              � Click any index above to view its historical chart
            </p>
            <p className="text-xs text-gray-500">
              For individual stock charts, consider upgrading to a paid API plan
            </p>
          </div>
        </div>
      );
    }

    // Regular error handling for other errors
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-600 mb-2">
          Error loading chart data for {selectedStock}
        </p>
        <p className="text-xs text-red-500 mb-2">{error.message}</p>
        {error.message.includes("403") && (
          <p className="text-xs text-red-400">
            This might be an API key or rate limit issue. Check the console for
            more details.
          </p>
        )}
      </div>
    );
  }

  // Handle fallback to quote data when historical data fails with 402
  if (shouldUseFallback && quoteData) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">
            {selectedStock} - Current Quote
          </h3>
          <p className="text-sm text-indigo-600 mb-4">
            Historical data requires a paid subscription. Showing current price
            data instead.
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <p className="text-gray-600">Current Price</p>
              <p className="text-xl font-bold text-gray-900">
                ${quoteData.quote.price.toFixed(2)}
              </p>
              <p
                className={`text-sm ${quoteData.quote.change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {quoteData.quote.change >= 0 ? "+" : ""}
                {quoteData.quote.change.toFixed(2)} (
                {quoteData.quote.changesPercentage.toFixed(2)}%)
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <p className="text-gray-600">Day Range</p>
              <p className="text-lg font-semibold text-gray-900">
                ${quoteData.quote.dayLow.toFixed(2)} - $
                {quoteData.quote.dayHigh.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <p className="text-gray-600">52 Week Range</p>
              <p className="text-lg font-semibold text-gray-900">
                ${quoteData.quote.yearLow.toFixed(2)} - $
                {quoteData.quote.yearHigh.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <p className="text-gray-600">Volume</p>
              <p className="text-lg font-semibold text-gray-900">
                {(quoteData.quote.volume / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>

          <p className="text-xs text-indigo-500 mt-4">
            💡 Upgrade your API subscription to view historical charts and
            trends
          </p>
        </div>
      </div>
    );
  }

  // Show empty state for historical data
  if (!historicalData || historicalData.data.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-600 mb-2">
          No historical data available
        </p>
        <p className="text-xs text-yellow-500">
          Historical price data for {selectedStock} is not available.
        </p>
      </div>
    );
  }

  // Transform historical data for Highcharts
  const chartData = historicalData.data
    .map((item: HistoricalPrice) => [new Date(item.date).getTime(), item.price])
    .reverse(); // Reverse to show oldest to newest

  // Highcharts configuration
  const displayName = isFreeTierSymbol(selectedStock)
    ? `${SYMBOL_NAMES[selectedStock]} (${selectedStock})`
    : selectedStock;

  const options: Highcharts.Options = {
    accessibility: {
      enabled: false, // Disable accessibility module to remove warning
    },
    title: {
      text: `${displayName} Price History`,
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    subtitle: {
      text: "15-Day Historical Price Data",
      style: {
        fontSize: "14px",
        color: "#666",
      },
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Date",
      },
    },
    yAxis: {
      title: {
        text: "Price ($)",
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        type: "line" as const,
        name: `${selectedStock} Price`,
        data: chartData,
        color: "#4f46e5", // Indigo for the price line
        lineWidth: 2,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 4,
            },
          },
        },
      },
    ],
    tooltip: {
      formatter: function () {
        return `<b>${selectedStock}</b><br/>
                ${Highcharts.dateFormat("%B %e, %Y", this.x as number)}<br/>
                Price: $${(this.y as number).toFixed(2)}`;
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            title: {
              style: {
                fontSize: "16px",
              },
            },
            subtitle: {
              style: {
                fontSize: "12px",
              },
            },
          },
        },
      ],
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

// Chart component with Suspense wrapper
const Chart = () => {
  const { selectedStock } = useContext(SearchContext);

  if (!selectedStock) {
    return null;
  }

  return (
    <Suspense fallback={<ChartLoading symbol={selectedStock} />}>
      <StockChart />
    </Suspense>
  );
};

export default Chart;
