import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  Layers,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  BellOff,
  Settings,
  Download,
  Upload,
  Calendar,
  BarChart3
} from 'lucide-react';

interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      load: number;
    };
  };
  checks: {
    name: string;
    status: 'pass' | 'fail';
    responseTime: number;
    details?: string;
  }[];
}

interface BasicHealthInfo {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  environment: string;
  responseTime: string;
}

interface HistoricalMetric {
  timestamp: string;
  value: number;
  label: string;
}

const EnhancedMonitoringDashboard: React.FC = () => {
  const [basicHealth, setBasicHealth] = useState<BasicHealthInfo | null>(null);
  const [detailedHealth, setDetailedHealth] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [notifications, setNotifications] = useState(true);
  const [historicalData, setHistoricalData] = useState<{
    memory: HistoricalMetric[];
    cpu: HistoricalMetric[];
    database: HistoricalMetric[];
  }>({
    memory: [],
    cpu: [],
    database: []
  });

  const fetchHealthData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic health
      const basicResponse = await fetch('http://localhost:3001/health/basic');
      if (!basicResponse.ok) throw new Error('Basic health check failed');
      const basicData = await basicResponse.json();
      setBasicHealth(basicData);

      // Fetch detailed health
      try {
        const detailedResponse = await fetch('http://localhost:3001/health/detailed');
        if (detailedResponse.ok) {
          const detailedData = await detailedResponse.json();
          setDetailedHealth(detailedData);

          // Store historical data
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
      } catch (detailedError) {
        console.warn('Detailed health check failed:', detailedError);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
      if (notifications) {
        // Show browser notification for critical errors
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('System Health Alert', {
            body: `Health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            icon: '/favicon.ico'
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    fetchHealthData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchHealthData, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchHealthData, autoRefresh, refreshInterval]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'pass':
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
      case 'fail':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (loading && !basicHealth) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading system status...</span>
      </div>
    );
  }

  if (error && !basicHealth) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">System Status Unavailable</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchHealthData}
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
            System Monitoring Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time system health monitoring and performance metrics
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
            onClick={fetchHealthData}
            disabled={loading}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Status */}
      {detailedHealth && (
        <div className={`border-2 rounded-lg p-6 ${getStatusColor(detailedHealth.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(detailedHealth.status)}
              <div>
                <h2 className="text-xl font-semibold">Overall System Status</h2>
                <p className="text-sm opacity-75">
                  Last updated: {new Date(detailedHealth.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{detailedHealth.status.toUpperCase()}</div>
              <div className="text-sm opacity-75">
                Uptime: {formatUptime(detailedHealth.uptime)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Database Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Database</h3>
            </div>
            {detailedHealth?.services.database.status && getStatusIcon(detailedHealth.services.database.status)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                detailedHealth?.services.database.status === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {detailedHealth?.services.database.status || 'Unknown'}
              </span>
            </div>
            {detailedHealth?.services.database.responseTime && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-medium">{detailedHealth.services.database.responseTime.toFixed(2)}ms</span>
              </div>
            )}
            {historicalData.database.length > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trend:</span>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(
                    historicalData.database[historicalData.database.length - 1]?.value || 0,
                    historicalData.database[historicalData.database.length - 2]?.value || 0
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Memory</h3>
            </div>
            {detailedHealth?.services.memory && (
              <div className={`text-sm font-medium ${
                detailedHealth.services.memory.percentage > 80 ? 'text-red-600' :
                detailedHealth.services.memory.percentage > 60 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {detailedHealth.services.memory.percentage.toFixed(1)}%
              </div>
            )}
          </div>
          {detailedHealth?.services.memory && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    detailedHealth.services.memory.percentage > 80 ? 'bg-red-500' :
                    detailedHealth.services.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(detailedHealth.services.memory.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-medium">{formatBytes(detailedHealth.services.memory.used)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{formatBytes(detailedHealth.services.memory.total)}</span>
                </div>
                {historicalData.memory.length > 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trend:</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(
                        historicalData.memory[historicalData.memory.length - 1]?.value || 0,
                        historicalData.memory[historicalData.memory.length - 2]?.value || 0
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* CPU Load */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">CPU Load</h3>
            </div>
            {detailedHealth?.services.cpu && (
              <div className={`text-sm font-medium ${
                detailedHealth.services.cpu.load > 5 ? 'text-red-600' :
                detailedHealth.services.cpu.load > 2 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {detailedHealth.services.cpu.load.toFixed(2)}
              </div>
            )}
          </div>
          {detailedHealth?.services.cpu && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    detailedHealth.services.cpu.load > 5 ? 'bg-red-500' :
                    detailedHealth.services.cpu.load > 2 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((detailedHealth.services.cpu.load / 10) * 100, 100)}%` }}
                ></div>
              </div>
              {historicalData.cpu.length > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trend:</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(
                      historicalData.cpu[historicalData.cpu.length - 1]?.value || 0,
                      historicalData.cpu[historicalData.cpu.length - 2]?.value || 0
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Server Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Server Info</h3>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {basicHealth && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{basicHealth.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-medium">{basicHealth.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">{basicHealth.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{formatUptime(basicHealth.uptime)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Health Checks */}
      {detailedHealth && detailedHealth.checks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            System Health Checks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailedHealth.checks.map((check, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(check.status)}
                    <span className="font-medium capitalize">
                      {check.name.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {check.responseTime.toFixed(2)}ms
                  </span>
                </div>
                {check.details && (
                  <p className="text-sm opacity-75">{check.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Charts */}
      {(historicalData.memory.length > 1 || historicalData.cpu.length > 1 || historicalData.database.length > 1) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Performance Trends (Last 20 measurements)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Memory Trend */}
            {historicalData.memory.length > 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Memory Usage %</h4>
                <div className="h-32 bg-gray-50 rounded border p-2">
                  <svg width="100%" height="100%" viewBox="0 0 300 100">
                    <polyline
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      points={historicalData.memory.map((point, index) => 
                        `${(index / (historicalData.memory.length - 1)) * 280},${100 - (point.value / 100) * 80}`
                      ).join(' ')}
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* CPU Trend */}
            {historicalData.cpu.length > 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">CPU Load</h4>
                <div className="h-32 bg-gray-50 rounded border p-2">
                  <svg width="100%" height="100%" viewBox="0 0 300 100">
                    <polyline
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      points={historicalData.cpu.map((point, index) => 
                        `${(index / (historicalData.cpu.length - 1)) * 280},${100 - (point.value / 10) * 80}`
                      ).join(' ')}
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Database Response Time Trend */}
            {historicalData.database.length > 1 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Database Response Time (ms)</h4>
                <div className="h-32 bg-gray-50 rounded border p-2">
                  <svg width="100%" height="100%" viewBox="0 0 300 100">
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      points={historicalData.database.map((point, index) => 
                        `${(index / (historicalData.database.length - 1)) * 280},${100 - (point.value / 100) * 80}`
                      ).join(' ')}
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMonitoringDashboard;
