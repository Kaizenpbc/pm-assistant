import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  FlaskConical,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Shield,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useUIStore } from '../stores/uiStore';

export function ScenarioModelingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setAIPanelContext } = useUIStore();

  const [scenario, setScenario] = useState('');
  const [budgetChangePct, setBudgetChangePct] = useState(0);
  const [workerChange, setWorkerChange] = useState(0);
  const [daysExtension, setDaysExtension] = useState(0);

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => apiService.getProject(id!),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (projectData?.data) {
      setAIPanelContext({
        type: 'project',
        projectId: id,
        projectName: projectData.data.name,
      });
    }
  }, [projectData, id, setAIPanelContext]);

  const scenarioMutation = useMutation({
    mutationFn: () =>
      apiService.modelScenario({
        projectId: id!,
        scenario,
        parameters: {
          budgetChangePct: budgetChangePct || undefined,
          workerChange: workerChange || undefined,
          daysExtension: daysExtension || undefined,
        },
      }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) return;
    scenarioMutation.mutate();
  };

  if (isLoading) return <LoadingSpinner />;

  const project = projectData?.data;
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-gray-500">Project not found</p>
      </div>
    );
  }

  const result = scenarioMutation.data?.data;
  const aiPowered = scenarioMutation.data?.aiPowered;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/project/${id}`)}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </button>
        <div className="flex items-center gap-3">
          <FlaskConical className="h-5 w-5 text-ai-primary" />
          <h1 className="text-xl font-bold text-gray-900">What-If Scenario Modeling</h1>
          {aiPowered && (
            <span className="rounded-full bg-ai-primary/10 px-2 py-0.5 text-[10px] font-medium text-ai-primary">
              AI-Powered
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Model changes for <span className="font-medium">{project.name}</span> and see cascading impacts.
        </p>
      </div>

      {/* Scenario Input */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scenario Description</label>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder='e.g., "What if the budget is cut by 20%?" or "What if we add 3 more workers?"'
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ai-primary focus:outline-none focus:ring-1 focus:ring-ai-primary"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SliderInput
            label="Budget Change"
            value={budgetChangePct}
            onChange={setBudgetChangePct}
            min={-50}
            max={50}
            step={5}
            unit="%"
          />
          <SliderInput
            label="Worker Change"
            value={workerChange}
            onChange={setWorkerChange}
            min={-10}
            max={10}
            step={1}
            unit=" workers"
          />
          <SliderInput
            label="Days Extension"
            value={daysExtension}
            onChange={setDaysExtension}
            min={-60}
            max={90}
            step={7}
            unit=" days"
          />
        </div>

        <button
          type="submit"
          disabled={!scenario.trim() || scenarioMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-ai-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ai-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scenarioMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {scenarioMutation.isPending ? 'Modeling...' : 'Run Scenario'}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Impact Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ImpactCard
              label="Schedule Impact"
              icon={TrendingUp}
              original={`${result.scheduleImpact.originalDays}d`}
              projected={`${result.scheduleImpact.projectedDays}d`}
              changePct={result.scheduleImpact.changePct}
            />
            <ImpactCard
              label="Budget Impact"
              icon={DollarSign}
              original={`$${(result.budgetImpact.originalBudget / 1000).toFixed(0)}K`}
              projected={`$${(result.budgetImpact.projectedBudget / 1000).toFixed(0)}K`}
              changePct={result.budgetImpact.changePct}
            />
            <ImpactCard
              label="Resources"
              icon={Users}
              original={`${result.resourceImpact.currentWorkers}`}
              projected={`${result.resourceImpact.projectedWorkers}`}
              changePct={
                result.resourceImpact.currentWorkers > 0
                  ? ((result.resourceImpact.projectedWorkers - result.resourceImpact.currentWorkers) / result.resourceImpact.currentWorkers) * 100
                  : 0
              }
            />
            <ImpactCard
              label="Risk Score"
              icon={Shield}
              original={`${result.riskImpact.currentRiskScore}`}
              projected={`${result.riskImpact.projectedRiskScore}`}
              changePct={
                result.riskImpact.currentRiskScore > 0
                  ? ((result.riskImpact.projectedRiskScore - result.riskImpact.currentRiskScore) / result.riskImpact.currentRiskScore) * 100
                  : 0
              }
            />
          </div>

          {/* Explanations */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Impact Analysis</h3>
            <ExplanationRow label="Schedule" text={result.scheduleImpact.explanation} />
            <ExplanationRow label="Budget" text={result.budgetImpact.explanation} />
            <ExplanationRow label="Resources" text={result.resourceImpact.explanation} />
            <ExplanationRow label="Risk" text={result.riskImpact.explanation} />
          </div>

          {/* New Risks */}
          {result.riskImpact.newRisks?.length > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-900">New Risks</h3>
              </div>
              <ul className="space-y-1">
                {result.riskImpact.newRisks.map((risk: string, i: number) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-orange-500 mt-0.5">-</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Affected Tasks */}
          {result.affectedTasks?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Affected Tasks</h3>
              <div className="space-y-1.5">
                {result.affectedTasks.map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">{t.taskName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{t.impact}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        t.severity === 'high' ? 'bg-red-100 text-red-700' :
                        t.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {t.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="rounded-xl border border-ai-border bg-ai-surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-ai-primary" />
                <h3 className="text-sm font-semibold text-gray-900">Recommendations</h3>
                <span className="text-[10px] text-gray-400">Confidence: {((result.confidence || 0) * 100).toFixed(0)}%</span>
              </div>
              <ul className="space-y-1">
                {result.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-ai-primary mt-0.5">-</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step, unit }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}: <span className={`font-bold ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </label>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-ai-primary"
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function ImpactCard({ label, icon: Icon, original, projected, changePct }: {
  label: string;
  icon: React.ElementType;
  original: string;
  projected: string;
  changePct: number;
}) {
  const isPositive = changePct > 0;
  const isNeutral = changePct === 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-gray-400 line-through">{original}</span>
        <span className="text-lg font-bold text-gray-900">{projected}</span>
      </div>
      {!isNeutral && (
        <span className={`text-xs font-medium ${
          // For risk and budget, increase is bad. For schedule, increase is bad too.
          isPositive ? 'text-red-600' : 'text-green-600'
        }`}>
          {isPositive ? '+' : ''}{changePct.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

function ExplanationRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
      <span className="text-[10px] font-medium text-gray-500 uppercase">{label}</span>
      <p className="text-xs text-gray-700 mt-0.5">{text}</p>
    </div>
  );
}
