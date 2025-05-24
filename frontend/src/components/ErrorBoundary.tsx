import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper, Divider } from "@mui/material";
import { Home as HomeIcon, Refresh as RefreshIcon } from "@mui/icons-material";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);

    // Optional: Send error to logging service
    // logErrorToService(error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: "100%",
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>

            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
              We're sorry, but an error occurred while rendering this page. Our team
              has been notified.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
              >
                Go to Homepage
              </Button>
            </Box>

            {import.meta.env.DEV && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Error details (visible in development only):
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 1,
                    p: 2,
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflow: "auto",
                    maxHeight: "200px",
                    bgcolor: "grey.50",
                  }}
                >
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;