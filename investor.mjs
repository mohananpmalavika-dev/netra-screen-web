import './offline-status.js';
const summary=document.querySelector('[data-evidence-summary]'),scope=document.querySelector('[data-evidence-scope]');
try{
 const response=await fetch('./investor-evidence.json');if(!response.ok)throw Error('Evidence unavailable');
 const evidence=await response.json();
 if(evidence.status!=='passed')throw Error('Evidence review is not complete');
 summary.textContent=`${evidence.unitTests.passed} Node regression tests and ${evidence.browserTests.passed} Chromium browser tests passed. ${evidence.viewports.length} emulated screen sizes checked. Snapshot: ${evidence.reviewDate}.`;
 scope.textContent='Environment: desktop Chromium with emulated viewports and controlled camera/model fixtures. No physical phone or clinical validation is claimed by this receipt.';
}catch{summary.textContent='The engineering snapshot could not be loaded. Ask Team MindMesh for the latest receipt.';}
document.querySelector('#discussionForm').addEventListener('submit',event=>{
 event.preventDefault();const form=new FormData(event.currentTarget);
 const text=['NETRA-SCREEN / Team MindMesh - Discussion note',`Topic: ${form.get('topic')}`,`Name / organisation: ${String(form.get('name')).trim()||'Not provided'}`,`Preferred contact: ${String(form.get('contact')).trim()||'Agree in person'}`,`Suggested next step: ${String(form.get('next')).trim()||'Agree with Team MindMesh'}`,'','Meet Team MindMesh at the KGDTIS YIP pavilion and agree a follow-up channel.','Saved on this device only. This note has not been sent or submitted.'].join('\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='NETRA-SCREEN-discussion-note.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 document.querySelector('[data-discussion-status]').textContent='Discussion note prepared for download. It has not been sent. Share the saved file with the team when you meet.';
});
