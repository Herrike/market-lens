interface SelectedStockFallbackProps {
  selectedStock: string;
}

const SelectedStockFallback = ({
  selectedStock,
}: SelectedStockFallbackProps) => {
  return (
    <>
      <h2
        className="text-3xl font-bold text-gray-900 mb-2"
        data-testid="selected-stock-symbol"
      >
        {selectedStock}
      </h2>
      <p className="text-gray-600 mb-6" data-testid="selected-symbol">
        Selected Stock Symbol <strong>{selectedStock}</strong>
      </p>
    </>
  );
};

export default SelectedStockFallback;
