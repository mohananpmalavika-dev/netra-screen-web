// Decorative motion never controls research data, camera access or task timing.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!reduced.matches){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('cinematic-arrival');observer.unobserve(entry.target);}}},{threshold:.08});
 document.querySelectorAll('.opportunity,.research-setup,.partner-section,.partner-band,.join-partner-pack').forEach(el=>observer.observe(el));
}
if(document.querySelector('#viewHome')||document.querySelector('.partner-shell')){
 const progress=document.createElement('div');progress.className='signature-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 let frame=0;const update=()=>{const height=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${height>0?scrollY/height:0})`;frame=0;};
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});update();
}
