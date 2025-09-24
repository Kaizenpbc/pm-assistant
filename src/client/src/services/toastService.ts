import { ToastNotificationProps } from '../components/ToastNotification';

class ToastService {
  private toasts: ToastNotificationProps[] = [];
  private listeners: Array<(toasts: ToastNotificationProps[]) => void> = [];

  // Subscribe to toast changes
  subscribe(listener: (toasts: ToastNotificationProps[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Get current toasts
  getToasts(): ToastNotificationProps[] {
    return [...this.toasts];
  }

  // Add a toast
  addToast(toast: Omit<ToastNotificationProps, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastNotificationProps = {
      id,
      duration: 5000,
      persistent: false,
      ...toast
    };

    this.toasts.push(newToast);
    this.notifyListeners();
    return id;
  }

  // Remove a toast
  removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  // Clear all toasts
  clearAll(): void {
    this.toasts = [];
    this.notifyListeners();
  }

  // Helper methods for different toast types
  success(title: string, message: string, options?: Partial<ToastNotificationProps>): string {
    return this.addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<ToastNotificationProps>): string {
    return this.addToast({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer duration for errors
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<ToastNotificationProps>): string {
    return this.addToast({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    });
  }

  info(title: string, message: string, options?: Partial<ToastNotificationProps>): string {
    return this.addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  // PWA-specific notifications
  pwaRegistrationSuccess(): string {
    return this.success(
      'PM Assistant Ready',
      'App is now available offline with enhanced features.',
      { duration: 4000 }
    );
  }

  pwaRegistrationError(): string {
    return this.error(
      'Offline Features Unavailable',
      'Unable to enable offline capabilities. Some features may be limited. Please check your internet connection and try refreshing the page.',
      { persistent: true }
    );
  }

  pwaUnsupportedBrowser(): string {
    return this.warning(
      'Browser Compatibility Notice',
      'Your browser does not support offline features. Please consider updating to a modern browser for the best experience.',
      { duration: 8000 }
    );
  }

  pwaUpdateAvailable(): string {
    return this.info(
      'App Update Available',
      'A new version of PM Assistant is available. Click to update.',
      { persistent: true }
    );
  }

  offlineMode(): string {
    return this.warning(
      'You are offline',
      'Some features may be limited while offline.',
      { duration: 3000 }
    );
  }

  onlineMode(): string {
    return this.success(
      'Back online',
      'All features are now available.',
      { duration: 2000 }
    );
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}

export const toastService = new ToastService();
