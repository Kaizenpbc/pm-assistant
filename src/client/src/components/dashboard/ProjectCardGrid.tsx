import { useState } from 'react';
import { Grid3X3, List, Plus, Search } from 'lucide-react';
import { ProjectCard } from './ProjectCard';

export interface ProjectCardData {
  id: string;
  code?: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budgetAllocated?: number;
  budgetSpent?: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
  region?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  aiHealthScore?: number;
}

interface ProjectCardGridProps {
  projects: ProjectCardData[];
  onProjectClick: (projectId: string) => void;
  onCreateProject?: () => void;
  isLoading?: boolean;
}

export function ProjectCardGrid({ projects, onProjectClick, onCreateProject, isLoading }: ProjectCardGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = !searchQuery ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Active Projects
          <span className="ml-2 text-sm font-normal text-gray-500">({filteredProjects.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 rounded-lg border border-gray-300 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-ai-primary focus:outline-none focus:ring-1 focus:ring-ai-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-gray-300 px-2 text-sm text-gray-700 focus:border-ai-primary focus:outline-none focus:ring-1 focus:ring-ai-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          {/* View Toggle */}
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-l-lg p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-r-lg p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {onCreateProject && (
            <button
              onClick={onCreateProject}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-ai-primary px-3 text-sm font-medium text-white transition-colors hover:bg-ai-primary-hover"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Grid/List */}
      {isLoading ? (
        <div className={`mt-4 ${viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all' ? 'No projects match your filters' : 'No projects yet'}
          </p>
          {onCreateProject && !searchQuery && statusFilter === 'all' && (
            <button
              onClick={onCreateProject}
              className="mt-3 text-sm font-medium text-ai-primary hover:text-ai-primary-hover"
            >
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className={`mt-4 ${viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}`}>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onClick={() => onProjectClick(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
