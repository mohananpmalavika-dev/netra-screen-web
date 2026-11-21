import {chromium} from '@playwright/test';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
const output='../output/summit';await mkdir(output,{recursive:true});
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block',reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8080');await page.locator('.hero-title').filter({hasText:'A new perspective'}).waitFor();
await page.screenshot({path:`${output}/homepage-desktop.png`});
await page.locator('#researchSetup').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/targets-desktop.png`});
await page.locator('.companion-cards-grid').screenshot({path:`${output}/original-targets.png`});
await page.locator('[data-comp="fish"]').click();await page.locator('#btnStartDemo').click();await page.locator('#readyCompanion img').waitFor();await page.screenshot({path:`${output}/fish-ready.png`});
await page.locator('#btnFocusReady').click();await page.screenshot({path:`${output}/walkthrough.png`});await page.locator('#btnExitSession').click();
for(const width of [320,360,768]){
 await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:8080');
 for(const lang of ['en','ml']){
  if(lang==='ml')await page.locator('#langToggleBtn').click();
  if(await page.locator('.home-card').evaluate(el=>el.getBoundingClientRect().x+el.scrollWidth>innerWidth))throw Error(`Home overflow ${width}/${lang}`);
  await page.locator('.content-viewport').evaluate(el=>el.scrollTop=0);await page.locator('#viewHome').evaluate(el=>el.scrollTop=0);
  await page.screenshot({path:`${output}/home-${width}-${lang}.png`});
  await page.locator('#researchSetup').scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/setup-${width}-${lang}.png`});
 }
}
await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:8080/presentation.html');
for(let i=0;i<8;i++){
 await page.locator('.pitch-slide.active').screenshot({path:`${output}/overview-${i+1}.png`});
 if(i<7)await page.locator('#btnNextSlide').click();
}
await page.emulateMedia({media:'print'});
await page.addStyleTag({content:'@page{size:338.667mm 190.5mm;margin:0}.pitch-slide,.pitch-slide.active,.pitch-shell.mode-report .pitch-slide{height:190.5mm!important;min-height:190.5mm!important;max-height:190.5mm!important;}'});
await page.pdf({path:'docs/NETRA-SCREEN-investor-deck.pdf',width:'338.667mm',height:'190.5mm',printBackground:true,margin:{top:0,right:0,bottom:0,left:0},preferCSSPageSize:true});
await copyFile('docs/NETRA-SCREEN-investor-deck.pdf','../output/pdf/NETRA-SCREEN-investor-deck.pdf');
await writeFile(`${output}/visual-check.json`,JSON.stringify({pageErrors:errors,checkedWidths:[320,360,768,1440],languages:['en','ml'],overviewSlides:8},null,2));
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log('Responsive previews and eight-slide PDF exported without page errors.');
