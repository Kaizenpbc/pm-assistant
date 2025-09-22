"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `flex items-center justify-center ${className}`, children: (0, jsx_runtime_1.jsx)("div", { className: `animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`, role: "status", "aria-label": "Loading", children: (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Loading..." }) }) }));
};
exports.LoadingSpinner = LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.js.map