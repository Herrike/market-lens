import React, { Component } from "react";
import type { ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error("Error Boundary caught an error:", error, errorInfo);

    // In production, you might want to log to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Something went wrong
              </h1>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                We're sorry, but something unexpected happened. This has been
                logged and we're working to fix it.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  <summary className="cursor-pointer font-medium text-gray-900 dark:text-white mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-600 dark:text-red-400 text-xs">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                data-testid="try-again"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                data-testid="reload-page"
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
