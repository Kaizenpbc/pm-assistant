export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  code?: string;
  status?: number;
}

/** User-friendly message map for common API errors */
const USER_MESSAGES: Record<number, string> = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource was not found.',
  408: 'The request timed out. Please try again.',
  409: 'This action conflicts with existing data. Please refresh and try again.',
  422: 'The data you entered could not be processed. Please fix the errors and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
};

/** Map generic error types to user-friendly messages */
const GENERIC_MESSAGES: Record<string, string> = {
  NetworkError: "We couldn't reach the server. Check your internet connection and try again.",
  AbortError: 'The request was cancelled.',
  TimeoutError: 'The request took too long. Please try again.',
};

export class ErrorService {
  private errors: ErrorInfo[] = [];
  private maxStored = 50;

  public reportError(error: Error | unknown, context?: string): void {
    const err = error instanceof Error ? error : new Error(String(error));
    const errorInfo: ErrorInfo = {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (context) {
      errorInfo.message = `[${context}] ${errorInfo.message}`;
    }

    this.errors.push(errorInfo);
    if (this.errors.length > this.maxStored) {
      this.errors = this.errors.slice(-this.maxStored);
    }

    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
      console.error('Error reported:', errorInfo);
    }

    // Placeholder for Sentry / production logging
    // if (typeof window !== 'undefined' && (window as any).Sentry) {
    //   (window as any).Sentry.captureException(err);
    // }
  }

  public getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * Returns a user-friendly message for display (toasts, error pages, etc.)
   */
  public getUserFriendlyMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const ax = error as { response?: { status?: number; data?: { message?: string; error?: string } } };
      const status = ax.response?.status;
      if (status && USER_MESSAGES[status]) {
        const serverMsg = ax.response?.data?.message ?? ax.response?.data?.error;
        if (typeof serverMsg === 'string' && serverMsg.length > 0 && serverMsg.length < 200) {
          return serverMsg;
        }
        return USER_MESSAGES[status];
      }
    }
    if (error instanceof Error) {
      if (GENERIC_MESSAGES[error.name]) return GENERIC_MESSAGES[error.name];
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        return GENERIC_MESSAGES.NetworkError;
      }
      if (error.message.length < 150) return error.message;
    }
    return 'Something went wrong. Please try again.';
  }

  public isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.name === 'NetworkError' || error.message.includes('Network') || error.message.includes('fetch');
    }
    return false;
  }

  public isAuthError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'response' in error) {
      const ax = error as { response?: { status?: number } };
      return ax.response?.status === 401 || ax.response?.status === 403;
    }
    return false;
  }
}

export const errorService = new ErrorService();

/**
 * Extract a user-friendly message from an API (axios) error.
 * Use this in catch blocks when calling apiService.
 */
export function getApiErrorMessage(error: unknown): string {
  return errorService.getUserFriendlyMessage(error);
}
