/* Lưu trang vào bộ nhớ đệm để mở được khi không có mạng. Đặt cùng thư mục với index.html. */
var BO_NHO = 'ktpc-v2';

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(BO_NHO).then(function (c) { return c.add('./'); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ds) {
    return Promise.all(ds.filter(function (k) { return k !== BO_NHO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Có mạng: lấy bản mới và cập nhật bộ nhớ đệm; mất mạng: dùng bản đã lưu.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var trang = e.request.mode === 'navigate';
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok && r.type === 'basic' && !r.redirected) {
      var b = r.clone();
      caches.open(BO_NHO).then(function (c) { c.put(trang ? './' : e.request, b); });
    }
    return r;
  }).catch(function () {
    return caches.match(trang ? './' : e.request, { ignoreSearch: true });
  }));
});
