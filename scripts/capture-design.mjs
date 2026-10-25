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
      if(name==='research')await page.addStyleTag({content:'html,body{height:auto!important;overflow:auto!important}.app-container{height:auto!important;min-height:100vh}.content-viewport{overflow:visible!important;flex:none!important}#viewHome{height:auto!important;overflow:visible!important}.app-footer{position:static!important}'});
      await page.screenshot({path:`output/design/${name}-${width}.png`,fullPage:true});
      if(name==='additional'){
        await page.locator('#studioLang').click();
        await page.screenshot({path:`output/design/additional-malayalam-${width}.png`,fullPage:true});
      }
    }
  }
  console.log('Reviewed design captures written to output/design/.');
}finally{await context.close();await browser.close();}
