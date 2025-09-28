import type { StockQuoteData } from "@/hooks/useStockQuote";

interface QuoteFallbackCardProps {
  selectedStock: string;
  quoteData: StockQuoteData;
}

const QuoteFallbackCard = ({
  selectedStock,
  quoteData,
}: QuoteFallbackCardProps) => {
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
              className={`text-sm ${
                quoteData.quote.change >= 0 ? "text-green-600" : "text-red-600"
              }`}
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
          💡 Upgrade your API subscription to view historical charts and trends
        </p>
      </div>
    </div>
  );
};

export default QuoteFallbackCard;
