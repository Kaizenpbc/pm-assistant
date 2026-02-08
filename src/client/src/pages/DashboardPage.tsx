import React, { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AIAssistant } from '../components/AIAssistant';
import ProjectCreationModal from '../components/ProjectCreationModal';
import ProjectEditModal from '../components/ProjectEditModal';
import {
  BarChart3,
  Brain,
  Target,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  User,
  Lightbulb,
  Loader2,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  
  const [searchParams] = useSearchParams();
  const [aiAssistant, setAIAssistant] = useState<{
    isOpen: boolean;
    type: 'analysis' | 'recommendations' | 'chat';
  }>({ isOpen: false, type: 'chat' });
  
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  
  // Debug initial state
  console.log('🏠 DashboardPage: Component rendered');
  console.log('📊 DashboardPage: Initial showCreateProject state:', showCreateProject);
  
  // Add visible debug element
  if (showCreateProject) {
    console.log('🎨 MODAL SHOULD BE VISIBLE NOW!');
  }

  // Handle URL shortcuts and shared content
  const { data: projectsData, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
    // Use global configuration - no need to override staleTime
  });

  const projects = projectsData?.projects || [];

  // Debug logging (temporary)
  if (isLoading) {
    console.log('🔄 Dashboard is loading projects...');
  }
  if (error) {
    console.error('❌ Dashboard error:', error);
  }
  if (projectsData) {
    console.log('✅ Dashboard received projects:', projects.length);
  }

  useEffect(() => {
    const action = searchParams.get('action');
    const shared = searchParams.get('shared');
    
    if (action === 'create-project') {
      setShowCreateProject(true);
    } else if (action === 'ai-tasks') {
      setAIAssistant({ isOpen: true, type: 'analysis' });
    } else if (action === 'view-schedules') {
      // Navigate to first project's schedule if available
      if (projectsData && projectsData.length > 0) {
        navigate(`/project/${projectsData[0].id}/schedule`);
      }
    }
    
    if (shared === 'true') {
      // Show notification that shared content was received
      console.log('Shared content received');
    }
  }, [searchParams, navigate, projectsData]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      logout();
      // Navigate to login page for complete logout
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout(); // Logout locally even if API call fails
      // Navigate to login page even if API call fails
      navigate('/login');
    }
  };

  const handleEditProject = (project: any) => {
    console.log('✏️ Editing project:', project);
    setEditingProject(project);
    setShowEditProject(true);
  };

  const handleUpdateProject = async (updatedProjectData: any) => {
    try {
      console.log('🔄 Updating project:', editingProject?.id, updatedProjectData);
      await apiService.updateProject(editingProject?.id as string, updatedProjectData);
      setShowEditProject(false);
      setEditingProject(null);
      
      // Properly refresh the projects list using React Query
      if (refetch) {
        await refetch();
        console.log('✅ Projects list refreshed after update');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  // AI Action Button Handlers
  const handlePortfolioAnalysis = () => {
    setAIAssistant({ isOpen: true, type: 'analysis' });
  };

  const handleAdvancedAnalytics = () => {
    setAIAssistant({ isOpen: true, type: 'analysis' });
  };

  const handleProjectHealth = () => {
    setAIAssistant({ isOpen: true, type: 'analysis' });
  };

  const handleResourceAllocation = () => {
    setAIAssistant({ isOpen: true, type: 'recommendations' });
  };

  const handleRiskTrends = () => {
    setAIAssistant({ isOpen: true, type: 'analysis' });
  };

  const handleDeadlines = () => {
    setAIAssistant({ isOpen: true, type: 'recommendations' });
  };

  const handleEscalations = () => {
    setAIAssistant({ isOpen: true, type: 'recommendations' });
  };

  const handleApprovals = () => {
    setAIAssistant({ isOpen: true, type: 'recommendations' });
  };

  const handleSmartAlerts = () => {
    setAIAssistant({ isOpen: true, type: 'chat' });
  };

  const handleAITasks = () => {
    setAIAssistant({ isOpen: true, type: 'chat' });
  };

  // Table Action Handlers
  const handleProjectClick = (project: any) => {
    console.log('Project clicked:', project);
    // Navigate to project details
    window.location.href = `/project/${project.id}`;
  };

  const handleViewRAID = (project: any) => {
    console.log('View RAID for project:', project);
    setAIAssistant({ isOpen: true, type: 'analysis' });
  };

  const handleViewSchedule = (project: any) => {
    console.log('View Schedule for project:', project);
    // Navigate to schedule view page
    window.location.href = `/schedule/${project.id}`;
  };

  const handleGetAISuggestions = (project: any) => {
    console.log('AI Suggestions for project:', project);
    setAIAssistant({ isOpen: true, type: 'recommendations' });
  };

  const handleSmartIssueEscalationClick = (project: any) => {
    console.log('Issue Escalation for project:', project);
    setAIAssistant({ isOpen: true, type: 'recommendations' });
  };

  const handleSmartDecisionEngineClick = (project: any) => {
    console.log('Decision Engine for project:', project);
    setAIAssistant({ isOpen: true, type: 'analysis' });
  };

  const handleSmartActionPrioritizationClick = (project: any) => {
    console.log('Action Prioritization for project:', project);
    setAIAssistant({ isOpen: true, type: 'recommendations' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading projects...</p>
        <button 
          onClick={() => refetch()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to load projects
          </h2>
          <p className="text-gray-600 mb-4">
            There was an error loading your projects. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DEBUG ELEMENT - REMOVE AFTER TESTING */}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Title Row */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Project Management Dashboard
              </h1>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.username || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role?.toUpperCase() || 'USER'} • {user?.username || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3">
            {(user?.role === 'region_admin' || user?.role === 'admin') && (
              <button
                onClick={() => navigate('/region/admin')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center space-x-2"
                type="button"
              >
                <span>⚙️</span>
                <span>Manage Region</span>
              </button>
            )}
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md"
              type="button"
            >
              ➕ Create New Project
            </button>
            <button
              onClick={() => navigate('/monitoring')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-2"
              type="button"
            >
              <Activity className="w-4 h-4" />
              System Monitoring
            </button>
            <button
              onClick={() => navigate('/performance')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-2"
              type="button"
            >
              <BarChart3 className="w-4 h-4" />
              Performance Metrics
            </button>
            <button
              onClick={handlePortfolioAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Portfolio Analysis
            </button>
            <button
              onClick={handleAdvancedAnalytics}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <Brain className="h-4 w-4 mr-2" />
              Advanced Analytics
            </button>
            <button
              onClick={handleProjectHealth}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <Target className="h-4 w-4 mr-2" />
              Project Health
            </button>
            <button
              onClick={handleResourceAllocation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <Users className="h-4 w-4 mr-2" />
              Resource Allocation
            </button>
            <button
              onClick={handleRiskTrends}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Risk Trends
            </button>
            <button
              onClick={handleDeadlines}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <Clock className="h-4 w-4 mr-2" />
              Deadlines
            </button>
            <button
              onClick={handleEscalations}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Escalations
            </button>
            <button
              onClick={handleApprovals}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approvals
            </button>
            <button
              onClick={handleSmartAlerts}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <Bell className="h-4 w-4 mr-2" />
              Smart Alerts
            </button>
            <button
              onClick={handleAITasks}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md"
            >
              <User className="h-4 w-4 mr-2" />
              AI Tasks
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📁</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {projects.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {projects.filter((p: any) => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-lg">⏳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Planning</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {projects.filter((p: any) => p.status === 'planning').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {projects.filter((p: any) => p.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Projects</h2>
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="sticky left-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200 min-w-[200px]">Actions & Code</th>
                    <th className="sticky left-[200px] z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200 min-w-[200px]">Project Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Finish</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Finish</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend to Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Complete</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link to Risks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Suggestions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Escalation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision Tracking</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link to Issues</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={17} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Loading projects...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={17} className="px-6 py-4 text-center text-red-500">
                        <div className="flex items-center justify-center space-x-2">
                          <span>Failed to load projects</span>
                        </div>
                      </td>
                    </tr>
                  ) : projects && projects.length > 0 ? (
                    projects.map((project: any) => {
                      return (
                        <tr 
                          key={project.id} 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleProjectClick(project)}
                        >
                          <td className="sticky left-0 z-10 px-6 py-4 whitespace-nowrap bg-white border-r border-gray-200 min-w-[200px]">
                            {/* Action Buttons - SUPER VISIBLE */}
                            <div className="flex items-center space-x-2 mb-2" style={{ backgroundColor: 'yellow', padding: '5px', border: '2px solid red' }}>
                              <button 
                                style={{ 
                                  backgroundColor: 'lime', 
                                  color: 'black', 
                                  padding: '5px 10px', 
                                  border: '2px solid green',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/project/${project.id}`;
                                }}
                              >
                                👁️ VIEW
                              </button>
                              <button 
                                style={{ 
                                  backgroundColor: 'blue', 
                                  color: 'white', 
                                  padding: '5px 10px', 
                                  border: '2px solid darkblue',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProject(project);
                                }}
                              >
                                ✏️ EDIT
                              </button>
                              <button 
                                style={{ 
                                  backgroundColor: 'red', 
                                  color: 'white', 
                                  padding: '5px 10px', 
                                  border: '2px solid darkred',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) {
                                    try {
                                      await apiService.deleteProject(project.id);
                                      
                                      // Properly refresh the projects list using React Query
                                      if (refetch) {
                                        await refetch();
                                        console.log('✅ Projects list refreshed after deletion');
                                      }
                                    } catch (error) {
                                      console.error('Failed to delete project:', error);
                                      alert('Failed to delete project. Please try again.');
                                    }
                                  }
                                }}
                              >
                                🗑️ DELETE
                              </button>
                            </div>
                            {/* Project Code */}
                            <div className="text-sm font-medium text-blue-600">{project.code || 'No Code'}</div>
                            <div className="text-xs text-gray-500">ID: {project.id}</div>
                          </td>
                          <td className="sticky left-[200px] z-10 px-6 py-4 whitespace-nowrap bg-white border-r border-gray-200 min-w-[200px]">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {project.created_by || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{project.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.plannedStartDate ? new Date(project.plannedStartDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.projectedEndDate ? new Date(project.projectedEndDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${project.budget?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${project.spentToDate?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${project.progressPercentage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{project.progressPercentage || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              project.status === 'completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'in_progress' || project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'initiate' ? 'bg-yellow-100 text-yellow-800' :
                              project.status === 'planning' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRAID(project);
                              }}
                            >
                              View RAID
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-purple-600 hover:text-purple-800 hover:underline flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGetAISuggestions(project);
                              }}
                            >
                              <Lightbulb className="h-4 w-4 mr-1" />
                              AI Suggestions
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-orange-600 hover:text-orange-800 hover:underline flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSmartIssueEscalationClick(project);
                              }}
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Escalation
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSmartDecisionEngineClick(project);
                              }}
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Decisions
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('AI Priority button clicked for project:', project.name);
                                handleSmartActionPrioritizationClick(project);
                              }}
                            >
                              <Target className="h-4 w-4 mr-1" />
                              🧠 AI Priority
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-blue-600 hover:text-blue-800 hover:underline border border-blue-300 px-3 py-1 rounded-md flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSchedule(project);
                              }}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              View Schedule
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-green-600 hover:text-green-800 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRAID(project);
                              }}
                            >
                              View Issues
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={17} className="px-6 py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-gray-400 text-2xl">📁</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-500 mb-4">
                          Get started by creating your first project.
                        </p>
                        <button className="btn btn-primary">
                          Create Project
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      {/* AI Assistant Modal */}
      {aiAssistant.isOpen && (
        <AIAssistant
          type={aiAssistant.type}
          onClose={() => setAIAssistant({ isOpen: false, type: 'chat' })}
        />
      )}

      {/* Project Creation Modal */}
      {showCreateProject && (
        <>
          {console.log('🚀 DashboardPage: Rendering ProjectCreationModal')}
          {console.log('📊 DashboardPage: showCreateProject =', showCreateProject)}
          <ProjectCreationModal
            isOpen={showCreateProject}
            onClose={() => {
              console.log('🔒 DashboardPage: Closing modal');
              setShowCreateProject(false);
            }}
            onCreateProject={async (projectData) => {
              try {
                console.log('🎯 DashboardPage: onCreateProject called');
                console.log('📝 DashboardPage: Project data:', projectData);
                
                // Call the API to create the project
                const response = await apiService.createProject(projectData);
                
                if (response.success) {
                  console.log('✅ DashboardPage: Project created successfully:', response.project);
                  
                  // Properly refresh the projects list using React Query
                  if (refetch) {
                    await refetch();
                    console.log('✅ Projects list refreshed after creation');
                  }
                } else {
                  console.error('❌ DashboardPage: Failed to create project:', response.message);
                  alert('Failed to create project: ' + response.message);
                }
              } catch (error) {
                console.error('💥 DashboardPage: Error creating project:', error);
                alert('Error creating project: ' + (error instanceof Error ? error.message : String(error)));
              } finally {
                console.log('🔚 DashboardPage: Closing modal after project creation');
                setShowCreateProject(false);
              }
            }}
          />
        </>
      )}

      {/* Project Edit Modal */}
      {showEditProject && editingProject && (
        <ProjectEditModal
          isOpen={showEditProject}
          project={editingProject}
          onClose={() => {
            setShowEditProject(false);
            setEditingProject(null);
          }}
          onUpdate={handleUpdateProject}
        />
      )}
    </div>
  );
};
