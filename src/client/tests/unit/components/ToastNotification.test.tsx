import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastNotification } from '../../../components/ToastNotification';

describe('ToastNotification', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toast notification with message', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success toast with correct styling', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Success message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-green-500');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders error toast with correct styling', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Error message"
        type="error"
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-red-500');
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders warning toast with correct styling', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Warning message"
        type="warning"
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-yellow-500');
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('renders info toast with correct styling', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Info message"
        type="info"
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-blue-500');
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('auto-closes after duration when autoClose is true', async () => {
    vi.useFakeTimers();
    
    render(
      <ToastNotification
        id="test-toast"
        message="Test message"
        type="success"
        onClose={mockOnClose}
        autoClose={true}
        duration={1000}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-toast');
    });

    vi.useRealTimers();
  });

  it('does not auto-close when autoClose is false', async () => {
    vi.useFakeTimers();
    
    render(
      <ToastNotification
        id="test-toast"
        message="Test message"
        type="success"
        onClose={mockOnClose}
        autoClose={false}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Fast-forward time
    vi.advanceTimersByTime(5000);

    expect(mockOnClose).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('renders persistent toast correctly', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Persistent message"
        type="info"
        onClose={mockOnClose}
        persistent={true}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('bg-blue-500');
    
    // Persistent toasts should not have auto-close behavior
    expect(screen.getByText('Persistent message')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    expect(toast).toHaveAttribute('aria-atomic', 'true');
  });

  it('handles long messages correctly', () => {
    const longMessage = 'This is a very long message that should be handled properly by the toast notification component without breaking the layout or causing any issues with the display';
    
    render(
      <ToastNotification
        id="test-toast"
        message={longMessage}
        type="info"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('renders with custom duration', () => {
    render(
      <ToastNotification
        id="test-toast"
        message="Custom duration message"
        type="success"
        onClose={mockOnClose}
        autoClose={true}
        duration={3000}
      />
    );

    expect(screen.getByText('Custom duration message')).toBeInTheDocument();
  });
});
