// 앱 설치(홈 화면 추가)와 오프라인 실행을 위한 서비스 워커.
// 네트워크를 먼저 시도하고 실패하면 캐시를 쓰므로, 코드를 고쳐 올리면 바로 새 버전이 보인다.
const V = 'parkjam-v1';
const CORE = [
  './', 'index.html', 'manifest.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png',
  'assets/vehicles/sedan_white.png', 'assets/vehicles/sedan_black.png', 'assets/vehicles/sedan_silver.png',
  'assets/vehicles/sedan_red.png', 'assets/vehicles/sedan_blue.png', 'assets/vehicles/kei.png',
  'assets/vehicles/taxi.png', 'assets/vehicles/porter.png', 'assets/vehicles/bus.png',
  'assets/vehicles/moto.png', 'assets/vehicles/mine.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(r, copy)); }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
