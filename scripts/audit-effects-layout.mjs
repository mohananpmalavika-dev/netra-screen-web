import {chromium} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
for(const [width,height] of [[320,740],[768,1024],[1024,768]]){
 await page.setViewportSize({width,height});
 for(const route of ['/','/presentation.html','/investor.html','/join.html']){
  await page.goto('http://127.0.0.1:8080'+route);
  const read=()=>page.evaluate(()=>({root:[document.documentElement.scrollWidth,innerWidth],bad:[...document.querySelectorAll('body *')].flatMap(el=>{const r=el.getBoundingClientRect();return r.width&&r.right>innerWidth+1?[{tag:el.tagName,cls:el.className?.baseVal??el.className,right:r.right,text:el.textContent.slice(0,30)}]:[]}).slice(0,12)}));
  console.log(width,route,await read());
  if(route==='/'){await page.locator('#langToggleBtn').click();console.log(width,'ml',await read());}
 }
}
await browser.close();
