// Presentation light follows the pointer; the research pipeline is independent.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.optical-hero').forEach(scene=>{
 if(!matchMedia('(pointer:fine)').matches)return;
 scene.addEventListener('pointermove',event=>{if(reduced.matches)return;const r=scene.getBoundingClientRect();scene.style.setProperty('--light-x',`${(event.clientX-r.x)/r.width*100}%`);scene.style.setProperty('--light-y',`${(event.clientY-r.y)/r.height*100}%`);});
 scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--light-x','50%');scene.style.setProperty('--light-y','50%');});
});
