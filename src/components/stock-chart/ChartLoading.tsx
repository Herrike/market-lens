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

export default ChartLoading;
