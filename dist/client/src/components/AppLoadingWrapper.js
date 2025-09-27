"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLoadingWrapper = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const EnhancedLoadingSpinner_1 = __importDefault(require("./EnhancedLoadingSpinner"));
const SkeletonLoader_1 = require("./SkeletonLoader");
const AppLoadingWrapper = ({ children, fallbackMessage = 'Loading your project management workspace...' }) => {
    const [loadingProgress, setLoadingProgress] = (0, react_1.useState)(0);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [loadingStep, setLoadingStep] = (0, react_1.useState)('Initializing...');
    (0, react_1.useEffect)(() => {
        const loadingSteps = [
            { step: 'Initializing application...', progress: 10 },
            { step: 'Loading security features...', progress: 25 },
            { step: 'Preparing AI components...', progress: 40 },
            { step: 'Connecting to database...', progress: 60 },
            { step: 'Loading user interface...', progress: 80 },
            { step: 'Finalizing setup...', progress: 95 },
            { step: 'Ready!', progress: 100 }
        ];
        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < loadingSteps.length) {
                const { step, progress } = loadingSteps[currentStep];
                setLoadingStep(step);
                setLoadingProgress(progress);
                currentStep++;
            }
            else {
                clearInterval(interval);
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);
    if (isLoading) {
        if (loadingProgress > 50) {
            return (0, jsx_runtime_1.jsx)(SkeletonLoader_1.DashboardSkeleton, {});
        }
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4", children: [(0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.default, { message: loadingStep, size: "large", variant: "detailed", showProgress: true, progress: loadingProgress }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6 text-center", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-white/80 text-sm", children: fallbackMessage }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 space-y-2 text-xs text-white/70", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "Security" }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-400", children: "\u2713" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "AI Features" }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-400", children: "\u2713" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { children: "PWA Support" }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-400", children: "\u2713" })] })] })] })] }) }));
    }
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
};
exports.AppLoadingWrapper = AppLoadingWrapper;
exports.default = exports.AppLoadingWrapper;
//# sourceMappingURL=AppLoadingWrapper.js.map