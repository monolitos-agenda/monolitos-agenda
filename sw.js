const CACHE = 'monolitos-v56';
const ASSETS = ['./','./index.html','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// ===== NOTIFICAÇÕES PUSH (Firebase Cloud Messaging) =====
// Mostra o aviso quando o app está fechado ou em segundo plano.
try{
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey: "AIzaSyCaJiO8XARNpC2mAaMTVWG7wFnKn2IR7TI",
    authDomain: "mt-agenda.firebaseapp.com",
    projectId: "mt-agenda",
    storageBucket: "mt-agenda.firebasestorage.app",
    messagingSenderId: "10217074325",
    appId: "1:10217074325:web:2c8d6d8beb0a4009ab759c"
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(payload => {
    const t = payload.notification || {};
    self.registration.showNotification(t.title || 'Top-Agenda', {
      body: t.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png'
    });
  });
}catch(e){ console.warn('FCM no service worker indisponível:', e); }

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window'}).then(list=>{
      for(const c of list){ if('focus' in c) return c.focus(); }
      if(self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
