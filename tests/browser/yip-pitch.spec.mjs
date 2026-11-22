import {test,expect} from '@playwright/test';

test('YIP pitch is separate from investor slides and all original slides are reachable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/index.html');
 await page.locator('.page-yip').click();await expect(page).toHaveURL(/yip-pitch.html$/);
 await expect(page.locator('h1')).toHaveText('YIP project pitch');await expect(page.locator('#yipSelect option')).toHaveCount(14);
 await expect(page.locator('#yipPrev')).toBeDisabled();
 for(let i=1;i<=14;i++){
  await expect(page.locator('#yipCounter')).toHaveText(`${i} / 14`);
  await expect.poll(()=>page.locator('#yipSlideImage').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(page.locator('#yipSlideText')).not.toBeEmpty();if(i<14)await page.locator('#yipNext').click();
 }
 await expect(page.locator('#yipNext')).toBeDisabled();await page.locator('.yip-stage').focus();await page.keyboard.press('Home');await expect(page.locator('#yipCounter')).toHaveText('1 / 14');
 await page.keyboard.press('ArrowRight');await expect(page.locator('#yipCounter')).toHaveText('2 / 14');
 await page.locator('#yipSelect').selectOption('11');await expect(page.locator('#yipSlideTitle')).toHaveText('Team MindMesh');
 await page.locator('#yipZoom').click();await expect(page.locator('.yip-stage')).toHaveClass(/is-zoomed/);await page.locator('#yipZoom').click();
 const download=page.waitForEvent('download');await page.getByRole('link',{name:'Download original PDF'}).click();expect((await download).suggestedFilename()).toBe('NETRA_SCREEN_MindMesh.pdf');
 await page.locator('[data-page-back]').click();await expect(page).toHaveURL(/index.html$/);
});

test('YIP viewer, page navigation and landscape capture stay within usable screen bounds',async({page})=>{
 test.setTimeout(90000);await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of [[320,740],[768,1024],[1440,900],[568,320]]){
  await page.setViewportSize({width,height});await page.goto('/yip-pitch.html');await expect(page.locator('#yipSelect option')).toHaveCount(14);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const nav=await page.locator('.page-navigation').boundingBox();expect(nav.x+nav.width).toBeLessThanOrEqual(width);
  await page.locator('#yipSelect').selectOption('13');await expect(page.locator('#yipCounter')).toHaveText('14 / 14');
 }
 await page.goto('/index.html');await page.locator('#btnStartDemo').click();await page.locator('#btnFocusReady').click();
 const stage=await page.locator('#stageWrapper').boundingBox();expect(stage.height).toBeGreaterThan(100);expect(stage.y+stage.height).toBeLessThanOrEqual(321);
 await expect(page.locator('[data-page-back]')).toBeVisible();await page.locator('[data-page-back]').click();await expect(page.locator('#viewHome')).toHaveClass(/active-view/);
});

test('YIP deck works offline after the app package is ready',async({browser})=>{
 test.setTimeout(90000);const context=await browser.newContext({serviceWorkers:'allow',reducedMotion:'reduce'}),page=await context.newPage();
 try{
  await page.goto('http://127.0.0.1:8080/yip-pitch.html');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);await page.reload();await expect(page.locator('#yipSelect option')).toHaveCount(14);
  await page.locator('#yipSelect').selectOption('13');await expect.poll(()=>page.locator('#yipSlideImage').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await page.locator('[data-page-home]').click();await expect(page.locator('#btnStartLive')).toBeVisible();
 }finally{await context.close();}
});
