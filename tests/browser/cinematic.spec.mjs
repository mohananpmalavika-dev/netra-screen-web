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
 await expect(page.locator('.optical-hero')).toBeVisible();await expect(page.locator('h1')).toContainText('Help eye-coordination concerns');
 await page.locator('[data-launch-preview]').click();await expect(page.locator('#viewReady')).toHaveClass(/active-view/);await expect(page.locator('.guide-launcher')).not.toBeVisible();
});
