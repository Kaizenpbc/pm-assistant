// PM Application v2 Service Worker
// Provides offline capabilities and caching

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `pm-application-v2-${CACHE_VERSION}`;
const STATIC_CACHE = `pm-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pm-dynamic-${CACHE_VERSION}`;
const API_CACHE = `pm-api-${CACHE_VERSION}`;

// Cache configuration
const CACHE_CONFIG = {
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB max cache size
  MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours max age
  MAX_ENTRIES: 100, // Max number of cache entries
  CLEANUP_INTERVAL: 60 * 60 * 1000 // 1 hour cleanup interval
};

// Dynamic path resolution for deployment flexibility
const getBasePath = () => {
  // Get the scope from the service worker registration
  const scope = self.registration.scope;
  return scope.endsWith('/') ? scope : scope + '/';
};

const BASE_PATH = getBasePath();

// Files to cache for offline use (using relative paths)
const STATIC_FILES = [
  BASE_PATH,
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'favicon.ico'
];

// Dynamic asset files (will be populated at runtime)
const DYNAMIC_ASSETS = [
  // These will be populated by the build process or runtime detection
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/projects/,
  /\/api\/auth\/me/,
  /\/api\/templates/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files...');
        // Only cache files that actually exist
        return cache.addAll(STATIC_FILES.filter(file => {
          // Skip files that might not exist
          return !file.includes('dashboard') && !file.includes('login');
        }));
      })
      .then(() => {
        console.log('[SW] Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error);
        // Don't fail installation if some files can't be cached
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
        
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (!currentCaches.includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        // Start periodic cache cleanup
        scheduleCacheCleanup();
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Static files - Cache First
    if (isStaticFile(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: API calls - Use appropriate cache strategy
    if (isApiCall(url)) {
      const cacheName = getApiCacheName(url);
      return await networkFirstWithExpiration(request, cacheName);
    }
    
    // Strategy 3: React Routes - Serve index.html for client-side routing
    if (isReactRoute(url) && request.mode === 'navigate') {
      const indexResponse = await caches.match(BASE_PATH + 'index.html');
      if (indexResponse) {
        return indexResponse;
      }
    }
    
    // Strategy 4: Other requests - Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('[SW] Service Worker fetch error:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage();
    }
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a generic offline response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Network First Strategy with Expiration
async function networkFirstWithExpiration(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  // Check if we have a cached response
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cached response is still fresh
    const cacheTime = cachedResponse.headers.get('sw-cache-time');
    if (cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < CACHE_CONFIG.MAX_AGE) {
        console.log('[SW] Serving fresh cached response:', request.url);
        return cachedResponse;
      } else {
        console.log('[SW] Cached response expired, fetching fresh:', request.url);
      }
    }
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Add cache timestamp to response headers
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...networkResponse.headers,
          'sw-cache-time': Date.now().toString()
        }
      });
      
      cache.put(request, responseWithTimestamp.clone());
      console.log('[SW] Cached fresh response:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      console.log('[SW] Serving stale cached response:', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}

// Helper functions
function isStaticFile(url) {
  return url.pathname.startsWith('/assets/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname.endsWith('.ttf');
}

function isReactRoute(url) {
  // Handle React Router routes (client-side routing)
  const reactRoutes = ['/dashboard', '/login', '/project', '/schedule', '/monitoring'];
  return reactRoutes.some(route => url.pathname.startsWith(route)) || 
         url.pathname === '/' || 
         url.pathname === BASE_PATH;
}

function isApiCall(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function getApiCacheName(url) {
  // Use different cache strategies based on API endpoint
  if (url.pathname.includes('/projects')) return API_CACHE;
  if (url.pathname.includes('/auth')) return DYNAMIC_CACHE; // Don't cache auth long-term
  if (url.pathname.includes('/templates')) return STATIC_CACHE; // Templates change rarely
  return DYNAMIC_CACHE; // Default to dynamic cache
}

async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE);
  const offlinePage = await cache.match('/offline.html');
  
  if (offlinePage) {
    return offlinePage;
  }
  
  // Return a simple offline page
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - PM Application</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0; padding: 20px; background: #f5f5f5; 
        }
        .container { 
          max-width: 600px; margin: 50px auto; 
          background: white; padding: 40px; border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .retry-btn {
          background: #007bff; color: white; border: none;
          padding: 12px 24px; border-radius: 4px; cursor: pointer;
          font-size: 16px; margin-top: 20px;
        }
        .retry-btn:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔌 You're Offline</h1>
        <p>It looks like you're not connected to the internet. Some features may not be available.</p>
        <p>Don't worry - your data is safe and will sync when you're back online.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('[SW] Starting background sync...');
    
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    if (pendingActions.length === 0) {
      console.log('[SW] No pending actions to sync');
      return;
    }
    
    console.log(`[SW] Syncing ${pendingActions.length} pending actions`);
    
    const syncResults = [];
    
    for (const action of pendingActions) {
      try {
        console.log(`[SW] Syncing action: ${action.type} (${action.id})`);
        
        const success = await syncAction(action);
        
        if (success) {
          await removePendingAction(action.id);
          console.log(`[SW] Successfully synced and removed action: ${action.id}`);
          syncResults.push({ actionId: action.id, success: true });
        } else {
          // Update retry count
          const newRetryCount = action.retryCount + 1;
          
          if (newRetryCount >= action.maxRetries) {
            console.log(`[SW] Action ${action.id} exceeded max retries, removing`);
            await removePendingAction(action.id);
            syncResults.push({ actionId: action.id, success: false, reason: 'max_retries_exceeded' });
          } else {
            console.log(`[SW] Incrementing retry count for action ${action.id}: ${newRetryCount}/${action.maxRetries}`);
            await updateOfflineActionRetryCount(action.id, newRetryCount);
            syncResults.push({ actionId: action.id, success: false, retryCount: newRetryCount });
          }
        }
        
        // Add small delay between requests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`[SW] Failed to sync action ${action.id}:`, error);
        syncResults.push({ actionId: action.id, success: false, error: error.message });
      }
    }
    
    const successful = syncResults.filter(r => r.success).length;
    const failed = syncResults.filter(r => !r.success).length;
    
    console.log(`[SW] Background sync completed: ${successful} successful, ${failed} failed`);
    
    // Notify clients about sync results
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        results: syncResults,
        summary: { successful, failed, total: pendingActions.length }
      });
    });
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_ERROR',
        error: error.message
      });
    });
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from PM Application',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PM Application', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Helper functions for background sync
async function getPendingActions() {
  try {
    // Use IndexedDB directly in service worker
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const actions = request.result || [];
        console.log(`[SW] Found ${actions.length} pending offline actions`);
        resolve(actions);
      };
      
      request.onerror = () => {
        console.error('[SW] Failed to get pending actions:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[SW] Failed to get pending actions:', error);
    return [];
  }
}

async function syncAction(action) {
  try {
    console.log('Syncing action:', action.type, action.id);
    
    // Make API call based on action type
    const response = await fetch(`/api/v1/${getApiEndpoint(action.type)}`, {
      method: action.type.startsWith('CREATE') ? 'POST' : 
              action.type.startsWith('UPDATE') ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(action.data)
    });

    if (response.ok) {
      console.log('[SW] Action synced successfully:', action.id);
      return true;
    } else {
      console.error('[SW] Failed to sync action:', action.id, response.status);
      return false;
    }
  } catch (error) {
    console.error('[SW] Error syncing action:', action.id, error);
    return false;
  }
}

async function removePendingAction(actionId) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(actionId);
      
      request.onsuccess = () => {
        console.log('[SW] Removed pending action:', actionId);
        resolve();
      };
      
      request.onerror = () => {
        console.error('[SW] Failed to remove pending action:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[SW] Failed to remove pending action:', error);
  }
}

function getApiEndpoint(actionType) {
  switch (actionType) {
    case 'CREATE_PROJECT':
    case 'UPDATE_PROJECT':
      return 'projects';
    case 'CREATE_SCHEDULE':
    case 'UPDATE_SCHEDULE':
      return 'schedules';
    case 'CREATE_TASK':
    case 'UPDATE_TASK':
    case 'DELETE_TASK':
      return 'tasks';
    default:
      return 'unknown';
  }
}

// IndexedDB management functions
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PMApplicationDB', 1);
    
    request.onerror = () => {
      console.error('[SW] Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      console.log('[SW] IndexedDB opened successfully');
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create offlineActions object store if it doesn't exist
      if (!db.objectStoreNames.contains('offlineActions')) {
        const store = db.createObjectStore('offlineActions', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        console.log('[SW] Created offlineActions object store');
      }
      
      // Create cachedProjects object store if it doesn't exist
      if (!db.objectStoreNames.contains('cachedProjects')) {
        const store = db.createObjectStore('cachedProjects', { keyPath: 'id' });
        store.createIndex('lastModified', 'lastModified', { unique: false });
        console.log('[SW] Created cachedProjects object store');
      }
      
                  // Create cachedSchedules object store if it doesn't exist
                  if (!db.objectStoreNames.contains('cachedSchedules')) {
                    const store = db.createObjectStore('cachedSchedules', { keyPath: 'id' });
                    store.createIndex('projectId', 'projectId', { unique: false });
                    store.createIndex('lastModified', 'lastModified', { unique: false });
                    console.log('[SW] Created cachedSchedules object store');
                  }
                  
                  // Create sharedContent object store if it doesn't exist
                  if (!db.objectStoreNames.contains('sharedContent')) {
                    const store = db.createObjectStore('sharedContent', { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log('[SW] Created sharedContent object store');
                  }
    };
  });
}

// Queue management functions
async function addOfflineAction(action) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    const offlineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(offlineAction);
      
      request.onsuccess = () => {
        console.log('[SW] Added offline action:', offlineAction.id);
        resolve(offlineAction.id);
      };
      
      request.onerror = () => {
        console.error('[SW] Failed to add offline action:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[SW] Failed to add offline action:', error);
    throw error;
  }
}

async function updateOfflineActionRetryCount(actionId, newRetryCount) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(actionId);
      
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.retryCount = newRetryCount;
          const putRequest = store.put(action);
          
          putRequest.onsuccess = () => {
            console.log('[SW] Updated retry count for action:', actionId, newRetryCount);
            resolve();
          };
          
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('[SW] Failed to update retry count:', error);
  }
}

// Cache cleanup and management functions
async function scheduleCacheCleanup() {
  // Run cleanup immediately
  await performCacheCleanup();
  
  // Schedule periodic cleanup
  setTimeout(() => {
    scheduleCacheCleanup();
  }, CACHE_CONFIG.CLEANUP_INTERVAL);
}

async function performCacheCleanup() {
  console.log('[SW] Starting cache cleanup...');
  
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      let entriesToDelete = [];
      let totalSize = 0;
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          // Check expiration
          const cacheTime = response.headers.get('sw-cache-time');
          if (cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age > CACHE_CONFIG.MAX_AGE) {
              entriesToDelete.push(request);
              continue;
            }
          }
          
          // Estimate size (this is approximate)
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            totalSize += parseInt(contentLength);
          } else {
            // Rough estimate for responses without content-length
            totalSize += 1024; // 1KB estimate
          }
        }
      }
      
      // Remove expired entries
      for (const request of entriesToDelete) {
        await cache.delete(request);
        console.log('[SW] Removed expired cache entry:', request.url);
      }
      
      // If cache is too large, remove oldest entries
      if (totalSize > CACHE_CONFIG.MAX_CACHE_SIZE || keys.length > CACHE_CONFIG.MAX_ENTRIES) {
        await trimCache(cache, keys);
      }
      
      console.log(`[SW] Cache cleanup completed for ${cacheName}: ${entriesToDelete.length} expired entries removed`);
      
    } catch (error) {
      console.error(`[SW] Cache cleanup failed for ${cacheName}:`, error);
    }
  }
}

async function trimCache(cache, keys) {
  // Sort by cache time (oldest first)
  const entriesWithTime = [];
  
  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const cacheTime = response.headers.get('sw-cache-time');
      entriesWithTime.push({
        key,
        time: cacheTime ? parseInt(cacheTime) : 0
      });
    }
  }
  
  // Sort by time (oldest first)
  entriesWithTime.sort((a, b) => a.time - b.time);
  
  // Remove oldest entries until we're under the limit
  const entriesToRemove = entriesWithTime.slice(0, Math.floor(entriesWithTime.length * 0.2)); // Remove 20%
  
  for (const entry of entriesToRemove) {
    await cache.delete(entry.key);
    console.log('[SW] Trimmed cache entry:', entry.key.url);
  }
}

// Cache invalidation functions
async function invalidateCachePattern(pattern) {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const key of keys) {
      if (pattern.test(key.url)) {
        await cache.delete(key);
        console.log('[SW] Invalidated cache entry:', key.url);
      }
    }
  }
}

async function invalidateApiCache(endpoint) {
  const pattern = new RegExp(`/api/v1/${endpoint}`);
  await invalidateCachePattern(pattern);
}

// Handle share target requests
async function handleShareTarget(data) {
  try {
    console.log('[SW] Handling share target data:', data);
    
    // Store shared data in IndexedDB for the app to retrieve
    const db = await openIndexedDB();
    const transaction = db.transaction(['sharedContent'], 'readwrite');
    const store = transaction.objectStore('sharedContent');
    
    const sharedContent = {
      id: `shared_${Date.now()}`,
      timestamp: Date.now(),
      title: data.title,
      text: data.text,
      url: data.url,
      files: data.files || []
    };
    
    await store.put(sharedContent);
    console.log('[SW] Shared content stored successfully');
    
    // Notify all clients about the shared content
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SHARED_CONTENT_RECEIVED',
        data: sharedContent
      });
    });
    
  } catch (error) {
    console.error('[SW] Failed to handle share target:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'SHARE_TARGET') {
    handleShareTarget(event.data.payload);
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(performCacheCleanup());
  }
  
  if (event.data && event.data.type === 'INVALIDATE_API') {
    event.waitUntil(invalidateApiCache(event.data.endpoint));
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    event.waitUntil(getCacheInfo().then(info => {
      event.ports[0].postMessage({ cacheInfo: info });
    }));
  }
  
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    event.waitUntil(checkForUpdates());
  }
  
  if (event.data && event.data.type === 'ADD_OFFLINE_ACTION') {
    event.waitUntil(addOfflineAction(event.data.action));
  }
  
  if (event.data && event.data.type === 'TRIGGER_BACKGROUND_SYNC') {
    event.waitUntil(doBackgroundSync());
  }
});

// Get cache information
async function getCacheInfo() {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  const info = {};
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      const responses = await Promise.all(keys.map(key => cache.match(key)));
      
      let totalSize = 0;
      let expiredCount = 0;
      
      for (const response of responses) {
        if (response) {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            totalSize += parseInt(contentLength);
          }
          
          const cacheTime = response.headers.get('sw-cache-time');
          if (cacheTime) {
            const age = Date.now() - parseInt(cacheTime);
            if (age > CACHE_CONFIG.MAX_AGE) {
              expiredCount++;
            }
          }
        }
      }
      
      info[cacheName] = {
        entryCount: keys.length,
        totalSize: totalSize,
        expiredEntries: expiredCount,
        maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
        maxEntries: CACHE_CONFIG.MAX_ENTRIES
      };
    } catch (error) {
      info[cacheName] = { error: error.message };
    }
  }
  
  return info;
}

// Update notification and checking functions
async function checkForUpdates() {
  console.log('[SW] Checking for application updates...');
  
  try {
    // Fetch the current version from the server
    const response = await fetch('/api/v1/version', {
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const serverVersion = await response.json();
      const currentVersion = CACHE_VERSION;
      
      if (serverVersion.version !== currentVersion) {
        console.log(`[SW] Update available: ${currentVersion} → ${serverVersion.version}`);
        
        // Notify all clients about the update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            currentVersion,
            newVersion: serverVersion.version,
            changelog: serverVersion.changelog || 'Bug fixes and improvements'
          });
        });
        
        // Show notification to user
        await showUpdateNotification(serverVersion.version);
      } else {
        console.log('[SW] Application is up to date');
        
        // Notify clients that no update is available
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'NO_UPDATE_AVAILABLE',
            version: currentVersion
          });
        });
      }
    }
  } catch (error) {
    console.error('[SW] Failed to check for updates:', error);
    
    // Notify clients about the error
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_CHECK_ERROR',
        error: error.message
      });
    });
  }
}

async function showUpdateNotification(newVersion) {
  try {
    await self.registration.showNotification('PM Application Update Available', {
      body: `Version ${newVersion} is ready to install. Click to update.`,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'app-update',
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: 'Update Now',
          icon: '/icon-192x192.png'
        },
        {
          action: 'later',
          title: 'Later',
          icon: '/icon-192x192.png'
        }
      ],
      data: {
        type: 'update',
        version: newVersion,
        timestamp: Date.now()
      }
    });
    
    console.log('[SW] Update notification shown');
  } catch (error) {
    console.error('[SW] Failed to show update notification:', error);
  }
}

// Handle notification clicks for updates
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'update') {
    // Trigger app update
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'FORCE_UPDATE',
            version: event.notification.data.version
          });
        });
      })
    );
  } else if (event.action === 'later') {
    // Schedule reminder for later
    setTimeout(() => {
      checkForUpdates();
    }, 60 * 60 * 1000); // Check again in 1 hour
  }
});

// Periodic update checking
setInterval(() => {
  checkForUpdates();
}, 24 * 60 * 60 * 1000); // Check for updates every 24 hours

console.log('[SW] Service Worker loaded successfully');
