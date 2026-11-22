import {chromium} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'});
for(const width of [320,390,768]){
 await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:8080/');
 console.log(width,await page.locator('#btnStartLive').evaluate(el=>{const s=getComputedStyle(el);return {color:s.color,bg:s.backgroundColor,img:s.backgroundImage}}));
 await page.locator('#langToggleBtn').click();
 console.log(width,'home',await page.locator('#viewHome').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth})));
 console.log(await page.locator('#viewHome').evaluate(el=>[...el.querySelectorAll('*')].flatMap(n=>{const r=n.getBoundingClientRect();return r.width&&n.scrollWidth>n.clientWidth+1?[{node:n.className,text:n.textContent?.slice(0,35),width:n.clientWidth,scroll:n.scrollWidth,right:r.right}]:[]}).slice(0,35)));
}
await browser.close();
