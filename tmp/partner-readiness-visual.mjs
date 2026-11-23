import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const out='../output/summit/partner-readiness-review';await mkdir(out,{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:8080/investor.html');
  await page.locator('#next-evidence').screenshot({path:`${out}/next-evidence-${width}.png`});
 }
 await page.goto('file:///C:/NetraScreen/output/summit/NETRA-SCREEN-team-playbook.html');
 await page.locator('#phoneRun').screenshot({path:`${out}/phone-run.png`});
 await page.locator('#reviewForm').screenshot({path:`${out}/review-form.png`});
 console.log('Rendered new evidence section and private forms.');
}finally{await browser.close();}
