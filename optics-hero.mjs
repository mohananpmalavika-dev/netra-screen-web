// A restrained pointer light for the illustration. No camera or research data.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.optical-hero').forEach(scene=>{
 if(!matchMedia('(pointer:fine)').matches)return;
 let frame=0,point=null;
 const paint=()=>{frame=0;if(!point)return;const r=scene.getBoundingClientRect();scene.style.setProperty('--light-x',`${(point.x-r.x)/r.width*100}%`);scene.style.setProperty('--light-y',`${(point.y-r.y)/r.height*100}%`);};
 scene.addEventListener('pointermove',event=>{if(reduced.matches)return;point={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(paint);});
 scene.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);frame=0;point=null;scene.style.setProperty('--light-x','50%');scene.style.setProperty('--light-y','50%');});
});
