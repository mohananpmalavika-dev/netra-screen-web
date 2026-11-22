import './offline-status.js';
import {COPY} from './investor-copy.mjs';
let language='en',current=0,report=false;
const slides=[...document.querySelectorAll('.pitch-slide')], main=document.getElementById('presMain');
function render(){
 document.documentElement.lang=language;document.body.classList.toggle('lang-ml',language==='ml');
 document.querySelectorAll('[data-pitch]').forEach(el=>{el.innerHTML=COPY[Number(el.dataset.pitch)][language];});
 document.getElementById('overviewTitle').textContent=language==='en'?'NETRA-SCREEN · Investor overview':'NETRA-SCREEN · ആശയവും ഗവേഷണവും';
 document.getElementById('presentationLang').textContent=language==='en'?'മലയാളം':'English';
 document.getElementById('btnModeReport').textContent=report?(language==='en'?'Slide view':'സ്ലൈഡ് കാഴ്ച'):(language==='en'?'Read all slides':'എല്ലാ സ്ലൈഡുകളും');
 document.getElementById('btnModeReport').setAttribute('aria-pressed',String(report));
 main.classList.toggle('mode-report',report);
 slides.forEach((slide,i)=>{slide.classList.toggle('active',i===current);slide.setAttribute('aria-hidden',String(!report&&i!==current));});
 document.getElementById('presCounter').textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
 document.getElementById('btnPrevSlide').disabled=current===0;document.getElementById('btnNextSlide').disabled=current===slides.length-1;
}
function go(delta){current=Math.max(0,Math.min(slides.length-1,current+delta));render();if(report)slides[current].scrollIntoView({behavior:'smooth',block:'start'});}
document.getElementById('btnNextSlide').addEventListener('click',()=>go(1));
document.getElementById('btnPrevSlide').addEventListener('click',()=>go(-1));
document.getElementById('presentationLang').addEventListener('click',()=>{language=language==='en'?'ml':'en';render();});
document.getElementById('btnModeReport').addEventListener('click',()=>{report=!report;render();});
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.getElementById('btnFullscreen').textContent='Use browser fullscreen';}}
document.getElementById('btnFullscreen').addEventListener('click',fullscreen);
document.addEventListener('keydown',event=>{if(event.target.closest('button,a,input,select,textarea'))return;if(['ArrowRight',' ','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();if(event.key==='Home')current=0;else if(event.key==='End')current=slides.length-1;else go(event.key==='ArrowLeft'?-1:1);render();}if(event.key.toLowerCase()==='f')fullscreen();});
let remaining=90,deadline=0,timer=null;
const timerButton=document.getElementById('presTimerBtn');
function timerText(){timerButton.textContent=`${timer?'Pause':'Pitch'} ${Math.floor(remaining/60).toString().padStart(2,'0')}:${(remaining%60).toString().padStart(2,'0')}`;}
timerButton.addEventListener('click',()=>{if(timer){clearInterval(timer);timer=null;remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));timerText();return;}if(!remaining)remaining=90;deadline=Date.now()+remaining*1000;timer=setInterval(()=>{remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));if(!remaining){clearInterval(timer);timer=null;}timerText();},200);timerText();});
window.addEventListener('hashchange',()=>{if(location.hash==='#partnership'){current=slides.length-1;render();}});
if(location.hash==='#partnership')current=slides.length-1;
render();
