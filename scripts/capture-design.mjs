import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch();
const context=await browser.newContext({baseURL:'http://127.0.0.1:8080',serviceWorkers:'block'});
const page=await context.newPage();
await mkdir('output/design',{recursive:true});
try{
  for(const width of [1440,360]){
    await page.setViewportSize({width,height:1000});
    for(const [name,path] of [['research','/index.html'],['additional','/eye-tests.html']]){
      await page.goto(path);await page.locator('h1').waitFor();
      // Expand the app's internal scrolling region for a single reviewable full-page image.
      const expansion=name==='research'?await page.addStyleTag({content:'html,body{height:auto!important;overflow:auto!important}.app-container{height:auto!important;min-height:100vh}.content-viewport{overflow:visible!important;flex:none!important}#viewHome{height:auto!important;overflow:visible!important}.app-footer{position:static!important}'}):null;
      await page.screenshot({path:`output/design/${name}-${width}.png`,fullPage:true});
      await page.locator(name==='research'?'#langToggleBtn':'#studioLang').click();
      await page.screenshot({path:`output/design/${name}-malayalam-${width}.png`,fullPage:true});
      if(name==='research'){
        await expansion.evaluate(el=>el.remove());
        await page.locator('#btnStartDemo').click();
        await page.screenshot({path:`output/design/child-ready-${width}.png`,fullPage:true,animations:'disabled'});
        await page.locator('#btnFocusReady').click();
        await page.screenshot({path:`output/design/child-focus-${width}.png`,fullPage:true,animations:'disabled'});
      }
    }
  }
  console.log('Reviewed design captures written to output/design/.');
}finally{await context.close();await browser.close();}
