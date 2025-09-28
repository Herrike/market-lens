import type { ApiErrorResponse } from "@/utils/api-errors";

interface ChartErrorDisplayProps {
  errorInfo: ApiErrorResponse;
  suggestion?: string;
}

const ChartErrorDisplay = ({
  errorInfo,
  suggestion,
}: ChartErrorDisplayProps) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-red-400 dark:text-red-300 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
            Chart Loading Error
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {errorInfo.userMessage}
          </p>
          {suggestion && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 leading-relaxed">
              💡 {suggestion}
            </p>
          )}
          {errorInfo.code === 403 && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Mobile users:</strong> Try these popular free symbols:
                AAPL, MSFT, GOOGL, TSLA, AMZN
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartErrorDisplay;
