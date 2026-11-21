import {chromium} from '@playwright/test';
import {mkdir,rename} from 'node:fs/promises';
const output='../output/summit';await mkdir(output,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1280,height:800},recordVideo:{dir:`${output}/video-tmp`,size:{width:1280,height:800}},serviceWorkers:'allow'});
const page=await context.newPage();
const start=Date.now();
async function scene(label,seconds){
 await page.evaluate(label=>{let node=document.getElementById('video-caption');if(!node){node=document.createElement('div');node.id='video-caption';node.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0c202bf5;border-top:1px solid #54877d;color:#dcf5ec;padding:13px 24px;font:500 16px Segoe UI,Arial;text-align:center;';document.body.append(node);}node.textContent=label;},label);
 await page.waitForTimeout(seconds*1000);
}
await page.goto('http://127.0.0.1:8080');
await scene('NETRA-SCREEN / On-device eye-movement research / Team MindMesh',10);
await page.locator('#researchSetup').scrollIntoViewIfNeeded();
await scene('Original visual targets. Guardian consent. On-device camera processing.',10);
await page.locator('[data-comp="butterfly"]').click();await page.locator('#btnStartDemo').click();
await scene('CAMERA-FREE WALKTHROUGH / No participant data is recorded',5);
await page.locator('#btnFocusReady').click();
await scene('Four guided paths / Horizontal, vertical, diagonal and step-and-hold',36);
await page.locator('#viewReport.active-view').waitFor();
await scene('Walkthrough report / Measurements remain unavailable / No clinical result',10);
await page.goto('http://127.0.0.1:8080/presentation.html#partnership');
await scene('Seeking ophthalmology collaboration, supervised usability partners and research mentorship',12);
const remaining=Math.max(0,95_000-(Date.now()-start));if(remaining)await page.waitForTimeout(Math.min(remaining,15000));
const video=page.video();await context.close();await video.saveAs(`${output}/NETRA-SCREEN-summit-backup.webm`);await browser.close();
console.log('Saved a camera-free product backup video (approximately 95 seconds).');
