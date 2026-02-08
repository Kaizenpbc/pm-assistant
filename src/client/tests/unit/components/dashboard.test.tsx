import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AISummaryBanner } from '../../../src/components/dashboard/AISummaryBanner';
import { PredictionCards } from '../../../src/components/dashboard/PredictionCards';

// =============================================================================
// AISummaryBanner
// =============================================================================

describe('AISummaryBanner', () => {
  describe('loading state', () => {
    it('renders a loading skeleton when isLoading is true', () => {
      const { container } = render(<AISummaryBanner isLoading={true} />);

      // The loading state renders animated pulse divs instead of text content
      const pulsingElements = container.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThanOrEqual(1);
    });

    it('does not render "AI Daily Briefing" heading when loading', () => {
      render(<AISummaryBanner isLoading={true} />);
      expect(screen.queryByText('AI Daily Briefing')).not.toBeInTheDocument();
    });
  });

  describe('with summary text', () => {
    it('renders the provided summary text', () => {
      render(
        <AISummaryBanner summary="3 projects are on track. 1 project needs attention due to budget overrun." />
      );

      expect(
        screen.getByText('3 projects are on track. 1 project needs attention due to budget overrun.')
      ).toBeInTheDocument();
    });

    it('renders the "AI Daily Briefing" heading', () => {
      render(<AISummaryBanner summary="All good." />);
      expect(screen.getByText('AI Daily Briefing')).toBeInTheDocument();
    });

    it('renders the "Auto-generated" badge', () => {
      render(<AISummaryBanner summary="Summary text." />);
      expect(screen.getByText('Auto-generated')).toBeInTheDocument();
    });
  });

  describe('without summary', () => {
    it('renders default fallback text when no summary is provided', () => {
      render(<AISummaryBanner highlights={[]} />);
      expect(
        screen.getByText("Good morning. Here's your project portfolio summary for today.")
      ).toBeInTheDocument();
    });
  });

  describe('highlights', () => {
    it('renders highlight chips with correct text', () => {
      const highlights = [
        { text: '2 critical risks detected', type: 'risk' as const },
        { text: 'Budget on track', type: 'success' as const },
        { text: 'Weather advisory', type: 'info' as const },
      ];

      render(<AISummaryBanner highlights={highlights} />);

      expect(screen.getByText('2 critical risks detected')).toBeInTheDocument();
      expect(screen.getByText('Budget on track')).toBeInTheDocument();
      expect(screen.getByText('Weather advisory')).toBeInTheDocument();
    });

    it('renders risk highlights with red styling', () => {
      const highlights = [{ text: 'Flood risk', type: 'risk' as const }];
      const { container } = render(<AISummaryBanner highlights={highlights} />);

      const riskChip = screen.getByText('Flood risk').closest('span');
      expect(riskChip).toHaveClass('bg-red-50');
      expect(riskChip).toHaveClass('text-red-700');
    });

    it('renders success highlights with green styling', () => {
      const highlights = [{ text: 'On schedule', type: 'success' as const }];
      render(<AISummaryBanner highlights={highlights} />);

      const successChip = screen.getByText('On schedule').closest('span');
      expect(successChip).toHaveClass('bg-green-50');
      expect(successChip).toHaveClass('text-green-700');
    });

    it('renders info highlights with gray styling', () => {
      const highlights = [{ text: 'New update available', type: 'info' as const }];
      render(<AISummaryBanner highlights={highlights} />);

      const infoChip = screen.getByText('New update available').closest('span');
      expect(infoChip).toHaveClass('bg-gray-100');
      expect(infoChip).toHaveClass('text-gray-600');
    });
  });
});

// =============================================================================
// PredictionCards
// =============================================================================

describe('PredictionCards', () => {
  describe('default rendering (no props)', () => {
    it('renders 3 cards', () => {
      render(<PredictionCards />);

      expect(screen.getByText('Risk Alerts')).toBeInTheDocument();
      expect(screen.getByText('Weather Forecast')).toBeInTheDocument();
      expect(screen.getByText('Budget Health')).toBeInTheDocument();
    });

    it('shows default values when no data is provided', () => {
      render(<PredictionCards />);

      // Risk default: "0"
      expect(screen.getByText('0')).toBeInTheDocument();
      // Weather default: "Clear"
      expect(screen.getByText('Clear')).toBeInTheDocument();
      // Budget default: "N/A"
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('shows default subtitles when no data is provided', () => {
      render(<PredictionCards />);

      expect(screen.getByText('No active risks detected')).toBeInTheDocument();
      expect(screen.getByText('No weather impacts expected')).toBeInTheDocument();
      expect(screen.getByText('Budget data loading...')).toBeInTheDocument();
    });
  });

  describe('with risk data', () => {
    it('shows the sum of critical and high risks as the value', () => {
      render(
        <PredictionCards risks={{ critical: 2, high: 3, medium: 5 }} />
      );

      // 2 critical + 3 high = "5"
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows risk breakdown in the subtitle', () => {
      render(
        <PredictionCards risks={{ critical: 1, high: 4, medium: 2 }} />
      );

      expect(screen.getByText('1 critical, 4 high')).toBeInTheDocument();
    });

    it('shows "Needs attention" when there are critical risks', () => {
      render(
        <PredictionCards risks={{ critical: 1, high: 0, medium: 0 }} />
      );

      expect(screen.getByText('Needs attention')).toBeInTheDocument();
    });

    it('shows "All clear" when there are no critical risks', () => {
      render(
        <PredictionCards risks={{ critical: 0, high: 0, medium: 3 }} />
      );

      expect(screen.getByText('All clear')).toBeInTheDocument();
    });
  });

  describe('with weather data', () => {
    it('shows the weather condition as the card value', () => {
      render(
        <PredictionCards weather={{ condition: 'Heavy Rain', impact: 'Possible delays on outdoor tasks' }} />
      );

      expect(screen.getByText('Heavy Rain')).toBeInTheDocument();
    });

    it('shows the weather impact in the subtitle', () => {
      render(
        <PredictionCards weather={{ condition: 'Clear', impact: 'No weather impacts expected' }} />
      );

      expect(screen.getByText('No weather impacts expected')).toBeInTheDocument();
    });
  });

  describe('with budget data', () => {
    it('shows on-track count as the value', () => {
      render(
        <PredictionCards budget={{ overBudget: 2, onTrack: 8 }} />
      );

      expect(screen.getByText('8 on track')).toBeInTheDocument();
    });

    it('shows over-budget count in the subtitle (plural)', () => {
      render(
        <PredictionCards budget={{ overBudget: 3, onTrack: 7 }} />
      );

      expect(screen.getByText('3 projects over budget')).toBeInTheDocument();
    });

    it('shows over-budget count in the subtitle (singular)', () => {
      render(
        <PredictionCards budget={{ overBudget: 1, onTrack: 9 }} />
      );

      expect(screen.getByText('1 project over budget')).toBeInTheDocument();
    });

    it('shows "Review needed" when there are over-budget projects', () => {
      render(
        <PredictionCards budget={{ overBudget: 2, onTrack: 5 }} />
      );

      expect(screen.getByText('Review needed')).toBeInTheDocument();
    });

    it('shows "Healthy" when no projects are over budget', () => {
      render(
        <PredictionCards budget={{ overBudget: 0, onTrack: 10 }} />
      );

      expect(screen.getByText('Healthy')).toBeInTheDocument();
    });
  });

  describe('with all props', () => {
    it('renders correct values for all 3 cards simultaneously', () => {
      render(
        <PredictionCards
          risks={{ critical: 1, high: 2, medium: 4 }}
          weather={{ condition: 'Thunderstorm', impact: 'Outdoor work suspended' }}
          budget={{ overBudget: 1, onTrack: 5 }}
        />
      );

      // Risk card: 1+2 = 3
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('1 critical, 2 high')).toBeInTheDocument();

      // Weather card
      expect(screen.getByText('Thunderstorm')).toBeInTheDocument();
      expect(screen.getByText('Outdoor work suspended')).toBeInTheDocument();

      // Budget card
      expect(screen.getByText('5 on track')).toBeInTheDocument();
      expect(screen.getByText('1 project over budget')).toBeInTheDocument();
    });
  });
});
