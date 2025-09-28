// PWA Service for handling installation, updates, and offline capabilities

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  newVersion?: string;
  currentVersion?: string;
}

class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;
  private updateAvailable = false;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Request notification permissions early for better user experience
    await this.requestNotificationPermission();
    
    // Check if app is already installed
    this.isInstalled = this.checkIfInstalled();
    
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', this.handleInstallPrompt.bind(this));
    
    // Listen for app installed
    window.addEventListener('appinstalled', this.handleAppInstalled.bind(this));
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Check for updates
    await this.checkForUpdates();
  }

  private checkIfInstalled(): boolean {
    // Check if running in standalone mode (installed PWA)
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  private handleInstallPrompt(event: Event): void {
    console.log('📱 PWA install prompt triggered');
    
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    
    // Stash the event so it can be triggered later
    this.deferredPrompt = event as any;
    
    // Show install button or notification
    this.showInstallPrompt();
  }

  private handleAppInstalled(): void {
    console.log('✅ PWA installed successfully');
    this.isInstalled = true;
    this.deferredPrompt = null;
    
    // Track installation
    this.trackEvent('pwa_installed');
    
    // Show success message
    this.showToastNotification('App installed successfully!', 'success');
  }

  private handleOnline(): void {
    console.log('🌐 App is back online');
    this.isOnline = true;
    
    // Sync any pending data
    this.syncPendingData();
    
    // Show online notification
    this.showToastNotification('You are back online', 'info');
  }

  private handleOffline(): void {
    console.log('🔌 App is offline');
    this.isOnline = false;
    
    // Show offline notification
    this.showToastNotification('You are offline. Some features may be limited.', 'warning');
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const { pathService } = await import('./pathService');
        const swPath = pathService.getServiceWorkerPath();
        this.registration = await navigator.serviceWorker.register(swPath);
        console.log('✅ Service Worker registered successfully');
        
        // Show success notification to user
        await this.showNotification('PM Assistant Ready', {
          body: 'App is now available offline with enhanced features.',
          tag: 'pwa-registration-success'
        });
        
        // Also show toast notification
        const { toastService } = await import('./toastService');
        toastService.pwaRegistrationSuccess();
        
        // Listen for updates
        this.registration.addEventListener('updatefound', this.handleServiceWorkerUpdate.bind(this));
        
        // Check for updates every 30 minutes
        setInterval(() => this.checkForUpdates(), 30 * 60 * 1000);
        
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        
        // Show error notification to user with actionable information
        await this.showNotification('Offline Features Unavailable', {
          body: 'Unable to enable offline capabilities. Some features may be limited. Please check your internet connection and try refreshing the page.',
          tag: 'pwa-registration-error',
          requireInteraction: true
        });
        
        // Also show toast notification
        const { toastService } = await import('./toastService');
        toastService.pwaRegistrationError();
        
        // Also show a console warning for developers
        console.warn('⚠️ PWA offline capabilities disabled. This may affect app performance and user experience.');
      }
    } else {
      // Browser doesn't support service workers
      console.warn('⚠️ Service Workers not supported in this browser');
      await this.showNotification('Browser Compatibility Notice', {
        body: 'Your browser does not support offline features. Please consider updating to a modern browser for the best experience.',
        tag: 'pwa-unsupported-browser'
      });
      
      // Also show toast notification
      const { toastService } = await import('./toastService');
      toastService.pwaUnsupportedBrowser();
    }
  }

  private handleServiceWorkerUpdate(): void {
    if (this.registration?.waiting) {
      console.log('🔄 New service worker available');
      this.updateAvailable = true;
      this.showUpdatePrompt();
    }
  }

  private async checkForUpdates(): Promise<void> {
    // Skip PWA updates in development
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    if (this.registration) {
      try {
        await this.registration.update();
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }

  // Public methods
  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        this.trackEvent('pwa_install_accepted');
        return true;
      } else {
        console.log('❌ User dismissed the install prompt');
        this.trackEvent('pwa_install_dismissed');
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  public async updateApp(): Promise<void> {
    if (this.registration?.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to use the new service worker
      window.location.reload();
    }
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public isAppOnline(): boolean {
    return this.isOnline;
  }

  public hasUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  public async getAppInfo(): Promise<{
    isInstalled: boolean;
    isOnline: boolean;
    hasUpdate: boolean;
    version: string;
    platform: string;
  }> {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      hasUpdate: this.updateAvailable,
      version: '2.0.0',
      platform: this.getPlatform()
    };
  }

  // Offline capabilities
  public async cacheData(key: string, data: any): Promise<void> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('pm-data-cache');
        await cache.put(key, new Response(JSON.stringify(data)));
        console.log('📦 Data cached:', key);
      }
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  public async getCachedData(key: string): Promise<any> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('pm-data-cache');
        const response = await cache.match(key);
        
        if (response) {
          const data = await response.json();
          console.log('📦 Data retrieved from cache:', key);
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
    }
    return null;
  }

  public async clearCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Cache cleared');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Background sync
  public async queueBackgroundSync(tag: string, data: any): Promise<void> {
    try {
      if ('serviceWorker' in navigator && this.registration) {
        // Note: Background sync API is not widely supported yet
        // For now, we'll just store the data for later sync
        await this.cacheData(`sync-${tag}`, data);
        
        console.log('🔄 Background sync queued:', tag);
      }
    } catch (error) {
      console.error('Failed to queue background sync:', error);
    }
  }

  // Push notifications
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission === 'granted') {
      const { pathService } = await import('./pathService');
      const notification = new Notification(title, {
        icon: pathService.getIconPath('192x192'),
        badge: pathService.resolve('/badge-72x72.png'),
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  // Helper methods
  private showInstallPrompt(): void {
    // This would typically show a custom install button or banner
    console.log('📱 Show install prompt UI');
  }

  private showUpdatePrompt(): void {
    // This would typically show an update notification
    console.log('🔄 Show update prompt UI');
  }

  private showToastNotification(message: string, type: 'success' | 'info' | 'warning' | 'error'): void {
    // This would typically show a toast notification
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
  }

  private trackEvent(eventName: string, properties?: Record<string, any>): void {
    // This would typically send analytics events
    console.log('📊 Event tracked:', eventName, properties);
  }

  private async syncPendingData(): Promise<void> {
    // This would sync any pending offline data
    console.log('🔄 Syncing pending data...');
  }

  private getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('windows')) return 'windows';
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('linux')) return 'linux';
    
    return 'unknown';
  }
}

// Create singleton instance
export const pwaService = new PWAService();

export default pwaService;
