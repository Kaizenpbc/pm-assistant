"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppShell = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const AppShell = ({ children }) => {
    const location = (0, react_router_dom_1.useLocation)();
    const [shellState, setShellState] = (0, react_1.useState)({
        isLoaded: false,
        isOnline: navigator.onLine,
        hasUpdate: false
    });
    (0, react_1.useEffect)(() => {
        initializeAppShell();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
            }
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    const initializeAppShell = async () => {
        try {
            await preloadCriticalResources();
            setShellState(prev => ({ ...prev, isLoaded: true }));
            await checkForUpdates();
        }
        catch (error) {
            console.error('❌ Failed to initialize app shell:', error);
        }
    };
    const preloadCriticalResources = async () => {
        const criticalResources = [
            '/api/v1/projects',
            '/api/v1/templates',
            '/manifest.json'
        ];
        const preloadPromises = criticalResources.map(async (resource) => {
            try {
                const response = await fetch(resource, { cache: 'force-cache' });
                if (response.ok) {
                    console.log(`✅ Preloaded: ${resource}`);
                }
            }
            catch (error) {
                console.log(`⚠️ Failed to preload: ${resource}`);
            }
        });
        await Promise.allSettled(preloadPromises);
    };
    const checkForUpdates = async () => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
                const messageChannel = new MessageChannel();
                navigator.serviceWorker.controller.postMessage({ type: 'CHECK_FOR_UPDATES' }, [messageChannel.port2]);
            }
            catch (error) {
                console.error('❌ Failed to check for updates:', error);
            }
        }
    };
    const handleServiceWorkerMessage = (event) => {
        const { data } = event;
        switch (data.type) {
            case 'UPDATE_AVAILABLE':
                setShellState(prev => ({
                    ...prev,
                    hasUpdate: true,
                    updateVersion: data.newVersion
                }));
                break;
            case 'NO_UPDATE_AVAILABLE':
                console.log('✅ App is up to date');
                break;
            case 'UPDATE_CHECK_ERROR':
                console.error('❌ Update check failed:', data.error);
                break;
            case 'FORCE_UPDATE':
                handleForceUpdate(data.version);
                break;
        }
    };
    const handleOnline = () => {
        setShellState(prev => ({ ...prev, isOnline: true }));
        console.log('🌐 App shell: Online');
    };
    const handleOffline = () => {
        setShellState(prev => ({ ...prev, isOnline: false }));
        console.log('📴 App shell: Offline');
    };
    const handleForceUpdate = (version) => {
        console.log(`🔄 Forcing update to version ${version}`);
        window.location.reload();
    };
    const handleUpdateNow = () => {
        if (shellState.updateVersion) {
            handleForceUpdate(shellState.updateVersion);
        }
    };
    const handleUpdateLater = () => {
        setShellState(prev => ({ ...prev, hasUpdate: false }));
    };
    if (!shellState.isLoaded) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800 mb-2", children: "Loading PM Application" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Initializing app shell..." })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "app-shell min-h-screen bg-gray-50", children: [(0, jsx_runtime_1.jsx)("header", { className: "app-shell-header bg-white shadow-sm border-b", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center h-16", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold text-gray-900", children: "PM Application v2" }), !shellState.isOnline && ((0, jsx_runtime_1.jsx)("span", { className: "ml-3 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full", children: "Offline" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [shellState.hasUpdate && ((0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateNow, className: "px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors", children: "Update Available" })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("div", { className: `w-2 h-2 rounded-full ${shellState.isOnline ? 'bg-green-500' : 'bg-red-500'}` }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: shellState.isOnline ? 'Online' : 'Offline' })] })] })] }) }) }), (0, jsx_runtime_1.jsx)("main", { className: "app-shell-main", children: children }), shellState.hasUpdate && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900", children: "Update Available" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 mb-6", children: ["Version ", shellState.updateVersion, " is ready to install. This update includes bug fixes and improvements."] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateNow, className: "flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors", children: "Update Now" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateLater, className: "flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors", children: "Later" })] })] }) })), (0, jsx_runtime_1.jsx)("footer", { className: "app-shell-footer bg-white border-t mt-auto", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center text-sm text-gray-500", children: [(0, jsx_runtime_1.jsx)("div", { children: "\u00A9 2024 PM Application v2. All rights reserved." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsx)("span", { children: "Version 1.0.0" }), (0, jsx_runtime_1.jsx)("span", { children: "\u2022" }), (0, jsx_runtime_1.jsxs)("span", { children: ["Status: ", shellState.isOnline ? 'Online' : 'Offline'] })] })] }) }) })] }));
};
exports.AppShell = AppShell;
exports.default = exports.AppShell;
//# sourceMappingURL=AppShell.js.map