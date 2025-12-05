"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToastManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const ToastNotification = ({ id, type, title, message, duration = 5000, onClose, persistent = false }) => {
    const [isVisible, setIsVisible] = (0, react_1.useState)(true);
    const [isExiting, setIsExiting] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!persistent && duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, persistent]);
    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300);
    };
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'error':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-red-500" });
            case 'warning':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-yellow-500" });
            case 'info':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "w-5 h-5 text-blue-500" });
            default:
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "w-5 h-5 text-gray-500" });
        }
    };
    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };
    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
                return 'text-blue-800';
            default:
                return 'text-gray-800';
        }
    };
    if (!isVisible)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: `
        fixed top-4 right-4 z-50 max-w-sm w-full
        border rounded-lg shadow-lg p-4
        transition-all duration-300 ease-in-out
        ${getBackgroundColor()}
        ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
      `, role: "alert", "aria-live": "polite", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: getIcon() }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("h4", { className: `text-sm font-medium ${getTextColor()}`, children: title }), (0, jsx_runtime_1.jsx)("p", { className: `text-sm mt-1 ${getTextColor()} opacity-90`, children: message })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleClose, className: `
              rounded-md p-1.5 transition-colors duration-200
              ${getTextColor()} hover:bg-white hover:bg-opacity-50
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
            `, "aria-label": "Close notification", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-4 h-4" }) }) })] }) }));
};
const ToastManager = ({ toasts, onRemoveToast }) => {
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed top-4 right-4 z-50 space-y-2", children: toasts.map((toast) => ((0, jsx_runtime_1.jsx)(ToastNotification, { ...toast, onClose: () => onRemoveToast(toast.id) }, toast.id))) }));
};
exports.ToastManager = ToastManager;
exports.default = ToastNotification;
//# sourceMappingURL=ToastNotification.js.map