import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface TaskSuggestion {
  id: string;
  name: string;
  description: string;
  estimatedDays: number;
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
  riskLevel: number;
  category: string;
  skills: string[];
  deliverables: string[];
}

interface ProjectAnalysis {
  projectType: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  riskLevel: number;
  suggestedPhases: string[];
  taskSuggestions: TaskSuggestion[];
  criticalPath: string[];
  resourceRequirements: {
    developers?: number;
    designers?: number;
    testers?: number;
    managers?: number;
  };
}

interface AITaskBreakdownProps {
  onTasksGenerated: (tasks: TaskSuggestion[], phases?: any[]) => void;
  projectId?: string;
  existingDescription?: string;
  projectName?: string;
  projectCode?: string;
  projectStatus?: string;
}

export const AITaskBreakdown: React.FC<AITaskBreakdownProps> = ({
  onTasksGenerated,
  projectId,
  existingDescription = '',
  projectName = '',
  projectCode = '',
  projectStatus = ''
}) => {
  // Create comprehensive project context
  const createProjectContext = () => {
    const context = [];
    if (projectName) context.push(`Project Name: ${projectName}`);
    if (projectCode) context.push(`Project Code: ${projectCode}`);
    if (projectStatus) context.push(`Status: ${projectStatus}`);
    if (existingDescription) context.push(`Description: ${existingDescription}`);
    return context.join('\n');
  };

  const [projectDescription, setProjectDescription] = useState(() => {
    return createProjectContext() || existingDescription;
  });
  
  // Auto-detect project type based on project context
  const detectProjectType = () => {
    const context = `${projectName} ${projectCode} ${existingDescription}`.toLowerCase();
    if (context.includes('construction') || context.includes('building') || context.includes('school')) {
      return 'construction_project';
    }
    if (context.includes('mobile') || context.includes('app')) {
      return 'mobile_app';
    }
    if (context.includes('web') || context.includes('website')) {
      return 'web_application';
    }
    if (context.includes('data') || context.includes('analytics')) {
      return 'data_project';
    }
    return 'general';
  };

  const [projectType, setProjectType] = useState(detectProjectType());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const projectTypes = [
    { value: 'construction_project', label: '🏗️ Construction Project' },
    { value: 'mobile_app', label: '📱 Mobile App Development' },
    { value: 'web_application', label: '🌐 Web Application' },
    { value: 'backend_service', label: '⚙️ Backend Service/API' },
    { value: 'data_project', label: '📊 Data Project' },
    { value: 'design_project', label: '🎨 Design Project' },
    { value: 'ai_ml_project', label: '🤖 AI/ML Project' },
    { value: 'iot_project', label: '🔌 IoT Project' },
    { value: 'general', label: '📋 General Project' }
  ];

  const handleAnalyzeProject = async () => {
    if (!projectDescription.trim()) {
      alert('Please enter a project description');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiService.analyzeProject({
        projectDescription,
        projectType,
        existingTasks: []
      });

      setAnalysis(response.analysis);
      setInsights(response.insights);
      
      // Auto-select all tasks initially
      const allTaskIds = response.analysis.taskSuggestions.map((task: TaskSuggestion) => task.id);
      setSelectedTasks(allTaskIds);
      
    } catch (error) {
      console.error('Error analyzing project:', error);
      alert('Failed to analyze project. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSchedule = () => {
    if (!analysis) return;
    
    const selectedTaskSuggestions = analysis.taskSuggestions.filter(task => 
      selectedTasks.includes(task.id)
    );
    
    // Pass both selected tasks and the phase structure
    onTasksGenerated(selectedTaskSuggestions, analysis.suggestedPhases);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel > 70) return 'text-red-600 bg-red-100';
    if (riskLevel > 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="ai-task-breakdown p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🤖 AI Task Breakdown
        </h2>
        <p className="text-gray-600 mb-4">
          Describe your project and let AI suggest an intelligent task breakdown with dependencies, estimates, and risk assessment.
        </p>
      </div>

      {/* Project Description Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Description *
        </label>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Describe your project in detail... e.g., 'Build a mobile app for restaurant ordering with user authentication, menu browsing, order placement, and payment integration'"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          disabled={isAnalyzing}
        />
      </div>

      {/* Project Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Type
        </label>
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isAnalyzing}
        >
          {projectTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Analyze Button */}
      <div className="mb-6">
        <button
          onClick={handleAnalyzeProject}
          disabled={isAnalyzing || !projectDescription.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Project...
            </span>
          ) : (
            '🧠 Analyze Project with AI'
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Project Overview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Project Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.estimatedDuration}</div>
                <div className="text-sm text-gray-600">Estimated Days</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold px-3 py-1 rounded-full text-sm ${getComplexityColor(analysis.complexity)}`}>
                  {analysis.complexity.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600 mt-1">Complexity</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold px-3 py-1 rounded-full text-sm ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Risk Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.taskSuggestions.length}</div>
                <div className="text-sm text-gray-600">Tasks</div>
              </div>
            </div>
          </div>

          {/* Resource Requirements */}
          {analysis.resourceRequirements && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">👥 Resource Requirements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analysis.resourceRequirements.developers > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{analysis.resourceRequirements.developers}</div>
                    <div className="text-sm text-gray-600">Developers</div>
                  </div>
                )}
                {analysis.resourceRequirements.designers > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{analysis.resourceRequirements.designers}</div>
                    <div className="text-sm text-gray-600">Designers</div>
                  </div>
                )}
                {analysis.resourceRequirements.testers > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{analysis.resourceRequirements.testers}</div>
                    <div className="text-sm text-gray-600">Testers</div>
                  </div>
                )}
                {analysis.resourceRequirements.managers > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{analysis.resourceRequirements.managers}</div>
                    <div className="text-sm text-gray-600">Managers</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insights */}
          {insights && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 AI Insights</h3>
              <div className="space-y-3">
                {insights.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">✅ Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {insights.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {insights.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">⚠️ Warnings:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {insights.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Task Suggestions */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">📋 Suggested Tasks</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedTasks.length} of {analysis.taskSuggestions.length} selected
                  </span>
                  <button
                    onClick={() => setSelectedTasks(
                      selectedTasks.length === analysis.taskSuggestions.length 
                        ? [] 
                        : analysis.taskSuggestions.map(task => task.id)
                    )}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedTasks.length === analysis.taskSuggestions.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Phase-organized Task Display */}
            <div className="space-y-6">
              {analysis.suggestedPhases.map((phase: any) => (
                <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Phase Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {phase.estimatedDays} days total
                        </div>
                        <div className="text-sm text-gray-500">
                          {phase.tasks.length} tasks
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Phase Tasks */}
                  <div className="divide-y divide-gray-100">
                    {phase.tasks.map((task: TaskSuggestion) => (
                      <div key={task.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-medium text-gray-900">{task.name}</h4>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(task.complexity)}`}>
                                  {task.complexity}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(task.riskLevel)}`}>
                                  {task.riskLevel}% risk
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{task.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Duration:</span> {task.estimatedDays} days
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Category:</span> {task.category}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Skills:</span> {task.skills.join(', ')}
                              </div>
                            </div>
                            
                            {task.deliverables.length > 0 && (
                              <div className="mt-2">
                                <span className="font-medium text-gray-700 text-sm">Deliverables:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.deliverables.map((deliverable, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {deliverable}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Schedule Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerateSchedule}
              disabled={selectedTasks.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📅 Generate Schedule with {selectedTasks.length} Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
