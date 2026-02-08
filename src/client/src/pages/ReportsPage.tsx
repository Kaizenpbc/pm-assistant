import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Sparkles,
  ChevronRight,
  FileText,
  Shield,
  DollarSign,
  Users,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'status' | 'risk' | 'budget' | 'resource';
  frequency: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'weekly-status',
    title: 'Weekly Status Report',
    description: 'AI-generated summary of all project progress, blockers, and upcoming milestones.',
    icon: FileText,
    category: 'status',
    frequency: 'Weekly',
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment Report',
    description: 'Comprehensive risk analysis across all active projects with mitigation recommendations.',
    icon: Shield,
    category: 'risk',
    frequency: 'On demand',
  },
  {
    id: 'budget-forecast',
    title: 'Budget Forecast Report',
    description: 'Budget utilization analysis with projected final costs and variance tracking.',
    icon: DollarSign,
    category: 'budget',
    frequency: 'Monthly',
  },
  {
    id: 'resource-utilization',
    title: 'Resource Utilization Report',
    description: 'Team allocation analysis, overload detection, and capacity planning insights.',
    icon: Users,
    category: 'resource',
    frequency: 'Bi-weekly',
  },
];

interface GeneratedReport {
  id: string;
  title: string;
  templateId: string;
  generatedAt: string;
  status: 'generating' | 'ready' | 'error';
}

export function ReportsPage() {
  const { setAIPanelContext } = useUIStore();
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);

  React.useEffect(() => {
    setAIPanelContext({ type: 'reports' });
  }, [setAIPanelContext]);

  function handleGenerate(template: ReportTemplate) {
    if (generating) return;

    setGenerating(template.id);
    const reportId = `report-${Date.now()}`;

    const newReport: GeneratedReport = {
      id: reportId,
      title: template.title,
      templateId: template.id,
      generatedAt: new Date().toISOString(),
      status: 'generating',
    };

    setGeneratedReports(prev => [newReport, ...prev]);

    // Simulate generation — will be replaced with real AI in Phase 4
    setTimeout(() => {
      setGeneratedReports(prev =>
        prev.map(r => r.id === reportId ? { ...r, status: 'ready' as const } : r)
      );
      setGenerating(null);
    }, 3000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-generated reports and analytics for your project portfolio.
        </p>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Generate Report</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {reportTemplates.map((template) => {
            const Icon = template.icon;
            const isGenerating = generating === template.id;

            return (
              <button
                key={template.id}
                onClick={() => handleGenerate(template)}
                disabled={!!generating}
                className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-ai-border hover:shadow-md disabled:opacity-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-ai-surface">
                  <Icon className="h-5 w-5 text-ai-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{template.title}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      {template.frequency}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{template.description}</p>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  {isGenerating ? (
                    <div className="flex items-center gap-1.5 text-xs text-ai-primary">
                      <Sparkles className="h-4 w-4 animate-ai-pulse" />
                      Generating...
                    </div>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generated Reports */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Recent Reports</h2>
        {generatedReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <FileBarChart className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">No reports generated yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Select a template above to generate your first AI report
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {generatedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <FileBarChart className="h-5 w-5 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.generatedAt).toLocaleString()}
                  </p>
                </div>
                {report.status === 'generating' ? (
                  <span className="flex items-center gap-1.5 text-xs text-ai-primary">
                    <Sparkles className="h-3.5 w-3.5 animate-ai-pulse" />
                    Generating
                  </span>
                ) : report.status === 'ready' ? (
                  <button className="flex items-center gap-1 text-xs font-medium text-ai-primary hover:text-ai-primary-hover">
                    <Download className="h-3.5 w-3.5" />
                    View
                  </button>
                ) : (
                  <span className="text-xs text-red-500">Error</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
