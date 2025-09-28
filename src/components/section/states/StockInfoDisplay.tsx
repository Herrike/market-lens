interface Stock {
  name: string;
  symbol: string;
  currency?: string;
  exchange?: string;
  exchangeFullName?: string;
}

interface StockInfoDisplayProps {
  stock: Stock;
}

const StockInfoDisplay = ({ stock }: StockInfoDisplayProps) => {
  return (
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
          <span className="text-gray-500" data-testid="stock-currency">
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
          <div className="text-sm text-gray-600" data-testid="stock-exchange">
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
  );
};

export default StockInfoDisplay;
