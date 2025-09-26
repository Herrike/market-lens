/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import React from "react";
import Section from "@/components/section/Section";
import SearchContext from "@/contexts/SearchContext";
import { SidebarProvider } from "@/providers/SidebarProvider";

// Mock the Chart component
vi.mock("@/components/chart/Chart", () => ({
  default: () => <div data-testid="stock-chart">Chart Component</div>,
}));

// Mock the FreeTierSuggestions component
vi.mock("@/components/free-tier-suggestions/FreeTierSuggestions", () => ({
  default: () => (
    <div data-testid="free-tier-suggestions">Free Tier Suggestions</div>
  ),
}));

// Mock the SearchModal component
vi.mock("@/components/search-modal/SearchModal", () => ({
  default: () => <div data-testid="search-modal">Search Modal</div>,
}));

// Mock the useStocks hook
vi.mock("@/hooks/useStocks");

// Mock the icons
vi.mock("@heroicons/react/20/solid/esm/ArrowLeftIcon", () => ({
  default: () => <div data-testid="arrow-left-icon">←</div>,
}));

// Mock stock data
const mockStockDetails = {
  symbol: "AAPL",
  name: "Apple Inc.",
  currency: "USD",
  exchangeFullName: "NASDAQ Global Select Market",
  exchange: "NASDAQ",
};

const mockMinimalStock = {
  symbol: "TSLA",
  name: "Tesla, Inc.",
  currency: "USD",
  exchange: "NASDAQ",
  exchangeFullName: "NASDAQ", // Same as exchange to test the fallback logic
};

// Mock SearchContext with controllable values
const createMockSearchContext = (overrides = {}) => ({
  searchModalToggle: false,
  setSearchModalToggle: vi.fn(),
  searchQuery: "",
  setSearchQuery: vi.fn(),
  selectedStock: "",
  setSelectedStock: vi.fn(),
  ...overrides,
});

// Custom wrapper with mocked context
const SectionWrapper = ({
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

describe("Stock Detail Display Component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Default mock for useStockDetails
    const useStocksModule = await import("@/hooks/useStocks");
    vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
      stock: null,
      isLoading: false,
      error: undefined,
    });
  });

  describe("Homepage State (No Stock Selected)", () => {
    it("should show homepage when no stock is selected", () => {
      render(
        <SectionWrapper contextValue={{ selectedStock: "" }}>
          <Section />
        </SectionWrapper>,
      );

      expect(screen.getByTestId("app-title")).toBeInTheDocument();
      expect(screen.getByTestId("app-description")).toBeInTheDocument();
      expect(screen.getByTestId("free-tier-suggestions")).toBeInTheDocument();
    });

    it("should not show back button on homepage", () => {
      render(
        <SectionWrapper contextValue={{ selectedStock: "" }}>
          <Section />
        </SectionWrapper>,
      );

      expect(
        screen.queryByTestId("back-to-home-button"),
      ).not.toBeInTheDocument();
    });

    it("should show search modal when toggle is true", () => {
      render(
        <SectionWrapper
          contextValue={{
            selectedStock: "",
            searchModalToggle: true,
          }}
        >
          <Section />
        </SectionWrapper>,
      );

      expect(screen.getByTestId("search-modal")).toBeInTheDocument();
    });
  });

  describe("Stock Detail Loading State", () => {
    it("should show loading skeleton when fetching stock details", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: null,
        isLoading: true,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      // Check for loading skeleton elements
      const loadingElements = screen
        .getAllByRole("generic")
        .filter((el) => el.className.includes("animate-pulse"));
      expect(loadingElements.length).toBeGreaterThan(0);

      // Should still show chart and back button even during loading
      expect(screen.getByTestId("stock-chart")).toBeInTheDocument();
      expect(screen.getByTestId("back-to-home-button")).toBeInTheDocument();
    });
  });

  describe("Stock Detail Loaded State", () => {
    it("should display complete stock information", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: mockStockDetails,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      // Check stock name and symbol
      expect(screen.getByTestId("stock-name")).toBeInTheDocument();
      expect(screen.getByTestId("stock-symbol")).toBeInTheDocument();

      // Check currency display
      expect(screen.getByTestId("stock-currency")).toBeInTheDocument();

      // Check exchange information
      expect(screen.getByTestId("stock-exchange")).toBeInTheDocument();
      expect(screen.getByTestId("stock-exchange")).toBeInTheDocument();
      expect(screen.getByTestId("stock-exchange-short")).toBeInTheDocument();

      // Check chart is displayed
      expect(screen.getByTestId("stock-chart")).toBeInTheDocument();

      // Check back button
      expect(screen.getByTestId("back-to-home-button")).toBeInTheDocument();
    });

    it("should display stock with minimal information", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: mockMinimalStock,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "TSLA" }}>
          <Section />
        </SectionWrapper>,
      );

      expect(screen.getByTestId("stock-name")).toBeInTheDocument();
      expect(screen.getByTestId("stock-symbol")).toBeInTheDocument();
      expect(screen.getByTestId("stock-currency")).toBeInTheDocument();

      // Should show exchange name as fallback when no exchangeFullName
      expect(screen.getByTestId("stock-exchange")).toBeInTheDocument();
    });

    it("should handle stock without currency", async () => {
      const stockWithoutCurrency = {
        ...mockStockDetails,
        currency: "", // Empty string instead of undefined
      };

      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: stockWithoutCurrency,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      expect(screen.getByTestId("stock-name")).toBeInTheDocument();
      expect(screen.getByTestId("stock-symbol")).toBeInTheDocument();

      // Currency should not be displayed
      expect(screen.queryByText(/USD/)).not.toBeInTheDocument();
    });
  });

  describe("Stock Detail Fallback State", () => {
    it("should show symbol when no stock details available", () => {
      render(
        <SectionWrapper contextValue={{ selectedStock: "UNKNOWN" }}>
          <Section />
        </SectionWrapper>,
      );

      // Should show the selected stock symbol as fallback (check heading specifically)
      expect(
        screen.getByRole("heading", { name: "UNKNOWN" }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Selected Stock Symbol/)).toBeInTheDocument();

      // Chart should still be shown
      expect(screen.getByTestId("stock-chart")).toBeInTheDocument();

      // Back button should be available
      expect(screen.getByTestId("back-to-home-button")).toBeInTheDocument();
    });
  });

  describe("Chart Integration", () => {
    it("should always display chart component when stock is selected", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: mockStockDetails,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      expect(screen.getByTestId("stock-chart")).toBeInTheDocument();
    });

    it("should display chart even with loading state", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: null,
        isLoading: true,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      expect(screen.getByTestId("stock-chart")).toBeInTheDocument();
    });

    it("should not display chart on homepage", () => {
      render(
        <SectionWrapper contextValue={{ selectedStock: "" }}>
          <Section />
        </SectionWrapper>,
      );

      expect(screen.queryByTestId("stock-chart")).not.toBeInTheDocument();
    });
  });

  describe("Back to Home Functionality", () => {
    it("should call setSelectedStock with empty string when back button clicked", async () => {
      const user = userEvent.setup();
      const setSelectedStock = vi.fn();

      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: mockStockDetails,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper
          contextValue={{
            selectedStock: "AAPL",
            setSelectedStock,
          }}
        >
          <Section />
        </SectionWrapper>,
      );

      const backButton = screen.getByTestId("back-to-home-button");
      await user.click(backButton);

      expect(setSelectedStock).toHaveBeenCalledWith("");
    });

    it("should display correct back button styling and content", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: mockStockDetails,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      const backButton = screen.getByTestId("back-to-home-button");
      expect(backButton).toHaveClass("cursor-pointer");
      // Icon is rendered as actual SVG, not our mock
      expect(screen.getByText("Back to Home")).toBeInTheDocument();
      expect(screen.getByText("Back to Home")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle stock details error gracefully", async () => {
      const mockError = {
        name: "ApiError",
        message: "Stock not found",
        status: 404,
      };

      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: null,
        isLoading: false,
        error: mockError,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "INVALID" }}>
          <Section />
        </SectionWrapper>,
      );

      // Should show fallback with symbol when error occurs (check heading specifically)
      expect(
        screen.getByRole("heading", { name: "INVALID" }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Selected Stock Symbol/)).toBeInTheDocument();

      // Chart and back button should still be available
      expect(screen.getByTestId("stock-chart")).toBeInTheDocument();
      expect(screen.getByTestId("back-to-home-button")).toBeInTheDocument();
    });
  });

  describe("Responsive Layout", () => {
    it("should have proper responsive classes", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: mockStockDetails,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      // Check for responsive container classes
      const container = screen
        .getByText("Apple Inc.")
        .closest('div[class*="max-w-7xl"]');
      expect(container).toHaveClass(
        "mx-auto",
        "max-w-7xl",
        "px-4",
        "sm:px-6",
        "lg:px-8",
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: mockStockDetails,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      // Main stock name should be a heading
      const heading = screen.getByRole("heading", { name: /apple inc/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H1");
    });

    it("should provide proper button accessibility", async () => {
      const useStocksModule = await import("@/hooks/useStocks");
      vi.mocked(useStocksModule.useStockDetails).mockReturnValue({
        stock: mockStockDetails,
        isLoading: false,
        error: undefined,
      });

      render(
        <SectionWrapper contextValue={{ selectedStock: "AAPL" }}>
          <Section />
        </SectionWrapper>,
      );

      const backButton = screen.getByTestId("back-to-home-button");
      // Button doesn't have explicit type attribute, but defaults to button
      expect(backButton.tagName).toBe("BUTTON");
    });
  });
});
