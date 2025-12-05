"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const SystemStatusDashboard = () => {
    const [basicHealth, setBasicHealth] = (0, react_1.useState)(null);
    const [detailedHealth, setDetailedHealth] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    const fetchHealthData = async () => {
        try {
            setLoading(true);
            setError(null);
            const basicResponse = await fetch('http://localhost:3001/health');
            if (!basicResponse.ok)
                throw new Error('Basic health check failed');
            const basicData = await basicResponse.json();
            setBasicHealth(basicData);
            try {
                const detailedResponse = await fetch('http://localhost:3001/health/detailed');
                if (detailedResponse.ok) {
                    const detailedData = await detailedResponse.json();
                    setDetailedHealth(detailedData);
                }
            }
            catch (detailedError) {
                console.warn('Detailed health check failed:', detailedError);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch health data');
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchHealthData();
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchHealthData, 30000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [autoRefresh]);
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'healthy':
            case 'ok':
            case 'pass':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'degraded':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-yellow-500" });
            case 'unhealthy':
            case 'error':
            case 'fail':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-5 h-5 text-red-500" });
            default:
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "w-5 h-5 text-gray-500" });
        }
    };
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'healthy':
            case 'ok':
            case 'pass':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'degraded':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'unhealthy':
            case 'error':
            case 'fail':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    if (loading && !basicHealth) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-lg shadow-md p-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-6 h-6 animate-spin text-blue-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-gray-600", children: "Loading system status..." })] }) }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center text-red-600", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-6 h-6 mr-2" }), (0, jsx_runtime_1.jsx)("span", { className: "font-semibold", children: "System Status Unavailable" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-500 mt-2", children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: fetchHealthData, className: "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors", children: "Retry" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-md p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "w-6 h-6 text-blue-500 mr-2" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-gray-800", children: "System Status" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center text-sm text-gray-600", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: autoRefresh, onChange: (e) => setAutoRefresh(e.target.checked), className: "mr-2" }), "Auto-refresh"] }), (0, jsx_runtime_1.jsx)("button", { onClick: fetchHealthData, disabled: loading, className: "p-2 text-gray-600 hover:text-blue-500 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }) })] })] }), basicHealth && ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: `p-4 rounded-lg border ${getStatusColor(basicHealth.status)}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [getStatusIcon(basicHealth.status), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 font-medium", children: "Status" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm mt-1 capitalize", children: basicHealth.status })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-lg border border-gray-200 bg-gray-50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Server, { className: "w-5 h-5 text-blue-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 font-medium", children: "Uptime" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm mt-1", children: formatUptime(basicHealth.uptime) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-lg border border-gray-200 bg-gray-50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Cpu, { className: "w-5 h-5 text-green-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 font-medium", children: "Memory" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm mt-1", children: [formatBytes(basicHealth.memory.heapUsed), " / ", formatBytes(basicHealth.memory.heapTotal)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-lg border border-gray-200 bg-gray-50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "w-5 h-5 text-purple-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 font-medium", children: "Response" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm mt-1", children: basicHealth.responseTime })] })] })), detailedHealth && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800", children: "Service Health" }), (0, jsx_runtime_1.jsxs)("div", { className: `p-4 rounded-lg border ${getStatusColor(detailedHealth.services.database.status)}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Database, { className: "w-5 h-5 mr-2" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Database" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [getStatusIcon(detailedHealth.services.database.status), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-sm", children: detailedHealth.services.database.responseTime ?
                                                    `${detailedHealth.services.database.responseTime.toFixed(2)}ms` :
                                                    'N/A' })] })] }), detailedHealth.services.database.error && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm mt-1 text-red-600", children: detailedHealth.services.database.error }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-lg border border-gray-200 bg-gray-50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Cpu, { className: "w-5 h-5 mr-2" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Memory Usage" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm", children: [detailedHealth.services.memory.percentage.toFixed(1), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 rounded-full h-2", children: (0, jsx_runtime_1.jsx)("div", { className: `h-2 rounded-full ${detailedHealth.services.memory.percentage > 90 ? 'bg-red-500' :
                                                detailedHealth.services.memory.percentage > 70 ? 'bg-yellow-500' :
                                                    'bg-green-500'}`, style: { width: `${Math.min(detailedHealth.services.memory.percentage, 100)}%` } }) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-600 mt-1", children: [formatBytes(detailedHealth.services.memory.used), " / ", formatBytes(detailedHealth.services.memory.total)] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-md font-semibold text-gray-800 mb-3", children: "Health Checks" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: detailedHealth.checks.map((check, index) => ((0, jsx_runtime_1.jsxs)("div", { className: `p-3 rounded-lg border ${getStatusColor(check.status)}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [getStatusIcon(check.status), (0, jsx_runtime_1.jsx)("span", { className: "ml-2 font-medium capitalize", children: check.name.replace(/_/g, ' ') })] }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: check.responseTime > 0 ? `${check.responseTime.toFixed(2)}ms` : 'N/A' })] }), check.details && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm mt-1", children: check.details }))] }, index))) })] })] })), (0, jsx_runtime_1.jsx)("div", { className: "mt-6 pt-4 border-t border-gray-200", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center text-sm text-gray-500", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Last updated: ", basicHealth ? new Date(basicHealth.timestamp).toLocaleString() : 'Never'] }), (0, jsx_runtime_1.jsxs)("span", { children: [basicHealth?.version, " (", basicHealth?.environment, ")"] })] }) })] }));
};
exports.default = SystemStatusDashboard;
//# sourceMappingURL=SystemStatusDashboard.js.map