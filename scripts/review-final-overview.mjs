import {chromium,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const out='../output/summit/final-overview';await mkdir(out,{recursive:true});
const browser=await chromium.launch();const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
await page.addInitScript(()=>{window.cameraCalls=0;navigator.mediaDevices.getUserMedia=()=>{cameraCalls++;throw Error('The overview must not open a camera');};});
for(const [width,height] of [[1440,1000],[390,844]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:8080/');await page.evaluate(()=>document.fonts.ready);
 for(const lang of ['en','ml']){
  if(lang==='ml')await page.locator('#langToggleBtn').click();
  expect(await page.locator('#viewHome').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/home-${width}-${lang}.png`});
  await page.locator('.hero-links a[href="#researchSetup"]').click();await expect(page.locator('#researchSetup')).toBeInViewport();
  await page.locator('#btnStartLive').scrollIntoViewIfNeeded();await expect(page.locator('#btnStartLive')).toBeInViewport();
  await page.locator('#researchSetup').screenshot({path:`${out}/working-model-${width}-${lang}.png`});
  await page.locator('#projectOverview').screenshot({path:`${out}/purpose-${width}-${lang}.png`});
  expect(await page.evaluate(()=>cameraCalls)).toBe(0);
 }
 await expect(page.locator('#investorOptions a[href="./investor.html"]')).toHaveCount(1);
 await expect(page.locator('#investorOptions a[href="./presentation.html"]')).toHaveCount(1);
}
await browser.close();console.log('Final purpose, working-model entry, separate investor options and bilingual layouts verified.');
