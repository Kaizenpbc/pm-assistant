import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, Users, MapPin, Building, Wrench, Shield, GraduationCap, Heart, Zap } from 'lucide-react';
import ProjectPlanningTemplates from './ProjectPlanningTemplates';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: any) => void;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateProject 
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    category: '',
    budget: '',
    startDate: '',
    endDate: '',
    location: '',
    projectManager: 'admin'
  });

  const categories = [
    { id: 'construction', name: 'Construction', icon: Building, color: 'blue' },
    { id: 'road-building', name: 'Road Building', icon: MapPin, color: 'orange' },
    { id: 'agriculture', name: 'Agriculture', icon: Wrench, color: 'green' },
    { id: 'infrastructure', name: 'Infrastructure', icon: Building, color: 'indigo' },
    { id: 'environmental', name: 'Environmental', icon: Shield, color: 'emerald' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: 'purple' },
    { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'red' },
    { id: 'technology', name: 'Technology', icon: Zap, color: 'yellow' }
  ];

  const handleTemplateSelect = (templateData: any) => {
    // templateData contains the template plus selectedPhases and selectedDocuments
    const template = templateData;
    setSelectedTemplate(template);
    
    // Auto-fill project data based on template
    setProjectData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      category: template.category.toLowerCase(),
      budget: '500000' // Default budget
    }));
    
    setShowTemplates(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject = {
      ...projectData,
      template: selectedTemplate,
      status: 'planning',
      priority: 'medium',
      budget_allocated: parseFloat(projectData.budget),
      budget_spent: 0,
      currency: 'USD',
      progress: 0
    };
    
    onCreateProject(newProject);
    onClose();
    
    // Reset form
    setProjectData({
      name: '',
      description: '',
      category: '',
      budget: '',
      startDate: '',
      endDate: '',
      location: '',
      projectManager: 'admin'
    });
    setSelectedTemplate(null);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Building;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'blue';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🏗️ Create New Project</h2>
            <p className="text-gray-600 mt-1">Start a new project using our Guyana-style templates</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Debug info */}
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800 text-sm">
              🔍 <strong>Debug:</strong> showTemplates = {showTemplates.toString()}
            </p>
          </div>
          
          {showTemplates ? (
            <div>
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  🚀 <strong>Debug:</strong> Templates should be showing now! 
                  {projectData.category && ` Category: ${projectData.category}`}
                </p>
                <p className="text-yellow-800 text-sm mt-2">
                  📊 <strong>State:</strong> showTemplates = {showTemplates.toString()}
                </p>
              </div>
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-green-800 text-sm">
                  ✅ <strong>Component:</strong> About to render ProjectPlanningTemplates
                </p>
              </div>
              <ProjectPlanningTemplates
                projectCategory={projectData.category || 'infrastructure'}
                onTemplateSelect={handleTemplateSelect}
                onClose={() => setShowTemplates(false)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Project Template</h3>
                {selectedTemplate ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{selectedTemplate.name}</p>
                        <p className="text-sm text-blue-700">{selectedTemplate.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Change Template
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-900">No template selected</p>
                      <p className="text-sm text-blue-700">Choose from our Guyana-style project templates</p>
                    </div>
                    <button
                      onClick={() => {
                        console.log('🚀 Choosing template, category:', projectData.category);
                        console.log('🚀 Before setShowTemplates, showTemplates =', showTemplates);
                        setShowTemplates(true);
                        console.log('🚀 After setShowTemplates(true)');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Choose Template
                    </button>
                  </div>
                )}
              </div>

              {/* Project Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectData.name}
                      onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project name"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Category
                    </label>
                    <select
                      value={projectData.category}
                      onChange={(e) => setProjectData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category (optional)</option>
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        );
                      })}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Category helps determine available project templates
                    </p>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={projectData.budget}
                        onChange={(e) => setProjectData(prev => ({ ...prev, budget: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter budget amount"
                        required
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={projectData.location}
                        onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Georgetown, Berbice, Essequibo"
                        required
                      />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={projectData.startDate}
                        onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={projectData.endDate}
                        onChange={(e) => setProjectData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description *
                  </label>
                  <textarea
                    value={projectData.description}
                    onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the project objectives, scope, and key deliverables..."
                    required
                  />
                </div>

                {/* Template Summary */}
                {selectedTemplate && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Template Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">{selectedTemplate.estimatedDuration}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phases:</span>
                        <p className="font-medium">{selectedTemplate.phases.length}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Documents:</span>
                        <p className="font-medium">{selectedTemplate.documents.length}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget Range:</span>
                        <p className="font-medium">{selectedTemplate.budgetRange}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedTemplate}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationModal;
