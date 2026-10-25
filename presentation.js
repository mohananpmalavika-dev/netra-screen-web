import { PROJECT_COPY } from './project-copy.mjs';
import './offline-status.js';
let language='en';
function render(){
  document.documentElement.lang=language;
  document.querySelectorAll('[data-project-copy]').forEach(el=>{el.textContent=PROJECT_COPY[language][el.dataset.projectCopy]||PROJECT_COPY.en[el.dataset.projectCopy]||'';});
  document.getElementById('presentationLang').textContent=language==='en'?'മലയാളം':'English';
}
document.getElementById('presentationLang').addEventListener('click',()=>{language=language==='en'?'ml':'en';render();});
document.getElementById('printPresentation').addEventListener('click',()=>window.print());
render();
