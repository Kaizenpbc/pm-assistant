"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const vitest_1 = require("vitest");
const ErrorBoundary_1 = require("../../../components/ErrorBoundary");
const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) {
        throw new Error('Test error message');
    }
    return (0, jsx_runtime_1.jsx)("div", { children: "No error" });
};
const originalError = console.error;
beforeEach(() => {
    console.error = vitest_1.vi.fn();
});
afterEach(() => {
    console.error = originalError;
});
(0, vitest_1.describe)('ErrorBoundary', () => {
    (0, vitest_1.it)('renders children when there is no error', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(ThrowError, { shouldThrow: false }) }));
        (0, vitest_1.expect)(react_1.screen.getByText('No error')).toBeInTheDocument();
    });
    (0, vitest_1.it)('renders error UI when there is an error', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(ThrowError, { shouldThrow: true }) }));
        (0, vitest_1.expect)(react_1.screen.getByText('Something went wrong')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('An unexpected error occurred in the application.')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Try Again')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });
    (0, vitest_1.it)('displays error details in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(ThrowError, { shouldThrow: true }) }));
        (0, vitest_1.expect)(react_1.screen.getByText('🔍 Error Details (Development Mode)')).toBeInTheDocument();
        (0, vitest_1.expect)(react_1.screen.getByText('Test error message')).toBeInTheDocument();
        process.env.NODE_ENV = originalEnv;
    });
    (0, vitest_1.it)('does not display error details in production mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(ThrowError, { shouldThrow: true }) }));
        (0, vitest_1.expect)(react_1.screen.queryByText('🔍 Error Details (Development Mode)')).not.toBeInTheDocument();
        process.env.NODE_ENV = originalEnv;
    });
    (0, vitest_1.it)('calls console.error when an error occurs', () => {
        const consoleSpy = vitest_1.vi.spyOn(console, 'error').mockImplementation(() => { });
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(ThrowError, { shouldThrow: true }) }));
        (0, vitest_1.expect)(consoleSpy).toHaveBeenCalledWith('ErrorBoundary caught an error:', vitest_1.expect.any(Error), vitest_1.expect.any(Object));
        consoleSpy.mockRestore();
    });
    (0, vitest_1.it)('has proper accessibility attributes', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(ThrowError, { shouldThrow: true }) }));
        const errorContainer = react_1.screen.getByRole('alert');
        (0, vitest_1.expect)(errorContainer).toBeInTheDocument();
        (0, vitest_1.expect)(errorContainer).toHaveAttribute('aria-live', 'polite');
    });
    (0, vitest_1.it)('includes fallback content notice', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(ThrowError, { shouldThrow: true }) }));
        (0, vitest_1.expect)(react_1.screen.getByText(/This error screen is designed to provide a better user experience/)).toBeInTheDocument();
    });
});
//# sourceMappingURL=ErrorBoundary.test.js.map