import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
  AlertTriangle,
  Cloud,
  Sparkles,
  ExternalLink,
  CheckCircle,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  FlaskConical,
} from 'lucide-react';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useUIStore } from '../stores/uiStore';

type Tab = 'overview' | 'schedule' | 'risks' | 'activity';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'risks', label: 'Risks & Predictions' },
  { id: 'activity', label: 'Activity' },
];

const statusStyles: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  planning: { label: 'Planning', color: 'bg-purple-100 text-purple-700' },
  on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
};

const severityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { setAIPanelContext } = useUIStore();

  const { data: projectData, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiService.getProject(id!),
    enabled: !!id,
  });

  const { data: healthData } = useQuery({
    queryKey: ['project-health', id],
    queryFn: () => apiService.getProjectHealth(id!),
    enabled: !!id,
  });

  const { data: riskData } = useQuery({
    queryKey: ['project-risks', id],
    queryFn: () => apiService.getProjectRisks(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: weatherData } = useQuery({
    queryKey: ['project-weather', id],
    queryFn: () => apiService.getProjectWeatherImpact(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: budgetData } = useQuery({
    queryKey: ['project-budget', id],
    queryFn: () => apiService.getProjectBudgetForecast(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: anomalyData } = useQuery({
    queryKey: ['project-anomalies', id],
    queryFn: () => apiService.getProjectAnomalies(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const project = projectData?.data;
  const projectAnomalies = anomalyData?.data?.anomalies || [];
  const health = healthData?.data;
  const riskAssessment = riskData?.data;
  const weatherImpact = weatherData?.data;
  const budgetForecast = budgetData?.data;

  React.useEffect(() => {
    if (project) {
      setAIPanelContext({
        type: 'project',
        projectId: id,
        projectName: project.name,
      });
    }
  }, [project, id, setAIPanelContext]);

  if (isLoading) return <LoadingSpinner />;
  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-gray-500">Project not found</p>
        <button onClick={() => navigate('/dashboard')} className="mt-2 text-sm text-ai-primary hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const status = statusStyles[project.status] || statusStyles.planning;
  const progress = project.progress_percentage || 0;
  const budgetAllocated = project.budget_allocated || 0;
  const budgetSpent = project.budget_spent || 0;
  const budgetPct = budgetAllocated > 0 ? Math.round(budgetSpent / budgetAllocated * 100) : 0;
  const healthScore = health?.overallScore ?? health?.overall_score ?? null;

  const daysRemaining = project.end_date
    ? Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Risk level from AI assessment
  const riskSeverity = riskAssessment?.overallSeverity;
  const riskLabel = riskSeverity
    ? riskSeverity.charAt(0).toUpperCase() + riskSeverity.slice(1)
    : 'Analyzing...';
  const riskColor = riskSeverity
    ? severityColors[riskSeverity]
    : 'bg-gray-50 text-gray-600';

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
              {healthScore !== null && (
                <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  healthScore >= 75 ? 'bg-green-50 text-green-700' :
                  healthScore >= 50 ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  <TrendingUp className="h-3 w-3" />
                  Health: {healthScore}
                </span>
              )}
              {projectAnomalies.length > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                  <AlertTriangle className="h-3 w-3" />
                  {projectAnomalies.length} anomal{projectAnomalies.length !== 1 ? 'ies' : 'y'}
                </span>
              )}
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/project/${id}/scenarios`)}
              className="flex items-center gap-1.5 rounded-lg border border-ai-primary px-3 py-2 text-sm font-medium text-ai-primary transition-colors hover:bg-ai-primary/5"
            >
              <FlaskConical className="h-4 w-4" />
              What If
            </button>
            <button
              onClick={() => navigate(`/project/${id}/schedule`)}
              className="flex items-center gap-1.5 rounded-lg bg-ai-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-ai-primary-hover"
            >
              <Calendar className="h-4 w-4" />
              Open Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Context Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ContextCard
          label="Progress"
          value={`${progress}%`}
          icon={TrendingUp}
          color="bg-blue-50 text-blue-600"
          detail={
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          }
        />
        <ContextCard
          label="Budget"
          value={`$${(budgetSpent / 1000).toFixed(0)}K / $${(budgetAllocated / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color={budgetPct > 90 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
          detail={
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div className={`h-full rounded-full transition-all ${budgetPct > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
            </div>
          }
        />
        <ContextCard
          label="Timeline"
          value={daysRemaining !== null ? `${daysRemaining}d remaining` : 'No end date'}
          icon={Clock}
          color={daysRemaining !== null && daysRemaining < 14 ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}
        />
        <ContextCard
          label="Risk Level"
          value={riskLabel}
          icon={Shield}
          color={riskColor}
          detail={
            riskAssessment
              ? <p className="mt-1 text-[10px] text-gray-400">Score: {riskAssessment.overallScore}/100 — {riskAssessment.trend}</p>
              : <p className="mt-1 text-[10px] text-gray-400">AI risk assessment loading...</p>
          }
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-ai-primary text-ai-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          project={project}
          healthScore={healthScore}
          riskAssessment={riskAssessment}
          weatherImpact={weatherImpact}
        />
      )}
      {activeTab === 'schedule' && <ScheduleTab projectId={id!} navigate={navigate} />}
      {activeTab === 'risks' && (
        <RisksTab
          project={project}
          projectId={id!}
          riskAssessment={riskAssessment}
          budgetForecast={budgetForecast}
          anomalies={projectAnomalies}
          aiPowered={riskData?.aiPowered}
        />
      )}
      {activeTab === 'activity' && <ActivityTab project={project} />}
    </div>
  );
}

function ContextCard({ label, value, icon: Icon, color, detail }: {
  label: string; value: string; icon: React.ElementType; color: string; detail?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
      {detail}
    </div>
  );
}

function OverviewTab({ project, healthScore, riskAssessment, weatherImpact }: {
  project: any;
  healthScore: number | null;
  riskAssessment?: any;
  weatherImpact?: any;
}) {
  const topRisks = riskAssessment?.risks?.slice(0, 3) || [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* AI Insights */}
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-xl border border-ai-border bg-ai-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-ai-primary" />
            <h3 className="text-sm font-semibold text-gray-900">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {riskAssessment?.summary ? (
              <InsightItem text={riskAssessment.summary} type="info" />
            ) : (
              <InsightItem text="Loading AI analysis..." type="info" />
            )}
            {topRisks.map((risk: any, i: number) => (
              <InsightItem
                key={i}
                text={`${risk.title}: ${risk.description}`}
                type={risk.severity === 'critical' || risk.severity === 'high' ? 'risk' : 'info'}
              />
            ))}
            {topRisks.length === 0 && riskAssessment && (
              <InsightItem text="No significant risks identified." type="success" />
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Project Details</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {project.code && <DetailRow label="Code" value={project.code} />}
            {project.category && <DetailRow label="Category" value={project.category} />}
            {project.priority && <DetailRow label="Priority" value={project.priority} />}
            {project.start_date && <DetailRow label="Start Date" value={new Date(project.start_date).toLocaleDateString()} />}
            {project.end_date && <DetailRow label="End Date" value={new Date(project.end_date).toLocaleDateString()} />}
            {project.created_at && <DetailRow label="Created" value={new Date(project.created_at).toLocaleDateString()} />}
          </dl>
        </div>
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-4">
        {healthScore !== null && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Health Score</h3>
            <div className="flex items-center justify-center">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${
                healthScore >= 75 ? 'border-green-400' : healthScore >= 50 ? 'border-yellow-400' : 'border-red-400'
              }`}>
                <span className="text-2xl font-bold text-gray-900">{healthScore}</span>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Weather Impact</h3>
          {weatherImpact ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-gray-900">{weatherImpact.currentCondition}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Impact Level</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${
                    weatherImpact.impactLevel === 'none' || weatherImpact.impactLevel === 'low' ? 'bg-green-100 text-green-700' :
                    weatherImpact.impactLevel === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {weatherImpact.impactLevel}
                  </span>
                </div>
                {weatherImpact.estimatedDelayDays > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Est. Delay</span>
                    <span className="font-medium text-orange-600">{weatherImpact.estimatedDelayDays} day{weatherImpact.estimatedDelayDays !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              {weatherImpact.recommendations?.length > 0 && (
                <p className="mt-2 text-xs text-gray-400">{weatherImpact.recommendations[0]}</p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Cloud className="h-4 w-4" />
                <span>Loading weather analysis...</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ projectId, navigate }: { projectId: string; navigate: (path: string) => void }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
      <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
      <h3 className="text-sm font-semibold text-gray-900">Project Schedule</h3>
      <p className="mt-1 text-sm text-gray-500">
        View and manage tasks, dependencies, and Gantt chart.
      </p>
      <button
        onClick={() => navigate(`/project/${projectId}/schedule`)}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-ai-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ai-primary-hover"
      >
        Open Full Schedule
        <ExternalLink className="h-4 w-4" />
      </button>
    </div>
  );
}

function RisksTab({ project: _project, projectId, riskAssessment, budgetForecast, anomalies, aiPowered }: {
  project: any;
  projectId: string;
  riskAssessment?: any;
  budgetForecast?: any;
  anomalies?: any[];
  aiPowered?: boolean;
}) {
  const handleFeedback = (riskType: string, action: 'accepted' | 'rejected') => {
    apiService.submitAIFeedback({
      feature: 'risk_assessment',
      projectId,
      userAction: action,
      suggestionData: { riskType },
    }).catch(() => {}); // fire-and-forget
  };

  const risksByType = (type: string) =>
    riskAssessment?.risks?.filter((r: any) => r.type === type) || [];

  const categories = [
    { key: 'schedule', label: 'Schedule Risk', icon: Clock },
    { key: 'budget', label: 'Budget Risk', icon: DollarSign },
    { key: 'resource', label: 'Resource Risk', icon: TrendingUp },
    { key: 'weather', label: 'Weather Risk', icon: Cloud },
  ];

  return (
    <div className="space-y-4">
      {/* AI Risk Assessment Header */}
      <div className="rounded-xl border border-ai-border bg-ai-surface p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-ai-primary" />
          <h3 className="text-sm font-semibold text-gray-900">AI Risk Assessment</h3>
          {aiPowered && (
            <span className="rounded-full bg-ai-primary/10 px-2 py-0.5 text-[10px] font-medium text-ai-primary">
              AI-Powered
            </span>
          )}
        </div>
        {riskAssessment ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{riskAssessment.summary}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500">Overall Risk Score:</span>
              <span className={`rounded-full px-2 py-0.5 font-medium ${severityColors[riskAssessment.overallSeverity] || 'bg-gray-100 text-gray-600'}`}>
                {riskAssessment.overallScore}/100 — {riskAssessment.overallSeverity}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Trend: {riskAssessment.trend}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Loading risk analysis...</p>
        )}
      </div>

      {/* Risk Category Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {categories.map(({ key, label, icon: Icon }) => {
          const risks = risksByType(key);
          const topRisk = risks[0];
          return (
            <div key={key} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                </div>
                {topRisk ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[topRisk.severity]}`}>
                    {topRisk.severity}
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-600">
                    Low
                  </span>
                )}
              </div>
              {topRisk ? (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs text-gray-600">{topRisk.description}</p>
                  {topRisk.mitigations?.length > 0 && (
                    <div className="mt-1.5">
                      <p className="text-[10px] font-medium text-gray-500 mb-1">Mitigations:</p>
                      <ul className="space-y-0.5">
                        {topRisk.mitigations.slice(0, 2).map((m: string, i: number) => (
                          <li key={i} className="flex items-start gap-1 text-[10px] text-gray-400">
                            <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-400" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {risks.length > 1 && (
                    <p className="text-[10px] text-gray-400 mt-1">+{risks.length - 1} more risk{risks.length - 1 !== 1 ? 's' : ''}</p>
                  )}
                  {aiPowered && (
                    <div className="mt-2 flex gap-1">
                      <button
                        onClick={() => handleFeedback(key, 'accepted')}
                        className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                        title="This risk assessment is helpful"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(key, 'rejected')}
                        className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="This risk assessment is not accurate"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-400">No {label.toLowerCase()} identified</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Budget Forecast Panel */}
      {budgetForecast && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-900">Budget Forecast (EVM)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricBox label="CPI" value={budgetForecast.cpi?.toFixed(2)} good={budgetForecast.cpi >= 1} />
            <MetricBox label="SPI" value={budgetForecast.spi?.toFixed(2)} good={budgetForecast.spi >= 1} />
            <MetricBox label="Overrun Risk" value={`${budgetForecast.overrunProbability}%`} good={budgetForecast.overrunProbability < 30} />
            <MetricBox label="Est. at Completion" value={`$${(budgetForecast.eac / 1000).toFixed(0)}K`} />
          </div>
          <p className="mt-3 text-xs text-gray-500">{budgetForecast.summary}</p>
          {budgetForecast.recommendations?.length > 0 && (
            <div className="mt-2 space-y-1">
              {budgetForecast.recommendations.slice(0, 2).map((r: string, i: number) => (
                <p key={i} className="text-[10px] text-gray-400 flex items-start gap-1">
                  <span className="text-ai-primary">•</span> {r}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Anomalies Panel */}
      {anomalies && anomalies.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900">Detected Anomalies</h3>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">
              {anomalies.length}
            </span>
          </div>
          <div className="space-y-2">
            {anomalies.map((anomaly: any, i: number) => (
              <div key={i} className="rounded-lg bg-white p-3 border border-orange-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-900">{anomaly.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    anomaly.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    anomaly.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">{anomaly.description}</p>
                <p className="mt-1 text-[10px] text-ai-primary">{anomaly.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBox({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2.5 text-center">
      <p className="text-[10px] font-medium text-gray-500">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${
        good === undefined ? 'text-gray-900' : good ? 'text-green-600' : 'text-orange-600'
      }`}>
        {value}
      </p>
    </div>
  );
}

function ActivityTab({ project: _project }: { project: any }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
      <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
      <h3 className="text-sm font-semibold text-gray-900">Activity Log</h3>
      <p className="mt-1 text-sm text-gray-500">
        Project activity timeline will be populated from audit logs.
      </p>
    </div>
  );
}

function InsightItem({ text, type }: { text: string; type: 'risk' | 'success' | 'info' }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg p-2 text-sm ${
      type === 'risk' ? 'bg-red-50 text-red-700' :
      type === 'success' ? 'bg-green-50 text-green-700' :
      'bg-white text-gray-600'
    }`}>
      {type === 'risk' && <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
      {type === 'success' && <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0" />}
      {type === 'info' && <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-ai-primary" />}
      <span>{text}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900 capitalize">{value}</dd>
    </div>
  );
}
