"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const PerformanceDashboard = () => {
    const [metrics, setMetrics] = (0, react_1.useState)({});
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    const [slaMetrics, setSlaMetrics] = (0, react_1.useState)([]);
    const [thresholds, setThresholds] = (0, react_1.useState)([]);
    const [stats, setStats] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    const [refreshInterval, setRefreshInterval] = (0, react_1.useState)(30);
    const [selectedSeverity, setSelectedSeverity] = (0, react_1.useState)('all');
    const [showResolved, setShowResolved] = (0, react_1.useState)(false);
    const fetchDashboardData = (0, react_1.useCallback)(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:3001/api/v1/performance/dashboard');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success) {
                setMetrics(data.data.metrics || {});
                setAlerts(data.data.alerts || []);
                setSlaMetrics(data.data.slaMetrics || []);
                setThresholds(data.data.thresholds || []);
                setStats(data.data.stats || null);
            }
            else {
                throw new Error(data.error || 'Failed to fetch dashboard data');
            }
        }
        catch (err) {
            console.error('Error fetching performance dashboard:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        }
        finally {
            setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        fetchDashboardData();
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchDashboardData, refreshInterval * 1000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [fetchDashboardData, autoRefresh, refreshInterval]);
    const getSeverityIcon = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-5 h-5 text-red-500" });
            case 'warning':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-yellow-500" });
            case 'info':
                return (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { className: "w-5 h-5 text-blue-500" });
            default:
                return (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-gray-500" });
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };
    const getSLAStatusColor = (status) => {
        switch (status) {
            case 'pass':
                return 'text-green-600 bg-green-50';
            case 'warning':
                return 'text-yellow-600 bg-yellow-50';
            case 'fail':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };
    const getMetricIcon = (metricName) => {
        if (metricName.includes('cpu'))
            return (0, jsx_runtime_1.jsx)(lucide_react_1.Cpu, { className: "w-5 h-5 text-orange-600" });
        if (metricName.includes('memory'))
            return (0, jsx_runtime_1.jsx)(lucide_react_1.Layers, { className: "w-5 h-5 text-purple-600" });
        if (metricName.includes('disk'))
            return (0, jsx_runtime_1.jsx)(lucide_react_1.HardDrive, { className: "w-5 h-5 text-green-600" });
        if (metricName.includes('database'))
            return (0, jsx_runtime_1.jsx)(lucide_react_1.Database, { className: "w-5 h-5 text-blue-600" });
        if (metricName.includes('api'))
            return (0, jsx_runtime_1.jsx)(lucide_react_1.Wifi, { className: "w-5 h-5 text-indigo-600" });
        return (0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "w-5 h-5 text-gray-600" });
    };
    const formatMetricValue = (value, unit) => {
        if (unit === '%')
            return `${value.toFixed(1)}%`;
        if (unit === 'ms')
            return `${Math.round(value)}ms`;
        if (unit === 'MB')
            return `${(value / 1024 / 1024).toFixed(1)}MB`;
        if (unit === 'GB')
            return `${(value / 1024 / 1024 / 1024).toFixed(1)}GB`;
        return `${value} ${unit}`;
    };
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };
    const getTrendIcon = (values) => {
        if (values.length < 2)
            return (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4" });
        const latest = values[values.length - 1];
        const previous = values[values.length - 2];
        if (latest > previous)
            return (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "w-4 h-4 text-red-500" });
        if (latest < previous)
            return (0, jsx_runtime_1.jsx)(lucide_react_1.TrendingDown, { className: "w-4 h-4 text-green-500" });
        return (0, jsx_runtime_1.jsx)("div", { className: "w-4 h-4 border-t-2 border-gray-400" });
    };
    const acknowledgeAlert = async (alertId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/performance/alerts/${alertId}/acknowledge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ acknowledgedBy: 'Current User' })
            });
            if (response.ok) {
                await fetchDashboardData();
            }
        }
        catch (error) {
            console.error('Error acknowledging alert:', error);
        }
    };
    const resolveAlert = async (alertId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/v1/performance/alerts/${alertId}/resolve`, {
                method: 'POST'
            });
            if (response.ok) {
                await fetchDashboardData();
            }
        }
        catch (error) {
            console.error('Error resolving alert:', error);
        }
    };
    const filteredAlerts = alerts.filter(alert => {
        if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity)
            return false;
        if (!showResolved && alert.resolved)
            return false;
        return true;
    });
    if (loading && !metrics) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center p-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: "w-8 h-8 animate-spin text-blue-500" }), (0, jsx_runtime_1.jsx)("span", { className: "ml-2", children: "Loading performance data..." })] }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-red-800 mb-2", children: "Performance Dashboard Unavailable" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-600 mb-4", children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: fetchDashboardData, className: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors", children: "Retry" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto p-6 space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h1", { className: "text-3xl font-bold text-gray-900 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "w-8 h-8 mr-3 text-blue-600" }), "Performance Monitoring"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mt-1", children: "Real-time performance metrics, alerts, and SLA monitoring" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium text-gray-700", children: "Auto-refresh:" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setAutoRefresh(!autoRefresh), className: `flex items-center space-x-1 px-3 py-1 rounded text-sm ${autoRefresh
                                            ? 'bg-green-100 text-green-700 border border-green-300'
                                            : 'bg-gray-100 text-gray-700 border border-gray-300'}`, children: [autoRefresh ? (0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "w-4 h-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.BellOff, { className: "w-4 h-4" }), (0, jsx_runtime_1.jsx)("span", { children: autoRefresh ? 'On' : 'Off' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-sm font-medium text-gray-700", children: "Interval:" }), (0, jsx_runtime_1.jsxs)("select", { value: refreshInterval, onChange: (e) => setRefreshInterval(Number(e.target.value)), className: "border border-gray-300 rounded px-2 py-1 text-sm", disabled: !autoRefresh, children: [(0, jsx_runtime_1.jsx)("option", { value: 10, children: "10s" }), (0, jsx_runtime_1.jsx)("option", { value: 30, children: "30s" }), (0, jsx_runtime_1.jsx)("option", { value: 60, children: "1m" }), (0, jsx_runtime_1.jsx)("option", { value: 300, children: "5m" })] })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: fetchDashboardData, disabled: loading, className: "flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), (0, jsx_runtime_1.jsx)("span", { children: "Refresh" })] })] })] }), stats && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-gray-900", children: "Monitoring Status" }), (0, jsx_runtime_1.jsxs)("div", { className: `flex items-center space-x-2 px-3 py-1 rounded text-sm ${stats.isMonitoring ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`, children: [(0, jsx_runtime_1.jsx)("div", { className: `w-2 h-2 rounded-full ${stats.isMonitoring ? 'bg-green-500' : 'bg-red-500'}` }), (0, jsx_runtime_1.jsx)("span", { children: stats.isMonitoring ? 'Active' : 'Inactive' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-blue-600", children: stats.totalMetrics }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Total Metrics" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-orange-600", children: stats.activeAlerts }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Active Alerts" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-red-600", children: stats.criticalAlerts }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Critical Alerts" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-green-600", children: stats.thresholdsCount }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Thresholds" })] })] })] })), slaMetrics.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "SLA Metrics" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: slaMetrics.map((sla, index) => ((0, jsx_runtime_1.jsxs)("div", { className: `p-4 rounded-lg border ${getSLAStatusColor(sla.status)}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-2", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-medium", children: sla.name }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-medium uppercase", children: sla.status })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-baseline space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-2xl font-bold", children: sla.current }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: sla.unit })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-600 mt-1", children: ["Target: ", sla.target, " ", sla.unit] })] }, index))) })] })), Object.keys(metrics).length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Performance Metrics" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(metrics).map(([metricName, metricData]) => {
                            if (metricData.length === 0)
                                return null;
                            const latestMetric = metricData[metricData.length - 1];
                            const values = metricData.map(m => m.value);
                            const trend = getTrendIcon(values);
                            return ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 border border-gray-200 rounded-lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [getMetricIcon(metricName), (0, jsx_runtime_1.jsx)("span", { className: "font-medium capitalize", children: metricName.replace(/[._]/g, ' ') })] }), trend] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-baseline space-x-2", children: (0, jsx_runtime_1.jsx)("span", { className: "text-2xl font-bold", children: formatMetricValue(latestMetric.value, latestMetric.unit) }) }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 mt-1", children: formatTimestamp(latestMetric.timestamp) })] }, metricName));
                        }) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-gray-900", children: "Performance Alerts" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsxs)("select", { value: selectedSeverity, onChange: (e) => setSelectedSeverity(e.target.value), className: "border border-gray-300 rounded px-2 py-1 text-sm", children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "All Severities" }), (0, jsx_runtime_1.jsx)("option", { value: "critical", children: "Critical" }), (0, jsx_runtime_1.jsx)("option", { value: "warning", children: "Warning" }), (0, jsx_runtime_1.jsx)("option", { value: "info", children: "Info" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowResolved(!showResolved), className: `flex items-center space-x-1 px-2 py-1 rounded text-sm border ${showResolved
                                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                                            : 'bg-gray-100 text-gray-700 border-gray-300'}`, children: [showResolved ? (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-4 h-4" }) : (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { className: "w-4 h-4" }), (0, jsx_runtime_1.jsx)("span", { children: showResolved ? 'Show Resolved' : 'Hide Resolved' })] })] })] }), filteredAlerts.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-12 h-12 mx-auto mb-2 text-green-500" }), (0, jsx_runtime_1.jsx)("p", { children: "No alerts found" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: filteredAlerts.map((alert) => ((0, jsx_runtime_1.jsx)("div", { className: `p-4 rounded-lg border ${getSeverityColor(alert.severity)}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start space-x-3", children: [getSeverityIcon(alert.severity), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: alert.metricName }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm opacity-75", children: ["(", alert.currentValue, " vs ", alert.thresholdValue, ")"] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm mb-2", children: alert.message }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4 text-xs opacity-75", children: [(0, jsx_runtime_1.jsx)("span", { children: formatTimestamp(alert.timestamp) }), alert.acknowledged && ((0, jsx_runtime_1.jsxs)("span", { className: "text-green-600", children: ["\u2713 Acknowledged by ", alert.acknowledgedBy] })), alert.resolved && ((0, jsx_runtime_1.jsx)("span", { className: "text-blue-600", children: "\u2713 Resolved" }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [!alert.acknowledged && ((0, jsx_runtime_1.jsx)("button", { onClick: () => acknowledgeAlert(alert.id), className: "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700", children: "Acknowledge" })), !alert.resolved && ((0, jsx_runtime_1.jsx)("button", { onClick: () => resolveAlert(alert.id), className: "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700", children: "Resolve" }))] })] }) }, alert.id))) }))] }), thresholds.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Alert Thresholds" }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Metric" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Condition" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Severity" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: thresholds.map((threshold) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: threshold.metricName }), (0, jsx_runtime_1.jsxs)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [threshold.operator, " ", threshold.threshold] }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${threshold.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                        threshold.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'}`, children: threshold.severity }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${threshold.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: threshold.enabled ? 'Enabled' : 'Disabled' }) })] }, threshold.id))) })] }) })] }))] }));
};
exports.default = PerformanceDashboard;
//# sourceMappingURL=PerformanceDashboard.js.map