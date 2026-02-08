import { AlertTriangle } from 'lucide-react';

interface AnomalyAlertCardProps {
  anomalyCount: number;
  criticalCount: number;
  highCount: number;
  topAnomaly?: {
    title: string;
    projectName: string;
    severity: string;
  };
  isLoading?: boolean;
}

const severityBadge: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

export function AnomalyAlertCard({
  anomalyCount,
  criticalCount,
  highCount,
  topAnomaly,
  isLoading,
}: AnomalyAlertCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
        <div className="h-8 w-12 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  const hasIssues = criticalCount > 0 || highCount > 0;
  const borderColor = hasIssues ? 'border-orange-200' : 'border-gray-200';

  return (
    <div className={`rounded-xl border ${borderColor} bg-white p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className={`h-4 w-4 ${hasIssues ? 'text-orange-500' : 'text-gray-400'}`} />
        <span className="text-xs font-medium text-gray-500">Anomalies</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{anomalyCount}</span>
        {anomalyCount > 0 && (
          <div className="flex gap-1">
            {criticalCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${severityBadge.critical}`}>
                {criticalCount} critical
              </span>
            )}
            {highCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${severityBadge.high}`}>
                {highCount} high
              </span>
            )}
          </div>
        )}
      </div>

      {topAnomaly ? (
        <p className="mt-1.5 text-xs text-gray-500 truncate">
          <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium mr-1 ${severityBadge[topAnomaly.severity] || severityBadge.low}`}>
            {topAnomaly.severity}
          </span>
          {topAnomaly.title} — {topAnomaly.projectName}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-gray-400">No anomalies detected</p>
      )}
    </div>
  );
}
