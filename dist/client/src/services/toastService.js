"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toastService = void 0;
class ToastService {
    toasts = [];
    listeners = [];
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    getToasts() {
        return [...this.toasts];
    }
    addToast(toast) {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast = {
            id,
            duration: 5000,
            persistent: false,
            ...toast
        };
        this.toasts.push(newToast);
        this.notifyListeners();
        return id;
    }
    removeToast(id) {
        this.toasts = this.toasts.filter(toast => toast.id !== id);
        this.notifyListeners();
    }
    clearAll() {
        this.toasts = [];
        this.notifyListeners();
    }
    success(title, message, options) {
        return this.addToast({
            type: 'success',
            title,
            message,
            ...options
        });
    }
    error(title, message, options) {
        return this.addToast({
            type: 'error',
            title,
            message,
            duration: 8000,
            ...options
        });
    }
    warning(title, message, options) {
        return this.addToast({
            type: 'warning',
            title,
            message,
            duration: 6000,
            ...options
        });
    }
    info(title, message, options) {
        return this.addToast({
            type: 'info',
            title,
            message,
            ...options
        });
    }
    pwaRegistrationSuccess() {
        return this.success('PM Assistant Ready', 'App is now available offline with enhanced features.', { duration: 4000 });
    }
    pwaRegistrationError() {
        return this.error('Offline Features Unavailable', 'Unable to enable offline capabilities. Some features may be limited. Please check your internet connection and try refreshing the page.', { persistent: true });
    }
    pwaUnsupportedBrowser() {
        return this.warning('Browser Compatibility Notice', 'Your browser does not support offline features. Please consider updating to a modern browser for the best experience.', { duration: 8000 });
    }
    pwaUpdateAvailable() {
        return this.info('App Update Available', 'A new version of PM Assistant is available. Click to update.', { persistent: true });
    }
    offlineMode() {
        return this.warning('You are offline', 'Some features may be limited while offline.', { duration: 3000 });
    }
    onlineMode() {
        return this.success('Back online', 'All features are now available.', { duration: 2000 });
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.toasts));
    }
}
exports.toastService = new ToastService();
//# sourceMappingURL=toastService.js.map