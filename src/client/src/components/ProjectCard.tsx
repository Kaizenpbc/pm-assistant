import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div
      className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="card-header">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
          >
            {project.status.replace('_', ' ')}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}
          >
            {project.priority}
          </span>
        </div>

        {project.budgetAllocated && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Budget</span>
              <span>
                ${project.budgetSpent.toLocaleString()} / ${project.budgetAllocated.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((project.budgetSpent / project.budgetAllocated) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Created {new Date(project.createdAt).toLocaleDateString()}
          </span>
          <span className="text-blue-600 hover:text-blue-800">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};
