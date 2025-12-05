"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const EnhancedMonitoringDashboard_1 = __importDefault(require("../components/EnhancedMonitoringDashboard"));
const MonitoringPage = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };
    const handleExportData = () => {
        console.log('Export monitoring data');
    };
    const handleImportData = () => {
        console.log('Import monitoring data');
    };
    const handleScheduleReport = () => {
        console.log('Schedule monitoring report');
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-white border-b border-gray-200", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-7xl mx-auto px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: handleBackToDashboard, className: "flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "w-5 h-5" }), (0, jsx_runtime_1.jsx)("span", { children: "Back to Dashboard" })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-6 w-px bg-gray-300" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "w-6 h-6 text-blue-600" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold text-gray-900", children: "System Monitoring" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: handleExportData, className: "flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "w-4 h-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Export Data" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleImportData, className: "flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "w-4 h-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Import Data" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleScheduleReport, className: "flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "w-4 h-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Schedule Report" })] })] })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "py-6", children: (0, jsx_runtime_1.jsx)(EnhancedMonitoringDashboard_1.default, {}) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white border-t border-gray-200", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-7xl mx-auto px-6 py-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("p", { children: "System monitoring provides real-time insights into application performance and health." }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Last updated: ", new Date().toLocaleTimeString()] }), (0, jsx_runtime_1.jsx)("span", { children: "\u2022" }), (0, jsx_runtime_1.jsx)("span", { children: "Auto-refresh: 30s" })] })] }) }) })] }));
};
exports.default = MonitoringPage;
//# sourceMappingURL=MonitoringPage.js.map