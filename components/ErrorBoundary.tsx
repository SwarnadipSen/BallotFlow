"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary that catches runtime errors in the component tree.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeClientComponent />
 *   </ErrorBoundary>
 *
 * Falls back to a friendly error UI instead of a blank/crashed page.
 * Must be a class component — React's error boundary API requires it.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console in dev; in production this would go to Cloud Error Reporting
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            padding: "2rem",
            textAlign: "center",
            gap: "1rem",
          }}
        >
          <div style={{ fontSize: "3rem" }} aria-hidden="true">⚠️</div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.9375rem",
              maxWidth: "420px",
            }}
          >
            An unexpected error occurred. Please try refreshing the page or
            starting a new chat.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={this.handleReset}
              className="btn-primary"
              style={{ fontSize: "0.875rem", padding: "0.625rem 1.25rem" }}
            >
              Try Again
            </button>
            <Link
              href="/"
              className="btn-secondary"
              style={{ fontSize: "0.875rem", padding: "0.625rem 1.25rem" }}
            >
              Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
