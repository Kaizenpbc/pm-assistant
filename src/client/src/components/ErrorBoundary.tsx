import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                We encountered an unexpected error while loading the PM Application. 
                Don't worry, this happens sometimes and we're here to help!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🔄 Refresh Application
                </button>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="bg-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  🔄 Try Again
                </button>
              </div>

              {/* Help Section */}
              <div className="bg-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-white font-semibold text-lg mb-4">
                  💡 Quick Help
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/90">
                  <div>
                    <p className="font-medium mb-2">If the error persists:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Check your internet connection</li>
                      <li>• Clear your browser cache</li>
                      <li>• Try a different browser</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-2">For technical support:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Contact your system administrator</li>
                      <li>• Check the console for errors</li>
                      <li>• Report the issue with details</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-white/80 text-sm font-medium mb-2 hover:text-white transition-colors">
                    🔍 Error Details (Development Mode)
                  </summary>
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 mt-2">
                    <pre className="text-xs text-red-200 overflow-auto max-h-40 whitespace-pre-wrap">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}

              {/* Fallback Content Notice */}
              <div className="mt-6 text-xs text-white/70">
                <p>
                  This error screen is designed to provide a better user experience 
                  when JavaScript encounters issues. The application will attempt to 
                  recover automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
