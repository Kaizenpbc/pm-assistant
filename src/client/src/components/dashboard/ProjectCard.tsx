import {
  Calendar,
  DollarSign,
  Shield,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import type { ProjectCardData } from './ProjectCardGrid';

interface ProjectCardProps {
  project: ProjectCardData;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

const statusStyles: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  planning: { label: 'Planning', color: 'bg-purple-100 text-purple-700' },
  on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700' },
};

const priorityStyles: Record<string, string> = {
  urgent: 'border-l-risk-critical',
  high: 'border-l-risk-high',
  medium: 'border-l-risk-medium',
  low: 'border-l-risk-low',
};

const riskBadgeStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

export function ProjectCard({ project, viewMode, onClick }: ProjectCardProps) {
  const status = statusStyles[project.status] || statusStyles.planning;
  const priorityBorder = priorityStyles[project.priority] || '';
  const progress = project.progress ?? 0;
  const budgetPct = project.budgetAllocated && project.budgetAllocated > 0
    ? Math.round((project.budgetSpent ?? 0) / project.budgetAllocated * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-4 rounded-xl border border-gray-200 border-l-4 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-md ${priorityBorder}`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900">{project.name}</h3>
            <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500">{project.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="w-24">
            <div className="flex justify-between">
              <span>Progress</span>
              <span className="font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-ai-primary transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          {project.riskLevel && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${riskBadgeStyles[project.riskLevel] || ''}`}>
              {project.riskLevel} risk
            </span>
          )}
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col rounded-xl border border-gray-200 border-l-4 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-md ${priorityBorder}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">{project.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
            {project.description || 'No description'}
          </p>
        </div>
        <span className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Progress</span>
          <span className="font-semibold text-gray-700">{progress}%</span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${
              progress >= 80 ? 'bg-green-500' : progress >= 40 ? 'bg-ai-primary' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Meta Row */}
      <div className="mt-3 flex items-center gap-3 text-[11px] text-gray-500">
        {project.budgetAllocated && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {budgetPct}% spent
          </span>
        )}
        {project.endDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        {project.region && (
          <span className="truncate">{project.region}</span>
        )}
      </div>

      {/* AI Badges */}
      <div className="mt-3 flex items-center gap-2">
        {project.aiHealthScore !== undefined && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            project.aiHealthScore >= 75 ? 'bg-green-50 text-green-700' :
            project.aiHealthScore >= 50 ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'
          }`}>
            <TrendingUp className="h-3 w-3" />
            Health: {project.aiHealthScore}
          </span>
        )}
        {project.riskLevel && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${riskBadgeStyles[project.riskLevel] || ''}`}>
            <Shield className="h-3 w-3" />
            {project.riskLevel}
          </span>
        )}
      </div>
    </button>
  );
}
