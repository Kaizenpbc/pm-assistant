import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileBarChart,
  Sparkles,
  ChevronRight,
  FileText,
  Shield,
  DollarSign,
  Users,
  X,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { apiService } from '../services/api';

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
  reportType: string;
  content: string;
  generatedAt: string;
  status: 'generating' | 'ready' | 'error';
  aiPowered: boolean;
  errorMessage?: string;
}

export function ReportsPage() {
  const { setAIPanelContext } = useUIStore();
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<GeneratedReport | null>(null);

  const { data: historyData } = useQuery({
    queryKey: ['report-history'],
    queryFn: () => apiService.getReportHistory(),
    staleTime: 30_000,
  });

  React.useEffect(() => {
    setAIPanelContext({ type: 'reports' });
  }, [setAIPanelContext]);

  async function handleGenerate(template: ReportTemplate) {
    if (generating) return;

    setGenerating(template.id);
    const tempId = `temp-${Date.now()}`;

    const newReport: GeneratedReport = {
      id: tempId,
      title: template.title,
      reportType: template.id,
      content: '',
      generatedAt: new Date().toISOString(),
      status: 'generating',
      aiPowered: true,
    };

    setGeneratedReports(prev => [newReport, ...prev]);

    try {
      const result = await apiService.generateReport(template.id);

      setGeneratedReports(prev =>
        prev.map(r =>
          r.id === tempId
            ? {
                ...r,
                id: result.id,
                content: result.content,
                generatedAt: result.generatedAt,
                status: 'ready' as const,
                aiPowered: result.aiPowered,
              }
            : r,
        ),
      );
    } catch (error) {
      setGeneratedReports(prev =>
        prev.map(r =>
          r.id === tempId
            ? {
                ...r,
                status: 'error' as const,
                errorMessage: error instanceof Error ? error.message : 'Generation failed',
              }
            : r,
        ),
      );
    } finally {
      setGenerating(null);
    }
  }

  const historyReports = historyData?.reports || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-generated reports and analytics for your project portfolio.
        </p>
      </div>

      {/* Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{viewingReport.title}</h2>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(viewingReport.generatedAt).toLocaleString()}
                  {viewingReport.aiPowered && (
                    <span className="flex items-center gap-1 rounded-full bg-ai-surface px-2 py-0.5 text-ai-primary">
                      <Sparkles className="h-3 w-3" />
                      AI-powered
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">
                {viewingReport.content}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Generated Reports (current session) */}
      {generatedReports.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">This Session</h2>
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
                  <button
                    onClick={() => setViewingReport(report)}
                    className="flex items-center gap-1 text-xs font-medium text-ai-primary hover:text-ai-primary-hover"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Error
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report History (from DB) */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Report History</h2>
        {historyReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <FileBarChart className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">No reports generated yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Select a template above to generate your first AI report
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {historyReports.map((report: any) => (
              <div
                key={report.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <FileBarChart className="h-5 w-5 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(report.generatedAt).toLocaleString()}
                    {report.aiPowered && (
                      <span className="ml-2 text-ai-primary">AI</span>
                    )}
                  </p>
                </div>
                {report.content && (
                  <button
                    onClick={() =>
                      setViewingReport({
                        id: report.id,
                        title: report.title,
                        reportType: report.reportType,
                        content: report.content,
                        generatedAt: report.generatedAt,
                        status: 'ready',
                        aiPowered: report.aiPowered,
                      })
                    }
                    className="flex items-center gap-1 text-xs font-medium text-ai-primary hover:text-ai-primary-hover"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
