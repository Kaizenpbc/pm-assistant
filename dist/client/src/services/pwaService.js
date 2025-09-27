"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
        await this.requestNotificationPermission();
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
                const { pathService } = await Promise.resolve().then(() => __importStar(require('./pathService')));
                const swPath = pathService.getServiceWorkerPath();
                this.registration = await navigator.serviceWorker.register(swPath);
                console.log('✅ Service Worker registered successfully');
                await this.showNotification('PM Assistant Ready', {
                    body: 'App is now available offline with enhanced features.',
                    tag: 'pwa-registration-success'
                });
                const { toastService } = await Promise.resolve().then(() => __importStar(require('./toastService')));
                toastService.pwaRegistrationSuccess();
                this.registration.addEventListener('updatefound', this.handleServiceWorkerUpdate.bind(this));
                setInterval(() => this.checkForUpdates(), 30 * 60 * 1000);
            }
            catch (error) {
                console.error('❌ Service Worker registration failed:', error);
                await this.showNotification('Offline Features Unavailable', {
                    body: 'Unable to enable offline capabilities. Some features may be limited. Please check your internet connection and try refreshing the page.',
                    tag: 'pwa-registration-error',
                    requireInteraction: true
                });
                const { toastService } = await Promise.resolve().then(() => __importStar(require('./toastService')));
                toastService.pwaRegistrationError();
                console.warn('⚠️ PWA offline capabilities disabled. This may affect app performance and user experience.');
            }
        }
        else {
            console.warn('⚠️ Service Workers not supported in this browser');
            await this.showNotification('Browser Compatibility Notice', {
                body: 'Your browser does not support offline features. Please consider updating to a modern browser for the best experience.',
                tag: 'pwa-unsupported-browser'
            });
            const { toastService } = await Promise.resolve().then(() => __importStar(require('./toastService')));
            toastService.pwaUnsupportedBrowser();
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
            const { pathService } = await Promise.resolve().then(() => __importStar(require('./pathService')));
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