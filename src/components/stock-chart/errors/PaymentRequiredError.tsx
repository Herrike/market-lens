import { FREE_TIER_SYMBOLS, SYMBOL_NAMES } from "@/utils/free-tier-symbols";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface PaymentRequiredErrorProps {
  selectedStock: string;
  onSymbolSelect: (stock: string) => void;
}

const PaymentRequiredError = ({
  selectedStock,
  onSymbolSelect,
}: PaymentRequiredErrorProps) => {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
      <div className="text-center mb-4">
        <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          <InformationCircleIcon className="h-8 w-8 text-indigo-600" />
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
            onClick={() => onSymbolSelect(symbol)}
            className="bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-left transition-colors duration-200 cursor-pointer"
          >
            <div className="font-medium text-indigo-800 text-sm">{symbol}</div>
            <div className="text-xs text-gray-600">{SYMBOL_NAMES[symbol]}</div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-indigo-600 mb-2">
          💡 Click any index above to view its historical chart
        </p>
        <p className="text-xs text-gray-500">
          For individual stock charts, consider upgrading to a paid API plan
        </p>
      </div>
    </div>
  );
};

export default PaymentRequiredError;
