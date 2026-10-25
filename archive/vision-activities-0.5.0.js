import { VERSION, AcuityRun, ACUITY_LEVELS, DIRECTIONS, ActiveTimer, BlinkTracker, eyeAspectRatio, framing, optotypePixels, randomIndex } from './vision-core.mjs';
import { CameraSession, cameraError, loadLandmarker } from './camera.mjs';
import './offline-status.js';
const $ = id => document.getElementById(id);
let lang='en',view='home',generation=0,raf=null,camera=null,model=null;
let acuity=null,expected=null,calibration=null,task=null,exercise=null,monitor=null;
let report=freshReport(),viewedReport=null,saveEnabled=false;
const HISTORY_KEY='netra-wellness-reports-v1';
const text=(en,ml=en)=>lang==='ml'?ml:en;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,style='secondary',attrs='')=>`<button type="button" class="${style}" data-action="${action}" ${attrs}>${label}</button>`;
function freshReport(){return {schemaVersion:1,appVersion:VERSION,id:crypto.randomUUID(),createdAt:new Date().toISOString(),source:'personal-wellness',clinicalClassification:null,acuity:{},contrast:null,color:null,grid:[],exercises:[],monitor:null};}
function status(message){$('studioStatus').textContent=message;$('studioStatus').hidden=!message;}
function stopWork(){
  generation++;cancelAnimationFrame(raf);raf=null;camera?.stop();camera=null;
  exercise?.timer.pause();
  if(monitor)report.monitor={...monitor.tracker.summary(),stoppedAt:new Date().toISOString()};
  monitor=null;expected=null;
}
function navigate(next,markup){stopWork();view=next;viewedReport=null;$('studio').innerHTML=markup;$('studio').focus({preventScroll:true});window.scrollTo(0,0);}
function heading(kicker,title,body){return `<div class="eyebrow">${kicker}</div><h1>${title}</h1><p class="lead">${body}</p>`;}
const limitation=()=>`<aside class="scope">${text('These activities cannot tell whether your eyes are healthy or whether you need glasses. For vision problems or lasting discomfort, see an eye doctor.','ഇവയിലൂടെ കണ്ണുകൾക്ക് രോഗമില്ലെന്നോ കണ്ണട വേണമെന്നോ ഉറപ്പിക്കാൻ കഴിയില്ല. കാഴ്ചയിൽ പ്രശ്നമോ മാറാത്ത അസ്വസ്ഥതയോ ഉണ്ടെങ്കിൽ കണ്ണ് ഡോക്ടറെ കാണുക.')}</aside>`;
function home(){
  const cards=[
    ['exercise-home','◷',text('Rest and exercise your eyes','കണ്ണുകൾക്ക് വിശ്രമവും വ്യായാമവും'),text('Look into the distance, blink gently, or close your eyes for a short rest. Follow the timer.','ദൂരത്തേക്ക് നോക്കാം, പതുക്കെ കണ്ണുചിമ്മാം, അല്ലെങ്കിൽ കണ്ണടച്ച് അൽപ്പനേരം വിശ്രമിക്കാം. സമയം ഫോൺ കാണിക്കും.'),text('1–2 minutes · No camera needed','1–2 മിനിറ്റ് · ക്യാമറ വേണ്ട')],
    ['acuity','↗',text('Find the letter’s direction','അക്ഷരത്തിന്റെ ദിശ കണ്ടെത്താം'),text('Cover one eye. Look at the letter E and tap whether it points up, down, left or right.','ഒരു കണ്ണ് മൂടുക. E എന്ന അക്ഷരം മുകളിലേക്കോ താഴേക്കോ ഇടത്തേക്കോ വലത്തേക്കോ എന്ന് നോക്കി അമർത്തുക.'),text('Try each eye separately','ഓരോ കണ്ണും പ്രത്യേകം ഉപയോഗിക്കുക')],
    ['grid','▦',text('Look at straight lines','നേരെയുള്ള വരകൾ നോക്കാം'),text('Cover one eye and look at the middle dot. Notice if any lines look bent, blurred or missing.','ഒരു കണ്ണ് മൂടി നടുവിലെ കുത്തിൽ നോക്കുക. വരകൾ വളഞ്ഞോ മങ്ങിയോ കാണാതെയോ തോന്നുന്നുണ്ടോ എന്ന് ശ്രദ്ധിക്കുക.'),text('One eye at a time · No camera','ഓരോ കണ്ണും പ്രത്യേകം · ക്യാമറ വേണ്ട')],
    ['contrast','◐',text('See a fading letter','മങ്ങുന്ന അക്ഷരം കാണാമോ?'),text('The letter gets lighter. Tap the direction it points. Choose “Cannot see” when you are unsure.','അക്ഷരം പതിയെ മങ്ങും. അത് ഏത് ദിശയിലാണെന്ന് അമർത്തുക. വ്യക്തമല്ലെങ്കിൽ “കാണാനാകുന്നില്ല” തിരഞ്ഞെടുക്കുക.'),text('20 turns · No camera needed','20 തവണ · ക്യാമറ വേണ്ട')],
    ['color','◉',text('Match the colors','ഒരേ നിറം തിരഞ്ഞെടുക്കാം'),text('Look at the color in the middle. Tap the box below that has the same color.','നടുവിലുള്ള നിറം നോക്കുക. താഴെയുള്ള പെട്ടികളിൽ അതേ നിറമുള്ളതിൽ അമർത്തുക.'),text('12 turns · No camera needed','12 തവണ · ക്യാമറ വേണ്ട')],
    ['monitor','⌁',text('Watch your blinking','എത്ര തവണ കണ്ണുചിമ്മുന്നു?'),text('Look at the phone and blink normally. The camera estimates how often you blink.','ഫോണിലേക്ക് നോക്കി പതിവുപോലെ കണ്ണുചിമ്മുക. എത്ര തവണ ചിമ്മുന്നു എന്ന് ക്യാമറ ഏകദേശം കണക്കാക്കും.'),text('Uses the camera · No video saved','ക്യാമറ ഉപയോഗിക്കും · വീഡിയോ സൂക്ഷിക്കില്ല')],
    ['dial','☼',text('Compare the lines','വരകൾ തമ്മിൽ താരതമ്യം ചെയ്യാം'),text('Look at the round pattern with one eye. Notice whether some lines look darker or blurrier than others.','ഒരു കണ്ണ് ഉപയോഗിച്ച് വട്ടത്തിലുള്ള വരകൾ നോക്കുക. ചില വരകൾ കൂടുതൽ ഇരുണ്ടോ മങ്ങിയോ തോന്നുന്നുണ്ടോ എന്ന് ശ്രദ്ധിക്കുക.'),text('Just look · No camera needed','നോക്കാൻ മാത്രം · ക്യാമറ വേണ്ട')],
    ['duochrome','◒',text('Compare red and green','ചുവപ്പും പച്ചയും താരതമ്യം ചെയ്യാം'),text('Look at the same letters on red and green backgrounds. This cannot tell you your glasses power.','ചുവപ്പിലും പച്ചയിലുമുള്ള ഒരേ അക്ഷരങ്ങൾ നോക്കുക. ഇതിലൂടെ കണ്ണടയുടെ പവർ അറിയാനാവില്ല.'),text('Just look · No camera needed','നോക്കാൻ മാത്രം · ക്യാമറ വേണ്ട')],
    ['tracking','↔',text('Back to the YIP research tool','YIP ഗവേഷണത്തിലേക്ക് മടങ്ങാം'),text('Follow the moving target while the camera records eye movement for the main research project.','പ്രധാന ഗവേഷണത്തിനായി ക്യാമറ കണ്ണിന്റെ ചലനം രേഖപ്പെടുത്തുമ്പോൾ ചലിക്കുന്ന ലക്ഷ്യത്തെ നോക്കുക.'),text('Main research project','പ്രധാന ഗവേഷണ പ്രോജക്ട്')]
  ];
  navigate('home',`${heading('ADDITIONAL EYE-CARE TOOLS',text('Eye exercises and simple vision checks','കണ്ണുകൾക്ക് വ്യായാമവും ലളിതമായ കാഴ്ച പരിശോധനകളും'),text('Rest your eyes, try a simple activity, or see how often you blink. Choose one below. These are extra tools alongside our YIP research project.','കണ്ണുകൾക്ക് വിശ്രമം നൽകാം, ലളിതമായ കാഴ്ച പ്രവർത്തനങ്ങൾ ചെയ്യാം, എത്ര തവണ കണ്ണുചിമ്മുന്നു എന്ന് നോക്കാം. താഴെ ഒന്ന് തിരഞ്ഞെടുക്കുക. ഇവ YIP ഗവേഷണത്തിനൊപ്പമുള്ള അധിക ഉപകരണങ്ങളാണ്.'))}${limitation()}
    <div class="activity-grid">${cards.map(([action,icon,title,desc,meta],i)=>`<button type="button" class="activity-card tone-${i%4}" data-action="${action}"><span class="activity-icon" aria-hidden="true">${icon}</span><span class="card-meta">${meta}</span><h2>${title}</h2><p>${desc}</p><span class="card-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>
    <section class="panel report-strip"><div><h2>${text('Your session','ഈ സെഷൻ')}</h2><p>${text('Results stay in memory unless you explicitly save a summary.','സംഗ്രഹം സൂക്ഷിക്കാൻ തിരഞ്ഞെടുത്താൽ മാത്രമേ ഫലങ്ങൾ സംഭരിക്കൂ.')}</p></div>${button('report',text('View summary','സംഗ്രഹം കാണുക'),'primary')}${button('new-session',text('Clear session','സെഷൻ മായ്ക്കുക'))}</section>
    <aside class="urgent">${text('Sudden loss of vision, severe eye pain, new flashes, many new floaters, or a curtain over your vision need urgent medical care. Do not delay care to use these tools.','പെട്ടെന്നുള്ള കാഴ്ച നഷ്ടം, കടുത്ത കണ്ണുവേദന, പുതിയ മിന്നലുകൾ, ധാരാളം പുതിയ കറുത്ത പുള്ളികൾ, കാഴ്ചയിൽ തിരശ്ശീല എന്നിവയ്ക്ക് അടിയന്തര ചികിത്സ തേടുക.')}</aside>`);
}
function directions(){return `<div class="direction-pad" aria-label="Symbol direction">${DIRECTIONS.map((d,i)=>button('direction',['→','↓','←','↑'][i],'direction',`data-direction="${d}" aria-label="${d.toLowerCase()}"`)).join('')}${button('cant-see',text('Cannot see / unsure','കാണാനാകുന്നില്ല / ഉറപ്പില്ല'))}</div>`;}
function symbol(size,direction,fill='#111111'){
  return `<svg class="optotype" aria-label="Direction symbol" width="${size}" height="${size}" viewBox="0 0 5 5" style="transform:rotate(${DIRECTIONS.indexOf(direction)*90}deg)" shape-rendering="crispEdges"><path d="M0 0H5V1H1V2H5V3H1V4H5V5H0Z" fill="${fill}"/></svg>`;
}
function calibrationValid(){return calibration&&calibration.width===innerWidth&&calibration.scale===(window.visualViewport?.scale||1)&&calibration.pixelRatio===devicePixelRatio&&calibration.angle===(screen.orientation?.angle||0);}
function acuityScreen(){
  navigate('acuity',`${heading('VISUAL TASK',text('Which way does the E point?','E ഏത് ദിശയിലേക്കാണ്?'),text('Wear your usual near glasses. Cover one eye gently without pressure. Keep a steady distance in even light; tap the direction of the symbol’s prongs.','പതിവ് വായനക്കണ്ണട ധരിക്കുക. ഒരു കണ്ണ് അമർത്താതെ മൂടുക. ഒരേ ദൂരം പാലിച്ച് ചിഹ്നത്തിന്റെ ദിശ തിരഞ്ഞെടുക്കുക.'))}
    <section class="panel"><h2>${text('Set the letter size and phone distance','അക്ഷരത്തിന്റെ വലുപ്പവും ഫോണിന്റെ ദൂരവും ക്രമീകരിക്കാം')}</h2><p>${text('Without physical size calibration this is practice only. Match the line below to the short edge of a standard bank card (53.98 mm), or a 53.98 mm span on a ruler. No card details are collected.','വലുപ്പം ക്രമീകരിക്കാതെ ഇത് പരിശീലനം മാത്രമാണ്. താഴെയുള്ള രേഖ സാധാരണ ബാങ്ക് കാർഡിന്റെ ചെറിയ അരികിനോട് (53.98 മി.മീ.) പൊരുത്തപ്പെടുത്തുക. കാർഡ് വിവരങ്ങൾ ശേഖരിക്കില്ല.')}</p>
    <div class="calibration-box"><div id="calibrationLine" style="width:200px"></div></div><label>${text('Line width','രേഖയുടെ വീതി')}<input id="calibrationWidth" type="range" min="80" max="${Math.min(600,innerWidth-80)}" value="200"></label>
    <label>${text('Measured eye-to-screen distance (cm)','കണ്ണിൽ നിന്ന് സ്ക്രീനിലേക്കുള്ള അളന്ന ദൂരം (സെ.മീ.)')}<input id="viewDistance" type="number" min="25" max="100" value="40" inputmode="decimal"></label>
    <p>${text('Keep this measured distance throughout. Do not zoom or rotate. A near angular equivalent is not a distance eye-chart result.','പരിശോധനയിലുടനീളം അളന്ന ദൂരം പാലിക്കുക. ശേഷം സൂം ചെയ്യുകയോ ഫോൺ തിരിക്കുകയോ അരുത്.')}</p>${button('calibrate',text('Confirm size and measured distance','വലുപ്പവും അളന്ന ദൂരവും സ്ഥിരീകരിക്കുക'),'primary')}<p id="calibrationStatus" role="status">${text('Practice mode · no calibrated score','പരിശീലനം · അളവുകൾ ക്രമീകരിച്ചിട്ടില്ല')}</p></section>
    <section class="panel"><div class="segmented">${button('acuity-eye',text('Right eye · cover left','വലത് കണ്ണ് · ഇടത് മൂടുക'),'secondary','data-eye="OD"')}${button('acuity-eye',text('Left eye · cover right','ഇടത് കണ്ണ് · വലത് മൂടുക'),'secondary','data-eye="OS"')}</div><p id="acuityProgress" aria-live="polite"></p><div class="symbol-stage" id="acuitySymbol"></div>${directions()}<p id="acuityResult" role="status"></p></section>${button('report',text('View summary','സംഗ്രഹം കാണുക'))}`);
  calibration=null;startAcuity('OD');
}
function startAcuity(eye){acuity=new AcuityRun(eye);delete report.acuity[eye];$('acuityResult').textContent='';document.querySelectorAll('[data-eye]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eye===eye)));nextAcuity();}
function nextAcuity(){
  if(acuity.done){
    expected=null;const calibrated=calibrationValid();const result={...acuity.result(),calibrated:!!calibrated,calibration:calibrated?{...calibration}:null};
    if(!calibrated)result.angularEquivalent=null;report.acuity[acuity.eye]=result;$('acuitySymbol').textContent='✓';
    $('acuityResult').textContent=calibrated?`${acuity.eye}: ${result.angularEquivalent?`Near angular equivalent ${result.angularEquivalent}`:'Largest level not passed'}. Unvalidated self-check; not a prescription.`:text('Practice complete. No acuity grade is assigned without calibration.','പരിശീലനം പൂർത്തിയായി. ക്രമീകരണമില്ലാതെ കാഴ്ച ഗ്രേഡ് നൽകില്ല.');
    $('acuityProgress').textContent=text('Complete · choose the other eye to continue','പൂർത്തിയായി · മറ്റേ കണ്ണ് തിരഞ്ഞെടുക്കുക');return;
  }
  expected=DIRECTIONS[randomIndex(4)];const calibrated=calibrationValid();
  const size=calibrated?optotypePixels(ACUITY_LEVELS[acuity.level],calibration.distanceCm*10,calibration.pixelsPerMm):80-acuity.level*9;
  if(size<5&&acuity.passed){acuity.done=true;acuity.stopReason='display-resolution-limit';nextAcuity();$('acuityResult').textContent+=' Screen resolution limit reached; smaller symbols were not tested.';return;}
  if(size<5||size>$('acuitySymbol').clientWidth-32){expected=null;$('acuitySymbol').textContent=text('This level cannot be displayed reliably.','ഈ തലത്തിലെ ചിഹ്നം വിശ്വസനീയമായി കാണിക്കാനാവില്ല.');$('acuityResult').textContent='Change the measured distance and recalibrate. No result was saved.';return;}
  $('acuitySymbol').innerHTML=symbol(size,expected);$('acuityProgress').textContent=`${acuity.eye} · ${text('Level','തലം')} ${acuity.level+1}/7 · ${text('Turn','തവണ')} ${acuity.responses.length%5+1}/5 · ${calibrated?text('Calibrated','ക്രമീകരിച്ചു'):text('Practice','പരിശീലനം')}`;
}
function gridScreen(eye='OD'){
  navigate('grid',`${heading('CENTRAL VISION AID',text('Look at straight lines','നേരെയുള്ള വരകൾ നോക്കാം'),text('Wear reading glasses if normally used. Hold the phone about 30–35 cm away. Cover the other eye without pressure and keep looking at the center dot, rather than scanning the lines.','പതിവ് വായനക്കണ്ണട ധരിക്കുക. ഫോൺ ഏകദേശം 30–35 സെ.മീ. അകലെ പിടിക്കുക. മറ്റേ കണ്ണ് അമർത്താതെ മൂടി മധ്യബിന്ദുവിൽ നോക്കുക.'))}<section class="panel"><h2>${eye==='OD'?text('Right eye · cover left','വലത് കണ്ണ് · ഇടത് മൂടുക'):text('Left eye · cover right','ഇടത് കണ്ണ് · വലത് മൂടുക')}</h2><p>${text('Notice whether lines look bent, missing, blurred, or different from usual while keeping the dot in view. Contact your eye professional promptly for new changes. Completing this view does not establish normal vision.','മധ്യബിന്ദുവിൽ നോക്കുമ്പോൾ രേഖകൾ വളഞ്ഞതോ മങ്ങിയതോ കാണാതായതോ ആയി തോന്നുന്നുണ്ടെങ്കിൽ ശ്രദ്ധിക്കുക. പുതിയ മാറ്റങ്ങൾക്ക് നേത്രവിദഗ്ധനെ ഉടൻ ബന്ധപ്പെടുക.')}</p><div class="amsler-grid" role="img" aria-label="Square grid with central fixation dot"><span></span></div><div class="actions">${button('grid-next',eye==='OD'?text('Continue with left eye','ഇടത് കണ്ണിലേക്ക് തുടരുക'):text('Finish viewing','പൂർത്തിയാക്കുക'),'primary',`data-eye="${eye}"`)}</div><p>${text('Viewing aid only. No symptom answers or disease score are recorded.','കാണാനുള്ള സഹായം മാത്രം. ലക്ഷണങ്ങളെക്കുറിച്ചുള്ള ഉത്തരങ്ങളോ രോഗസ്കോറോ രേഖപ്പെടുത്തില്ല.')}</p></section>${limitation()}`);
}
function taskScreen(kind){
  const contrast=kind==='contrast';
  navigate(kind,`${heading('PHONE-ONLY ACTIVITY',contrast?text('Which way does the fading letter point?','മങ്ങുന്ന അക്ഷരം ഏത് ദിശയിലേക്കാണ്?'):text('Match the colors','ഒരേ നിറം തിരഞ്ഞെടുക്കാം'),contrast?text('Tap the prong direction of each symbol. Keep screen brightness comfortable and constant.','ഓരോ ചിഹ്നത്തിന്റെയും ദിശ തിരഞ്ഞെടുക്കുക. സ്ക്രീൻ തെളിച്ചം ഒരേ നിലയിൽ സൂക്ഷിക്കുക.'):text('Tap the tile that exactly matches the center color. Screen settings affect this activity.','മധ്യത്തിലെ നിറവുമായി കൃത്യമായി ചേരുന്ന ടൈൽ തിരഞ്ഞെടുക്കുക.'))}<section class="panel"><p>${text('Turn off night mode, color filters and automatic brightness changes. This unvalidated display task does not detect color blindness or measure clinical contrast sensitivity.','നൈറ്റ് മോഡും കളർ ഫിൽട്ടറുകളും സ്വയമേവ തെളിച്ചം മാറ്റലും ഓഫാക്കുക. ഇത് വർണ്ണാന്ധത കണ്ടെത്തുകയോ ക്ലിനിക്കൽ കോൺട്രാസ്റ്റ് അളക്കുകയോ ചെയ്യുന്നില്ല.')}</p><p id="taskProgress" aria-live="polite"></p><div id="taskStage" class="${contrast?'symbol-stage':'color-stage'}"></div>${contrast?directions():''}<p id="taskResult" role="status"></p>${button('report',text('View summary','സംഗ്രഹം കാണുക'))}</section>`);
  task={kind,responses:[],total:contrast?20:12,expected:null};report[kind]=null;nextTask();
}
function nextTask(){
  const n=task.responses.length;
  if(n===task.total){expected=null;task.expected=null;report[task.kind]={completed:true,correct:task.responses.filter(r=>r.correct).length,total:task.total,trials:task.responses,clinicalInterpretation:null};$('taskStage').textContent='✓';$('taskProgress').textContent=text('Activity complete','പ്രവർത്തനം പൂർത്തിയായി');$('taskResult').textContent=`${report[task.kind].correct}/${task.total} ${text('matches. No clinical interpretation is assigned.','പൊരുത്തങ്ങൾ. ക്ലിനിക്കൽ വ്യാഖ്യാനമില്ല.')}`;return;}
  $('taskProgress').textContent=`${text('Turn','തവണ')} ${n+1}/${task.total}`;
  if(task.kind==='contrast'){
    task.contrast=[1,0.5,0.25,0.1][Math.floor(n/5)];const shade=Math.round(255*(1-task.contrast));expected=DIRECTIONS[randomIndex(4)];$('taskStage').innerHTML=symbol(100,expected,`rgb(${shade},${shade},${shade})`);
  }else{
    const palette=['#cf6374','#63aeb2','#c5ab67','#8b82c4','#b68d6c','#7f9a77','#ca83a1','#7396c1'],start=randomIndex(8);
    const options=[0,2,4,6].map(i=>palette[(start+i)%8]);task.expected=randomIndex(4);
    $('taskStage').innerHTML=`<div class="color-target" style="background:${options[task.expected]}" role="img" aria-label="Target color"></div><div class="color-options">${options.map((c,i)=>`<button type="button" style="background:${c}" data-action="color-answer" data-choice="${i}" aria-label="Tile ${i+1}"></button>`).join('')}</div>`;
  }
}
function chartScreen(kind){
  const dial=kind==='dial';
  const chart=dial?`<svg viewBox="0 0 320 320" class="dial-chart" role="img" aria-label="Radial line chart">${Array.from({length:12},(_,i)=>{const r=i*Math.PI/12;return [-2,0,2].map(k=>`<line x1="${160+Math.cos(r)*130-Math.sin(r)*k}" y1="${160+Math.sin(r)*130+Math.cos(r)*k}" x2="${160-Math.cos(r)*130-Math.sin(r)*k}" y2="${160-Math.sin(r)*130+Math.cos(r)*k}"/>`).join('');}).join('')}</svg>`:'<div class="duochrome-chart" role="img" aria-label="Black letters on red and green backgrounds"><div>H E N<br>O X Z</div><div>H E N<br>O X Z</div></div>';
  navigate(kind,`${heading('EDUCATIONAL VISUAL AID',dial?text('Compare the lines','വരകൾ തമ്മിൽ താരതമ്യം ചെയ്യാം'):text('Compare red and green','ചുവപ്പും പച്ചയും താരതമ്യം ചെയ്യാം'),text('Use your usual glasses and view one eye at a time in even light.','പതിവ് കണ്ണട ഉപയോഗിച്ച് നല്ല വെളിച്ചത്തിൽ ഓരോ കണ്ണും പ്രത്യേകം ഉപയോഗിക്കുക.'))}<section class="panel">${chart}<p>${dial?text('All lines have the same stroke weight. If some appear consistently darker or blurrier, arrange an eye examination. This chart cannot determine astigmatism, its axis, or a prescription.','എല്ലാ രേഖകൾക്കും ഒരേ കനമാണ്. ചിലത് സ്ഥിരമായി ഇരുണ്ടതോ മങ്ങിയതോ ആയി തോന്നുന്നെങ്കിൽ നേത്രപരിശോധന നടത്തുക. ഈ ചാർട്ട് രോഗമോ കണ്ണടയുടെ പവറോ നിർണയിക്കില്ല.'):text('Compare identical letters. This uncalibrated chart cannot determine myopia, hyperopia, or glasses power. Do not change your prescription based on it.','ഒരേ അക്ഷരങ്ങൾ താരതമ്യം ചെയ്യുക. ഈ ചാർട്ടിന് കണ്ണടയുടെ പവർ നിർണയിക്കാനാവില്ല. ഇതിന്റെ അടിസ്ഥാനത്തിൽ കണ്ണട മാറ്റരുത്.')}</p>${button('home',text('Done viewing','കണ്ടുകഴിഞ്ഞു'),'primary')}</section>${limitation()}`);
}
const ROUTINES={
  distance:{seconds:20,title:()=>text('Distance break','ദൂരക്കാഴ്ച ഇടവേള'),desc:()=>text('Look at an object about 6 metres (20 feet) away. Use this break every 20 minutes of screen work.','ഏകദേശം 6 മീറ്റർ അകലെയുള്ള വസ്തുവിൽ നോക്കുക. സ്ക്രീൻ ഉപയോഗത്തിന്റെ ഓരോ 20 മിനിറ്റിലും ഇടവേള എടുക്കുക.')},
  blink:{seconds:30,title:()=>text('Gentle blink routine','സൗമ്യമായ ചിമ്മൽ'),desc:()=>text('Close and open your eyes softly at the prompts. Never squeeze or press your eyes.','നിർദേശങ്ങൾക്കനുസരിച്ച് കണ്ണുകൾ സൗമ്യമായി അടയ്ക്കുകയും തുറക്കുകയും ചെയ്യുക. അമർത്തരുത്.')},
  rest:{seconds:60,title:()=>text('One-minute eye rest','ഒരു മിനിറ്റ് വിശ്രമം'),desc:()=>text('Put the phone down safely. Close your eyes comfortably and relax your shoulders.','ഫോൺ സുരക്ഷിതമായി വയ്ക്കുക. കണ്ണുകൾ അടച്ച് വിശ്രമിക്കുക.')},
  reminder:{seconds:1200,title:()=>text('Screen-break reminder','സ്ക്രീൻ ഇടവേള ഓർമ്മപ്പെടുത്തൽ')}
};
function exerciseHome(){
  navigate('exercise-home',`${heading('GUIDED EYE EXERCISES',text('Take a short rest for your eyes','കണ്ണുകൾക്ക് അൽപ്പനേരം വിശ്രമിക്കാം'),text('Gentle comfort routines with a timer. Exercises do not correct refractive errors or replace prescribed vision therapy. Stop for pain, dizziness, or double vision.','ടൈമറോടുകൂടിയ സൗമ്യമായ വിശ്രമം. വ്യായാമങ്ങൾ കണ്ണടയുടെ ആവശ്യം മാറ്റുകയില്ല. വേദനയോ തലകറക്കമോ ഇരട്ടക്കാഴ്ചയോ തോന്നിയാൽ നിർത്തുക.'))}<div class="activity-grid">${['distance','blink','rest'].map(kind=>`<button type="button" class="activity-card" data-action="exercise-start" data-kind="${kind}"><span class="activity-icon">◷</span><span class="card-meta">${ROUTINES[kind].seconds} seconds</span><h2>${ROUTINES[kind].title()}</h2><p>${ROUTINES[kind].desc()}</p></button>`).join('')}</div>${button('reminder',text('Start a 20-minute break reminder','20 മിനിറ്റ് ഇടവേള ഓർമ്മപ്പെടുത്തൽ തുടങ്ങുക'))}<p>${text('Timers pause when this page is hidden. Keep it open for reminders; no background notifications are sent.','ഈ പേജ് മറഞ്ഞാൽ ടൈമർ നിൽക്കും. ഓർമ്മപ്പെടുത്തലുകൾക്കായി പേജ് തുറന്നുവയ്ക്കുക.')}</p><p class="source">${text('General screen-break and blinking guidance:','സ്ക്രീൻ ഇടവേള, ചിമ്മൽ സംബന്ധിച്ച നിർദേശങ്ങൾ:')} <a href="https://www.aao.org/eye-health/tips-prevention/computer-usage" target="_blank" rel="noopener noreferrer">American Academy of Ophthalmology</a>.</p>`);
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
    report.exercises.push({kind:exercise.kind,durationSeconds:exercise.timer.durationMs/1000,timerCompletedAt:new Date().toISOString(),participationVerified:false});
    $('exercisePrompt').textContent=text('Routine timer complete','വിശ്രമ സമയം പൂർത്തിയായി');$('exerciseState').textContent=text('Timer completion does not measure improvement in vision.','ഇത് സമയം പൂർത്തിയായത് മാത്രമാണ്; കാഴ്ച മെച്ചപ്പെട്ടതിന്റെ അളവല്ല.');$('exercisePause').disabled=true;return;
  }
  if(exercise.timer.running)raf=requestAnimationFrame(exerciseLoop);
}
function monitorScreen(){
  navigate('monitor',`${heading('ON-DEVICE CAMERA',text('Watch your blinking','എത്ര തവണ കണ്ണുചിമ്മുന്നു?'),text('Face the screen in even light. Keep your eyes visible and blink naturally.','നല്ല വെളിച്ചത്തിൽ സ്ക്രീനിലേക്ക് നോക്കുക. കണ്ണുകൾ വ്യക്തമായി കാണണം. സ്വാഭാവികമായി ചിമ്മുക.'))}<section class="panel"><label class="check-row"><input id="cameraConsent" type="checkbox" checked>${text('I agree to local camera processing. No camera images are stored or uploaded. A guardian should supervise children.','പ്രാദേശിക ക്യാമറ പ്രോസസ്സിംഗിന് സമ്മതിക്കുന്നു. ചിത്രങ്ങൾ സംഭരിക്കുകയോ അപ്‌ലോഡ് ചെയ്യുകയോ ഇല്ല. കുട്ടികളെ രക്ഷിതാവ് മേൽനോട്ടം വഹിക്കണം.')}</label><div class="actions">${button('monitor-start',text('Start camera','ക്യാമറ തുടങ്ങുക'),'primary','id="monitorStart"')}${button('monitor-stop',text('Stop camera','ക്യാമറ നിർത്തുക'))}${button('report',text('Finish & view summary','പൂർത്തിയാക്കി സംഗ്രഹം കാണുക'))}</div><p id="monitorStatus" role="status" aria-live="polite">${text('Camera is off.','ക്യാമറ ഓഫാണ്.')}</p><video id="monitorVideo" playsinline autoplay muted aria-label="Local camera preview"></video><div class="monitor-metrics"><div><span id="blinkValue">—</span><small>Estimated blinks per minute</small></div><div><span id="blinkCount">—</span><small>Blinks counted</small></div><div><span id="observedTime">0s</span><small>Time with eyes in view</small></div></div><canvas id="blinkWave" width="640" height="120" role="img" aria-label="Eye aperture waveform"></canvas><p>${text('Keep your eyes naturally open for baseline setup. A rate appears after 15 seconds of usable observation. Face loss pauses measurement. This landmark estimate cannot diagnose dry eye, incomplete blinks or eye strain. Face framing is not a distance measurement in centimetres.','ആദ്യം കണ്ണുകൾ സ്വാഭാവികമായി തുറന്നുവയ്ക്കുക. ഉപയോഗിക്കാവുന്ന 15 സെക്കൻഡ് കഴിഞ്ഞാൽ നിരക്ക് കാണിക്കും. മുഖം കാണാതായാൽ അളക്കൽ നിൽക്കും. ഇത് കണ്ണിന്റെ രോഗങ്ങൾ നിർണയിക്കില്ല.')}</p></section>${limitation()}`);
}
async function startMonitor(){
  if(!$('cameraConsent').checked){status(text('Please agree to local camera processing before starting.','ക്യാമറ തുടങ്ങുന്നതിന് മുമ്പ് സമ്മതം നൽകുക.'));return;}
  stopWork();const token=generation,video=$('monitorVideo');camera=new CameraSession(video);const sessionCamera=camera;
  $('monitorStart').disabled=true;$('monitorStatus').textContent=text('Starting offline model and camera…','ക്യാമറയും മോഡലും തുടങ്ങുന്നു…');status('');
  try{
    if(!model){const loaded=await loadLandmarker();if(token!==generation){loaded.close();return;}model=loaded;}
    if(token!==generation||!await sessionCamera.start())return;
    if(token!==generation){sessionCamera.stop();return;}
    monitor={tracker:new BlinkTracker(),lastVideo:-1,lastDetect:performance.now(),wave:[]};report.monitor=null;
    video.srcObject.getVideoTracks().forEach(track=>track.addEventListener('ended',()=>{if(token===generation){stopWork();$('monitorStatus').textContent='Camera stopped. Start again to resume.';$('monitorStart').disabled=false;}}));monitorLoop();
  }catch(error){if(token!==generation)return;stopWork();status(cameraError(error));$('monitorStatus').textContent=text('Camera is off. No measurement was generated.','ക്യാമറ ഓഫാണ്. അളവുകൾ സൃഷ്ടിച്ചിട്ടില്ല.');}
  finally{if(view==='monitor'&&(token===generation||!camera))$('monitorStart').disabled=false;}
}
function monitorLoop(){
  if(!monitor||view!=='monitor')return;const now=performance.now(),video=$('monitorVideo');
  if(video.readyState>=2&&video.currentTime!==monitor.lastVideo&&now-monitor.lastDetect>=65){
    monitor.lastVideo=video.currentTime;monitor.lastDetect=now;
    try{
      const results=model.detectForVideo(video,now),raw=results.faceLandmarks?.length===1?results.faceLandmarks[0]:null;
      const quality=framing(raw,video.videoWidth,video.videoHeight),p=raw?.map(p=>({x:p.x*video.videoWidth,y:p.y*video.videoHeight}));
      const ear=quality.ok?eyeAspectRatio(p):null;
      if(ear!==null){monitor.tracker.observe(ear,now);$('monitorStatus').textContent=monitor.tracker.summary().calibrated?text('Observing · face framing accepted','നിരീക്ഷിക്കുന്നു · മുഖത്തിന്റെ സ്ഥാനം ശരിയാണ്'):text('Setting baseline · blink naturally','ക്രമീകരിക്കുന്നു · സ്വാഭാവികമായി ചിമ്മുക');monitor.wave.push(ear);}
      else{monitor.tracker.gap();monitor.wave.push(null);$('monitorStatus').textContent=text('Measurement paused · show one face, level head, both eyes visible.','അളക്കൽ നിർത്തി · ഒരു മുഖവും രണ്ട് കണ്ണുകളും വ്യക്തമായി കാണിക്കുക.');}
      monitor.wave=monitor.wave.slice(-160);const summary=monitor.tracker.summary();$('blinkValue').textContent=summary.blinksPerMinute??'—';$('blinkCount').textContent=summary.blinks;$('observedTime').textContent=`${summary.observedSeconds}s`;
      const ctx=$('blinkWave').getContext('2d');ctx.clearRect(0,0,640,120);ctx.strokeStyle='#6ee7b7';ctx.lineWidth=2;ctx.beginPath();monitor.wave.forEach((ear,i)=>{if(ear===null)return;const x=i*4,y=110-ear*200;if(i===0||monitor.wave[i-1]===null)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
    }catch(error){stopWork();status(cameraError(error));$('monitorStart').disabled=false;return;}
  }
  if(monitor&&now-monitor.lastDetect>500){monitor.tracker.gap();$('monitorStatus').textContent=text('Waiting for a fresh camera frame.','പുതിയ ക്യാമറ ചിത്രത്തിനായി കാത്തിരിക്കുന്നു.');}
  raf=requestAnimationFrame(monitorLoop);
}
function reportRows(r){
  const untested=text('Not completed','പൂർത്തിയാക്കിയിട്ടില്ല'),rows=[];
  for(const eye of ['OD','OS']){const a=r.acuity?.[eye];rows.push([`${eye} · Tumbling E`,a?.completed?a.calibrated?`${a.angularEquivalent||'Largest level not passed'} · near angular equivalent at ${a.calibration.distanceCm} cm · unvalidated`:`Practice only · ${a.trials.filter(t=>t.correct).length}/${a.trials.length} correct · no acuity grade`:untested]);}
  for(const [key,label]of [['contrast','Contrast task'],['color','Color matching']])rows.push([label,r[key]?.completed?`${r[key].correct}/${r[key].total} correct · no clinical classification`:untested]);
  rows.push(['Blink observation',r.monitor?`${r.monitor.blinks} detected events · ${r.monitor.observedSeconds}s usable time · ${r.monitor.blinksPerMinute??'Unavailable'} blinks/min (estimate)`:untested]);
  rows.push(['Amsler grid',r.grid.length?`${r.grid.join(', ')} · viewed only, no result assigned`:untested]);rows.push(['Eye exercises',`${r.exercises.length} routine timers completed · participation not verified`]);return rows;
}
function renderReport(saved=null){
  stopWork();const r=saved||report;
  navigate('report',`${heading('SESSION SUMMARY',text('Your activity record','നിങ്ങളുടെ പ്രവർത്തന രേഖ'),text('Only completed activities appear below. No overall health score or normal-vision result is assigned.','പൂർത്തിയായ പ്രവർത്തനങ്ങൾ മാത്രം താഴെ കാണിക്കുന്നു. ആരോഗ്യസ്കോറോ സാധാരണ കാഴ്ചയെന്ന ഫലമോ നൽകില്ല.'))}<section class="panel" id="printableReport"><h2>NETRA-SCREEN · ${VERSION}</h2><p>${escape(new Date(r.createdAt).toLocaleString(lang==='ml'?'ml-IN':'en-IN'))}</p><dl class="report-rows">${reportRows(r).map(([label,value])=>`<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>${limitation()}</section><section class="panel no-print"><label class="check-row"><input id="saveOptIn" type="checkbox" ${saveEnabled?'checked':''}>${text('Allow saving this anonymous summary on this browser. Shared devices can expose saved summaries.','ഈ ബ്രൗസറിൽ പേരില്ലാത്ത സംഗ്രഹം സൂക്ഷിക്കാൻ അനുവദിക്കുക. പങ്കിട്ട ഉപകരണങ്ങളിൽ മറ്റുള്ളവർക്ക് കാണാനാകും.')}</label><div class="actions">${button('save-report',text('Save on this browser','ഈ ബ്രൗസറിൽ സൂക്ഷിക്കുക'),'primary')}${button('export',text('Download JSON','JSON ഡൗൺലോഡ്'))}${button('print',text('Print / Save PDF','പ്രിന്റ് / PDF'))}${button('home',text('Activities','പ്രവർത്തനങ്ങൾ'))}</div><p>${text('Exports may be saved outside the app. Clear local summaries here and delete exported copies separately.','ആപ്പിന് പുറത്തുള്ള പകർപ്പുകൾ പ്രത്യേകം മായ്ക്കണം.')}</p></section>`);viewedReport=r;
}
function readHistory(){const data=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');if(!Array.isArray(data))throw new Error('Invalid summary storage');return data.filter(r=>r&&r.schemaVersion===1&&typeof r.id==='string'&&typeof r.createdAt==='string'&&r.acuity&&Array.isArray(r.exercises)&&Array.isArray(r.grid)).slice(0,20);}
function history(){
  let records=[];try{records=readHistory();}catch{status(text('Saved summaries are unavailable. Storage may be blocked or damaged. Clear it below.','സൂക്ഷിച്ച സംഗ്രഹങ്ങൾ ലഭ്യമല്ല. ബ്രൗസർ സംഭരണം തടഞ്ഞിരിക്കാം.'));}
  navigate('history',`${heading('ON THIS BROWSER',text('Saved activity summaries','സൂക്ഷിച്ച സംഗ്രഹങ്ങൾ'),text('Up to 20 anonymous summaries. No camera images or identifying details.','പരമാവധി 20 പേരില്ലാത്ത സംഗ്രഹങ്ങൾ. ചിത്രങ്ങളോ വ്യക്തിവിവരങ്ങളോ ഇല്ല.'))}<section class="panel">${records.length?records.map(r=>`<div class="saved-row"><span>${escape(new Date(r.createdAt).toLocaleString())}</span>${button('open-saved',text('Open','തുറക്കുക'),'secondary',`data-id="${escape(r.id)}"`)}${button('delete-saved',text('Delete','മായ്ക്കുക'),'secondary',`data-id="${escape(r.id)}"`)}</div>`).join(''):`<p>${text('No saved summaries.','സംഗ്രഹങ്ങളൊന്നും സൂക്ഷിച്ചിട്ടില്ല.')}</p>`}${button('clear-all',text('Erase saved summaries & current session','സൂക്ഷിച്ച സംഗ്രഹങ്ങളും നിലവിലെ സെഷനും മായ്ക്കുക'),'danger')}</section>`);
}
function download(r){const blob=new Blob([JSON.stringify({...r,limitations:'Unvalidated personal wellness activities. Not a medical diagnosis or prescription.'},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`netra-wellness-${r.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('click',async event=>{
  const b=event.target.closest('[data-action]');if(!b||b.disabled)return;const action=b.dataset.action;
  try{
    if(action==='tracking')window.location.assign('./index.html');else if(action==='home')home();else if(action==='acuity')acuityScreen();else if(action==='acuity-eye')startAcuity(b.dataset.eye);
    else if(action==='calibrate'){
      const distance=Number($('viewDistance').value),width=Number($('calibrationWidth').value);
      if(!Number.isFinite(distance)||distance<25||distance>100){status('Enter a measured distance from 25 to 100 cm.');return;}
      calibration={pixelsPerMm:width/53.98,distanceCm:distance,width:innerWidth,height:innerHeight,scale:window.visualViewport?.scale||1,pixelRatio:devicePixelRatio,angle:screen.orientation?.angle||0,method:'manual-53.98mm-reference',confirmedAt:new Date().toISOString()};$('calibrationStatus').textContent=text('Size confirmed. Keep the same distance and orientation.','വലുപ്പം സ്ഥിരീകരിച്ചു. ഒരേ ദൂരവും ദിശയും പാലിക്കുക.');status('');startAcuity(acuity.eye);
    }else if(action==='direction'||action==='cant-see'){
      if(!expected)return;const answer=action==='cant-see'?'UNSURE':b.dataset.direction;
      if(view==='acuity'){acuity.answer(answer==='UNSURE'?DIRECTIONS[(DIRECTIONS.indexOf(expected)+1)%4]:answer,expected);nextAcuity();}
      else if(view==='contrast'){task.responses.push({nominalContrast:task.contrast,correct:answer===expected});nextTask();}
    }else if(action==='grid')gridScreen();else if(action==='grid-next'){if(!report.grid.includes(b.dataset.eye))report.grid.push(b.dataset.eye);b.dataset.eye==='OD'?gridScreen('OS'):renderReport();}
    else if(action==='color'||action==='contrast')taskScreen(action);
    else if(action==='color-answer'&&view==='color'&&task.expected!==null){task.responses.push({correct:Number(b.dataset.choice)===task.expected});nextTask();}
    else if(action==='dial'||action==='duochrome')chartScreen(action);else if(action==='exercise-home')exerciseHome();else if(action==='exercise-start')startExercise(b.dataset.kind);else if(action==='reminder')startExercise('reminder');
    else if(action==='exercise-pause'){if(exercise.timer.running){exercise.timer.pause();cancelAnimationFrame(raf);b.textContent=text('Resume','തുടരുക');$('exerciseState').textContent=text('Paused','നിർത്തി');}else{exercise.timer.start(performance.now());b.textContent=text('Pause','നിർത്തുക');$('exerciseState').textContent='';exerciseLoop();}}
    else if(action==='monitor')monitorScreen();else if(action==='monitor-start')await startMonitor();else if(action==='monitor-stop'){stopWork();$('monitorStatus').textContent=text('Camera stopped. Summary preserved.','ക്യാമറ നിർത്തി. സംഗ്രഹം സൂക്ഷിച്ചു.');$('monitorStart').disabled=false;}
    else if(action==='report')renderReport();else if(action==='export')download(viewedReport||report);else if(action==='print')window.print();
    else if(action==='save-report'){if(!$('saveOptIn').checked){status(text('Select local saving before saving a summary.','സൂക്ഷിക്കാൻ മുമ്പ് അനുമതി തിരഞ്ഞെടുക്കുക.'));return;}saveEnabled=true;const r=viewedReport||report;localStorage.setItem(HISTORY_KEY,JSON.stringify([r,...readHistory().filter(item=>item.id!==r.id)].slice(0,20)));status(text('Summary saved on this browser.','ഈ ബ്രൗസറിൽ സംഗ്രഹം സൂക്ഷിച്ചു.'));}
    else if(action==='open-saved'){const saved=readHistory().find(r=>r.id===b.dataset.id);if(saved)renderReport(saved);}
    else if(action==='delete-saved'){localStorage.setItem(HISTORY_KEY,JSON.stringify(readHistory().filter(r=>r.id!==b.dataset.id)));history();}
    else if(action==='clear-all'){localStorage.removeItem(HISTORY_KEY);report=freshReport();saveEnabled=false;history();status(text('Saved summaries and the current session were erased.','സൂക്ഷിച്ച സംഗ്രഹങ്ങളും നിലവിലെ സെഷനും മായ്ച്ചു.'));}
    else if(action==='new-session'){report=freshReport();saveEnabled=false;home();status(text('Current session cleared.','നിലവിലെ സെഷൻ മായ്ച്ചു.'));}
  }catch(error){status(text('This action could not finish. Browser storage may be unavailable. You can still download your summary.','പ്രവർത്തനം പൂർത്തിയായില്ല. ബ്രൗസർ സംഭരണം ലഭ്യമല്ലായിരിക്കാം.'));console.error(error);}
});
document.addEventListener('input',event=>{if(event.target.id==='calibrationWidth'||event.target.id==='viewDistance'){if(event.target.id==='calibrationWidth')$('calibrationLine').style.width=`${event.target.value}px`;calibration=null;expected=null;$('calibrationStatus').textContent=text('Setup changed. Confirm to restart the eye check.','ക്രമീകരണം മാറ്റി. വീണ്ടും സ്ഥിരീകരിക്കുക.');}});
document.addEventListener('keydown',event=>{if(event.repeat||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;const map={ArrowRight:'RIGHT',ArrowDown:'DOWN',ArrowLeft:'LEFT',ArrowUp:'UP'};if(expected&&map[event.key]&&['acuity','contrast'].includes(view)){event.preventDefault();document.querySelector(`[data-direction="${map[event.key]}"]`)?.click();}});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden)return;
  if(view==='monitor'){stopWork();$('monitorStart').disabled=false;$('monitorStatus').textContent=text('Camera stopped while page was hidden. Start explicitly to resume.','പേജ് മറഞ്ഞതിനാൽ ക്യാമറ നിർത്തി. തുടരാൻ വീണ്ടും തുടങ്ങുക.');}
  if(view==='exercise'&&exercise?.timer.running){exercise.timer.pause();cancelAnimationFrame(raf);$('exercisePause').textContent=text('Resume','തുടരുക');$('exerciseState').textContent=text('Paused while page was hidden.','പേജ് മറഞ്ഞതിനാൽ നിർത്തി.');}
});
window.addEventListener('pagehide',()=>{stopWork();model?.close();model=null;});
function invalidateCalibration(){if(view==='acuity'&&calibration&&!calibrationValid()){calibration=null;expected=null;$('calibrationStatus').textContent=text('Screen size or zoom changed. Recalibrate and restart.','സ്ക്രീൻ വലുപ്പമോ സൂമോ മാറി. വീണ്ടും ക്രമീകരിക്കുക.');}}
window.addEventListener('resize',invalidateCalibration);window.visualViewport?.addEventListener('resize',invalidateCalibration);
$('studioHome').addEventListener('click',home);$('studioHistory').addEventListener('click',history);
$('studioLang').addEventListener('click',()=>{lang=lang==='en'?'ml':'en';document.documentElement.lang=lang;$('studioLang').textContent=lang==='en'?'മലയാളം':'English';status('');home();});
home();
