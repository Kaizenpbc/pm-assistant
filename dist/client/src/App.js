"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const authStore_1 = require("./stores/authStore");
const LoginPage_1 = require("./pages/LoginPage");
const DashboardPage_1 = require("./pages/DashboardPage");
const ProjectPage_1 = require("./pages/ProjectPage");
const ErrorBoundary_1 = require("./components/ErrorBoundary");
const LoadingSpinner_1 = require("./components/LoadingSpinner");
const MonitoringDashboard_1 = __importDefault(require("./components/MonitoringDashboard"));
const PWAInstallPrompt_1 = __importDefault(require("./components/PWAInstallPrompt"));
function App() {
    const { isAuthenticated, isLoading } = (0, authStore_1.useAuthStore)();
    if (isLoading) {
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.LoadingSpinner, {});
    }
    return ((0, jsx_runtime_1.jsx)(ErrorBoundary_1.ErrorBoundary, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.BrowserRouter, { children: (0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50", children: [(0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/dashboard", replace: true }) : (0, jsx_runtime_1.jsx)(LoginPage_1.LoginPage, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/dashboard", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(DashboardPage_1.DashboardPage, {}) : (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/project/:id", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(ProjectPage_1.ProjectPage, {}) : (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/monitoring", element: isAuthenticated ? (0, jsx_runtime_1.jsx)(MonitoringDashboard_1.default, {}) : (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/dashboard", replace: true }) })] }), (0, jsx_runtime_1.jsx)(PWAInstallPrompt_1.default, {})] }) }) }));
}
exports.default = App;
//# sourceMappingURL=App.js.map