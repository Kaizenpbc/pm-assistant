"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedLoadingSpinner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const EnhancedLoadingSpinner = ({ message = 'Loading...', size = 'medium', variant = 'default', showProgress = false, progress = 0 }) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return 'w-8 h-8';
            case 'large':
                return 'w-16 h-16';
            default:
                return 'w-12 h-12';
        }
    };
    const getSpinnerSize = () => {
        switch (size) {
            case 'small':
                return 'w-4 h-4';
            case 'large':
                return 'w-8 h-8';
            default:
                return 'w-6 h-6';
        }
    };
    if (variant === 'minimal') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)("div", { className: `${getSpinnerSize()} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin` }), message && (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-sm text-gray-600", children: message })] }));
    }
    if (variant === 'detailed') {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center min-h-[200px] p-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("div", { className: `${getSizeClasses()} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin` }), (0, jsx_runtime_1.jsx)("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", children: (0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 bg-blue-600 rounded-full animate-pulse" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 text-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: message }), showProgress && ((0, jsx_runtime_1.jsx)("div", { className: "w-64 bg-gray-200 rounded-full h-2 mb-4", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out", style: { width: `${Math.min(100, Math.max(0, progress))}%` } }) })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 text-sm text-gray-600", children: [(0, jsx_runtime_1.jsxs)("p", { className: "flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" }), "Initializing application"] }), (0, jsx_runtime_1.jsxs)("p", { className: "flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse", style: { animationDelay: '0.2s' } }), "Loading components"] }), (0, jsx_runtime_1.jsxs)("p", { className: "flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse", style: { animationDelay: '0.4s' } }), "Preparing workspace"] })] })] })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center min-h-[300px] p-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: `${getSizeClasses()} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin` }), (0, jsx_runtime_1.jsx)("div", { className: `${getSizeClasses()} absolute top-0 left-0 border-4 border-transparent border-r-purple-600 rounded-full animate-spin`, style: { animationDirection: 'reverse', animationDuration: '1.5s' } }), (0, jsx_runtime_1.jsx)("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", children: (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse" }) })] }), (0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800 mb-2", children: "PM Application v2" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: message }), showProgress && ((0, jsx_runtime_1.jsx)("div", { className: "w-48 bg-gray-200 rounded-full h-2 mb-4", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out", style: { width: `${Math.min(100, Math.max(0, progress))}%` } }) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-blue-600 rounded-full animate-bounce" }), (0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-purple-600 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), (0, jsx_runtime_1.jsx)("div", { className: "w-2 h-2 bg-pink-600 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] })] }));
};
exports.EnhancedLoadingSpinner = EnhancedLoadingSpinner;
exports.default = exports.EnhancedLoadingSpinner;
//# sourceMappingURL=EnhancedLoadingSpinner.js.map