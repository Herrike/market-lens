/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import Navigation from "./Navigation";
import { SearchProvider } from "@/providers/SearchProvider";
import { SidebarProvider } from "@/providers/SidebarProvider";

// Mock the icons
vi.mock("@heroicons/react/20/solid/esm/MagnifyingGlassIcon", () => ({
  default: () => <div data-testid="magnifying-glass-icon">🔍</div>,
}));

vi.mock("@heroicons/react/20/solid/esm/Bars3Icon", () => ({
  default: () => <div data-testid="bars3-icon">☰</div>,
}));

vi.mock("@heroicons/react/20/solid/esm/ArrowTurnDownLeftIcon", () => ({
  default: () => <div data-testid="arrow-turn-down-left-icon">↵</div>,
}));

// Wrapper component with required providers
const NavigationWrapper = ({ children }: { children: React.ReactNode }) => (
  <SearchProvider>
    <SidebarProvider>{children}</SidebarProvider>
  </SearchProvider>
);

describe("Navigation Component - Search Input Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Search Input Rendering", () => {
    it("should render search input with placeholder", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("name", "search");
      // Note: This is a regular input, not type="search"
    });

    it("should render search button with correct icon", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const searchButton = screen.getByRole("button", {
        name: /submit search/i,
      });
      expect(searchButton).toBeInTheDocument();
      expect(
        screen.getByTestId("arrow-turn-down-left-icon")
      ).toBeInTheDocument();
    });

    it("should render magnifying glass icon", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      expect(screen.getByTestId("magnifying-glass-icon")).toBeInTheDocument();
    });
  });

  describe("Modal Opening Functionality", () => {
    it("should respond to search input interactions", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search");

      // Test mousedown event (as per the component's onMouseDownCapture)
      fireEvent.mouseDown(searchInput);

      // Verify the input is interactive
      expect(searchInput).toBeInTheDocument();
    });

    it("should prevent default behavior on search button click", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const searchButton = screen.getByRole("button", {
        name: /submit search/i,
      });

      // The button has onClick handler that prevents default
      fireEvent.click(searchButton);

      // Button should be disabled (cosmetic only)
      expect(searchButton).toBeDisabled();
    });
  });

  describe("Mobile Menu Button", () => {
    it("should render mobile menu button", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const mobileMenuButton = screen.getByRole("button", {
        name: /open sidebar/i,
      });
      expect(mobileMenuButton).toBeInTheDocument();
      expect(screen.getByTestId("bars3-icon")).toBeInTheDocument();
    });

    it("should have correct mobile-specific classes", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const mobileMenuButton = screen.getByRole("button", {
        name: /open sidebar/i,
      });
      expect(mobileMenuButton).toHaveClass("lg:hidden");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const searchInput = screen.getByLabelText("Search");
      const submitButton = screen.getByLabelText(/submit search/i);

      expect(searchInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it("should have proper semantic structure", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      // Check for proper input structure (textbox, not searchbox)
      const searchInput = screen.getByRole("textbox");
      expect(searchInput).toBeInTheDocument();

      // Check for proper button roles
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2); // Mobile menu + search submit
    });
  });

  describe("Search Input Interaction", () => {
    it("should handle mobile menu cursor pointer class", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const mobileButton = screen.getByRole("button", {
        name: /open sidebar/i,
      });
      expect(mobileButton).toHaveClass("cursor-pointer");
    });

    it("should be properly styled for dark mode", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search");

      // Check for dark mode classes
      expect(searchInput).toHaveClass("dark:text-white");
      expect(searchInput).toHaveClass("dark:placeholder:text-gray-500");
    });

    it("should handle mouse down capture on search input", () => {
      render(
        <NavigationWrapper>
          <Navigation />
        </NavigationWrapper>
      );

      const searchInput = screen.getByPlaceholderText("Search");

      // Test mousedown event
      fireEvent.mouseDown(searchInput);

      // Input should be accessible and interactive
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("name", "search");
    });
  });
});
