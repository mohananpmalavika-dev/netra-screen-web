import {test,expect,chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('real offline model and WASM initialize with browser camera frames; stopping releases camera',async()=>{
  test.setTimeout(90000);
  const browser=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
  const context=await browser.newContext({baseURL:'http://127.0.0.1:8080',permissions:['camera'],serviceWorkers:'block'}),page=await context.newPage();
  try{
    await page.goto('/index.html');await page.locator('#btnStartLive').click();await page.locator('#btnFocusReady').click();
    await expect(page.locator('#irisDisp')).toHaveText('Waiting for valid capture',{timeout:70000});
    expect(await page.locator('#webcamVideo').evaluate(v=>v.srcObject?.active)).toBe(true);
    await page.locator('#btnPauseSession').click();expect(await page.locator('#webcamVideo').evaluate(v=>v.srcObject)).toBeNull();
  }finally{await browser.close();}
});

test('hiding tracking while its model loads prevents a late camera request; explicit resume recovers',async({page})=>{
  const original=await readFile('camera.mjs','utf8');
  const mock=`export async function loadLandmarker(){return new Promise(resolve=>window.releaseModel=()=>resolve({detectForVideo(){return {faceLandmarks:[]}},close(){}}));}\n`+original.slice(original.indexOf('export function cameraError'));
  await page.route('**/camera.mjs',route=>route.fulfill({contentType:'text/javascript',body:mock}));
  await page.addInitScript(()=>{window.cameraRequests=0;navigator.mediaDevices.getUserMedia=()=>{window.cameraRequests++;return Promise.reject(new DOMException('Denied','NotAllowedError'));};});
  await page.goto('/tracking.html');await page.locator('#consentCheckbox').check();await page.locator('#btnStartLive').click();await page.locator('#btnFocusReady').click();
  await expect.poll(()=>page.evaluate(()=>typeof window.releaseModel)).toBe('function');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));window.releaseModel();});
  await expect(page.locator('#btnPauseSession')).toHaveText('Resume');expect(await page.evaluate(()=>window.cameraRequests)).toBe(0);
  await page.evaluate(()=>Object.defineProperty(document,'hidden',{value:false,configurable:true}));
  await page.locator('#btnPauseSession').click();await expect.poll(()=>page.evaluate(()=>window.cameraRequests)).toBe(1);await expect(page.locator('#sessionNotice')).toContainText('permission was denied');
});

test('tracking with no face freezes task clock and releases camera on background',async()=>{
  const browser=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
  const context=await browser.newContext({baseURL:'http://127.0.0.1:8080',permissions:['camera'],serviceWorkers:'block'}),page=await context.newPage();
  try{
    const original=await readFile('camera.mjs','utf8');
    await page.route('**/camera.mjs',route=>route.fulfill({contentType:'text/javascript',body:`export async function loadLandmarker(){return {detectForVideo(){return {faceLandmarks:[]}},close(){}}}\n`+original.slice(original.indexOf('export function cameraError'))}));
    await page.goto('/tracking.html');await page.locator('#consentCheckbox').check();await page.locator('#btnStartLive').click();await page.locator('#btnFocusReady').click();await expect.poll(()=>page.locator('#webcamVideo').evaluate(v=>!!v.srcObject)).toBe(true);
    await expect(page.locator('#hudTimer')).toHaveText('8s');await page.waitForTimeout(1200);await expect(page.locator('#hudTimer')).toHaveText('8s');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
    await expect(page.locator('#btnPauseSession')).toHaveText('Resume');expect(await page.locator('#webcamVideo').evaluate(v=>v.srcObject)).toBeNull();
  }finally{await browser.close();}
});
