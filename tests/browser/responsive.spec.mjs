import {test,expect} from '@playwright/test';

const sizes=[[320,740],[390,844],[768,1024],[1024,768],[1440,900],[568,320],[844,390]];
async function fits(locator){
 expect(await locator.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
}
for(const [width,height] of sizes){
 test(`visitor pages, presenter and translated slides fit ${width}x${height}`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width,height});
  for(const route of ['/index.html','/join.html','/presentation.html','/investor.html']){
   await page.goto(route);
   const launcher=page.locator('.guide-launcher');
   await expect(launcher).toHaveAttribute('aria-haspopup','dialog');
   expect(await launcher.locator('img').count()).toBe(1);
   await fits(page.locator('html'));
   if(route.includes('index')&&height<=390)expect(await page.locator('.top-nav').evaluate(el=>el.getBoundingClientRect().height)).toBeLessThanOrEqual(80);
   if(route.includes('index')){
    await expect(launcher).toBeInViewport();const before=await launcher.boundingBox();
    await page.locator('#researchSetup').scrollIntoViewIfNeeded();
    await expect(launcher).toBeInViewport();expect(await launcher.boundingBox()).toEqual(before);
   }
   await launcher.focus();await page.keyboard.press('Enter');
   const guide=page.locator('#netraGuide'),close=guide.locator('[data-guide-close]');
   await expect(close).toBeFocused();await fits(guide);
   for(const language of ['en','ml']){
    if(language==='ml')await guide.locator('[data-guide-language]').click();
    await guide.locator('[data-guide-mode=pitch]').click();
    await guide.evaluate(el=>el.scrollTop=el.scrollHeight);
    await expect(close).toBeInViewport();
    expect(await close.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el;})).toBe(true);
    await fits(guide);
   }
   await page.keyboard.press('Escape');await expect(launcher).toBeFocused();
   if(route.includes('index')){
    await page.locator('#langToggleBtn').click();await fits(page.locator('#viewHome'));
    await launcher.click();await expect(close).toBeInViewport();await page.keyboard.press('Escape');
   }
   if(route.includes('presentation')){
    await expect(page.locator('#presTimerBtn')).toBeVisible();
    await fits(page.locator('.pitch-dock'));
    for(const language of ['en','ml']){
     if(language==='ml')await page.locator('#presentationLang').click();
     for(let i=0;i<8;i++){
      const slide=page.locator('.pitch-slide.active');await fits(slide);
      // Overflow-hidden cards can conceal a translated grid item without page overflow.
      expect(await slide.locator('h2,p,table').evaluateAll(elements=>elements.every(el=>{const r=el.getBoundingClientRect(),card=el.closest('.pitch-slide').getBoundingClientRect();return r.left>=card.left&&r.right<=card.right;}))).toBe(true);
      if(i<7)await page.locator('#btnNextSlide').click();
     }
     for(let i=0;i<7;i++)await page.locator('#btnPrevSlide').click();
    }
    await page.locator('#btnModeReport').click();await expect(page.locator('.pitch-slide:visible')).toHaveCount(8);await fits(page.locator('html'));
   }
  }
 });
}
