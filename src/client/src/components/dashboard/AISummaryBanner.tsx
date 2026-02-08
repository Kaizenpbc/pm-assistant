import { Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';

interface AISummaryBannerProps {
  summary?: string;
  highlights?: Array<{ text: string; type: 'risk' | 'success' | 'info' }>;
  isLoading?: boolean;
}

const defaultHighlights = [
  { text: 'AI insights will appear here once the backend is connected', type: 'info' as const },
];

export function AISummaryBanner({ summary, highlights = defaultHighlights, isLoading }: AISummaryBannerProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-ai-border bg-ai-surface p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 animate-ai-pulse items-center justify-center rounded-lg bg-ai-primary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-ai-border" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-ai-border" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ai-border bg-gradient-to-r from-ai-surface to-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-ai-primary">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">AI Daily Briefing</h3>
            <span className="rounded-full bg-ai-primary/10 px-2 py-0.5 text-[10px] font-medium text-ai-primary">
              Auto-generated
            </span>
          </div>
          {summary ? (
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{summary}</p>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Good morning. Here's your project portfolio summary for today.
            </p>
          )}
          {highlights.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {highlights.map((highlight, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    highlight.type === 'risk'
                      ? 'bg-red-50 text-red-700'
                      : highlight.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {highlight.type === 'risk' && <AlertTriangle className="h-3 w-3" />}
                  {highlight.type === 'success' && <TrendingUp className="h-3 w-3" />}
                  {highlight.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
