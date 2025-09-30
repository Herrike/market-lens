/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { ErrorBoundary, withErrorBoundary } from "@/components/ErrorBoundary";

// Mock console.error to avoid noise in test output
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, "location", {
  writable: true,
  value: {
    reload: mockReload,
  },
});

// Mock the Heroicons
vi.mock("@heroicons/react/24/outline", () => ({
  ExclamationTriangleIcon: ({ className }: { className: string }) => (
    <div data-testid="exclamation-icon" className={className}>
      ⚠️
    </div>
  ),
}));

// Component that throws an error for testing
const ErrorThrowingComponent = ({
  shouldThrow = false,
}: {
  shouldThrow?: boolean;
}) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div data-testid="working-component">Component is working</div>;
};

// Component that throws after user interaction
const ConditionalErrorComponent = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error("User triggered error");
  }

  return (
    <button
      data-testid="trigger-error-button"
      onClick={() => setShouldThrow(true)}
    >
      Click to trigger error
    </button>
  );
};

describe("ErrorBoundary Component", () => {
  beforeEach(() => {
    consoleSpy.mockClear();
    mockReload.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Normal Operation", () => {
    it("should render children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("working-component")).toBeInTheDocument();
      expect(screen.getByText("Component is working")).toBeInTheDocument();
    });

    it("should not show error UI when children render successfully", () => {
      render(
        <ErrorBoundary>
          <div data-testid="healthy-component">Healthy component</div>
        </ErrorBoundary>,
      );

      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("exclamation-icon")).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should catch and display error when child component throws", () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Should show error UI
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByTestId("exclamation-icon")).toBeInTheDocument();

      // Should not render the failing component
      expect(screen.queryByTestId("working-component")).not.toBeInTheDocument();
    });

    it("should log error to console when error occurs", () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error Boundary caught an error:",
        expect.any(Error),
        expect.any(Object),
      );
    });

    it("should display error details in development mode", () => {
      // Mock development environment
      vi.stubEnv("DEV", true);

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Should show error details section
      expect(
        screen.getByText("Error Details (Development)"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();

      vi.unstubAllEnvs();
    });

    it("should not display error details in production mode", () => {
      // Mock production environment
      vi.stubEnv("DEV", false);

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Should not show error details
      expect(
        screen.queryByText("Error Details (Development)"),
      ).not.toBeInTheDocument();

      vi.unstubAllEnvs();
    });
  });

  describe("Custom Fallback UI", () => {
    it("should render custom fallback when provided", () => {
      const customFallback = (
        <div data-testid="custom-fallback">Custom error message</div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
      expect(screen.getByText("Custom error message")).toBeInTheDocument();

      // Should not show default error UI
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });

    it("should use default fallback when no custom fallback provided", () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Should show default error UI
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText(
          "We're sorry, but something unexpected happened. This has been logged and we're working to fix it.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle retry button click", () => {
      render(
        <ErrorBoundary>
          <ConditionalErrorComponent />
        </ErrorBoundary>,
      );

      // Trigger error
      const triggerButton = screen.getByTestId("trigger-error-button");
      fireEvent.click(triggerButton);

      // Should show error UI
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByTestId("try-again");
      fireEvent.click(retryButton);

      // After retry, the component should be back to working state initially
      // (the ConditionalErrorComponent resets its internal state)
      expect(screen.getByTestId("trigger-error-button")).toBeInTheDocument();
    });

    it("should handle reload page button click", () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const reloadButton = screen.getByTestId("reload-page");
      fireEvent.click(reloadButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Boundary Styling", () => {
    it("should have proper accessibility classes", () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Check that the main error UI container exists
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Check that buttons have proper classes
      const tryAgainButton = screen.getByTestId("try-again");
      const reloadButton = screen.getByTestId("reload-page");

      expect(tryAgainButton).toHaveClass("bg-indigo-600");
      expect(reloadButton).toHaveClass("bg-gray-300");
    });

    it("should have proper button styling", () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>,
      );

      const retryButton = screen.getByTestId("try-again");
      const reloadButton = screen.getByTestId("reload-page");

      expect(retryButton).toHaveClass("bg-indigo-600", "hover:bg-indigo-700");
      expect(reloadButton).toHaveClass("bg-gray-300", "hover:bg-gray-400");
    });
  });
});

describe("withErrorBoundary HOC", () => {
  it("should wrap component with error boundary", () => {
    const TestComponent = ({ shouldFail }: { shouldFail: boolean }) => {
      if (shouldFail) {
        throw new Error("HOC test error");
      }
      return <div data-testid="hoc-component">HOC wrapped component</div>;
    };

    const WrappedComponent = withErrorBoundary(TestComponent);

    // Test normal operation
    const { rerender } = render(<WrappedComponent shouldFail={false} />);
    expect(screen.getByTestId("hoc-component")).toBeInTheDocument();

    // Test error handling
    rerender(<WrappedComponent shouldFail={true} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should use custom fallback with HOC", () => {
    const TestComponent = () => {
      throw new Error("HOC with custom fallback");
    };

    const customFallback = (
      <div data-testid="hoc-custom-fallback">HOC Custom Error</div>
    );
    const WrappedComponent = withErrorBoundary(TestComponent, customFallback);

    render(<WrappedComponent />);

    expect(screen.getByTestId("hoc-custom-fallback")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("should preserve component props in HOC", () => {
    const TestComponent = ({ message }: { message: string }) => (
      <div data-testid="hoc-props-component">{message}</div>
    );

    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent message="Props preserved!" />);

    expect(screen.getByText("Props preserved!")).toBeInTheDocument();
  });
});
