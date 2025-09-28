const StockLoading = () => {
  return (
    <div className="animate-pulse" data-testid="stock-loading">
      <div className="h-8 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-6 w-3/4 mx-auto"></div>
    </div>
  );
};

export default StockLoading;
