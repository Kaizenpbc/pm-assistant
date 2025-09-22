import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: projectData, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiService.getProject(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Project not found
          </h2>
          <p className="text-gray-600 mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                ← Back to Dashboard
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <p className="text-gray-600">
                  {project.description || 'Project Management'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">
                  Project Information
                </h2>
              </div>
              <div className="card-content">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {project.status.replace('_', ' ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Priority</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">
                      {project.priority}
                    </dd>
                  </div>
                  {project.startDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(project.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {project.endDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">End Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(project.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Budget Information */}
            {project.budgetAllocated && (
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Budget Information
                  </h2>
                </div>
                <div className="card-content">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Budget Progress</span>
                      <span>
                        ${project.budgetSpent.toLocaleString()} / ${project.budgetAllocated.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{
                          width: `${Math.min((project.budgetSpent / project.budgetAllocated) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {((project.budgetSpent / project.budgetAllocated) * 100).toFixed(1)}% of budget used
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="card-content space-y-3">
                <button className="w-full btn btn-primary">
                  Edit Project
                </button>
                <button className="w-full btn btn-secondary">
                  Add Task
                </button>
                <button className="w-full btn btn-secondary">
                  View Schedule
                </button>
              </div>
            </div>

            {/* Project Stats */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Project Statistics
                </h3>
              </div>
              <div className="card-content">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {project.budgetAllocated && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining Budget</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(project.budgetAllocated - project.budgetSpent).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
