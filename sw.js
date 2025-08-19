const CACHE_NAME = 'quick-jot-v1';
const BASE_PATH = location.hostname === 'localhost' ? '' : '/T3_App_Notes';

// Archivos esenciales para cachear (App Shell)
const CACHE_FILES = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.webmanifest.json`,
  `${BASE_PATH}/src/css/app.css`,
  `${BASE_PATH}/src/js/app.js`,
  `${BASE_PATH}/src/js/notes.js`,
  `${BASE_PATH}/src/js/ui.js`,
  `${BASE_PATH}/sw.js`,
  // Material Design Lite CDN
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
  'https://code.getmdl.io/1.3.0/material.min.js',
  // Iconos
  `${BASE_PATH}/src/assets/icons/icon-128x128.png`,
  `${BASE_PATH}/src/assets/icons/icon-256x256.png`,
  `${BASE_PATH}/src/assets/icons/icon-512x512.png`
];

// Evento INSTALL - Cachear archivos esenciales
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando y cacheando archivos...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierto');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        console.log('Service Worker: Todos los archivos cacheados correctamente');
        // Forzar la activación inmediata del SW
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error al cachear archivos:', error);
      })
  );
});

// Evento ACTIVATE - Limpiar caches antiguas
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguas
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Eliminando cache antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activado correctamente');
        // Asegurar que el SW tome control inmediatamente
        return clients.claim();
      })
  );
});

// Evento FETCH - Estrategia Cache First
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones HTTP/HTTPS
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Si está en cache, devolverlo (Cache First)
          if (cachedResponse) {
            console.log('Service Worker: Sirviendo desde cache:', event.request.url);
            return cachedResponse;
          }
          
          // Si no está en cache, hacer fetch y cachear para futuras peticiones
          console.log('Service Worker: Descargando desde red:', event.request.url);
          return fetch(event.request)
            .then((response) => {
              // Verificar que sea una respuesta válida
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clonar la respuesta porque es un stream
              const responseToCache = response.clone();
              
              // Cachear archivos importantes dinámicamente
              if (shouldCache(event.request.url)) {
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              
              return response;
            })
            .catch((error) => {
              console.error('Service Worker: Error en fetch:', error);
              
              // Si es una página HTML y falla, devolver página offline básica
              if (event.request.destination === 'document') {
                return caches.match(`${BASE_PATH}/index.html`);
              }
            });
        })
    );
  }
});

// Función para determinar si un recurso debe ser cacheado
function shouldCache(url) {
  // Cachear recursos estáticos importantes
  return url.includes('.css') || 
         url.includes('.js') || 
         url.includes('.png') || 
         url.includes('.jpg') || 
         url.includes('.jpeg') || 
         url.includes('.gif') || 
         url.includes('.svg') ||
         url.includes('fonts.googleapis.com') ||
         url.includes('code.getmdl.io');
}

// Evento SYNC - Para sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Evento sync recibido:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí puedes implementar lógica de sincronización
      // como enviar datos guardados offline cuando vuelva la conexión
      console.log('Ejecutando sincronización en segundo plano')
    );
  }
});

// Evento PUSH - Para notificaciones push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification recibida');
  
  let options = {
    body: 'Nueva notificación de Quick Jot',
    icon: `${BASE_PATH}/src/assets/icons/icon-128x128.png`,
    badge: `${BASE_PATH}/src/assets/icons/icon-128x128.png`,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: 'Abrir App',
        icon: `${BASE_PATH}/src/assets/icons/icon-128x128.png`
      },
      {
        action: 'close', 
        title: 'Cerrar',
        icon: `${BASE_PATH}/src/assets/icons/icon-128x128.png`
      },
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Quick Jot';
  }
  
  event.waitUntil(
    self.registration.showNotification('Quick Jot', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click recibido');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Abrir o enfocar la app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === `${self.location.origin}${BASE_PATH}/` && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(`${BASE_PATH}/`);
          }
        })
    );
  }
});