"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const authStore_1 = require("../stores/authStore");
const api_1 = require("../services/api");
const LoadingSpinner_1 = require("../components/LoadingSpinner");
const LoginPage = () => {
    const [username, setUsername] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const { setUser, setError: setAuthError } = (0, authStore_1.useAuthStore)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await api_1.apiService.login(username, password);
            if (response.user) {
                localStorage.setItem('userRole', response.user.role);
                localStorage.setItem('userId', response.user.id);
            }
            setUser(response.user);
        }
        catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            setAuthError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md w-full space-y-8", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "PM Application v2" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Sign in to your account" })] }), (0, jsx_runtime_1.jsxs)("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [error && ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-medium text-red-800", children: "Error" }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 text-sm text-red-700", children: error })] })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700", children: "Username" }), (0, jsx_runtime_1.jsx)("input", { id: "username", name: "username", type: "text", required: true, value: username, onChange: (e) => setUsername(e.target.value), className: "input mt-1", placeholder: "Enter your username" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), (0, jsx_runtime_1.jsx)("input", { id: "password", name: "password", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "input mt-1", placeholder: "Enter your password" })] })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: isLoading, className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(LoadingSpinner_1.LoadingSpinner, { size: "sm", className: "mr-2" }), "Signing in..."] })) : ('Sign in') }) }), (0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600", children: "Demo: Use any username/password to login" }) })] })] }) }));
};
exports.LoginPage = LoginPage;
//# sourceMappingURL=LoginPage.js.map