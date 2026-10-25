import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
async function fakeModel(page,body='return {faceLandmarks:[]}'){
  const source=await readFile('camera.mjs','utf8');
  await page.route('**/camera.mjs',route=>route.fulfill({contentType:'text/javascript',body:`export async function loadLandmarker(){return {detectForVideo(){${body}},close(){}}}\n`+source.slice(source.indexOf('export function cameraError'))}));
}
test('main camera failure never switches to demo; consent is enforced',async({page})=>{
  await fakeModel(page);await page.addInitScript(()=>{window.cameraRequests=0;navigator.mediaDevices.getUserMedia=()=>{window.cameraRequests++;return Promise.reject(new DOMException('Denied','NotAllowedError'));};});
  await page.goto('/index.html');await expect(page.locator('#consentCheckbox')).toBeChecked();await expect(page.locator('#viewHome')).toHaveClass(/active-view/);expect(await page.evaluate(()=>window.cameraRequests)).toBe(0);await page.locator('#consentCheckbox').uncheck();await page.locator('#btnStartLive').click();await expect(page.locator('#viewHome')).toHaveClass(/active-view/);expect(await page.evaluate(()=>window.cameraRequests)).toBe(0);await expect(page.locator('#sessionNotice')).toContainText('Please agree');
  await page.locator('#consentCheckbox').check();await page.locator('#btnStartLive').click();await page.locator('#btnFocusReady').click();await expect(page.locator('#sessionNotice')).toContainText('permission was denied');await expect(page.locator('#viewHome')).toHaveClass(/active-view/);await expect(page.locator('#viewReport')).not.toHaveClass(/active-view/);
});
test('walkthrough produces no eye samples or invented metrics, including after language changes',async({page})=>{
  await page.clock.install();await page.goto('/tracking.html');await page.locator('#btnStartDemo').click();await page.locator('#btnFocusReady').click();await expect(page.locator('#sessionNotice')).toContainText('WALKTHROUGH');
  await page.clock.runFor(33500);await expect(page.locator('#viewReport')).toHaveClass(/active-view/);await expect(page.locator('#metricCorrelation')).toHaveText('Unavailable');await expect(page.locator('#metricFixation')).toHaveText('Unavailable');
  await page.locator('#langToggleBtn').click();await expect(page.locator('#evalBannerTitle')).not.toContainText(/Healthy|തൃപ്തികരം/);
  const event=page.waitForEvent('download');await page.locator('#btnExportJSON').click();const data=JSON.parse(await readFile(await (await event).path(),'utf8'));expect(data.source).toBe('walkthrough');expect(data.observationsSampled).toEqual([]);expect(data.metrics.movementCorrelation).toBeNull();
});
