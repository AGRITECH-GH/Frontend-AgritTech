import { Component } from "react";
import * as Sentry from "@sentry/react";
import { logger } from "@/lib/logger";

export class ErrorBoundary extends Component {
  state = { error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("ErrorBoundary caught:", error, errorInfo);
    Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-base font-semibold text-foreground">
            Something went wrong
          </p>
          <p className="text-sm text-muted">
            {import.meta.env.DEV ? this.state.error.message : "Please try refreshing the page."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
