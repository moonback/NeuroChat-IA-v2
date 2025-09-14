// Service Worker pour NeuroChat IA
// Version 2.0 - PWA complet avec cache intelligent

const CACHE_NAME = 'neurochat-v2.0';
const STATIC_CACHE = 'neurochat-static-v2.0';
const DYNAMIC_CACHE = 'neurochat-dynamic-v2.0';

// Ressources critiques à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo-p.png',
  '/neurochat-screenshot.png',
  '/bip2.mp3',
  '/bip.wav',
  '/pdf.worker.mjs',
  '/manifest.json'
];

// Ressources dynamiques (API, images, etc.)
const DYNAMIC_PATTERNS = [
  /^https:\/\/api\./,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:mp3|wav|ogg)$/,
  /\.(?:css|js)$/
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation en cours...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim();
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Stratégie de cache selon le type de ressource
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
  } else if (isDynamicAsset(request.url)) {
    event.respondWith(networkFirst(request));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(networkOnly(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_CLEAR':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CACHE_SIZE':
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size });
      });
      break;
      
    case 'PREFETCH_RESOURCES':
      prefetchResources(payload.resources).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('[SW] Message non reconnu:', type);
  }
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('[SW] Synchronisation en arrière-plan:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('[SW] Notification push reçue');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification de NeuroChat',
    icon: '/logo-p.png',
    badge: '/logo-p.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ouvrir NeuroChat',
        icon: '/logo-p.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/logo-p.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('NeuroChat IA', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clic sur notification:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Fonctions utilitaires
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset));
}

function isDynamicAsset(url) {
  return DYNAMIC_PATTERNS.some(pattern => pattern.test(url));
}

function isAPIRequest(url) {
  return url.includes('/api/') || url.includes('openai.com') || url.includes('googleapis.com');
}

// Stratégies de cache
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Erreur réseau pour ressource statique:', error);
    return new Response('Ressource non disponible', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Réseau indisponible, utilisation du cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Ressource non disponible', { status: 503 });
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Erreur réseau pour API:', error);
    return new Response('Service indisponible', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Fonctions de gestion du cache
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    totalSize += keys.length;
  }
  
  return totalSize;
}

async function prefetchResources(resources) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return Promise.all(
    resources.map(resource => 
      fetch(resource).then(response => {
        if (response.ok) {
          cache.put(resource, response);
        }
      }).catch(error => {
        console.warn('[SW] Impossible de précharger:', resource, error);
      })
    )
  );
}

async function doBackgroundSync() {
  // Synchronisation des données en arrière-plan
  console.log('[SW] Synchronisation en cours...');
  
  try {
    // Ici, vous pouvez ajouter la logique de synchronisation
    // Par exemple, sauvegarder les conversations, synchroniser les paramètres, etc.
    
    console.log('[SW] Synchronisation terminée');
  } catch (error) {
    console.error('[SW] Erreur lors de la synchronisation:', error);
  }
}

// Gestion des erreurs globales
self.addEventListener('error', (event) => {
  console.error('[SW] Erreur globale:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Promesse rejetée non gérée:', event.reason);
});

console.log('[SW] Service Worker chargé - Version 2.0');
