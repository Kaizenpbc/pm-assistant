"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pwaService = void 0;
class PWAService {
    deferredPrompt = null;
    isInstalled = false;
    isOnline = navigator.onLine;
    updateAvailable = false;
    registration = null;
    constructor() {
        this.initialize();
    }
    async initialize() {
        this.isInstalled = this.checkIfInstalled();
        window.addEventListener('beforeinstallprompt', this.handleInstallPrompt.bind(this));
        window.addEventListener('appinstalled', this.handleAppInstalled.bind(this));
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        await this.registerServiceWorker();
        await this.checkForUpdates();
    }
    checkIfInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');
    }
    handleInstallPrompt(event) {
        console.log('📱 PWA install prompt triggered');
        event.preventDefault();
        this.deferredPrompt = event;
        this.showInstallPrompt();
    }
    handleAppInstalled() {
        console.log('✅ PWA installed successfully');
        this.isInstalled = true;
        this.deferredPrompt = null;
        this.trackEvent('pwa_installed');
        this.showToastNotification('App installed successfully!', 'success');
    }
    handleOnline() {
        console.log('🌐 App is back online');
        this.isOnline = true;
        this.syncPendingData();
        this.showToastNotification('You are back online', 'info');
    }
    handleOffline() {
        console.log('🔌 App is offline');
        this.isOnline = false;
        this.showToastNotification('You are offline. Some features may be limited.', 'warning');
    }
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered successfully');
                this.registration.addEventListener('updatefound', this.handleServiceWorkerUpdate.bind(this));
                setInterval(() => this.checkForUpdates(), 30 * 60 * 1000);
            }
            catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }
    handleServiceWorkerUpdate() {
        if (this.registration?.waiting) {
            console.log('🔄 New service worker available');
            this.updateAvailable = true;
            this.showUpdatePrompt();
        }
    }
    async checkForUpdates() {
        if (this.registration) {
            try {
                await this.registration.update();
            }
            catch (error) {
                console.error('Failed to check for updates:', error);
            }
        }
    }
    async installApp() {
        if (!this.deferredPrompt) {
            console.warn('Install prompt not available');
            return false;
        }
        try {
            await this.deferredPrompt.prompt();
            const choiceResult = await this.deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
                this.trackEvent('pwa_install_accepted');
                return true;
            }
            else {
                console.log('❌ User dismissed the install prompt');
                this.trackEvent('pwa_install_dismissed');
                return false;
            }
        }
        catch (error) {
            console.error('Install prompt failed:', error);
            return false;
        }
        finally {
            this.deferredPrompt = null;
        }
    }
    async updateApp() {
        if (this.registration?.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }
    canInstall() {
        return this.deferredPrompt !== null && !this.isInstalled;
    }
    isAppInstalled() {
        return this.isInstalled;
    }
    isAppOnline() {
        return this.isOnline;
    }
    hasUpdateAvailable() {
        return this.updateAvailable;
    }
    async getAppInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            hasUpdate: this.updateAvailable,
            version: '2.0.0',
            platform: this.getPlatform()
        };
    }
    async cacheData(key, data) {
        try {
            if ('caches' in window) {
                const cache = await caches.open('pm-data-cache');
                await cache.put(key, new Response(JSON.stringify(data)));
                console.log('📦 Data cached:', key);
            }
        }
        catch (error) {
            console.error('Failed to cache data:', error);
        }
    }
    async getCachedData(key) {
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
        }
        catch (error) {
            console.error('Failed to get cached data:', error);
        }
        return null;
    }
    async clearCache() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                console.log('🗑️ Cache cleared');
            }
        }
        catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }
    async queueBackgroundSync(tag, data) {
        try {
            if ('serviceWorker' in navigator && this.registration) {
                await this.cacheData(`sync-${tag}`, data);
                console.log('🔄 Background sync queued:', tag);
            }
        }
        catch (error) {
            console.error('Failed to queue background sync:', error);
        }
    }
    async requestNotificationPermission() {
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
    async showNotification(title, options) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                ...options
            });
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }
    showInstallPrompt() {
        console.log('📱 Show install prompt UI');
    }
    showUpdatePrompt() {
        console.log('🔄 Show update prompt UI');
    }
    showToastNotification(message, type) {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }
    trackEvent(eventName, properties) {
        console.log('📊 Event tracked:', eventName, properties);
    }
    async syncPendingData() {
        console.log('🔄 Syncing pending data...');
    }
    getPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android'))
            return 'android';
        if (userAgent.includes('iphone') || userAgent.includes('ipad'))
            return 'ios';
        if (userAgent.includes('windows'))
            return 'windows';
        if (userAgent.includes('mac'))
            return 'macos';
        if (userAgent.includes('linux'))
            return 'linux';
        return 'unknown';
    }
}
exports.pwaService = new PWAService();
exports.default = exports.pwaService;
//# sourceMappingURL=pwaService.js.map