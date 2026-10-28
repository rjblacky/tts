/* GitHub Pages cannot send the two headers that unlock multi-core WebAssembly.
   This tiny service worker adds them on the way in (COOP + COEP "credentialless"),
   so the AI voice can use several CPU cores instead of one. Nothing is stored or sent anywhere.
   To switch it off: open the site once with ?safe at the end of the address. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.cache==='only-if-cached'&&r.mode!=='same-origin')return;
  const req=r.mode==='no-cors'?new Request(r,{credentials:'omit'}):r;
  e.respondWith(fetch(req).then(res=>{
    if(res.status===0)return res;
    const h=new Headers(res.headers);
    h.set('Cross-Origin-Embedder-Policy','credentialless');
    h.set('Cross-Origin-Opener-Policy','same-origin');
    return new Response(res.body,{status:res.status,statusText:res.statusText,headers:h});
  }).catch(err=>{console.error(err);return Response.error()}));
});
