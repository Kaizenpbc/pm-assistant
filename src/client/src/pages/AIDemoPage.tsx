import React, { useState } from 'react';
import { AITaskBreakdown } from '../components/AITaskBreakdown';

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

export const AIDemoPage: React.FC = () => {
  const [generatedTasks, setGeneratedTasks] = useState<TaskSuggestion[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  const handleTasksGenerated = (tasks: TaskSuggestion[]) => {
    setGeneratedTasks(tasks);
    setShowDemo(false);
  };

  const sampleProjects = [
    {
      name: "Restaurant Mobile App",
      description: "Build a mobile app for restaurant ordering with user authentication, menu browsing, order placement, payment integration, and real-time order tracking",
      type: "mobile_app"
    },
    {
      name: "E-commerce Website",
      description: "Create a full-stack e-commerce website with product catalog, shopping cart, user accounts, payment processing, inventory management, and admin dashboard",
      type: "web_application"
    },
    {
      name: "Customer Support API",
      description: "Develop a RESTful API for customer support system with ticket management, user authentication, real-time notifications, and analytics dashboard",
      type: "backend_service"
    },
    {
      name: "Data Analytics Platform",
      description: "Build a data analytics platform with data ingestion, processing pipelines, visualization dashboard, and reporting capabilities",
      type: "data_project"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI-Powered Project Scheduling
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of project management with intelligent task breakdown, 
            automatic dependency detection, and smart resource allocation.
          </p>
        </div>

        {/* Demo Section */}
        {!showDemo ? (
          <div className="space-y-8">
            {/* Features Overview */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">✨ AI Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🧠</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Smart Task Decomposition</h3>
                  <p className="text-gray-600 text-sm">AI analyzes your project description and automatically breaks it down into optimal tasks with dependencies.</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">⏱️</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Predictive Time Estimation</h3>
                  <p className="text-gray-600 text-sm">Machine learning models provide accurate time estimates based on historical project data.</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">⚠️</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Risk Assessment</h3>
                  <p className="text-gray-600 text-sm">AI identifies potential risks and suggests mitigation strategies for each task.</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Resource Optimization</h3>
                  <p className="text-gray-600 text-sm">Smart resource allocation matches skills to tasks and prevents team overload.</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Critical Path Analysis</h3>
                  <p className="text-gray-600 text-sm">Automatically identifies critical path and dependencies between tasks.</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">💡</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Intelligent Insights</h3>
                  <p className="text-gray-600 text-sm">Get actionable recommendations and warnings based on project analysis.</p>
                </div>
              </div>
            </div>

            {/* Sample Projects */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 Try Sample Projects</h2>
              <p className="text-gray-600 mb-6">
                Click on any sample project below to see how AI breaks down complex projects into manageable tasks.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sampleProjects.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => {
                         setShowDemo(true);
                         // In a real app, we'd pass the project data to the AI component
                       }}>
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <h3 className="font-semibold text-gray-800">{project.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {project.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                        Analyze with AI →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Project */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">✨ Create Your Own Project</h2>
              <p className="text-gray-600 mb-6">
                Describe your own project and let AI create an intelligent task breakdown for you.
              </p>
              <button
                onClick={() => setShowDemo(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg"
              >
                🧠 Start AI Analysis
              </button>
            </div>

            {/* Results Preview */}
            {generatedTasks.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Generated Tasks</h2>
                <p className="text-gray-600 mb-6">
                  AI has generated {generatedTasks.length} tasks for your project:
                </p>
                <div className="space-y-4">
                  {generatedTasks.map((task, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{task.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.complexity === 'high' ? 'text-red-600 bg-red-100' :
                            task.complexity === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                            'text-green-600 bg-green-100'
                          }`}>
                            {task.complexity}
                          </span>
                          <span className="text-sm text-gray-600">{task.estimatedDays} days</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{task.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Category: {task.category}</span>
                        <span>Risk: {task.riskLevel}%</span>
                        <span>Skills: {task.skills.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* AI Task Breakdown Component */
          <div className="bg-white rounded-lg shadow-lg">
            <AITaskBreakdown
              onTasksGenerated={handleTasksGenerated}
              projectId="demo"
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>🤖 Powered by AI • Built with ❤️ for smarter project management</p>
        </div>
      </div>
    </div>
  );
};
