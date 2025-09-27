"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const authStore_1 = require("./stores/authStore");
const LoginPage_1 = require("./pages/LoginPage");
const DashboardPage_1 = require("./pages/DashboardPage");
const ProjectPage_1 = require("./pages/ProjectPage");
const SchedulePage_1 = __importDefault(require("./pages/SchedulePage"));
const ErrorBoundary_1 = require("./components/ErrorBoundary");
const LoadingSpinner_1 = require("./components/LoadingSpinner");
const AppLoadingWrapper_1 = __importDefault(require("./components/AppLoadingWrapper"));
const MonitoringDashboard_1 = __importDefault(require("./components/MonitoringDashboard"));
const PWAInstallPrompt_1 = __importDefault(require("./components/PWAInstallPrompt"));
const ToastNotification_1 = require("./components/ToastNotification");
const toastService_1 = require("./services/toastService");
const buildUtils_1 = require("./utils/buildUtils");
const securityService_1 = require("./services/securityService");
const indexedDBService_1 = require("./services/indexedDBService");
const accessibilityService_1 = require("./services/accessibilityService");
const AppShell_1 = __importDefault(require("./components/AppShell"));
const ShareTargetHandler_1 = __importDefault(require("./components/ShareTargetHandler"));
function App() {
    const { isAuthenticated, isLoading, setLoading, logout } = (0, authStore_1.useAuthStore)();
    const [toasts, setToasts] = (0, react_1.useState)(toastService_1.toastService.getToasts());
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, [setLoading]);
    (0, react_1.useEffect)(() => {
        const unsubscribe = toastService_1.toastService.subscribe(setToasts);
        return unsubscribe;
    }, []);
    (0, react_1.useEffect)(() => {
        (0, buildUtils_1.logDeploymentInfo)();
    }, []);
    (0, react_1.useEffect)(() => {
        securityService_1.securityService.logSecurityInfo();
    }, []);
    (0, react_1.useEffect)(() => {
        accessibilityService_1.accessibilityService.setupSkipLinks();
        accessibilityService_1.accessibilityService.announce('PM Application loaded successfully');
        const initializeServices = async () => {
            try {
                await indexedDBService_1.indexedDBService.initialize();
                console.log('✅ IndexedDB and background sync services initialized');
            }
            catch (error) {
                console.error('❌ Failed to initialize services:', error);
            }
        };
        initializeServices();
    }, []);
    if (isLoading) {
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.LoadingSpinner, {});
    }
    return ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(AppLoadingWrapper_1.default, { fallbackMessage: "Loading your project management workspace...", children: (0, jsx_runtime_1.jsx)(AppShell_1.default, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50", children: [(0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/dashboard", replace: true }) : (0, jsx_runtime_1.jsx)(LoginPage_1.LoginPage, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(DashboardPage_1.DashboardPage, {}) : (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/project/:id", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(ProjectPage_1.ProjectPage, {}) : (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/schedule/:projectId", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(SchedulePage_1.default, {}) : (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/monitoring", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(MonitoringDashboard_1.default, {}) : (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/share-target", element: (0, jsx_runtime_1.jsx)(ShareTargetHandler_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/dashboard", replace: true }) : (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) })] }), (0, jsx_runtime_1.jsx)(PWAInstallPrompt_1.default, {}), (0, jsx_runtime_1.jsx)(ToastNotification_1.ToastManager, { toasts: toasts, onRemoveToast: (id) => toastService_1.toastService.removeToast(id) })] }) }) }) }) }));
}
exports.default = App;
//# sourceMappingURL=App.js.map