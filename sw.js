const CACHE = 'bunkbuddy-v6'; // <--- ध्यान दें: v6 कर दिया है
const ASSETS = ['./', './index.html', './manifest.json', './leaderboard.html', './supabase-config.js'];

self.addEventListener('install', function (e) {
  self.skipWaiting(); // नया सर्विस वर्कर तुरंत एक्टिवेट करो
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res) { // पहले नेटवर्क से लाओ (Network First)
      var clone = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
      return res;
    }).catch(function () {
      return caches.match(e.request); // अगर नेट न हो तो कैश से दो
    })
  );
});