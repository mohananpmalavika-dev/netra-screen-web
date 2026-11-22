import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const out='../output/summit/signature-review';await mkdir(out,{recursive:true});const browser=await chromium.launch();const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
for(const [width,height] of [[1440,1000],[390,844],[768,1024],[568,320]]){
 await page.setViewportSize({width,height});
 for(const [route,name] of [['/','home'],['/investor.html','investor'],['/join.html','qr'],['/eye-tests.html','rest'],['/presentation.html','slides']]){
  await page.goto(`http://127.0.0.1:8080${route}`);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:false});
 }
}
await browser.close();console.log('Captured the real rendered site across desktop, tablet, phone and landscape.');
