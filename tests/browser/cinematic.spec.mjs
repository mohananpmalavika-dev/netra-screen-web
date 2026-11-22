import {test,expect} from '@playwright/test';
test('original interactive eyes explain the product without opening a camera',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.previewCameraCalls=0;navigator.mediaDevices.getUserMedia=()=>{window.previewCameraCalls++;throw Error('Preview must not start camera');};});
 for(const route of ['/','/tracking.html','/investor.html','/presentation.html']){
  await page.goto(route);await expect(page.locator('.optical-hero')).toBeVisible();await expect(page.locator('.product-phone')).toHaveCount(0);expect(await page.evaluate(()=>previewCameraCalls)).toBe(0);
 }
 expect(errors).toEqual([]);
});
test('reduced motion retains the original eyes and camera-free walkthrough',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('.optical-hero')).toBeVisible();await expect(page.locator('h1')).toContainText('Earlier attention to');
 await page.locator('[data-launch-preview]').click();await expect(page.locator('#viewReady')).toHaveClass(/active-view/);await expect(page.locator('.guide-launcher')).not.toBeVisible();
});

test('optical paths change the illustration, pause with reduced motion, and yield to eye control',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{window.cameraCalls=0;navigator.mediaDevices.getUserMedia=()=>{cameraCalls++;throw Error('Illustrated paths must not request a camera');};});
 await page.goto('/');const stage=page.locator('[data-netra-3d]'),host=page.locator('.research-hero .optical-hero');
 await expect(host).toHaveAttribute('data-exhibit-playing','false');
 await page.locator('[data-exhibit-path=vertical]').click();
 await expect(page.locator('[data-exhibit-path=vertical]')).toHaveAttribute('aria-pressed','true');
 await expect.poll(async()=>Math.abs(Number(await stage.getAttribute('data-gaze-y')))).toBeGreaterThan(.1);
 await page.locator('[data-exhibit-path=horizontal]').focus();await page.keyboard.press('Enter');
 await expect.poll(async()=>Math.abs(Number(await stage.getAttribute('data-gaze-x')))).toBeGreaterThan(.1);
 expect(Math.abs(Number(await stage.getAttribute('data-gaze-y')))).toBeLessThan(.001);
 await page.locator('#langToggleBtn').click();await expect(page.locator('[data-exhibit-path=horizontal]')).toHaveText('തിരശ്ചീനം');
 await stage.evaluate(el=>el.dataset.eyeControl='starting');const before=await stage.getAttribute('data-gaze-x');
 await page.locator('[data-exhibit-path=hold]').click();await expect(host).toHaveAttribute('data-exhibit-playing','false');await expect(stage).toHaveAttribute('data-gaze-x',before);expect(await page.evaluate(()=>cameraCalls)).toBe(0);
});
