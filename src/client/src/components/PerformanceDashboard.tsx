import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Bell,
  BellOff,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Download,
  Zap,
  Database,
  Server,
  Cpu,
  Layers,
  HardDrive,
  Wifi,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

interface PerformanceAlert {
  id: string;
  thresholdId: string;
  metricName: string;
  currentValue: number | string;
  thresholdValue: number | string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
}

interface SLAMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
  status: 'pass' | 'fail' | 'warning';
  lastUpdated: string;
}

interface PerformanceThreshold {
  id: string;
  metricName: string;
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=';
  threshold: number | string;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  description?: string;
  cooldownMinutes?: number;
}

interface MonitoringStats {
  isMonitoring: boolean;
  totalMetrics: number;
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  thresholdsCount: number;
  slaMetricsCount: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetric[]>>({});
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetric[]>([]);
  const [thresholds, setThresholds] = useState<PerformanceThreshold[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);

  const fetchDashboardData = useCallback(async () => {
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
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching performance dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchDashboardData, autoRefresh, refreshInterval]);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
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

  const getSLAStatusColor = (status: string) => {
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

  const getMetricIcon = (metricName: string) => {
    if (metricName.includes('cpu')) return <Cpu className="w-5 h-5 text-orange-600" />;
    if (metricName.includes('memory')) return <Layers className="w-5 h-5 text-purple-600" />;
    if (metricName.includes('disk')) return <HardDrive className="w-5 h-5 text-green-600" />;
    if (metricName.includes('database')) return <Database className="w-5 h-5 text-blue-600" />;
    if (metricName.includes('api')) return <Wifi className="w-5 h-5 text-indigo-600" />;
    return <Activity className="w-5 h-5 text-gray-600" />;
  };

  const formatMetricValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === 'MB') return `${(value / 1024 / 1024).toFixed(1)}MB`;
    if (unit === 'GB') return `${(value / 1024 / 1024 / 1024).toFixed(1)}GB`;
    return `${value} ${unit}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTrendIcon = (values: number[]) => {
    if (values.length < 2) return <div className="w-4 h-4" />;
    
    const latest = values[values.length - 1];
    const previous = values[values.length - 2];
    
    if (latest > previous) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (latest < previous) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <div className="w-4 h-4 border-t-2 border-gray-400" />;
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/performance/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: 'Current User' })
      });

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/performance/alerts/${alertId}/resolve`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (!showResolved && alert.resolved) return false;
    return true;
  });

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading performance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Performance Dashboard Unavailable</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            Performance Monitoring
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time performance metrics, alerts, and SLA monitoring
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Auto-refresh:</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              {autoRefresh ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span>{autoRefresh ? 'On' : 'Off'}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Interval:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              disabled={!autoRefresh}
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
          
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Monitoring Status */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Monitoring Status</h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded text-sm ${
              stats.isMonitoring ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${stats.isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{stats.isMonitoring ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMetrics}</div>
              <div className="text-sm text-gray-600">Total Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.activeAlerts}</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.thresholdsCount}</div>
              <div className="text-sm text-gray-600">Thresholds</div>
            </div>
          </div>
        </div>
      )}

      {/* SLA Metrics */}
      {slaMetrics.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SLA Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slaMetrics.map((sla, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getSLAStatusColor(sla.status)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{sla.name}</h3>
                  <span className="text-xs font-medium uppercase">{sla.status}</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{sla.current}</span>
                  <span className="text-sm text-gray-600">{sla.unit}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Target: {sla.target} {sla.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {Object.keys(metrics).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metrics).map(([metricName, metricData]) => {
              if (metricData.length === 0) return null;
              
              const latestMetric = metricData[metricData.length - 1];
              const values = metricData.map(m => m.value);
              const trend = getTrendIcon(values);
              
              return (
                <div key={metricName} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getMetricIcon(metricName)}
                      <span className="font-medium capitalize">
                        {metricName.replace(/[._]/g, ' ')}
                      </span>
                    </div>
                    {trend}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">
                      {formatMetricValue(latestMetric.value, latestMetric.unit)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {formatTimestamp(latestMetric.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance Alerts</h2>
          <div className="flex items-center space-x-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm border ${
                showResolved 
                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {showResolved ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{showResolved ? 'Show Resolved' : 'Hide Resolved'}</span>
            </button>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No alerts found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{alert.metricName}</span>
                        <span className="text-sm opacity-75">
                          ({alert.currentValue} vs {alert.thresholdValue})
                        </span>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-xs opacity-75">
                        <span>{formatTimestamp(alert.timestamp)}</span>
                        {alert.acknowledged && (
                          <span className="text-green-600">
                            ✓ Acknowledged by {alert.acknowledgedBy}
                          </span>
                        )}
                        {alert.resolved && (
                          <span className="text-blue-600">
                            ✓ Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Acknowledge
                      </button>
                    )}
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thresholds */}
      {thresholds.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {thresholds.map((threshold) => (
                  <tr key={threshold.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {threshold.metricName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {threshold.operator} {threshold.threshold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        threshold.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        threshold.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {threshold.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        threshold.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {threshold.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;