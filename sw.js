/* 다이어리 알림. 말랑대학 sw.js 와 같은 방식이에요. 화면 파일을 저장해 두지는 않아요 */
const SW_V = '2026-11-13-18';   // 화면을 고치면 올려요 (새 서비스워커로 바뀌게). 저장해 둔 화면 파일이 있으면 지워요
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k))))));
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data && e.data.text() }; }
  // 다이어리 알림은 하나로: 같은 tag 라서 겹쳐 쌓이지 않아요
  e.waitUntil(self.registration.showNotification(d.title || '내 다이어리', { body: d.body || '', icon: d.icon || 'assets/icon-512.png', tag: 'jd-daily', data: { url: './?go=today' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const L = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of L) if ('focus' in c) { try { c.postMessage({ go: 'today' }); } catch (x) {} return c.focus(); }
    return self.clients.openWindow(new URL('./?go=today', self.registration.scope).href);
  })());
});
