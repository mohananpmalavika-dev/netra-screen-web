// Installation state is visible: first-load downloads are not an offline guarantee.
const footer=document.querySelector('.studio-footer,.app-footer');
const indicator=document.createElement('small');
indicator.id='offlineStatus';indicator.setAttribute('role','status');indicator.style.display='block';
footer?.append(indicator);
const show=message=>{indicator.textContent=message;};
if(!('serviceWorker'in navigator))show('Offline installation is not supported in this browser.');
else{
  show('Preparing offline access…');
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async registration=>{
    const ready=async()=>{
      try{
        const cached=(await caches.keys()).some(key=>key.startsWith('netra-screen-offline-'));
        show(cached?'Offline activities ready · model and app saved on this browser':'Offline files unavailable. Reconnect and reopen the app.');
      }catch{show('Offline storage unavailable in this browser. Keep a connection to use the app.');}
    };
    const observe=worker=>{
      if(!worker)return;
      const update=()=>{
        if(worker.state==='installing')show('Downloading offline app and vision model. Keep this page open.');
        if(worker.state==='installed'){
          if(registration.waiting&&navigator.serviceWorker.controller)show('Update ready. Close all app tabs and reopen to finish updating.');
          else ready();
        }
        if(worker.state==='redundant')show('Offline download did not finish. Reconnect and reload to retry.');
      };
      worker.addEventListener('statechange',update);update();
    };
    if(registration.waiting)show('Update ready. Close all app tabs and reopen to finish updating.');
    else if(registration.active)await ready();
    observe(registration.installing);
    registration.addEventListener('updatefound',()=>observe(registration.installing));
    navigator.serviceWorker.addEventListener('controllerchange',ready);
  }).catch(()=>show('Offline setup unavailable. Keep a connection to use the app.'));
}
