/* Decorative eye controls, deliberately separate from capture and research reports. */
import {relativeIris, eyeAspectRatio, framing} from './vision-core.mjs';
export function gazeObservation(raw,width,height){
 if(!raw||!framing(raw,width,height).ok)return null;
 const p=raw.map(v=>({x:v.x*width,y:v.y*height}));
 const ear=eyeAspectRatio(p);if(ear===null||ear<.15)return null;
 const left=relativeIris(p[263],p[362],p[473]),right=relativeIris(p[33],p[133],p[468]);
 if(!left||!right)return null;
 return {x:(left.x+right.x)/2,y:(left.y+right.y)/2};
}
export class GazeSmoother{
 constructor(){this.reset();}
 reset(){this.samples=[];this.center=null;this.value={x:0,y:0};}
 observe(point){
  if(!point||!Number.isFinite(point.x)||!Number.isFinite(point.y))return null;
  if(!this.center){
   this.samples.push(point);if(this.samples.length<20)return {calibrating:true};
   const median=key=>this.samples.map(p=>p[key]).sort((a,b)=>a-b)[10];
   // Reject a calibration collected while the visitor is moving their eyes.
   if(['x','y'].some(key=>Math.max(...this.samples.map(p=>p[key]))-Math.min(...this.samples.map(p=>p[key]))>.09)){this.samples=[];return {calibrating:true};}
   this.center={x:median('x'),y:median('y')};
  }
  const clamp=n=>Math.max(-1,Math.min(1,n));
  const target={x:clamp(-(point.x-this.center.x)*7),y:clamp((point.y-this.center.y)*10)};
  for(const key of ['x','y'])this.value[key]+=(target[key]-this.value[key])*.28;
  return {...this.value,calibrating:false};
 }
}
const text={en:{summary:'Try eye control',start:'Control with my eyes',stop:'Camera off',center:'Recenter',idle:'Try eye control · camera stays off until you choose it.',loading:'Starting local eye tracking…',calibrate:'Look at the centre and hold your head still.',tracking:'Eye control active · mirrored, approximate gaze',missing:'Keep one face visible, eyes open and head level.',stopped:'Camera off · pointer control restored.',privacy:'Local camera processing. No images saved. This is an interactive illustration, not a clinical measurement.'},ml:{summary:'കണ്ണുകൾ കൊണ്ട് നിയന്ത്രിക്കാം',start:'കണ്ണുകൾ കൊണ്ട് നിയന്ത്രിക്കാം',stop:'ക്യാമറ നിർത്തുക',center:'വീണ്ടും ക്രമീകരിക്കുക',idle:'നിങ്ങൾ തിരഞ്ഞെടുക്കുമ്പോൾ മാത്രം ക്യാമറ തുറക്കും.',loading:'ഉപകരണത്തിൽ ട്രാക്കിംഗ് തുടങ്ങുന്നു…',calibrate:'മധ്യത്തിലേക്ക് നോക്കി തല അനക്കാതെ ഇരിക്കുക.',tracking:'കണ്ണുകൾ കൊണ്ട് നിയന്ത്രിക്കുന്നു · ഏകദേശ ചലനം',missing:'ഒരു മുഖം മാത്രം കാണിക്കുക. കണ്ണുകൾ തുറന്ന് തല നേരെ വയ്ക്കുക.',stopped:'ക്യാമറ നിർത്തി. ഇനി പോയിന്റർ ഉപയോഗിക്കാം.',privacy:'ഉപകരണത്തിൽ മാത്രം ക്യാമറ പ്രോസസ്സിംഗ്. ചിത്രങ്ങൾ സൂക്ഷിക്കില്ല. ഇത് ദൃശ്യാനുഭവം മാത്രം; ക്ലിനിക്കൽ അളവല്ല.'}};
function install(stage){
 const host=stage.closest('.protocol-visual')||stage.parentElement;
 const panel=document.createElement('details');panel.className='eye-control';
 panel.innerHTML='<summary data-eye-summary></summary><div class="eye-control-actions"><button type="button" data-eye-toggle aria-pressed="false"></button><button type="button" data-eye-center hidden></button></div><p data-eye-status role="status"></p><p class="eye-privacy"></p><video data-eye-video muted playsinline aria-hidden="true"></video>';
 host.append(panel);
 const toggle=panel.querySelector('[data-eye-toggle]'),center=panel.querySelector('[data-eye-center]'),status=panel.querySelector('[data-eye-status]'),video=panel.querySelector('video');
 let generation=0,running=false,starting=false,camera=null,model=null,frame=0,last=0,lastVideo=-1,state='idle';const smoother=new GazeSmoother();
 const copy=()=>text[document.documentElement.lang==='ml'?'ml':'en'];
 const publish=(x,y)=>stage.dispatchEvent(new CustomEvent('netra:gaze',{detail:{x,y}}));
 function render(){const t=copy();panel.querySelector('[data-eye-summary]').textContent=t.summary;toggle.textContent=running||starting?t.stop:t.start;toggle.setAttribute('aria-pressed',String(running||starting));center.hidden=!running;center.textContent=t.center;status.textContent=t[state]||state;panel.querySelector('.eye-privacy').textContent=t.privacy;}
 function stop(message='stopped'){
  generation++;running=false;starting=false;cancelAnimationFrame(frame);camera?.stop();camera=null;model?.close();model=null;smoother.reset();stage.dataset.eyeControl='off';publish(0,0);state=message;render();
 }
 async function start(){
  const token=++generation;starting=true;state='loading';render();stage.dataset.eyeControl='starting';
  try{
   const {loadLandmarker,CameraSession}=await import('./camera.mjs');if(token!==generation)return;
   camera=new CameraSession(video);if(!await camera.start()||token!==generation)return;
   const loaded=await loadLandmarker();if(token!==generation){loaded.close();return;}
   model=loaded;starting=false;running=true;lastVideo=-1;state='calibrate';stage.dataset.eyeControl='on';render();
   camera.stream?.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>stop()));
   function tick(now){
    if(!running||token!==generation)return;
    if(now-last>=80&&video.readyState>=2&&lastVideo!==video.currentTime){
     last=now;lastVideo=video.currentTime;
     try{
      const result=model.detectForVideo(video,now),raw=result.faceLandmarks?.length===1?result.faceLandmarks[0]:null;
      const value=smoother.observe(gazeObservation(raw,video.videoWidth,video.videoHeight));
      if(!value){state='missing';publish(0,0);}
      else if(value.calibrating){state='calibrate';}
      else{state='tracking';publish(value.x,value.y);}
      render();
     }catch{stop('Eye control could not continue. Turn the camera on to retry.');return;}
    }
    frame=requestAnimationFrame(tick);
   }
   frame=requestAnimationFrame(tick);
  }catch(error){
   if(token!==generation)return;const {cameraError}=await import('./camera.mjs');stop(cameraError(error));
  }
 }
 panel.addEventListener('toggle',()=>{if(!panel.open&&(running||starting))stop();});
 toggle.addEventListener('click',()=>running||starting?stop():start());
 center.addEventListener('click',()=>{smoother.reset();publish(0,0);state='calibrate';render();});
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 new MutationObserver(()=>{if((running||starting)&&!host.getClientRects().length)stop();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&(running||starting))stop();});
 document.addEventListener('netra:session-start',()=>stop());
 window.addEventListener('pagehide',()=>stop());render();
}
if(typeof document!=='undefined')document.querySelectorAll('.protocol-visual [data-netra-3d]').forEach(install);
