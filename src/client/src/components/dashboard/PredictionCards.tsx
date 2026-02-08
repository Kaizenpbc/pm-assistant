import React from 'react';
import { Shield, Cloud, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PredictionCard {
  title: string;
  icon: React.ElementType;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  confidence?: number;
  color: string;
}

interface PredictionCardsProps {
  risks?: { critical: number; high: number; medium: number };
  weather?: { condition: string; impact: string };
  budget?: { overBudget: number; onTrack: number };
}

export function PredictionCards({ risks, weather, budget }: PredictionCardsProps) {
  const cards: PredictionCard[] = [
    {
      title: 'Risk Alerts',
      icon: Shield,
      value: risks ? `${risks.critical + risks.high}` : '0',
      subtitle: risks
        ? `${risks.critical} critical, ${risks.high} high`
        : 'No active risks detected',
      trend: risks && risks.critical > 0 ? 'up' : 'stable',
      trendLabel: risks && risks.critical > 0 ? 'Needs attention' : 'All clear',
      color: risks && risks.critical > 0 ? 'border-risk-critical/30 bg-red-50' : 'border-risk-low/30 bg-green-50',
    },
    {
      title: 'Weather Forecast',
      icon: Cloud,
      value: weather?.condition || 'Clear',
      subtitle: weather?.impact || 'No weather impacts expected',
      trend: 'stable',
      trendLabel: 'Next 7 days',
      color: 'border-blue-200 bg-blue-50',
    },
    {
      title: 'Budget Health',
      icon: DollarSign,
      value: budget ? `${budget.onTrack} on track` : 'N/A',
      subtitle: budget
        ? `${budget.overBudget} project${budget.overBudget !== 1 ? 's' : ''} over budget`
        : 'Budget data loading...',
      trend: budget && budget.overBudget > 0 ? 'down' : 'stable',
      trendLabel: budget && budget.overBudget > 0 ? 'Review needed' : 'Healthy',
      color: budget && budget.overBudget > 0 ? 'border-risk-high/30 bg-orange-50' : 'border-risk-low/30 bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : Minus;

        return (
          <div
            key={card.title}
            className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${card.color}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-500">{card.title}</span>
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-medium ${
                card.trend === 'up' ? 'text-red-600' : card.trend === 'down' ? 'text-orange-600' : 'text-green-600'
              }`}>
                <TrendIcon className="h-3 w-3" />
                {card.trendLabel}
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-gray-900">{card.value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
