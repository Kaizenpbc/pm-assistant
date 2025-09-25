import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EnhancedLoadingSpinner } from '../../../components/EnhancedLoadingSpinner';

describe('EnhancedLoadingSpinner', () => {
  it('renders with default props', () => {
    render(<EnhancedLoadingSpinner />);
    
    // Check for spinner element
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('renders with custom message', () => {
    const message = 'Loading your projects...';
    render(<EnhancedLoadingSpinner message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders minimal variant correctly', () => {
    render(<EnhancedLoadingSpinner variant="minimal" />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders default variant correctly', () => {
    render(<EnhancedLoadingSpinner variant="default" />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('renders detailed variant correctly', () => {
    render(<EnhancedLoadingSpinner variant="detailed" />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders large size correctly', () => {
    render(<EnhancedLoadingSpinner size="large" />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('shows progress bar when showProgress is true', () => {
    render(<EnhancedLoadingSpinner showProgress={true} progress={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('does not show progress bar when showProgress is false', () => {
    render(<EnhancedLoadingSpinner showProgress={false} />);
    
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-spinner-class';
    render(<EnhancedLoadingSpinner className={customClass} />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveClass(customClass);
  });

  it('has proper accessibility attributes', () => {
    render(<EnhancedLoadingSpinner message="Loading data..." />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('displays progress percentage when progress is provided', () => {
    render(<EnhancedLoadingSpinner showProgress={true} progress={75} />);
    
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('handles edge case progress values', () => {
    render(<EnhancedLoadingSpinner showProgress={true} progress={0} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('handles maximum progress value', () => {
    render(<EnhancedLoadingSpinner showProgress={true} progress={100} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
