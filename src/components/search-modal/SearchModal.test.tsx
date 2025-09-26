/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import React from "react";
import SearchModal from "./SearchModal";
import SearchContext from "@/contexts/SearchContext";
import { SidebarProvider } from "@/providers/SidebarProvider";

// Mock the icons
vi.mock("@heroicons/react/20/solid/esm/MagnifyingGlassIcon", () => ({
  default: () => <div data-testid="magnifying-glass-icon">🔍</div>,
}));

vi.mock("@heroicons/react/24/outline/esm/ChevronRightIcon", () => ({
  default: () => <div data-testid="chevron-right-icon">{`>`}</div>,
}));

// Mock the useStocks hook
vi.mock("@/hooks/useStocks");

// Mock stock data
const mockStockData = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    currency: "USD",
    exchangeFullName: "NASDAQ Global Select",
    exchange: "NASDAQ",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    currency: "USD",
    exchangeFullName: "NASDAQ Global Select",
    exchange: "NASDAQ",
  },
];

// Mock SearchContext with controllable values
const createMockSearchContext = (overrides = {}) => ({
  searchModalToggle: true,
  setSearchModalToggle: vi.fn(),
  searchQuery: "",
  setSearchQuery: vi.fn(),
  selectedStock: "",
  setSelectedStock: vi.fn(),
  ...overrides,
});

// Custom wrapper with mocked context
const SearchModalWrapper = ({
  children,
  contextValue = {},
}: {
  children: React.ReactNode;
  contextValue?: Record<string, unknown>;
}) => {
  const mockContext = createMockSearchContext(contextValue);

  return (
    <SidebarProvider>
      <SearchContext.Provider value={mockContext}>
        {children}
      </SearchContext.Provider>
    </SidebarProvider>
  );
};

describe("SearchModal Component - Search & Results Flow", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Import and mock useStockSearch
    const useStocksModule = await import("@/hooks/useStocks");
    vi.mocked(useStocksModule.useStockSearch).mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
      clearCache: vi.fn(),
      isCached: false,
    });
  });

  describe("Modal Rendering and Visibility", () => {
    it("should render when modal is open", () => {
      render(
        <SearchModalWrapper contextValue={{ searchModalToggle: true }}>
          <SearchModal />
        </SearchModalWrapper>,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Lens on Stocks")).toBeInTheDocument();
    });

    it("should not render when modal is closed", () => {
      render(
        <SearchModalWrapper contextValue={{ searchModalToggle: false }}>
          <SearchModal />
        </SearchModalWrapper>,
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render search form", () => {
      render(
        <SearchModalWrapper contextValue={{ searchModalToggle: true }}>
          <SearchModal />
        </SearchModalWrapper>,
      );

      expect(
        screen.getByLabelText(/search a stock by their code/i),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter stock symbol (e.g., AAPL)"),
      ).toBeInTheDocument();
    });
  });

  describe("Search Form Functionality", () => {
    it("should handle search input typing", async () => {
      const user = userEvent.setup();

      render(
        <SearchModalWrapper contextValue={{ searchModalToggle: true }}>
          <SearchModal />
        </SearchModalWrapper>,
      );

      const searchInput = screen.getByPlaceholderText(
        "Enter stock symbol (e.g., AAPL)",
      );
      await user.type(searchInput, "AAPL");

      expect(searchInput).toHaveValue("AAPL");
    });

    it("should submit search form and call setSearchQuery", async () => {
      const user = userEvent.setup();
      const setSearchQuery = vi.fn();

      render(
        <SearchModalWrapper
          contextValue={{
            searchModalToggle: true,
            setSearchQuery,
          }}
        >
          <SearchModal />
        </SearchModalWrapper>,
      );

      const searchInput = screen.getByPlaceholderText(
        "Enter stock symbol (e.g., AAPL)",
      );
      const searchButton = screen.getByRole("button", {
        name: /search for stock/i,
      });

      await user.type(searchInput, "AAPL");
      await user.click(searchButton);

      expect(setSearchQuery).toHaveBeenCalledWith("AAPL");
    });

    it("should trim whitespace from search query", async () => {
      const user = userEvent.setup();
      const setSearchQuery = vi.fn();

      render(
        <SearchModalWrapper
          contextValue={{
            searchModalToggle: true,
            setSearchQuery,
          }}
        >
          <SearchModal />
        </SearchModalWrapper>,
      );

      const searchInput = screen.getByPlaceholderText(
        "Enter stock symbol (e.g., AAPL)",
      );
      const searchButton = screen.getByRole("button", {
        name: /search for stock/i,
      });

      await user.type(searchInput, "  AAPL  ");
      await user.click(searchButton);

      expect(setSearchQuery).toHaveBeenCalledWith("AAPL");
    });
  });

  describe("Loading State", () => {
    it("should show loading state during search", async () => {
      // Mock loading state
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockSearch).mockReturnValue({
        data: [],
        isLoading: true,
        error: undefined,
        refetch: vi.fn(),
        clearCache: vi.fn(),
        isCached: false,
      });

      render(
        <SearchModalWrapper
          contextValue={{
            searchModalToggle: true,
            searchQuery: "AAPL",
          }}
        >
          <SearchModal />
        </SearchModalWrapper>,
      );

      expect(screen.getByText('Searching for "AAPL"...')).toBeInTheDocument();
    });

    it("should disable form during loading", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockSearch).mockReturnValue({
        data: [],
        isLoading: true,
        error: undefined,
        refetch: vi.fn(),
        clearCache: vi.fn(),
        isCached: false,
      });

      render(
        <SearchModalWrapper
          contextValue={{
            searchModalToggle: true,
            searchQuery: "AAPL",
          }}
        >
          <SearchModal />
        </SearchModalWrapper>,
      );

      const searchInput = screen.getByPlaceholderText(
        "Enter stock symbol (e.g., AAPL)",
      );
      const searchButton = screen.getByRole("button", {
        name: /searching.../i,
      });

      expect(searchInput).toBeDisabled();
      expect(searchButton).toBeDisabled();
    });
  });

  describe("Search Results Display", () => {
    it("should display search results", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockSearch).mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
        clearCache: vi.fn(),
        isCached: false,
      });

      render(
        <SearchModalWrapper
          contextValue={{
            searchModalToggle: true,
            searchQuery: "AAPL",
          }}
        >
          <SearchModal />
        </SearchModalWrapper>,
      );

      expect(
        screen.getByText('2 results found for "AAPL"'),
      ).toBeInTheDocument();
      expect(screen.getByText("AAPL")).toBeInTheDocument();
      expect(screen.getByText("Apple Inc.")).toBeInTheDocument();
      expect(screen.getByText("MSFT")).toBeInTheDocument();
      expect(screen.getByText("Microsoft Corporation")).toBeInTheDocument();
    });

    it("should show no results message when no stocks found", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockSearch).mockReturnValue({
        data: [],
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
        clearCache: vi.fn(),
        isCached: false,
      });

      render(
        <SearchModalWrapper
          contextValue={{
            searchModalToggle: true,
            searchQuery: "INVALID",
          }}
        >
          <SearchModal />
        </SearchModalWrapper>,
      );

      expect(screen.getByText("No stocks found")).toBeInTheDocument();
      expect(screen.getByText(/No results for "INVALID"/)).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should display error message when search fails", async () => {
      const mockError = {
        name: "ApiError",
        message: "API rate limit exceeded",
        status: 429,
      };

      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockSearch).mockReturnValue({
        data: [],
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
        clearCache: vi.fn(),
        isCached: false,
      });

      render(
        <SearchModalWrapper
          contextValue={{
            searchModalToggle: true,
            searchQuery: "AAPL",
          }}
        >
          <SearchModal />
        </SearchModalWrapper>,
      );

      expect(screen.getByText("Search Error")).toBeInTheDocument();
      expect(
        screen.getAllByText(
          "Too many requests. Please wait a moment and try again.",
        ),
      ).toHaveLength(2); // Form error + results error
    });
  });

  describe("Result Item Interaction", () => {
    it("should handle stock selection and close modal", async () => {
      const user = userEvent.setup();
      const setSelectedStock = vi.fn();
      const setSearchModalToggle = vi.fn();

      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockSearch).mockReturnValue({
        data: mockStockData,
        isLoading: false,
        error: undefined,
        refetch: vi.fn(),
        clearCache: vi.fn(),
        isCached: false,
      });

      render(
        <SearchModalWrapper
          contextValue={{
            searchModalToggle: true,
            searchQuery: "AAPL",
            setSelectedStock,
            setSearchModalToggle,
          }}
        >
          <SearchModal />
        </SearchModalWrapper>,
      );

      const appleStock = screen.getByText("Apple Inc.").closest("button");
      await user.click(appleStock!);

      expect(setSelectedStock).toHaveBeenCalledWith("AAPL");
      expect(setSearchModalToggle).toHaveBeenCalledWith(false);
    });
  });
});
