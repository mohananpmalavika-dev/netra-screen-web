import {test,expect} from '@playwright/test';

test('page links preserve an internal Back route despite the no-referrer policy',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/index.html');const nav=page.locator('.page-navigation');
 await expect(nav.locator('[data-page-back]')).toBeDisabled();
 await nav.locator('summary').click();await nav.locator('a[href="./investor.html"]').click();
 await expect(page).toHaveURL(/investor.html$/);await expect(nav.locator('[data-page-back]')).toBeEnabled();
 await nav.locator('summary').click();await nav.locator('a[href="./about.html"]').click();
 await expect(page).toHaveURL(/about.html$/);await nav.locator('[data-page-back]').click();await expect(page).toHaveURL(/investor.html$/);
 await nav.locator('[data-page-back]').click();await expect(page).toHaveURL(/index.html$/);await expect(nav.locator('[data-page-back]')).toBeDisabled();
 await nav.locator('summary').focus();await page.keyboard.press('Enter');await expect(nav.locator('details')).toHaveAttribute('open','');
 await page.keyboard.press('Escape');await expect(nav.locator('details')).not.toHaveAttribute('open','');await expect(nav.locator('summary')).toBeFocused();
});

for(const [width,height] of [[320,740],[768,1024],[1440,900],[568,320]]){
 test(`every direct-entry page has a safe Home fallback and navigation fits ${width}x${height}`,async({page})=>{
  test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width,height});
  for(const route of ['about.html','join.html','eye-tests.html','investor.html','presentation.html','yip-pitch.html']){
   await page.goto('/'+route);const nav=page.locator('.page-navigation');await expect(nav).toBeVisible();
   await expect(nav.locator('[data-page-home]')).toHaveAttribute('href','./index.html');
   await nav.locator('summary').click();await expect(nav.locator('.page-menu-links a')).toHaveCount(8);
   const bounds=await nav.locator('.page-menu-links').boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);
   await page.keyboard.press('Escape');await nav.locator('[data-page-back]').click();await expect(page).toHaveURL(/index.html$/);
   expect(await nav.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 });
}

test('Back returns ready, capture, report and rest routines to their own setup',async({page})=>{
 test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});
 await page.addInitScript(()=>{window.cameraCalls=0;navigator.mediaDevices.getUserMedia=()=>{cameraCalls++;throw Error('Navigation must not start the camera');};});
 await page.goto('/index.html');await page.clock.install({time:new Date('2026-11-22T00:00:00Z')});await page.clock.pauseAt(new Date('2026-11-22T00:01:00Z'));
 const back=page.locator('[data-page-back]');
 await page.locator('#btnStartDemo').click();await expect(back).toHaveText('Back to setup');await back.click();await expect(page.locator('#viewHome')).toHaveClass(/active-view/);
 await page.locator('#btnStartDemo').click();await page.locator('#btnFocusReady').click();await back.click();await expect(page.locator('#viewHome')).toHaveClass(/active-view/);
 await page.locator('#btnStartDemo').click();await page.locator('#btnFocusReady').click();await page.clock.runFor(33500);await expect(page.locator('#viewReport')).toHaveClass(/active-view/);await back.click();await expect(page.locator('#viewHome')).toHaveClass(/active-view/);
 await page.locator('#langToggleBtn').click();await expect(page.locator('[data-page-home]')).toHaveText('ഹോം');await page.locator('#btnStartDemo').click();await expect(back).toHaveText('സജ്ജീകരണത്തിലേക്ക്');await back.click();expect(await page.evaluate(()=>cameraCalls)).toBe(0);
 await page.goto('/eye-tests.html');await page.locator('[data-kind="distance"]').click();await expect(back).toHaveText('Back to exercises');await back.click();await expect(page.locator('.activity-card')).toHaveCount(3);
});
