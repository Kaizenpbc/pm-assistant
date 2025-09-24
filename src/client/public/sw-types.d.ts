// TypeScript definitions for Service Worker
// This provides type safety for service worker code

declare const self: ServiceWorkerGlobalScope;

interface CacheConfig {
  MAX_CACHE_SIZE: number;
  MAX_AGE: number;
  MAX_ENTRIES: number;
  CLEANUP_INTERVAL: number;
}

interface OfflineAction {
  id: string;
  type: 'CREATE_PROJECT' | 'UPDATE_PROJECT' | 'CREATE_SCHEDULE' | 'UPDATE_SCHEDULE' | 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface SyncResult {
  success: boolean;
  actionId: string;
  error?: string;
  retryAfter?: number;
}

interface VersionInfo {
  version: string;
  buildDate?: string;
  changelog?: string;
  features?: string[];
  timestamp?: number;
}

interface UpdateManifest {
  version: string;
  updateUrl: string;
  changelog: string[];
  critical: boolean;
  forceUpdate: boolean;
  timestamp: number;
}

interface CacheInfo {
  entryCount: number;
  totalSize: number;
  expiredEntries: number;
  maxSize: number;
  maxEntries: number;
  error?: string;
}

interface CacheInfoMap {
  [cacheName: string]: CacheInfo;
}

interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'GET_VERSION' | 'CLEAR_CACHE' | 'INVALIDATE_API' | 'GET_CACHE_INFO' | 'CHECK_FOR_UPDATES';
  endpoint?: string;
  version?: string;
  ports?: MessagePort[];
}

interface ClientMessage {
  type: 'UPDATE_AVAILABLE' | 'NO_UPDATE_AVAILABLE' | 'UPDATE_CHECK_ERROR' | 'FORCE_UPDATE';
  currentVersion?: string;
  newVersion?: string;
  version?: string;
  changelog?: string;
  error?: string;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  data?: any;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
}

// Extend ServiceWorkerGlobalScope with our custom properties
declare global {
  interface ServiceWorkerGlobalScope {
    CACHE_VERSION: string;
    CACHE_NAME: string;
    STATIC_CACHE: string;
    DYNAMIC_CACHE: string;
    API_CACHE: string;
    CACHE_CONFIG: CacheConfig;
    BASE_PATH: string;
    STATIC_FILES: string[];
    API_CACHE_PATTERNS: RegExp[];
  }
}

// Service Worker event types
interface ServiceWorkerEvents {
  install: Event;
  activate: Event;
  fetch: FetchEvent;
  sync: SyncEvent;
  push: PushEvent;
  notificationclick: NotificationEvent;
  message: MessageEvent;
}

// Cache strategy types
type CacheStrategy = 'cache-first' | 'network-first' | 'network-only' | 'cache-only';

interface CacheStrategyConfig {
  strategy: CacheStrategy;
  cacheName: string;
  maxAge?: number;
  maxEntries?: number;
}

// API endpoint mapping
type ApiEndpoint = 'projects' | 'schedules' | 'tasks' | 'auth' | 'templates' | 'unknown';

// Export types for use in other files
export {
  CacheConfig,
  OfflineAction,
  SyncResult,
  VersionInfo,
  UpdateManifest,
  CacheInfo,
  CacheInfoMap,
  ServiceWorkerMessage,
  ClientMessage,
  NotificationAction,
  NotificationOptions,
  ServiceWorkerEvents,
  CacheStrategy,
  CacheStrategyConfig,
  ApiEndpoint
};
