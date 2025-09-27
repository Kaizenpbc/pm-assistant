// PM Application v2 Service Worker
// Provides offline capabilities and caching

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `pm-application-v2-${CACHE_VERSION}`;

// Files to cache for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    networkFirst(request)
      .catch(() => {
        // If network fails, try cache
        return cacheFirst(request);
      })
  );
});

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed:', request.url);
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Serving from cache:', request.url);
    return cachedResponse;
  }
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - PM Application</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline-message { max-width: 500px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <h1>You're Offline</h1>
            <p>It looks like you're not connected to the internet. Some features may not be available.</p>
            <p>Don't worry - your data is safe and will sync when you're back online.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  throw new Error('No cached response available');
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    console.log('[SW] Checking for application updates...');
    // Check for updates logic can be added here
  }
});

console.log('[SW] Service worker script loaded');