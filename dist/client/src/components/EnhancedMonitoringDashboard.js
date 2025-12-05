"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const EnhancedMonitoringDashboard = () => {
    const [basicHealth, setBasicHealth] = (0, react_1.useState)(null);
    const [detailedHealth, setDetailedHealth] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    const [refreshInterval, setRefreshInterval] = (0, react_1.useState)(30);
    const [notifications, setNotifications] = (0, react_1.useState)(true);
    const [historicalData, setHistoricalData] = (0, react_1.useState)({
        memory: [],
        cpu: [],
        database: []
    });
    const fetchHealthData = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const basicResponse = await fetch('http://localhost:3001/health/basic');
            if (!basicResponse.ok)
                throw new Error('Basic health check failed');
            const basicData = await basicResponse.json();
            setBasicHealth(basicData);
            try {
                const detailedResponse = await fetch('http://localhost:3001/health/detailed');
                if (detailedResponse.ok) {
                    const detailedData = await detailedResponse.json();
                    setDetailedHealth(detailedData);
                    const now = new Date().toISOString();
                    setHistoricalData(prev => ({
                        memory: [...prev.memory.slice(-19), {
                                timestamp: now,
                                value: detailedData.services.memory.percentage,
                                label: 'Memory Usage %'
                            }],
                        cpu: [...prev.cpu.slice(-19), {
                                timestamp: now,
                                value: detailedData.services.cpu.load,
                                label: 'CPU Load'
                            }],
                        database: [...prev.database.slice(-19), {
                                timestamp: now,
                                value: detailedData.services.database.responseTime || 0,
                                label: 'DB Response Time (ms)'
                            }]
                    }));
                }
            }
            catch (detailedError) {
                console.warn('Detailed health check failed:', detailedError);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch health data');
            if (notifications) {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('System Health Alert', {
                        body: `Health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
                        icon: '/favicon.ico'
                    });
                }
            }
        }
        finally {
            setLoading(false);
        }
    }, [notifications]);
    (0, react_1.useEffect)(() => {
        fetchHealthData();
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchHealthData, refreshInterval * 1000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [fetchHealthData, autoRefresh, refreshInterval]);
    (0, react_1.useEffect)(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatUptime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };
    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'healthy':
            case 'pass':
            case 'ok':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'degraded':
            case 'warning':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-yellow-500" });
            case 'unhealthy':
            case 'fail':
            case 'error':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-5 h-5 text-red-500" });
            default:
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { className: "w-5 h-5 text-gray-500" });
        }
    };
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'healthy':
            case 'pass':
            case 'ok':
                return 'text-green-500 bg-green-50 border-green-200';
            case 'degraded':
            case 'warning':
                return 'text-yellow-500 bg-yellow-50 border-yellow-200';
            case 'unhealthy':
            case 'fail':
            case 'error':
                return 'text-red-500 bg-red-50 border-red-200';
            default:
                return 'text-gray-500 bg-gray-50 border-gray-200';
        }
    };
    const getTrendIcon = (current, previous) => {
        if (current > previous)
            return (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "w-4 h-4 text-red-500" });
        if (current < previous)
            return (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingDown, { className: "w-4 h-4 text-green-500" });
        return (0, jsx_runtime_1.jsx)(lucide_react_1.Minus, { className: "w-4 h-4 text-gray-500" });
    };
    if (loading && !basicHealth) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center p-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-8 h-8 animate-spin text-blue-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2", children: "Loading system status..." })] }));
    }
    if (error && !basicHealth) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-red-800 mb-2", children: "System Status Unavailable" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-600 mb-4", children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: fetchHealthData, className: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors", children: "Retry" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto p-6 space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h1", { className: "text-3xl font-bold text-gray-900 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "w-8 h-8 mr-3 text-blue-600" }), "System Monitoring Dashboard"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mt-1", children: "Real-time system health monitoring and performance metrics" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium text-gray-700", children: "Auto-refresh:" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setAutoRefresh(!autoRefresh), className: `flex items-center space-x-1 px-3 py-1 rounded text-sm ${autoRefresh
                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                            : 'bg-gray-100 text-gray-700 border border-gray-300'}`, children: [autoRefresh ? (0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "w-4 h-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.BellOff, { className: "w-4 h-4" }), (0, jsx_runtime_1.jsx)("span", { children: autoRefresh ? 'On' : 'Off' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium text-gray-700", children: "Interval:" }), (0, jsx_runtime_1.jsxs)("select", { value: refreshInterval, onChange: (e) => setRefreshInterval(Number(e.target.value)), className: "border border-gray-300 rounded px-2 py-1 text-sm", disabled: !autoRefresh, children: [(0, jsx_runtime_1.jsx)("option", { value: 10, children: "10s" }), (0, jsx_runtime_1.jsx)("option", { value: 30, children: "30s" }), (0, jsx_runtime_1.jsx)("option", { value: 60, children: "1m" }), (0, jsx_runtime_1.jsx)("option", { value: 300, children: "5m" })] })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: fetchHealthData, disabled: loading, className: "flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), (0, jsx_runtime_1.jsx)("span", { children: "Refresh" })] })] })] }), detailedHealth && ((0, jsx_runtime_1.jsx)("div", { className: `border-2 rounded-lg p-6 ${getStatusColor(detailedHealth.status)}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [getStatusIcon(detailedHealth.status), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold", children: "Overall System Status" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm opacity-75", children: ["Last updated: ", new Date(detailedHealth.timestamp).toLocaleTimeString()] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold", children: detailedHealth.status.toUpperCase() }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm opacity-75", children: ["Uptime: ", formatUptime(detailedHealth.uptime)] })] })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Database, { className: "w-5 h-5 text-blue-600" }), (0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-gray-900", children: "Database" })] }), detailedHealth?.services.database.status && getStatusIcon(detailedHealth.services.database.status)] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Status:" }), (0, jsx_runtime_1.jsx)("span", { className: `font-medium ${detailedHealth?.services.database.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`, children: detailedHealth?.services.database.status || 'Unknown' })] }), detailedHealth?.services.database.responseTime && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Response Time:" }), (0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: [detailedHealth.services.database.responseTime.toFixed(2), "ms"] })] })), historicalData.database.length > 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Trend:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-1", children: getTrendIcon(historicalData.database[historicalData.database.length - 1]?.value || 0, historicalData.database[historicalData.database.length - 2]?.value || 0) })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Layers, { className: "w-5 h-5 text-purple-600" }), (0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-gray-900", children: "Memory" })] }), detailedHealth?.services.memory && ((0, jsx_runtime_1.jsxs)("div", { className: `text-sm font-medium ${detailedHealth.services.memory.percentage > 80 ? 'text-red-600' :
                                            detailedHealth.services.memory.percentage > 60 ? 'text-yellow-600' : 'text-green-600'}`, children: [detailedHealth.services.memory.percentage.toFixed(1), "%"] }))] }), detailedHealth?.services.memory && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 rounded-full h-2 mb-2", children: (0, jsx_runtime_1.jsx)("div", { className: `h-2 rounded-full ${detailedHealth.services.memory.percentage > 80 ? 'bg-red-500' :
                                                detailedHealth.services.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`, style: { width: `${Math.min(detailedHealth.services.memory.percentage, 100)}%` } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Used:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: formatBytes(detailedHealth.services.memory.used) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Total:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: formatBytes(detailedHealth.services.memory.total) })] }), historicalData.memory.length > 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Trend:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-1", children: getTrendIcon(historicalData.memory[historicalData.memory.length - 1]?.value || 0, historicalData.memory[historicalData.memory.length - 2]?.value || 0) })] }))] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Cpu, { className: "w-5 h-5 text-orange-600" }), (0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-gray-900", children: "CPU Load" })] }), detailedHealth?.services.cpu && ((0, jsx_runtime_1.jsx)("div", { className: `text-sm font-medium ${detailedHealth.services.cpu.load > 5 ? 'text-red-600' :
                                            detailedHealth.services.cpu.load > 2 ? 'text-yellow-600' : 'text-green-600'}`, children: detailedHealth.services.cpu.load.toFixed(2) }))] }), detailedHealth?.services.cpu && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 rounded-full h-2", children: (0, jsx_runtime_1.jsx)("div", { className: `h-2 rounded-full ${detailedHealth.services.cpu.load > 5 ? 'bg-red-500' :
                                                detailedHealth.services.cpu.load > 2 ? 'bg-yellow-500' : 'bg-green-500'}`, style: { width: `${Math.min((detailedHealth.services.cpu.load / 10) * 100, 100)}%` } }) }), historicalData.cpu.length > 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Trend:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-1", children: getTrendIcon(historicalData.cpu[historicalData.cpu.length - 1]?.value || 0, historicalData.cpu[historicalData.cpu.length - 2]?.value || 0) })] }))] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Server, { className: "w-5 h-5 text-green-600" }), (0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-gray-900", children: "Server Info" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 text-sm", children: basicHealth && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Version:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: basicHealth.version })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Environment:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: basicHealth.environment })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Response Time:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: basicHealth.responseTime })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Uptime:" }), (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: formatUptime(basicHealth.uptime) })] })] })) })] })] }), detailedHealth && detailedHealth.checks.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "w-5 h-5 mr-2 text-blue-600" }), "System Health Checks"] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: detailedHealth.checks.map((check, index) => ((0, jsx_runtime_1.jsxs)("div", { className: `border rounded-lg p-4 ${getStatusColor(check.status)}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [getStatusIcon(check.status), (0, jsx_runtime_1.jsx)("span", { className: "font-medium capitalize", children: check.name.replace(/_/g, ' ') })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm font-medium", children: [check.responseTime.toFixed(2), "ms"] })] }), check.details && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm opacity-75", children: check.details }))] }, index))) })] })), (historicalData.memory.length > 1 || historicalData.cpu.length > 1 || historicalData.database.length > 1) && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "w-5 h-5 mr-2 text-blue-600" }), "Performance Trends (Last 20 measurements)"] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [historicalData.memory.length > 1 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 mb-2", children: "Memory Usage %" }), (0, jsx_runtime_1.jsx)("div", { className: "h-32 bg-gray-50 rounded border p-2", children: (0, jsx_runtime_1.jsx)("svg", { width: "100%", height: "100%", viewBox: "0 0 300 100", children: (0, jsx_runtime_1.jsx)("polyline", { fill: "none", stroke: "#8b5cf6", strokeWidth: "2", points: historicalData.memory.map((point, index) => `${(index / (historicalData.memory.length - 1)) * 280},${100 - (point.value / 100) * 80}`).join(' ') }) }) })] })), historicalData.cpu.length > 1 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 mb-2", children: "CPU Load" }), (0, jsx_runtime_1.jsx)("div", { className: "h-32 bg-gray-50 rounded border p-2", children: (0, jsx_runtime_1.jsx)("svg", { width: "100%", height: "100%", viewBox: "0 0 300 100", children: (0, jsx_runtime_1.jsx)("polyline", { fill: "none", stroke: "#f97316", strokeWidth: "2", points: historicalData.cpu.map((point, index) => `${(index / (historicalData.cpu.length - 1)) * 280},${100 - (point.value / 10) * 80}`).join(' ') }) }) })] })), historicalData.database.length > 1 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 mb-2", children: "Database Response Time (ms)" }), (0, jsx_runtime_1.jsx)("div", { className: "h-32 bg-gray-50 rounded border p-2", children: (0, jsx_runtime_1.jsx)("svg", { width: "100%", height: "100%", viewBox: "0 0 300 100", children: (0, jsx_runtime_1.jsx)("polyline", { fill: "none", stroke: "#3b82f6", strokeWidth: "2", points: historicalData.database.map((point, index) => `${(index / (historicalData.database.length - 1)) * 280},${100 - (point.value / 100) * 80}`).join(' ') }) }) })] }))] })] }))] }));
};
exports.default = EnhancedMonitoringDashboard;
//# sourceMappingURL=EnhancedMonitoringDashboard.js.map