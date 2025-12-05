"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const pwaService_1 = require("../services/pwaService");
const PWAInstallPrompt = ({ onInstall, onDismiss }) => {
    const [canInstall, setCanInstall] = (0, react_1.useState)(false);
    const [isInstalled, setIsInstalled] = (0, react_1.useState)(false);
    const [hasUpdate, setHasUpdate] = (0, react_1.useState)(false);
    const [isInstalling, setIsInstalling] = (0, react_1.useState)(false);
    const [showPrompt, setShowPrompt] = (0, react_1.useState)(false);
    const [dismissed, setDismissed] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const checkInstallStatus = async () => {
            const canInstallApp = pwaService_1.pwaService.canInstall();
            const isAppInstalled = pwaService_1.pwaService.isAppInstalled();
            const hasUpdateAvailable = pwaService_1.pwaService.hasUpdateAvailable();
            setCanInstall(canInstallApp);
            setIsInstalled(isAppInstalled);
            setHasUpdate(hasUpdateAvailable);
            const wasDismissed = localStorage.getItem('pwa-install-dismissed');
            if (canInstallApp && !isAppInstalled && !wasDismissed) {
                setShowPrompt(true);
            }
        };
        checkInstallStatus();
        const interval = setInterval(checkInstallStatus, 5000);
        return () => clearInterval(interval);
    }, []);
    const handleInstall = async () => {
        setIsInstalling(true);
        try {
            const success = await pwaService_1.pwaService.installApp();
            if (success) {
                setShowPrompt(false);
                onInstall?.();
            }
        }
        catch (error) {
            console.error('Installation failed:', error);
        }
        finally {
            setIsInstalling(false);
        }
    };
    const handleUpdate = async () => {
        try {
            await pwaService_1.pwaService.updateApp();
        }
        catch (error) {
            console.error('Update failed:', error);
        }
    };
    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
        onDismiss?.();
    };
    if (isInstalled && !hasUpdate) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [showPrompt && canInstall && ((0, jsx_runtime_1.jsx)("div", { className: "fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6 text-blue-600 dark:text-blue-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" }) }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3 flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Install PM Application" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Install this app on your device for quick access and offline capabilities." }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-3 flex space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleInstall, disabled: isInstalling, className: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: isInstalling ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Installing..."] })) : ('Install') }), (0, jsx_runtime_1.jsx)("button", { onClick: handleDismiss, className: "inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Not now" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-4 flex-shrink-0", children: (0, jsx_runtime_1.jsxs)("button", { onClick: handleDismiss, className: "bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: [(0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Close" }), (0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })] }) })] }) }) })), hasUpdate && ((0, jsx_runtime_1.jsx)("div", { className: "fixed top-4 right-4 z-50 max-w-sm", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5 text-green-600 dark:text-green-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3 flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Update Available" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "A new version of the app is available with improvements and bug fixes." }), (0, jsx_runtime_1.jsx)("div", { className: "mt-3", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleUpdate, className: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500", children: "Update Now" }) })] })] }) }) })), !pwaService_1.pwaService.isAppOnline() && ((0, jsx_runtime_1.jsx)("div", { className: "fixed top-4 left-4 z-50", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5 text-yellow-600 dark:text-yellow-400", fill: "currentColor", viewBox: "0 0 20 20", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-yellow-800 dark:text-yellow-200", children: "You're offline" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-yellow-700 dark:text-yellow-300", children: "Some features may be limited" })] })] }) }) }))] }));
};
exports.default = PWAInstallPrompt;
//# sourceMappingURL=PWAInstallPrompt.js.map