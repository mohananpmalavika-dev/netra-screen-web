import { ActiveTimer } from './vision-core.mjs';
import './offline-status.js';
const $=id=>document.getElementById(id);
let lang='en',view='exercise-home',raf=null,exercise=null;
const text=(en,ml=en)=>lang==='ml'?ml:en;
const button=(action,label,style='secondary',attrs='')=>`<button type="button" class="${style}" data-action="${action}" ${attrs}>${label}</button>`;
function heading(kicker,title,body){return `<div class="eyebrow">${kicker}</div><h1>${title}</h1><p class="lead">${body}</p>`;}
function stopWork(){cancelAnimationFrame(raf);raf=null;exercise?.timer.pause();}
function navigate(next,markup){stopWork();view=next;$('studio').innerHTML=markup;$('studio').focus({preventScroll:true});window.scrollTo(0,0);}
const ROUTINES={
  distance:{seconds:20,title:()=>text('Distance break','ദൂരക്കാഴ്ച ഇടവേള'),desc:()=>text('Look at an object about 6 metres (20 feet) away. Use this break every 20 minutes of screen work.','ഏകദേശം 6 മീറ്റർ അകലെയുള്ള വസ്തുവിൽ നോക്കുക. സ്ക്രീൻ ഉപയോഗത്തിന്റെ ഓരോ 20 മിനിറ്റിലും ഇടവേള എടുക്കുക.')},
  blink:{seconds:30,title:()=>text('Gentle blink routine','സൗമ്യമായ ചിമ്മൽ'),desc:()=>text('Close and open your eyes softly at the prompts. Never squeeze or press your eyes.','നിർദേശങ്ങൾക്കനുസരിച്ച് കണ്ണുകൾ സൗമ്യമായി അടയ്ക്കുകയും തുറക്കുകയും ചെയ്യുക. അമർത്തരുത്.')},
  rest:{seconds:60,title:()=>text('One-minute eye rest','ഒരു മിനിറ്റ് വിശ്രമം'),desc:()=>text('Put the phone down safely. Close your eyes comfortably and relax your shoulders.','ഫോൺ സുരക്ഷിതമായി വയ്ക്കുക. കണ്ണുകൾ അടച്ച് വിശ്രമിക്കുക.')},
  reminder:{seconds:1200,title:()=>text('Screen-break reminder','സ്ക്രീൻ ഇടവേള ഓർമ്മപ്പെടുത്തൽ')}
};
function exerciseHome(){
  navigate('exercise-home',`${heading('GUIDED EYE REST',text('Take a short rest for your eyes','കണ്ണുകൾക്ക് അൽപ്പനേരം വിശ്രമിക്കാം'),text('Choose a short break below and follow the timer. These exercises do not replace glasses or treatment. Stop if you feel pain, dizziness or double vision.','താഴെ ഒരു വിശ്രമം തിരഞ്ഞെടുക്കുക. സമയം ഫോൺ കാണിക്കും. ഇവ കണ്ണടയ്ക്കോ ചികിത്സയ്ക്കോ പകരമല്ല. വേദനയോ തലകറക്കമോ ഇരട്ടക്കാഴ്ചയോ തോന്നിയാൽ നിർത്തുക.'))}<div class="activity-grid">${['distance','blink','rest'].map(kind=>`<button type="button" class="activity-card" data-action="exercise-start" data-kind="${kind}"><span class="activity-icon">◷</span><span class="card-meta">${ROUTINES[kind].seconds} ${text('seconds','സെക്കൻഡ്')}</span><h2>${ROUTINES[kind].title()}</h2><p>${ROUTINES[kind].desc()}</p></button>`).join('')}</div>${button('reminder',text('Start a 20-minute break reminder','20 മിനിറ്റ് ഇടവേള ഓർമ്മപ്പെടുത്തൽ തുടങ്ങുക'))}<p>${text('Timers pause when this page is hidden. Keep it open for reminders; no background notifications are sent.','ഈ പേജ് മറഞ്ഞാൽ ടൈമർ നിൽക്കും. ഓർമ്മപ്പെടുത്തലുകൾക്കായി പേജ് തുറന്നുവയ്ക്കുക.')}</p><p class="source">${text('General screen-break and blinking guidance:','സ്ക്രീൻ ഇടവേള, ചിമ്മൽ സംബന്ധിച്ച നിർദേശങ്ങൾ:')} <a href="https://www.aao.org/eye-health/tips-prevention/computer-usage" target="_blank" rel="noopener noreferrer">American Academy of Ophthalmology</a>.</p>`);
}
function startExercise(kind){
  const r=ROUTINES[kind];
  navigate('exercise',`${heading('EYE COMFORT',r.title(),text('Settle comfortably. Use Pause whenever you need to.','സൗകര്യമായി ഇരിക്കുക. ആവശ്യമെങ്കിൽ താൽക്കാലികമായി നിർത്തുക.'))}<section class="panel exercise-panel"><div class="rest-orbit" aria-hidden="true">◉</div><div id="exerciseClock" class="exercise-clock" role="timer"></div><h2 id="exercisePrompt"></h2><p id="exerciseState" role="status" aria-live="polite"></p><div class="actions">${button('exercise-pause',text('Pause','നിർത്തുക'),'primary','id="exercisePause"')}${button('exercise-home',text('End routine','അവസാനിപ്പിക്കുക'))}</div></section>`);
  exercise={kind,timer:new ActiveTimer(r.seconds*1000),completed:false};exercise.timer.start(performance.now());exerciseLoop();
}
function exerciseLoop(){
  if(view!=='exercise')return;
  const done=exercise.timer.tick(performance.now()),remaining=Math.ceil((exercise.timer.durationMs-exercise.timer.elapsedMs)/1000);
  $('exerciseClock').textContent=`${Math.floor(remaining/60).toString().padStart(2,'0')}:${(remaining%60).toString().padStart(2,'0')}`;
  $('exercisePrompt').textContent=exercise.kind==='blink'?(Math.floor(exercise.timer.elapsedMs/3000)%2===0?text('Close gently','സൗമ്യമായി അടയ്ക്കുക'):text('Open softly','സൗമ്യമായി തുറക്കുക')):exercise.kind==='distance'?text('Look away, about 6 metres into the distance.','ഏകദേശം 6 മീറ്റർ ദൂരത്തേക്ക് നോക്കുക.'):exercise.kind==='rest'?text('Rest your eyes. Breathe comfortably.','കണ്ണുകൾക്ക് വിശ്രമം. സാവധാനം ശ്വസിക്കുക.'):text('Keep this page visible. A distance break starts when the timer ends.','ഈ പേജ് തുറന്നുവയ്ക്കുക. സമയം കഴിഞ്ഞാൽ ദൂരത്തേക്ക് നോക്കുന്ന ഇടവേള തുടങ്ങും.');
  if(done&&!exercise.completed){
    exercise.completed=true;exercise.timer.pause();if(exercise.kind==='reminder'){startExercise('distance');return;}
    $('exercisePrompt').textContent=text('Routine timer complete','വിശ്രമ സമയം പൂർത്തിയായി');$('exerciseState').textContent=text('Timer completion does not measure improvement in vision.','ഇത് സമയം പൂർത്തിയായത് മാത്രമാണ്; കാഴ്ച മെച്ചപ്പെട്ടതിന്റെ അളവല്ല.');$('exercisePause').disabled=true;return;
  }
  if(exercise.timer.running)raf=requestAnimationFrame(exerciseLoop);
}

document.addEventListener('click',event=>{
  const b=event.target.closest('[data-action]');if(!b||b.disabled)return;
  if(b.dataset.action==='exercise-home')exerciseHome();
  else if(b.dataset.action==='exercise-start'&&['distance','blink','rest'].includes(b.dataset.kind))startExercise(b.dataset.kind);
  else if(b.dataset.action==='reminder')startExercise('reminder');
  else if(b.dataset.action==='exercise-pause'&&view==='exercise'&&exercise&&!exercise.completed){
    if(exercise.timer.running){exercise.timer.pause();cancelAnimationFrame(raf);b.textContent=text('Resume','തുടരുക');$('exerciseState').textContent=text('Paused','നിർത്തി');}
    else{exercise.timer.start(performance.now());b.textContent=text('Pause','നിർത്തുക');$('exerciseState').textContent='';exerciseLoop();}
  }
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&view==='exercise'&&exercise?.timer.running){stopWork();$('exercisePause').textContent=text('Resume','തുടരുക');$('exerciseState').textContent=text('Paused while page was hidden.','പേജ് മറഞ്ഞതിനാൽ നിർത്തി.');}
});
window.addEventListener('pagehide',stopWork);
$('studioHome').addEventListener('click',exerciseHome);
$('studioLang').addEventListener('click',()=>{lang=lang==='en'?'ml':'en';document.documentElement.lang=lang;$('studioLang').textContent=lang==='en'?'മലയാളം':'English';exerciseHome();});
exerciseHome();
