import './offline-status.js';
const $=id=>document.getElementById(id);
let slides=[],current=0;
function render(){
 const slide=slides[current];if(!slide)return;
 $('yipSlideImage').src='./'+slide.image;
 $('yipSlideImage').alt=`YIP slide ${current+1} of ${slides.length}: ${slide.title}`;
 $('yipSlideTitle').textContent=slide.title;$('yipSlideText').textContent=slide.text;
 $('yipCounter').textContent=`${current+1} / ${slides.length}`;$('yipSelect').value=String(current);
 $('yipPrev').disabled=current===0;$('yipNext').disabled=current===slides.length-1;$('yipStatus').textContent='';
 const stage=document.querySelector('.yip-stage');stage.scrollTop=0;stage.scrollLeft=0;
}
function go(index){current=Math.max(0,Math.min(slides.length-1,index));render();}
$('yipPrev').addEventListener('click',()=>go(current-1));$('yipNext').addEventListener('click',()=>go(current+1));
$('yipSelect').addEventListener('change',event=>go(Number(event.target.value)));
$('yipZoom').addEventListener('click',()=>{const zoomed=document.querySelector('.yip-stage').classList.toggle('is-zoomed');$('yipZoom').setAttribute('aria-pressed',String(zoomed));$('yipZoom').textContent=zoomed?'Fit slide':'Zoom slide';});
$('yipFullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('yipViewer').requestFullscreen();}catch{$('yipStatus').textContent='Use your browser’s fullscreen control.';}});
$('yipSlideImage').addEventListener('error',()=>{$('yipStatus').textContent='Slide image unavailable. Read the slide text below or open the original PDF.';});
document.addEventListener('keydown',event=>{if(event.target.closest('button,a,summary,input,select,textarea'))return;const targets={ArrowLeft:current-1,ArrowRight:current+1,Home:0,End:slides.length-1};if(event.key in targets){event.preventDefault();go(targets[event.key]);}});
try{
 const response=await fetch('./yip-deck.json');if(!response.ok)throw Error('Deck unavailable');
 const deck=await response.json();if(!Array.isArray(deck.slides)||deck.slides.length!==14)throw Error('Incomplete deck');slides=deck.slides;
 slides.forEach((slide,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=`${i+1}. ${slide.title}`;$('yipSelect').append(option);});render();
}catch{$('yipStatus').textContent='The slide viewer could not load. Open the original YIP PDF using the download link above.';$('yipPrev').disabled=true;$('yipNext').disabled=true;}
