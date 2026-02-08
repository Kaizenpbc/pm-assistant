import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  TrendingUp,
  DollarSign,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { AISummaryBanner } from '../components/dashboard/AISummaryBanner';
import { PredictionCards } from '../components/dashboard/PredictionCards';
import { AlertBanner } from '../components/notifications/AlertBanner';
import { useUIStore } from '../stores/uiStore';
import { apiService } from '../services/api';

const REGIONS = [
  { id: 'region-1', name: 'Region 1', code: 'barima-waini' },
  { id: 'region-2', name: 'Region 2', code: 'pomeroon-supenaam' },
  { id: 'region-3', name: 'Region 3', code: 'essequibo-islands-west-demerara' },
  { id: 'region-4', name: 'Region 4', code: 'demerara-mahaica' },
  { id: 'region-5', name: 'Region 5', code: 'mahaica-berbice' },
  { id: 'region-6', name: 'Region 6', code: 'east-berbice-corentyne' },
  { id: 'region-7', name: 'Region 7', code: 'cuyuni-mazaruni' },
  { id: 'region-8', name: 'Region 8', code: 'potaro-siparuni' },
  { id: 'region-9', name: 'Region 9', code: 'upper-takutu-upper-essequibo' },
  { id: 'region-10', name: 'Region 10', code: 'upper-demerara-berbice' },
];

export function MinisterDashboard() {
  const navigate = useNavigate();
  const { setAIPanelContext } = useUIStore();

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
  });

  React.useEffect(() => {
    setAIPanelContext({ type: 'dashboard' });
  }, [setAIPanelContext]);

  const projects = projectsData?.data || [];
  const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget_allocated || 0), 0);
  const totalSpent = projects.reduce((sum: number, p: any) => sum + (p.budget_spent || 0), 0);
  const activeProjects = projects.filter((p: any) => p.status === 'active').length;

  return (
    <div className="space-y-6">
      <AlertBanner />

      <AISummaryBanner
        isLoading={isLoading}
        summary={`National overview: ${projects.length} projects across 10 regions. ${activeProjects} active. Total budget: $${(totalBudget / 1000000).toFixed(1)}M.`}
        highlights={[
          { text: 'National Portfolio View', type: 'info' as const },
        ]}
      />

      <PredictionCards
        risks={{ critical: 0, high: 0, medium: 0 }}
        budget={{
          overBudget: 0,
          onTrack: projects.length,
        }}
      />

      {/* National Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Projects" value={projects.length.toString()} icon={BarChart3} color="bg-blue-50 text-blue-700" />
        <StatCard label="Active" value={activeProjects.toString()} icon={TrendingUp} color="bg-green-50 text-green-700" />
        <StatCard label="Total Budget" value={`$${(totalBudget / 1000000).toFixed(1)}M`} icon={DollarSign} color="bg-indigo-50 text-indigo-700" />
        <StatCard label="Budget Used" value={totalBudget > 0 ? `${Math.round(totalSpent / totalBudget * 100)}%` : '0%'} icon={DollarSign} color="bg-orange-50 text-orange-700" />
      </div>

      {/* Region Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Regions Overview</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {REGIONS.map((region) => {
            const regionProjects = projects.filter((p: any) => p.region_id === region.id);
            const regionActive = regionProjects.filter((p: any) => p.status === 'active').length;
            const regionBudget = regionProjects.reduce((sum: number, p: any) => sum + (p.budget_allocated || 0), 0);

            return (
              <button
                key={region.id}
                onClick={() => navigate(`/region/${region.id}/info`)}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{region.name}</h3>
                  <p className="text-xs text-gray-500">
                    {regionProjects.length} project{regionProjects.length !== 1 ? 's' : ''} &middot; {regionActive} active
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    ${(regionBudget / 1000000).toFixed(1)}M
                  </p>
                  <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4`}>
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
