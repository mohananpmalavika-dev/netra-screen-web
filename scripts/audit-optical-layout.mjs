import {chromium} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
for(const [width,height] of [[320,740],[390,844],[768,1024],[568,320],[844,390]]){
 await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:8080/presentation.html');
 const dock=await page.locator('.pitch-dock').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));console.log(width,'dock',dock);
 for(const language of ['en','ml']){
  if(language==='ml')await page.locator('#presentationLang').click();
  for(let i=0;i<8;i++){
   const bad=await page.locator('.pitch-slide.active').evaluate(slide=>[...slide.querySelectorAll('h2,p,table')].flatMap(el=>{const r=el.getBoundingClientRect(),c=slide.getBoundingClientRect();return r.left<c.left||r.right>c.right?[{text:el.textContent.slice(0,65),left:r.left,right:r.right,card:[c.left,c.right]}]:[]}));if(bad.length)console.log(width,language,i+1,bad);
   if(i<7)await page.locator('#btnNextSlide').click();
  }
  for(let i=0;i<7;i++)await page.locator('#btnPrevSlide').click();
 }
}
await browser.close();
