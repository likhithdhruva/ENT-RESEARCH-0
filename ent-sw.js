const CACHE = 'ent-research-v3';
const FILES = [
  './ENT_FINAL_COMPLETE.html',
  './ent-manifest.json',
  './ent-icon-192.png',
  './ent-icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.allSettled(FILES.map(function(f){ return c.add(f).catch(function(){}); }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Cache-first for local files, network-first for API calls
  if(e.request.url.includes('script.google.com') || e.request.url.includes('inputtools.google.com')){
    e.respondWith(fetch(e.request).catch(function(){ return new Response('{}',{headers:{'Content-Type':'application/json'}}); }));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(res){
        if(res && res.status === 200 && res.type !== 'opaque'){
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      }).catch(function(){
        return caches.match('./ENT_FINAL_COMPLETE.html');
      });
    })
  );
});