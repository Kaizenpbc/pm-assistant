import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Calendar, BarChart3 } from 'lucide-react';
import EnhancedMonitoringDashboard from '../components/EnhancedMonitoringDashboard';

const MonitoringPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log('Export monitoring data');
  };

  const handleImportData = () => {
    // TODO: Implement data import functionality
    console.log('Import monitoring data');
  };

  const handleScheduleReport = () => {
    // TODO: Implement scheduled report functionality
    console.log('Schedule monitoring report');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">System Monitoring</h1>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              
              <button
                onClick={handleImportData}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Import Data</span>
              </button>
              
              <button
                onClick={handleScheduleReport}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <EnhancedMonitoringDashboard />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <p>System monitoring provides real-time insights into application performance and health.</p>
            </div>
            <div className="flex items-center space-x-4">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span>•</span>
              <span>Auto-refresh: 30s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
