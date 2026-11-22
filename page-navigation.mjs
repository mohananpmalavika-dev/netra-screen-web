// Navigation stays within NETRA, even when a page is opened directly or offline.
const header=document.querySelector('.top-nav,.studio-nav');
if(header){
 const routes=[
  ['index.html','Project overview','പ്രോജക്റ്റ് പരിചയം'],
  ['index.html#researchSetup','Working model','പ്രവർത്തിക്കുന്ന മാതൃക'],
  ['yip-pitch.html','YIP project pitch','YIP പ്രോജക്റ്റ് പിച്ച്'],
  ['investor.html','Investor pack','നിക്ഷേപകർക്കായി'],
  ['presentation.html','Investor slides','അവതരണം'],
  ['join.html','QR & sharing','QR / പങ്കിടൽ'],
  ['eye-tests.html','Eye rest','കണ്ണുകൾക്ക് വിശ്രമം'],
  ['about.html','About & privacy','വിവരങ്ങളും സ്വകാര്യതയും']
 ];
 const pendingKey='netra-navigation-next',stateKey='netraReturnWithinSite';
 const markLocalEntry=()=>history.replaceState({...history.state,[stateKey]:true},'');
 try{
  const pending=JSON.parse(sessionStorage.getItem(pendingKey)||'null');
  sessionStorage.removeItem(pendingKey);
  if(pending&&pending.to===location.href&&Date.now()-pending.at<60000&&new URL(pending.from).origin===location.origin)markLocalEntry();
 }catch{/* Direct access and unavailable storage use the Home fallback. */}
 const nav=document.createElement('nav');nav.className='page-navigation';nav.setAttribute('aria-label','Page navigation');
 nav.innerHTML='<div class="page-return"><button type="button" data-page-back>Back</button><a href="./index.html" data-page-home>Home</a><span class="page-current"></span></div><a class="page-yip" href="./yip-pitch.html">YIP Pitch</a><details class="page-menu"><summary>Pages</summary><div class="page-menu-links"></div></details>';
 header.after(nav);
 const back=nav.querySelector('[data-page-back]'),home=nav.querySelector('[data-page-home]'),menu=nav.querySelector('details'),current=nav.querySelector('.page-current');
 const links=routes.map(([path])=>{const a=document.createElement('a');a.href='./'+path;nav.querySelector('.page-menu-links').append(a);return a;});
 const isHome=()=>/\/(?:index|tracking)?(?:\.html)?$/.test(location.pathname);
 const researchView=()=>document.querySelector('.view.active-view')?.id;
 const restBack=()=>document.querySelector('#studio [data-action="exercise-home"]');
 function update(){
  const ml=document.documentElement.lang==='ml',view=researchView();
  const session=['viewReady','viewTracking','viewReport'].includes(view),rest=!!restBack();
  nav.dataset.context=session||rest?'local':'page';nav.querySelector('.page-yip').textContent=ml?'YIP പിച്ച്':'YIP Pitch';
  back.textContent=session?(ml?'സജ്ജീകരണത്തിലേക്ക്':'Back to setup'):rest?(ml?'വിശ്രമ പ്രവർത്തനങ്ങൾ':'Back to exercises'):(ml?'തിരികെ':'Back');
  back.disabled=isHome()&&(!view||view==='viewHome')&&!history.state?.[stateKey]&&!location.hash;
  home.textContent=ml?'ഹോം':'Home';menu.querySelector('summary').textContent=ml?'പേജുകൾ':'Pages';
  const filename=location.pathname.split('/').pop()||'index.html';
  let active=routes.findIndex(([path])=>path===filename);if(filename==='tracking.html')active=0;
  current.textContent=routes[active]?.[ml?2:1]||'';
  links.forEach((a,i)=>{a.textContent=routes[i][ml?2:1];if(i===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 }
 back.addEventListener('click',()=>{
  const actions={viewReady:'btnReadyBack',viewTracking:'btnExitSession',viewReport:'btnRestartSession'};
  const control=document.getElementById(actions[researchView()]);
  if(control){control.click();update();return;}
  if(restBack()){restBack().click();update();return;}
  if(history.state?.[stateKey]&&history.length>1){history.back();return;}
  location.assign('./index.html');
 });
 let localHash=false;
 document.addEventListener('click',event=>{
  const anchor=event.target.closest('a[href]');
  if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
  const target=new URL(anchor.href);
  if(target.origin!==location.origin||!/\/(?:index|tracking|investor|presentation|join|eye-tests|about|yip-pitch)?(?:\.html)?$/.test(target.pathname))return;
  if(target.pathname===location.pathname&&target.search===location.search){localHash=target.hash!==location.hash;return;}
  try{sessionStorage.setItem(pendingKey,JSON.stringify({from:location.href,to:target.href,at:Date.now()}));}catch{}
 });
 addEventListener('hashchange',()=>{if(localHash){markLocalEntry();localHash=false;}update();});
 addEventListener('pageshow',update);addEventListener('popstate',update);
 document.addEventListener('click',event=>{if(!nav.contains(event.target))menu.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
 new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 const views=document.querySelectorAll('.view');
 const viewObserver=new MutationObserver(update);views.forEach(view=>viewObserver.observe(view,{attributes:true,attributeFilter:['class']}));
 const studio=document.getElementById('studio');if(studio)new MutationObserver(update).observe(studio,{childList:true});
 update();
}
