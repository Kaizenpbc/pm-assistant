import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AIAssistant } from '../components/AIAssistant';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Brain,
  Target,
  Clock,
  Bell,
  BarChart3,
  Shield,
  Activity,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown,
  Save,
  Loader2,
  FileText,
  X,
  LogOut
} from 'lucide-react';

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiAssistant, setAIAssistant] = useState<{
    isOpen: boolean;
    type: 'analysis' | 'recommendations' | 'chat';
  }>({ isOpen: false, type: 'chat' });

  const { data: projectData, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiService.getProject(id!),
    enabled: !!id,
  });

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const project = projectData.project;
  const daysRemaining = calculateDaysRemaining(project.endDate || project.plannedEndDate || new Date().toISOString());
  const budgetUtilization = project.budgetAllocated ? (project.budgetSpent / project.budgetAllocated) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">{project.code || 'No Code'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Project Health</div>
                <div className="text-2xl font-bold text-green-600">78/100</div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-red-600 hover:text-red-800 border border-red-300 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Context Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Progress Card */}
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                <Activity className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{project.progressPercentage || 0}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${project.progressPercentage || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Started {formatDate(project.startDate || project.plannedStartDate || project.createdAt)}
              </p>
            </div>
          </div>

          {/* Budget Card */}
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(project.budgetSpent || 0, 'USD')}
              </div>
              <div className="text-xs text-gray-500">
                of {formatCurrency(project.budgetAllocated || 0, 'USD')}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {budgetUtilization.toFixed(1)}% utilized
              </p>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="card">
            <div className="card-content">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">
                {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
              </div>
              <div className="text-xs text-gray-500">
                {daysRemaining > 0 ? 'remaining' : 'past due'}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Due {formatDate(project.endDate || project.plannedEndDate || new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Team Card */}
          <div className="card">
              <div className="card-content">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Team</h3>
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-gray-500">active members</div>
              <p className="text-xs text-gray-500 mt-2">
                PM: Project Manager
              </p>
            </div>
          </div>
        </div>

        {/* Smart Buttons Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Smart Project Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Analytics & Health */}
            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('analytics')}>
              <div className="card-content p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                    <p className="text-sm text-gray-600">Deep insights & trends</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('health')}>
              <div className="card-content p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Project Health</h3>
                    <p className="text-sm text-gray-600">AI-powered health score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource & Risk Management */}
            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('resources')}>
              <div className="card-content p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Resource Allocation</h3>
                    <p className="text-sm text-gray-600">Smart team optimization</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('risks')}>
              <div className="card-content p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Risk Trends</h3>
                    <p className="text-sm text-gray-600">Predictive risk analysis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Escalation */}
            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('deadlines')}>
              <div className="card-content p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Deadlines</h3>
                    <p className="text-sm text-gray-600">Critical timeline tracking</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('escalations')}>
              <div className="card-content p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Escalations</h3>
                    <p className="text-sm text-gray-600">Smart escalation rules</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI & Notifications */}
            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('alerts')}>
              <div className="card-content p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Bell className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Alerts</h3>
                    <p className="text-sm text-gray-600">Intelligent notifications</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('ai-tasks')}>
              <div className="card-content p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Brain className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Tasks</h3>
                    <p className="text-sm text-gray-600">Automated task assignment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="w-full">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'schedule', label: 'Schedule' },
                { id: 'raid', label: 'RAID' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'health', label: 'Health' },
                { id: 'resources', label: 'Resources' },
                { id: 'risks', label: 'Risks' },
                { id: 'checklist', label: 'PM Checklist' },
                { id: 'ai-tasks', label: 'AI Tasks' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-900 mt-1">{project.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{project.category || 'General'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Priority</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{project.priority}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{project.status.replace('_', ' ')}</p>
                      </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(project.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="card-content">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Project milestone completed</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Budget updated</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Risk assessment completed</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">📊 Advanced Analytics</h3>
                      <p className="text-gray-600">Comprehensive project performance insights and trends</p>
                    </div>
                    <button 
                      onClick={() => setAIAssistant({ isOpen: true, type: 'analysis' })}
                      className="btn btn-primary"
                    >
                      🤖 AI Deep Analysis
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="card-content">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                        <p className="text-3xl font-bold text-blue-600">78%</p>
                        <p className="text-xs text-green-600">↗ +5% this week</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-content">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Velocity</p>
                        <p className="text-3xl font-bold text-green-600">42</p>
                        <p className="text-xs text-green-600">↗ +3 points</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-content">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Budget Used</p>
                        <p className="text-3xl font-bold text-orange-600">67%</p>
                        <p className="text-xs text-orange-600">↗ +2% this week</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-content">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Risk Score</p>
                        <p className="text-3xl font-bold text-red-600">23</p>
                        <p className="text-xs text-red-600">↗ +2 points</p>
                      </div>
                      <div className="p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-content">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Performance Trends</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Task Completion Rate</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Team Productivity</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quality Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Client Satisfaction</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                          </div>
                          <span className="text-sm font-medium">88%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-content">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">⏱️ Timeline Analysis</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">On Track Milestones</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">8/10</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium">At Risk Milestones</span>
                        </div>
                        <span className="text-sm font-bold text-yellow-600">2/10</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium">Overdue Tasks</span>
                        </div>
                        <span className="text-sm font-bold text-red-600">3</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">Upcoming Deadlines</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Utilization */}
              <div className="card">
                <div className="card-content">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">👥 Resource Utilization</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">85%</div>
                      <p className="text-sm text-gray-600">Team Utilization</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">92%</div>
                      <p className="text-sm text-gray-600">Skill Match</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">78%</div>
                      <p className="text-sm text-gray-600">Capacity Planning</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Predictive Insights */}
              <div className="card">
                <div className="card-content">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">🔮 Predictive Insights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <h5 className="font-semibold text-blue-900">Completion Forecast</h5>
                      </div>
                      <p className="text-sm text-blue-800 mb-2">Based on current velocity and trends:</p>
                      <p className="text-lg font-bold text-blue-900">Project will complete 2 days ahead of schedule</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        </div>
                        <h5 className="font-semibold text-orange-900">Risk Alert</h5>
                      </div>
                      <p className="text-sm text-orange-800 mb-2">Potential bottleneck identified:</p>
                      <p className="text-lg font-bold text-orange-900">Design phase may delay by 3-5 days</p>
                    </div>
                  </div>
                </div>
          </div>

              {/* Action Buttons */}
              <div className="card">
                <div className="card-content">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Analytics Assistant</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setAIAssistant({ isOpen: true, type: 'analysis' })}
                      className="btn btn-primary w-full py-3"
                    >
                      📊 Generate Detailed Report
                    </button>
                    <button 
                      onClick={() => setAIAssistant({ isOpen: true, type: 'recommendations' })}
                      className="btn btn-secondary w-full py-3"
                    >
                      💡 Get Optimization Tips
                    </button>
                    <button 
                      onClick={() => setAIAssistant({ isOpen: true, type: 'chat' })}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full flex items-center justify-center space-x-2"
                    >
                      <span>🤖</span>
                      <span>Ask Analytics Questions</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Health Score</h3>
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-4">78/100</div>
                  <p className="text-gray-600 mb-4">Overall project health is good</p>
                  <button 
                    onClick={() => setAIAssistant({ isOpen: true, type: 'analysis' })}
                    className="btn btn-primary"
                  >
                    Get AI Health Analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Allocation</h3>
                <p className="text-gray-600">Resource management tools coming soon...</p>
                <button 
                  onClick={() => setAIAssistant({ isOpen: true, type: 'recommendations' })}
                  className="btn btn-primary mt-4"
                >
                  Get AI Resource Recommendations
                </button>
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
                <p className="text-gray-600">Risk management dashboard coming soon...</p>
                <button 
                  onClick={() => setAIAssistant({ isOpen: true, type: 'analysis' })}
                  className="btn btn-primary mt-4"
                >
                  Analyze Project Risks
                </button>
              </div>
            </div>
          )}

          {activeTab === 'deadlines' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deadline Management</h3>
                <p className="text-gray-600">Deadline tracking tools coming soon...</p>
                <button 
                  onClick={() => setAIAssistant({ isOpen: true, type: 'recommendations' })}
                  className="btn btn-primary mt-4"
                >
                  Get Deadline Recommendations
                </button>
              </div>
            </div>
          )}

          {activeTab === 'escalations' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalation Management</h3>
                <p className="text-gray-600">Escalation rules and management coming soon...</p>
                <button 
                  onClick={() => setAIAssistant({ isOpen: true, type: 'recommendations' })}
                  className="btn btn-primary mt-4"
                >
                  Configure Escalation Rules
                </button>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Alerts</h3>
                <p className="text-gray-600">Notification management coming soon...</p>
                <button 
                  onClick={() => setAIAssistant({ isOpen: true, type: 'chat' })}
                  className="btn btn-primary mt-4"
                >
                  Configure Smart Alerts
                </button>
              </div>
                  </div>
          )}

          {activeTab === 'ai-tasks' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Task Management</h3>
                <p className="text-gray-600">AI-powered task assignment coming soon...</p>
                <button 
                  onClick={() => setAIAssistant({ isOpen: true, type: 'chat' })}
                  className="btn btn-primary mt-4"
                >
                  Get AI Task Recommendations
                </button>
                  </div>
                    </div>
                  )}

          {activeTab === 'schedule' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Schedule</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <p className="text-blue-800 font-medium">Schedule Management</p>
                  </div>
                  <p className="text-blue-700 text-sm mb-3">
                    To view and manage your project schedule, click the button below to open the dedicated Schedule page.
                  </p>
                  <button 
                    onClick={() => navigate(`/schedule/${project.id}`)}
                    className="btn btn-primary"
                  >
                    View Project Schedule
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  <p>• Add phases from templates</p>
                  <p>• Manage tasks and timelines</p>
                  <p>• Save and load schedules</p>
                  <p>• Track project progress</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raid' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">RAID Management</h3>
                <p className="text-gray-600">RAID (Risks, Assumptions, Issues, Dependencies) management coming soon...</p>
                <button 
                  onClick={() => setAIAssistant({ isOpen: true, type: 'analysis' })}
                  className="btn btn-primary mt-4"
                >
                  Analyze RAID Items
                </button>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="card">
              <div className="card-content">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">PM Checklist</h3>
                <p className="text-gray-600">Project management checklist coming soon...</p>
                <button 
                  onClick={() => setAIAssistant({ isOpen: true, type: 'recommendations' })}
                  className="btn btn-primary mt-4"
                >
                  Get PM Checklist
                </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {aiAssistant.isOpen && (
        <AIAssistant
          type={aiAssistant.type}
          onClose={() => setAIAssistant({ isOpen: false, type: 'chat' })}
          projectId={project.id}
          projectName={project.name}
        />
      )}
    </div>
  );
};
