// Camera-free illustration only. Never writes to the research pipeline or report.
const copy={en:{label:'EXPLORE THE OPTICAL STUDY',horizontal:'Horizontal',vertical:'Vertical',diagonal:'Diagonal',hold:'Step & hold',pause:'Pause motion',play:'Play motion',note:'Illustrated eye movement · no participant measurements',camera:'Illustration paused while eye control is active'},ml:{label:'ദൃശ്യചലനം പരിചയപ്പെടാം',horizontal:'തിരശ്ചീനം',vertical:'ലംബം',diagonal:'ഡയഗണൽ',hold:'മാറി നിൽക്കുക',pause:'ചലനം നിർത്തുക',play:'ചലനം തുടങ്ങുക',note:'ചലനത്തിന്റെ ചിത്രീകരണം മാത്രം · വ്യക്തിയുടെ അളവുകളല്ല',camera:'Eye control ഉപയോഗിക്കുമ്പോൾ ചിത്രീകരണം നിൽക്കും'}};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.research-hero .optical-hero').forEach(host=>{
 const stage=host.querySelector('[data-netra-3d]');if(!stage)return;
 const target=document.createElement('span');target.className='exhibit-target';target.setAttribute('aria-hidden','true');stage.append(target);
 const controls=document.createElement('div');controls.className='exhibit-controls';controls.innerHTML='<div class="exhibit-control-header"><span data-exhibit-label></span><button type="button" data-exhibit-play></button></div><div class="exhibit-paths" role="group"><button type="button" data-exhibit-path="horizontal"></button><button type="button" data-exhibit-path="vertical"></button><button type="button" data-exhibit-path="diagonal"></button><button type="button" data-exhibit-path="hold"></button></div><p data-exhibit-note></p>';host.append(controls);
 let path='horizontal',playing=!reduced.matches,visible=false,frame=0,last=0,elapsed=0,previous=0,owner=false;
 const lang=()=>copy[document.documentElement.lang==='ml'?'ml':'en'];
 function render(){const t=lang();controls.querySelector('[data-exhibit-label]').textContent=t.label;controls.querySelector('.exhibit-paths').setAttribute('aria-label',t.label);controls.querySelector('[data-exhibit-play]').textContent=playing?t.pause:t.play;controls.querySelector('[data-exhibit-play]').setAttribute('aria-pressed',String(playing));controls.querySelector('[data-exhibit-note]').textContent=stage.dataset.eyeControl==='on'?t.camera:t.note;controls.querySelectorAll('[data-exhibit-path]').forEach(button=>{button.textContent=t[button.dataset.exhibitPath];button.setAttribute('aria-pressed',String(button.dataset.exhibitPath===path));});host.dataset.exhibitPlaying=String(playing);}
 function point(){const phase=elapsed/1000;let x=0,y=0;const s=Math.sin(phase*.72);if(path==='horizontal')x=s*.65;if(path==='vertical')y=s*.5;if(path==='diagonal'){x=s*.55;y=s*.38;}if(path==='hold'){const points=[[-.55,-.3],[.5,.3],[0,0],[.55,-.3],[-.5,.3],[0,0]];[x,y]=points[Math.floor(phase/1.7)%points.length];}return {x,y};}
 function paint(now,force=false){const {x,y}=point();target.style.setProperty('--target-x',`${x*34}%`);target.style.setProperty('--target-y',`${y*30}%`);if(force||now-last>110){stage.dispatchEvent(new CustomEvent('netra:gaze',{detail:{x:x*.7,y:-y*.7}}));last=now;}}
 function tick(now){frame=0;if(!playing||!visible||document.hidden)return;if(stage.dataset.eyeControl==='on'||stage.dataset.eyeControl==='starting'){playing=false;target.hidden=true;render();return;}target.hidden=false;elapsed+=previous?Math.min(now-previous,80):0;previous=now;paint(now);frame=requestAnimationFrame(tick);}
 function start(){previous=0;if(playing&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);}
 function stop(){cancelAnimationFrame(frame);frame=0;previous=0;}
 const eyeActive=()=>['on','starting'].includes(stage.dataset.eyeControl);
 controls.querySelector('[data-exhibit-play]').addEventListener('click',()=>{if(eyeActive())return;playing=!playing;render();if(playing)start();else stop();});
 controls.querySelectorAll('[data-exhibit-path]').forEach(button=>button.addEventListener('click',()=>{path=button.dataset.exhibitPath;elapsed=path==='hold'?1800:1200;render();if(!eyeActive())paint(performance.now(),true);}));
 stage.addEventListener('pointerenter',()=>{if(playing){owner=true;playing=false;stop();render();target.hidden=true;}});
 stage.addEventListener('pointerleave',()=>{if(owner&&!reduced.matches&&!eyeActive()){owner=false;playing=true;render();start();}});
 new MutationObserver(()=>{if(eyeActive()){playing=false;owner=false;stop();target.hidden=true;}render();}).observe(stage,{attributes:true,attributeFilter:['data-eye-control']});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:.1}).observe(stage);
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
 reduced.addEventListener('change',()=>{playing=!reduced.matches;stop();render();start();});
 render();paint(performance.now(),true);start();
});
