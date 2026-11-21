import {test,expect} from '@playwright/test';
test('3D showcase launches the real camera-free workflow and stays separate from observation data',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{window.cameraCalls=0;navigator.mediaDevices.getUserMedia=()=>{window.cameraCalls++;throw Error('Unexpected camera request');};});
 await page.goto('/');const stage=page.locator('[data-netra-3d]');await expect(stage).toHaveAttribute('data-renderer',/webgl|fallback/);
 expect(await stage.getAttribute('data-renderer-error')).toBeNull();
 await page.locator('[data-reset-scene]').click();await page.locator('[data-launch-preview]').click();
 await expect(page.locator('#viewReady')).toHaveClass(/active-view/);expect(await page.evaluate(()=>window.cameraCalls)).toBe(0);
 await page.locator('#btnFocusReady').click();await expect(page.locator('#viewTracking')).toHaveClass(/active-view/);await expect(page.locator('#sessionNotice')).toContainText('WALKTHROUGH');expect(errors).toEqual([]);
});
test('devices without WebGL retain a usable product preview and research workflow',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){if(kind==='webgl')return null;return original.call(this,kind,...args);};});
 await page.goto('/');await expect(page.locator('[data-netra-3d]')).toHaveAttribute('data-renderer','fallback');await expect(page.locator('.showcase-fallback')).toBeVisible();await page.locator('[data-launch-preview]').click();await expect(page.locator('#viewReady')).toHaveClass(/active-view/);
});
