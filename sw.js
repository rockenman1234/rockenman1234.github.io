// Enhanced Service Worker for Caching - GitHub Pages Compatible
// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

const CACHE_NAME = 'alexj-portfolio-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Critical resources to cache immediately
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.js',
  '/manifest.json',
  '/images/headshot.webp',
  '/images/altdowntown.avif',
  '/fonts/HKGrotesk-Regular.woff',
  '/fonts/Jost-Regular.ttf'
];

// Large assets to cache on demand
const largeAssets = [
  '/images/code.gif',
  '/images/KalibungaDemo.gif'
];

// Install event - cache critical resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('Caching critical resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with different strategies for different asset types
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle HTML files - Network First (for updated content)
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Handle images, fonts, and static assets - Cache First
  if (event.request.url.match(/\.(png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2|ttf|css|js)$/)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Default strategy - Cache First with network fallback
  event.respondWith(cacheFirst(event.request));
});

// Cache First Strategy - Good for static assets
function cacheFirst(request) {
  return caches.match(request)
    .then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request)
        .then(function(response) {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();
          
          // Determine cache to use
          const cacheName = isLargeAsset(request.url) ? DYNAMIC_CACHE : STATIC_CACHE;
          
          caches.open(cacheName)
            .then(function(cache) {
              cache.put(request, responseToCache);
            });

          return response;
        });
    });
}

// Network First Strategy - Good for HTML content
function networkFirst(request) {
  return fetch(request)
    .then(function(response) {
      // If network request succeeds, cache and return it
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then(function(cache) {
            cache.put(request, responseToCache);
          });
      }
      return response;
    })
    .catch(function() {
      // If network fails, try to get from cache
      return caches.match(request);
    });
}

// Helper function to identify large assets
function isLargeAsset(url) {
  return largeAssets.some(asset => url.includes(asset));
}

// @license-end