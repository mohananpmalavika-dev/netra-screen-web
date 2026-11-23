import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const out='../output/summit/design-system';await mkdir(out,{recursive:true});
const browser=await chromium.launch();const results=[];
try{
 const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  for(const [name,path] of [['home','index.html'],['investor','investor.html'],['slides','presentation.html'],['qr','join.html'],['rest','eye-tests.html'],['about','about.html'],['yip','yip-pitch.html']]){
   await page.goto('http://127.0.0.1:8080/'+path);await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:`${out}/${name}-${width}.png`});
   results.push({page:path,width,...await page.evaluate(()=>({fits:document.documentElement.scrollWidth<=innerWidth,font:getComputedStyle(document.body).fontFamily,bodySize:getComputedStyle(document.body).fontSize,headingFont:getComputedStyle(document.querySelector('h1')).fontFamily}))});
  }
 }
 await writeFile(`${out}/visual-review.json`,JSON.stringify(results,null,2));
 if(results.some(r=>!r.fits||!r.font.includes('Manrope')||!r.headingFont.includes('Manrope')))throw Error('Review font or overflow mismatch');
 console.log('14 page/viewport screenshots captured; font loading and page widths checked.');
}finally{await browser.close();}
