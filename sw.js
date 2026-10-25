const CACHE='bolta-khata-v2';
const FILES=['./','index.html','manifest.json','icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  // Awaz ka model Vosk khud IndexedDB mein rakhta hai, yahan dobara cache nahi karna
  if(url.pathname.includes('/models/'))return;
  const isPage=e.request.mode==='navigate';
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{
      if(r.ok&&(url.origin===location.origin||url.hostname.includes('fonts.g'))){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}
      return r}).catch(()=>hit);
    // Page: pehle naya version try karo (taake update foran mile), na mile to cache
    if(isPage)return net.then(r=>r||hit||caches.match('index.html'));
    return hit||net}))});
