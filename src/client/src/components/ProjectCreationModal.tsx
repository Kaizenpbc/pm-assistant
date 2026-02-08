import React, { useState } from 'react';
import { X, Calendar, DollarSign, MapPin, Building, Wrench, Shield, GraduationCap, Heart, Zap } from 'lucide-react';

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
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    category: '',
    budget: '',
    startDate: '',
    endDate: '',
    location: '',
    projectManager: '',
    assignedPM: '', // NEW: PM assignment field
    priority: 'medium',
    status: 'planning'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject = {
      ...projectData,
      budget: parseFloat(projectData.budget) || 0
    };
    
    onCreateProject(newProject);
    
    // Reset form
    setProjectData({
      name: '',
      description: '',
      category: '',
      budget: '',
      startDate: '',
      endDate: '',
      location: '',
      projectManager: '',
      assignedPM: '',
      priority: 'medium',
      status: 'planning'
    });
    
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setProjectData({
      name: '',
      description: '',
      category: '',
      budget: '',
      startDate: '',
      endDate: '',
      location: '',
      projectManager: '',
      assignedPM: '',
      priority: 'medium',
      status: 'planning'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                  Category *
                </label>
                <select
                  value={projectData.category}
                  onChange={(e) => setProjectData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={projectData.budget}
                    onChange={(e) => setProjectData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={projectData.priority}
                  onChange={(e) => setProjectData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={projectData.startDate}
                    onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={projectData.endDate}
                    onChange={(e) => setProjectData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={projectData.location}
                    onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              {/* Project Manager Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Manager (Optional)
                </label>
                <select
                  value={projectData.assignedPM}
                  onChange={(e) => setProjectData({...projectData, assignedPM: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select PM (Optional)</option>
                  <option value="pm-001">PM01 - Project Manager 01</option>
                  <option value="pm-002">PM02 - Project Manager 02</option>
                  {/* Add more PMs as needed */}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project description"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Building className="h-4 w-4" />
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationModal;