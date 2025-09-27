"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSkeleton = exports.ScheduleSkeleton = exports.DashboardSkeleton = exports.SkeletonLoader = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const SkeletonLoader = ({ variant = 'rectangular', width, height, className = '' }) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'text':
                return 'h-4 w-full rounded';
            case 'circular':
                return 'rounded-full';
            case 'dashboard':
                return 'h-32 w-full rounded-lg';
            case 'schedule':
                return 'h-16 w-full rounded-md';
            default:
                return 'w-full rounded';
        }
    };
    const getDimensions = () => {
        const styles = {};
        if (width)
            styles.width = typeof width === 'number' ? `${width}px` : width;
        if (height)
            styles.height = typeof height === 'number' ? `${height}px` : height;
        return styles;
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `skeleton-loader ${getVariantStyles()} ${className}`, style: getDimensions(), "aria-label": "Loading content", role: "status", children: (0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Loading content..." }) }));
};
exports.SkeletonLoader = SkeletonLoader;
const DashboardSkeleton = () => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 space-y-6", role: "status", "aria-label": "Loading dashboard", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "200px", height: "32px" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "circular", width: "40px", height: "40px" })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [...Array(4)].map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg shadow", children: [(0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "100px", height: "20px", className: "mb-2" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "60px", height: "32px", className: "mb-1" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "80px", height: "16px" })] }, i))) }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-6 border-b", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "150px", height: "24px" }) }), (0, jsx_runtime_1.jsx)("div", { className: "p-6 space-y-4", children: [...Array(3)].map((_, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "circular", width: "48px", height: "48px" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "200px", height: "20px", className: "mb-2" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "120px", height: "16px" })] })] }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "rectangular", width: "80px", height: "32px" })] }, i))) })] })] }));
};
exports.DashboardSkeleton = DashboardSkeleton;
const ScheduleSkeleton = () => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6 space-y-6", role: "status", "aria-label": "Loading schedule", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "300px", height: "32px" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-2", children: [(0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "rectangular", width: "120px", height: "40px" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "rectangular", width: "100px", height: "40px" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "200px", height: "24px" }) }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { className: "border-b", children: [(0, jsx_runtime_1.jsx)("th", { className: "px-4 py-3 text-left", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "100px", height: "20px" }) }), (0, jsx_runtime_1.jsx)("th", { className: "px-4 py-3 text-left", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "80px", height: "20px" }) }), (0, jsx_runtime_1.jsx)("th", { className: "px-4 py-3 text-left", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "120px", height: "20px" }) }), (0, jsx_runtime_1.jsx)("th", { className: "px-4 py-3 text-left", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "90px", height: "20px" }) })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: [...Array(5)].map((_, i) => ((0, jsx_runtime_1.jsxs)("tr", { className: "border-b", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-4 py-3", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "200px", height: "20px" }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-4 py-3", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "60px", height: "20px" }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-4 py-3", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "100px", height: "20px" }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-4 py-3", children: (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "rectangular", width: "80px", height: "24px" }) })] }, i))) })] }) })] })] }));
};
exports.ScheduleSkeleton = ScheduleSkeleton;
const LoginSkeleton = () => {
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", role: "status", "aria-label": "Loading login form", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md w-full space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "200px", height: "40px", className: "mx-auto mb-2" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "150px", height: "20px", className: "mx-auto" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-8 rounded-lg shadow space-y-6", children: [(0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "100px", height: "20px" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "rectangular", width: "100%", height: "48px" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "text", width: "100px", height: "20px" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "rectangular", width: "100%", height: "48px" }), (0, jsx_runtime_1.jsx)(exports.SkeletonLoader, { variant: "rectangular", width: "100%", height: "48px" })] })] }) }));
};
exports.LoginSkeleton = LoginSkeleton;
exports.default = exports.SkeletonLoader;
//# sourceMappingURL=SkeletonLoader.js.map