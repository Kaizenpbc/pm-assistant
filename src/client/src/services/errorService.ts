export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export class ErrorService {
  private errors: ErrorInfo[] = [];

  public reportError(error: Error, _context?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', errorInfo);
    }

    // In production, you might want to send this to a logging service
    // this.sendToLoggingService(errorInfo);
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

  // Future: Implement logging service integration
  // private async _sendToLoggingService(errorInfo: ErrorInfo): Promise<void> {
  //   // Implementation for production logging service
  // }
}

export const errorService = new ErrorService();
