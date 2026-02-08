import { BarChart3 } from 'lucide-react';

interface AccuracyMetricsProps {
  accuracy: number;
  acceptanceRate: number;
  totalRecords: number;
  isLoading?: boolean;
}

export function AccuracyMetrics({
  accuracy,
  acceptanceRate,
  totalRecords,
  isLoading,
}: AccuracyMetricsProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
        <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  const accuracyColor = accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-yellow-600' : 'text-red-600';
  const acceptColor = acceptanceRate >= 70 ? 'text-green-600' : acceptanceRate >= 50 ? 'text-yellow-600' : 'text-orange-600';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-4 w-4 text-ai-primary" />
        <span className="text-xs font-medium text-gray-500">AI Accuracy</span>
      </div>

      {totalRecords > 0 ? (
        <>
          <div className="flex items-baseline gap-3">
            <div>
              <span className={`text-2xl font-bold ${accuracyColor}`}>{accuracy.toFixed(0)}%</span>
              <span className="ml-1 text-[10px] text-gray-400">prediction</span>
            </div>
            <div className="border-l border-gray-200 pl-3">
              <span className={`text-lg font-bold ${acceptColor}`}>{acceptanceRate.toFixed(0)}%</span>
              <span className="ml-1 text-[10px] text-gray-400">accepted</span>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Based on {totalRecords} prediction{totalRecords !== 1 ? 's' : ''}
          </p>
        </>
      ) : (
        <>
          <span className="text-lg font-bold text-gray-400">--</span>
          <p className="mt-1 text-xs text-gray-400">No accuracy data yet</p>
        </>
      )}
    </div>
  );
}
