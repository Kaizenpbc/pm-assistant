import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity, Database, Server, Cpu } from 'lucide-react';

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

const SystemStatusDashboard: React.FC = () => {
  const [basicHealth, setBasicHealth] = useState<BasicHealthInfo | null>(null);
  const [detailedHealth, setDetailedHealth] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic health
      const basicResponse = await fetch('http://localhost:3001/health');
      if (!basicResponse.ok) throw new Error('Basic health check failed');
      const basicData = await basicResponse.json();
      setBasicHealth(basicData);

      // Fetch detailed health
      try {
        const detailedResponse = await fetch('http://localhost:3001/health/detailed');
        if (detailedResponse.ok) {
          const detailedData = await detailedResponse.json();
          setDetailedHealth(detailedData);
        }
      } catch (detailedError) {
        console.warn('Detailed health check failed:', detailedError);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchHealthData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
      case 'error':
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading system status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center text-red-600">
          <XCircle className="w-6 h-6 mr-2" />
          <span className="font-semibold">System Status Unavailable</span>
        </div>
        <p className="text-red-500 mt-2">{error}</p>
        <button
          onClick={fetchHealthData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">System Status</h2>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto-refresh
          </label>
          <button
            onClick={fetchHealthData}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Basic Status */}
      {basicHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${getStatusColor(basicHealth.status)}`}>
            <div className="flex items-center">
              {getStatusIcon(basicHealth.status)}
              <span className="ml-2 font-medium">Status</span>
            </div>
            <p className="text-sm mt-1 capitalize">{basicHealth.status}</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <Server className="w-5 h-5 text-blue-500" />
              <span className="ml-2 font-medium">Uptime</span>
            </div>
            <p className="text-sm mt-1">{formatUptime(basicHealth.uptime)}</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <Cpu className="w-5 h-5 text-green-500" />
              <span className="ml-2 font-medium">Memory</span>
            </div>
            <p className="text-sm mt-1">{formatBytes(basicHealth.memory.heapUsed)} / {formatBytes(basicHealth.memory.heapTotal)}</p>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="ml-2 font-medium">Response</span>
            </div>
            <p className="text-sm mt-1">{basicHealth.responseTime}</p>
          </div>
        </div>
      )}

      {/* Detailed Status */}
      {detailedHealth && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Service Health</h3>
          
          {/* Database Status */}
          <div className={`p-4 rounded-lg border ${getStatusColor(detailedHealth.services.database.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                <span className="font-medium">Database</span>
              </div>
              <div className="flex items-center">
                {getStatusIcon(detailedHealth.services.database.status)}
                <span className="ml-2 text-sm">
                  {detailedHealth.services.database.responseTime ? 
                    `${detailedHealth.services.database.responseTime.toFixed(2)}ms` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
            {detailedHealth.services.database.error && (
              <p className="text-sm mt-1 text-red-600">{detailedHealth.services.database.error}</p>
            )}
          </div>

          {/* Memory Status */}
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Cpu className="w-5 h-5 mr-2" />
                <span className="font-medium">Memory Usage</span>
              </div>
              <span className="text-sm">{detailedHealth.services.memory.percentage.toFixed(1)}%</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    detailedHealth.services.memory.percentage > 90 ? 'bg-red-500' :
                    detailedHealth.services.memory.percentage > 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(detailedHealth.services.memory.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formatBytes(detailedHealth.services.memory.used)} / {formatBytes(detailedHealth.services.memory.total)}
              </p>
            </div>
          </div>

          {/* Health Checks */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">Health Checks</h4>
            <div className="space-y-2">
              {detailedHealth.checks.map((check, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStatusColor(check.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(check.status)}
                      <span className="ml-2 font-medium capitalize">
                        {check.name.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-sm">
                      {check.responseTime > 0 ? `${check.responseTime.toFixed(2)}ms` : 'N/A'}
                    </span>
                  </div>
                  {check.details && (
                    <p className="text-sm mt-1">{check.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Last updated: {basicHealth ? new Date(basicHealth.timestamp).toLocaleString() : 'Never'}
          </span>
          <span>
            {basicHealth?.version} ({basicHealth?.environment})
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusDashboard;
