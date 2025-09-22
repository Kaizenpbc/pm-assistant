"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
class ErrorBoundary extends react_1.Component {
    state = {
        hasError: false,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md w-full bg-white shadow-lg rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("svg", { className: "h-8 w-8 text-red-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: "Something went wrong" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-500 mb-4", children: "An unexpected error occurred. Please try refreshing the page." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => window.location.reload(), className: "btn btn-primary", children: "Refresh Page" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => this.setState({ hasError: false }), className: "btn btn-secondary", children: "Try Again" })] }), process.env.NODE_ENV === 'development' && this.state.error && ((0, jsx_runtime_1.jsxs)("details", { className: "mt-4", children: [(0, jsx_runtime_1.jsx)("summary", { className: "cursor-pointer text-sm text-gray-600", children: "Error Details (Development)" }), (0, jsx_runtime_1.jsx)("pre", { className: "mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto", children: this.state.error.stack })] }))] }) }));
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map