/* (Oct 12, 12:50) Forest Fire Watch service worker: notifications only. It never caches or intercepts requests (no fetch
   handler), so updates and the reset link work as before. A tap on a notification brings the app forward on the screen it names. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick', function (e) {
  e.notification.close(); var url = (e.notification.data && e.notification.data.url) || 'Main.dc.html';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) { var c = cs[i]; if ('focus' in c) { try { c.navigate(url); } catch (x) {} return c.focus(); } }
    return self.clients.openWindow ? self.clients.openWindow(url) : null; }));
});
