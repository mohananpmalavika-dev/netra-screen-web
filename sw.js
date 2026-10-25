/* One atomic, versioned offline package with a compatible navigation update. */
importScripts('./static-assets.js');
const CACHE_NAME='netra-screen-offline-v28';
const ASSET_URLS=new Set(globalThis.NETRA_ASSETS.map(path=>new URL(path,self.registration.scope).href));
const INDEX_URL=new URL('index.html',self.registration.scope).href;
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('install',event=>{
  // Compatible route migration: loaded capture scripts remain compatible with the new package.
  // The next navigation must not retain retired activity menus.
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll([...ASSET_URLS])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys())if(key.startsWith('netra-screen-offline-')&&key!==CACHE_NAME)await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  url.search='';url.hash='';
  let key=url.href;
  if(key===self.registration.scope)key=INDEX_URL;
  if(!ASSET_URLS.has(key))return; // Never persist arbitrary requests or personal reports.
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME),cached=await cache.match(key);
    if(cached)return cached;
    try{return await fetch(event.request);}catch{return new Response('This asset is not available offline. Reconnect and reopen the app.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
  })());
});
