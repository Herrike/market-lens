import FreeTierSuggestions from "../../free-tier-suggestions/FreeTierSuggestions";

const HomeDisplay = () => {
  return (
    <>
      <h1
        className="text-2xl font-semibold text-gray-900"
        data-testid="app-title"
      >
        Market Lens
      </h1>
      <p
        className="mt-2 text-gray-600 dark:text-gray-400"
        data-testid="app-description"
      >
        Search for a stock to get started
      </p>

      {/* Show free tier suggestions */}
      <FreeTierSuggestions />
    </>
  );
};

export default HomeDisplay;
