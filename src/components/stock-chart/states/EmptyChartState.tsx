interface EmptyChartStateProps {
  selectedStock: string;
}

const EmptyChartState = ({ selectedStock }: EmptyChartStateProps) => {
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
};

export default EmptyChartState;
