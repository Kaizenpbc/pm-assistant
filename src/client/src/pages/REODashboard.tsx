import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, FileText, Settings } from 'lucide-react';
import { AISummaryBanner } from '../components/dashboard/AISummaryBanner';
import { PredictionCards } from '../components/dashboard/PredictionCards';
import { ProjectCardGrid, type ProjectCardData } from '../components/dashboard/ProjectCardGrid';
import { AlertBanner } from '../components/notifications/AlertBanner';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { apiService } from '../services/api';

export function REODashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setAIPanelContext } = useUIStore();

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
  });

  React.useEffect(() => {
    setAIPanelContext({ type: 'region', regionId: user?.region_id || undefined });
  }, [setAIPanelContext, user?.region_id]);

  const allProjects = projectsData?.data || [];
  const regionProjects = user?.region_id
    ? allProjects.filter((p: any) => p.region_id === user.region_id)
    : allProjects;

  const projects: ProjectCardData[] = regionProjects.map((p: any) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    status: p.status,
    priority: p.priority,
    budgetAllocated: p.budget_allocated || p.budgetAllocated,
    budgetSpent: p.budget_spent || p.budgetSpent,
    progress: p.progress_percentage || p.progress || 0,
    startDate: p.start_date || p.startDate,
    endDate: p.end_date || p.endDate,
  }));

  const activeCount = projects.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6">
      <AlertBanner />

      {/* Region Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Regional Dashboard</h1>
            <p className="text-sm text-gray-500">{user?.region_id || 'All regions'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/region/admin')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            Manage Region
          </button>
          <button
            onClick={() => navigate('/region/notices')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Notices
          </button>
        </div>
      </div>

      <AISummaryBanner
        isLoading={isLoading}
        summary={`Your region has ${projects.length} project${projects.length !== 1 ? 's' : ''}. ${activeCount} currently active.`}
      />

      <PredictionCards
        risks={{ critical: 0, high: 0, medium: 0 }}
        budget={{ overBudget: 0, onTrack: projects.length }}
      />

      <ProjectCardGrid
        projects={projects}
        onProjectClick={(id) => navigate(`/project/${id}`)}
        isLoading={isLoading}
      />
    </div>
  );
}
