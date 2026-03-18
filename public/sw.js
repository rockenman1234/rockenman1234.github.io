// Service Worker for Caching - GitHub Pages Compatible
// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3

const CACHE_NAME = 'alexj-portfolio-v5';
const STATIC_CACHE = 'static-v5';
const DYNAMIC_CACHE = 'dynamic-v5';
const IMAGE_CACHE = 'images-v5';

// Critical resources to cache immediately
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.js',
  '/manifest.json',
  '/images/headshot.webp',
  '/images/altdowntown.avif',
  '/images/safariBackground.webp',
  '/fonts/HKGrotesk-Regular.woff',
  '/fonts/Jost-Regular.ttf'
];

// Large assets to cache on demand with longer expiry
const largeAssets = [
  '/images/code.gif',
  '/images/KalibungaDemo.gif',
  '/images/AI-Textbook-logo.webp',
  '/images/Buzz_Off.webp',
  '/images/simpleHTTPd.webp',
  '/images/fedele-lab-logo.webp'
];

// Install event - cache critical resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then(function(cache) {
          console.log('Caching critical resources');
          return cache.addAll(urlsToCache);
        }),
      caches.open(IMAGE_CACHE)
        .then(function(cache) {
          console.log('Preparing image cache');
          return cache;
        })
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with optimized strategies for different asset types
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests and external analytics
  if (event.request.method !== 'GET' || 
      requestUrl.hostname.includes('simpleanalyticscdn.com') ||
      requestUrl.hostname.includes('cloudflareinsights.com')) {
    return;
  }

  // Handle images with reload-aware caching
  if (event.request.destination === 'image' || 
      event.request.url.match(/\.(png|jpg|jpeg|webp|avif|gif|svg|ico)$/)) {
    event.respondWith(imageReloadAware(event.request));
    return;
  }

  // Handle HTML files - Network First (for updated content)
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Handle fonts, CSS, and JS - Cache First with long expiry
  if (event.request.url.match(/\.(woff|woff2|ttf|css|js)$/)) {
    event.respondWith(cacheFirstLongTerm(event.request));
    return;
  }

  // Default strategy - Cache First with network fallback
  event.respondWith(cacheFirst(event.request));
});

// Reload-aware image caching strategy
function imageReloadAware(request) {
  return caches.open(IMAGE_CACHE)
    .then(function(cache) {
      // Check if this is a reload request (has cache-control: no-cache or pragma: no-cache)
      const isReload = request.headers.get('cache-control') === 'no-cache' || 
                      request.headers.get('pragma') === 'no-cache' ||
                      request.cache === 'reload';
      
      if (isReload) {
        // For reload requests, always fetch fresh and update cache
        return fetch(request)
          .then(function(response) {
            if (response && response.status === 200 && response.type !== 'opaque') {
              try {
                const responseToCache = response.clone();
                cache.put(request, responseToCache).catch(function(error) {
                  console.warn('Failed to cache image on reload:', request.url, error);
                });
              } catch (error) {
                console.warn('Failed to clone response for caching on reload:', request.url, error);
              }
            }
            return response;
          })
          .catch(function(error) {
            console.error('Failed to fetch image on reload:', request.url, error);
            // Fallback to cache if network fails
            return cache.match(request);
          });
      }
      
      // For normal requests, try cache first, then network
      return cache.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            // Also fetch in background to keep cache fresh
            fetch(request)
              .then(function(response) {
                if (response && response.status === 200 && response.type !== 'opaque') {
                  const responseToCache = response.clone();
                  cache.put(request, responseToCache).catch(function(error) {
                    console.warn('Failed to update cached image:', request.url, error);
                  });
                }
              })
              .catch(function(error) {
                console.warn('Background fetch failed for:', request.url, error);
              });
            
            return cachedResponse;
          }
          
          // Not in cache, fetch from network
          return fetch(request)
            .then(function(response) {
              if (response && response.status === 200 && response.type !== 'opaque') {
                try {
                  const responseToCache = response.clone();
                  cache.put(request, responseToCache).catch(function(error) {
                    console.warn('Failed to cache new image:', request.url, error);
                  });
                } catch (error) {
                  console.warn('Failed to clone response for caching:', request.url, error);
                }
              }
              return response;
            })
            .catch(function(error) {
              console.error('Failed to fetch image:', request.url, error);
              throw error;
            });
        })
        .catch(function(error) {
          console.error('Cache match failed for:', request.url, error);
          // Fallback to network request
          return fetch(request);
        });
    })
    .catch(function(error) {
      console.error('Failed to open image cache:', error);
      // Fallback to network request
      return fetch(request);
    });
}

// Cache First with long-term caching for static assets
function cacheFirstLongTerm(request) {
  return caches.match(request)
    .then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request)
        .then(function(response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(STATIC_CACHE)
            .then(function(cache) {
              cache.put(request, responseToCache);
            });

          return response;
        });
    });
}

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