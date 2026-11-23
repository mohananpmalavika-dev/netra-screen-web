import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const out='../output/summit/navigation-fix';await mkdir(out,{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
 for(const [width,height] of [[390,844],[1920,1080],[568,320]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:8080/index.html#projectOverview');
  await page.locator('.page-navigation').waitFor();await page.screenshot({path:`${out}/overview-${width}.png`});
  await page.locator('.page-menu summary').click();await page.screenshot({path:`${out}/menu-${width}.png`});
 }
}finally{await browser.close();}
