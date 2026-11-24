import './offline-status.js';
import {promptInstall} from './pwa-installer.mjs';
const url='https://mindmesh-netra.web.app/',status=document.querySelector('[data-join-status]');
async function copy(){try{await navigator.clipboard.writeText(url);status.textContent='Website link copied. Paste it into a message or your NFC tag app.';}catch{status.textContent='Copy this address: '+url;}}
document.querySelector('[data-copy]').addEventListener('click',copy);
document.querySelector('[data-share]').addEventListener('click',async()=>{if(!navigator.share){await copy();return;}try{await navigator.share({title:'NETRA-SCREEN · Eye-movement research',text:'Explore Team MindMesh’s research prototype.',url});status.textContent='Share sheet opened.';}catch(error){if(error.name!=='AbortError')await copy();}});
document.querySelector('[data-install]').addEventListener('click',()=>promptInstall());
document.querySelector('[data-print]').addEventListener('click',()=>print());
