import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AISummaryBanner } from '../components/dashboard/AISummaryBanner';
import { PredictionCards } from '../components/dashboard/PredictionCards';
import { ProjectCardGrid, type ProjectCardData } from '../components/dashboard/ProjectCardGrid';
import { AnomalyAlertCard } from '../components/dashboard/AnomalyAlertCard';
import { AccuracyMetrics } from '../components/dashboard/AccuracyMetrics';
import { AlertBanner } from '../components/notifications/AlertBanner';
import ProjectCreationModal from '../components/ProjectCreationModal';
import { useUIStore } from '../stores/uiStore';
import { apiService } from '../services/api';

export function PMDashboard() {
  const navigate = useNavigate();
  const { setAIPanelContext } = useUIStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiService.getProjects(),
  });

  const { data: predictionsData, isLoading: isPredictionsLoading } = useQuery({
    queryKey: ['dashboard-predictions'],
    queryFn: () => apiService.getDashboardPredictions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: anomalyData, isLoading: isAnomalyLoading } = useQuery({
    queryKey: ['dashboard-anomalies'],
    queryFn: () => apiService.getAnomalies(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: accuracyData, isLoading: isAccuracyLoading } = useQuery({
    queryKey: ['dashboard-accuracy'],
    queryFn: () => apiService.getAccuracyReport(),
    staleTime: 10 * 60 * 1000,
  });

  // Set AI panel context to dashboard
  React.useEffect(() => {
    setAIPanelContext({ type: 'dashboard' });
  }, [setAIPanelContext]);

  const predictions = predictionsData?.data;
  const anomalyReport = anomalyData?.data;
  const accuracyReport = accuracyData?.data;
  const anomalies = anomalyReport?.anomalies || [];
  const criticalAnomalies = anomalies.filter((a: any) => a.severity === 'critical').length;
  const highAnomalies = anomalies.filter((a: any) => a.severity === 'high').length;
  const topAnomaly = anomalies[0]; // Already sorted by severity from backend
  const healthMap = new Map<string, { healthScore: number; riskLevel: string }>();
  if (predictions?.projectHealthScores) {
    for (const ph of predictions.projectHealthScores) {
      healthMap.set(ph.projectId, { healthScore: ph.healthScore, riskLevel: ph.riskLevel });
    }
  }

  const projects: ProjectCardData[] = (projectsData?.data || []).map((p: any) => {
    const health = healthMap.get(p.id);
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      status: p.status,
      priority: p.priority,
      budgetAllocated: p.budgetAllocated,
      budgetSpent: p.budgetSpent,
      progress: p.progressPercentage || p.progress || 0,
      startDate: p.startDate,
      endDate: p.endDate,
      region: p.regionName,
      riskLevel: health?.riskLevel as ProjectCardData['riskLevel'],
      aiHealthScore: health?.healthScore,
    };
  });

  function handleProjectClick(projectId: string) {
    navigate(`/project/${projectId}`);
  }

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      <AlertBanner />

      {/* AI Summary */}
      <AISummaryBanner
        isLoading={isLoading || isPredictionsLoading}
        summary={predictions?.summary}
        highlights={predictions?.highlights}
      />

      {/* Prediction Cards */}
      <PredictionCards
        risks={predictions?.risks ?? { critical: 0, high: 0, medium: 0 }}
        weather={predictions?.weather}
        budget={predictions?.budget ?? {
          overBudget: projects.filter(p => p.budgetAllocated && p.budgetSpent && p.budgetSpent > p.budgetAllocated * 0.9).length,
          onTrack: projects.length - projects.filter(p => p.budgetAllocated && p.budgetSpent && p.budgetSpent > p.budgetAllocated * 0.9).length,
        }}
      />

      {/* Anomaly & Accuracy Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AnomalyAlertCard
          anomalyCount={anomalies.length}
          criticalCount={criticalAnomalies}
          highCount={highAnomalies}
          topAnomaly={topAnomaly ? { title: topAnomaly.title, projectName: topAnomaly.projectName, severity: topAnomaly.severity } : undefined}
          isLoading={isAnomalyLoading}
        />
        <AccuracyMetrics
          accuracy={accuracyReport?.overall?.accuracy ?? 0}
          acceptanceRate={accuracyReport?.feedbackSummary?.acceptanceRate ?? 0}
          totalRecords={accuracyReport?.overall?.totalRecords ?? 0}
          isLoading={isAccuracyLoading}
        />
      </div>

      {/* Project Grid */}
      <ProjectCardGrid
        projects={projects}
        onProjectClick={handleProjectClick}
        onCreateProject={() => setShowCreateModal(true)}
        isLoading={isLoading}
      />

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={() => setShowCreateModal(false)}
      />
    </div>
  );
}
