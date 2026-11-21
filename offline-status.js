import './static-assets.js';
// Installation state is visible; an update never interrupts an active session.
const footer=document.querySelector('.studio-footer,.app-footer');
const indicator=document.createElement('small');
indicator.id='offlineStatus';indicator.setAttribute('role','status');indicator.style.display='block';
footer?.append(indicator);
const show=message=>{indicator.textContent=message;};
if(!('serviceWorker'in navigator))show('Offline installation is not supported in this browser.');
else{
  show('Preparing offline access…');
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async registration=>{
    try{registration.update();}catch(e){}
    const ready=async()=>{
      try{
        const names=(await caches.keys()).filter(key=>key.startsWith('netra-screen-offline-'));
        const complete=await Promise.all(names.map(async name=>{
          const cache=await caches.open(name);
          return (await Promise.all(globalThis.NETRA_ASSETS.map(path=>cache.match(new URL(path,location.href).href)))).every(Boolean);
        }));
        const cached=complete.some(Boolean);
        show(cached?'Offline activities ready · model and app saved on this browser':'Offline files unavailable. Reconnect and reopen the app.');
      }catch{show('Offline storage unavailable in this browser. Keep a connection to use the app.');}
    };
    navigator.serviceWorker.addEventListener('controllerchange',ready);
    const observe=worker=>{
      if(!worker)return;
      const update=()=>{
        if(worker.state==='installing')show('Downloading offline app and vision model. Keep this page open.');
        if(worker.state==='installed'){
          if(registration.waiting&&navigator.serviceWorker.controller){
            registration.waiting.postMessage({type:'SKIP_WAITING'});
          }else ready();
        }
        if(worker.state==='redundant')show('Offline download did not finish. Reconnect and reload to retry.');
      };
      worker.addEventListener('statechange',update);update();
    };
    if(registration.waiting){
      registration.waiting.postMessage({type:'SKIP_WAITING'});
    }else if(registration.active)await ready();
    observe(registration.installing);
    registration.addEventListener('updatefound',()=>observe(registration.installing));
  }).catch(()=>show('Offline setup unavailable. Keep a connection to use the app.'));
}
