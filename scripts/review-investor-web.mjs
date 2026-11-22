import {chromium,expect} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const output='../output/summit/investor-review';await mkdir(output,{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [width,height] of [[390,844],[768,1024],[1440,900],[568,320]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:8080/investor.html');
 await expect(page.locator('[data-evidence-summary]')).toContainText('14 Node regression tests');
 await page.locator('.partner-hero').screenshot({path:`${output}/partner-hero-${width}.png`});
 await page.locator('#evidence').screenshot({path:`${output}/evidence-${width}.png`});
 if(width===390||width===1440){await page.locator('#plan').screenshot({path:`${output}/plan-${width}.png`});await page.locator('#connect').screenshot({path:`${output}/connect-${width}.png`});}
 const video=page.locator('video');await video.evaluate(el=>el.load());await expect.poll(()=>video.evaluate(el=>Number.isFinite(el.duration)&&el.duration>30&&el.duration<90)).toBe(true);
}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8080/presentation.html');await page.locator('#presentationLang').click();for(let i=0;i<5;i++)await page.locator('#btnNextSlide').click();await page.locator('.pitch-slide.active').screenshot({path:`${output}/roadmap-ml-phone.png`});
await page.goto('file:///C:/NetraScreen/output/summit/NETRA-SCREEN-team-playbook.html');
const row=page.locator('#budgetRows tr').first();await row.locator('input').nth(0).fill('2');await row.locator('input').nth(1).fill('500');await row.locator('input').nth(2).fill('QA example only');await expect(page.locator('#cashTotal')).toHaveText('INR 1,000');
const download=page.waitForEvent('download');await page.locator('#exportBudget').click();const data=JSON.parse(await readFile(await (await download).path(),'utf8'));expect(data.cashEstimateINR).toBe(1000);expect(data.fundingAskApproved).toBe(false);
await page.locator('#exportLead').click();await expect(page.locator('#leadStatus')).toContainText('Agree permission');
await page.reload();await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`${output}/team-playbook.png`});
await writeFile(`${output}/web-review.json`,JSON.stringify({errors,viewports:[[390,844],[768,1024],[1440,900],[568,320]],checks:['Partner evidence receipt loaded','Backup video metadata playable','Malayalam roadmap rendered','Budget example calculated and exported','Follow-up export requires visitor permission'],physicalPhonesTested:0},null,2));
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log('Screenshots, video metadata, private budget and follow-up controls verified.');
