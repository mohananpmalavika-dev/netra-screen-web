import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('media',{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1280,height:800},recordVideo:{dir:'test-results/investor-video',size:{width:960,height:600}},serviceWorkers:'block',reducedMotion:'reduce'});
const page=await context.newPage();let cameras=0;
await page.addInitScript(()=>{navigator.mediaDevices.getUserMedia=()=>{throw Error('This recording must remain camera-free.');};});
const started=Date.now(),cues=[];
async function caption(text){
 cues.push({time:(Date.now()-started)/1000,text});
 await page.evaluate(text=>{let el=document.querySelector('#recordingCaption');if(!el){el=document.createElement('div');el.id='recordingCaption';el.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:10000;padding:12px 20px;background:#11162cf5;color:#f4eafa;border-top:1px solid #ae8ed1;font:500 16px Segoe UI,Arial;text-align:center;';document.body.append(el);}el.textContent=text;},text);
}
await page.goto('http://127.0.0.1:8080/');await page.locator('.guide-launcher').waitFor();
await page.locator('#researchSetup').scrollIntoViewIfNeeded();
await caption('RECORDED CAMERA-FREE WALKTHROUGH | No participant eye data');await page.waitForTimeout(2500);
await page.locator('[data-comp=butterfly]').click();await page.locator('#btnStartDemo').click();
await caption('Choose a visual target. A guided ready screen precedes the task.');await page.waitForTimeout(2000);
await page.screenshot({path:'media/walkthrough-poster.png'});
await page.locator('#btnFocusReady').click();
await caption('Four target paths: horizontal, vertical, diagonal and step-and-hold.');
await page.locator('#viewReport.active-view').waitFor({timeout:50000});
await caption('Walkthrough report: measurements remain unavailable. No clinical result.');await page.waitForTimeout(5000);
await page.goto('http://127.0.0.1:8080/investor.html#connect');await page.locator('#connect h2').waitFor();
await caption('Seeking an ophthalmology research collaborator and a supervised usability partner.');await page.waitForTimeout(4000);
const ended=(Date.now()-started)/1000;
const video=page.video();await context.close();await video.saveAs('media/NETRA-SCREEN-recorded-walkthrough.webm');await browser.close();
const timestamp=s=>{const ms=Math.round(s*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;};
await writeFile('media/walkthrough-captions.vtt','WEBVTT\n\n'+cues.map((c,i)=>`${timestamp(c.time)} --> ${timestamp(cues[i+1]?.time??ended)}\n${c.text}\n`).join('\n'));
console.log(`Saved a ${ended.toFixed(1)}-second recording of the actual camera-free workflow, with captions.`);
