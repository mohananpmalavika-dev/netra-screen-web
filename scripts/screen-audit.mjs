import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const out='../output/summit/responsive';await mkdir(out,{recursive:true});const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[],checks=[];page.setDefaultNavigationTimeout(90000);page.on('pageerror',e=>errors.push(e.message));
const sizes=[[280,740],[320,900],[360,800],[390,844],[430,932],[568,320],[640,360],[768,1024],[1024,768],[1366,768],[1920,1080]];
const go=path=>page.goto('http://127.0.0.1:8080/'+path,{waitUntil:'domcontentloaded'});
async function fit(selector,label,width){const r=await page.locator(selector).evaluate(e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,scroll:e.scrollWidth,client:e.clientWidth};});if(r.left<-.6||r.right>width+.6||((label==='Home'||label==='Malayalam home')?r.left+r.scroll>width+1:r.scroll>r.client+1))throw Error(`${label} overflow ${width}: ${JSON.stringify(r)}`);checks.push({label,width,fit:true});}
try{
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});await go('index.html');await page.locator('.presenter-avatar-button img').waitFor();await fit('.home-card','Home',width);await page.screenshot({path:`${out}/home-${width}x${height}.png`});
  await page.locator('.presenter-avatar-button').click();await fit('#netraGuide','Presenter',width);await page.screenshot({path:`${out}/presenter-${width}x${height}.png`});await page.locator('[data-guide-close]').click();
  await page.locator('#researchSetup').scrollIntoViewIfNeeded();await fit('.session-panel','Setup',width);await page.locator('#langToggleBtn').click();await fit('.home-card','Malayalam home',width);
  for(const selector of ['#btnNavPresentation','#btnNavOtherTests','#langToggleBtn','#audioToggleBtn']){const b=await page.locator(selector).boundingBox();if(b.x<0||b.x+b.width>width+1)throw Error(`Navigation overflow ${selector}/${width}`);}
  await go('presentation.html');await fit('.pitch-slide.active','Investor slides',width);await page.locator('.guide-launcher').click();await fit('#netraGuide','Slide presenter',width);await page.locator('[data-guide-close]').click();
  await go('join.html');await fit('.join-card','QR and sharing',width);await page.screenshot({path:`${out}/qr-${width}x${height}.png`});
  await go('eye-tests.html');await fit('#studio','Rest activities',width);
  await go('about.html');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error(`About overflow ${width}`);checks.push({label:'About',width,fit:true});
  console.log(`Checked ${width} × ${height}`);
 }
 if(errors.length)throw Error(errors.join('\n'));await writeFile(`${out}/screen-audit.json`,JSON.stringify({sizes,checks,pageErrors:errors},null,2));console.log(`Passed ${checks.length} responsive layout checks.`);
}finally{await browser.close();}
