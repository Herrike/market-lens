import { useContext } from "react";
import SearchContext from "@/contexts/SearchContext";
import { FREE_TIER_SYMBOLS, SYMBOL_NAMES } from "@/utils/free-tier-symbols";

const FreeTierSuggestions = () => {
  const { setSelectedStock } = useContext(SearchContext);

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-indigo-800 mb-2">
          Free Tier Suggestions
        </h2>
        <p className="text-sm text-gray-700">
          Historical charts are available for major market indices on the free
          tier
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {FREE_TIER_SYMBOLS.slice(0, 6).map((symbol) => (
          <button
            key={symbol}
            onClick={() => setSelectedStock(symbol)}
            className="bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-left transition-colors duration-200 hover:shadow-sm cursor-pointer"
          >
            <div className="font-medium text-indigo-800 text-sm">{symbol}</div>
            <div className="text-xs text-gray-600">{SYMBOL_NAMES[symbol]}</div>
          </button>
        ))}
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-indigo-600">
          💡 Individual stocks require a paid API subscription for historical
          data
        </p>
      </div>
    </div>
  );
};

export default FreeTierSuggestions;
