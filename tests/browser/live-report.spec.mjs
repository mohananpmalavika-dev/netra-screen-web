import {test,expect,chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('valid frame fixtures finish four tasks, respect pause and export only measured observations',async()=>{
  test.setTimeout(65000);
  const browser=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
  const context=await browser.newContext({baseURL:'http://127.0.0.1:8080',permissions:['camera'],serviceWorkers:'block'}),page=await context.newPage();
  try{
    const original=await readFile('camera.mjs','utf8');
    const fixture=`export async function loadLandmarker(){return {close(){},detectForVideo(){
      const raw=Array.from({length:478},()=>({x:.5,y:.5}));
      const set=(i,x,y)=>raw[i]={x,y};
      set(33,.35,.45);set(133,.45,.45);set(263,.65,.45);set(362,.55,.45);set(234,.3,.5);set(454,.7,.5);set(10,.5,.2);set(152,.5,.8);
      for(const i of [160,158,385,387])set(i,.4,.43);for(const i of [153,144,373,380])set(i,.4,.47);
      const stage=document.getElementById('stageWrapper'),target=document.getElementById('targetCompanion');
      const x=parseFloat(target.style.left)/stage.clientWidth,y=parseFloat(target.style.top)/stage.clientHeight;
      set(468,.4+(x-.5)*.05,.45+(y-.5)*.025);set(473,.6+(x-.5)*.05,.45+(y-.5)*.025);
      return {faceLandmarks:[raw]};
    }}}\n`+original.slice(original.indexOf('export function cameraError'));
    await page.route('**/camera.mjs',route=>route.fulfill({contentType:'text/javascript',body:fixture}));
    await page.goto('/tracking.html');await page.locator('#consentCheckbox').check();await page.locator('#hideCameraCheckbox').check();await page.locator('#btnStartLive').click();await page.locator('#btnFocusReady').click();
    await expect(page.locator('#irisDisp')).toHaveText('Landmarks acquired');
    await expect(page.locator('#camPip')).toHaveCSS('opacity','0');await expect(page.locator('#camPip')).toHaveAttribute('aria-hidden','true');
    expect(await page.locator('#webcamVideo').evaluate(video=>video.srcObject.active)).toBe(true);
    await page.locator('#btnPauseSession').click();
    const timer=await page.locator('#hudTimer').textContent();expect(await page.locator('#webcamVideo').evaluate(v=>v.srcObject)).toBeNull();await page.waitForTimeout(500);await expect(page.locator('#hudTimer')).toHaveText(timer);
    await page.locator('#btnPauseSession').click();await expect(page.locator('#viewReport')).toHaveClass(/active-view/,{timeout:55000});
    await expect(page.locator('#evalBannerTitle')).toContainText('Research capture complete');
    const event=page.waitForEvent('download');await page.locator('#btnExportJSON').click();const data=JSON.parse(await readFile(await(await event).path(),'utf8'));
    expect(data.source).toBe('live-research');expect(data.clinicalClassification).toBeNull();expect(data.metrics.acceptedFrames).toBeGreaterThan(30);expect(data.metrics.acceptedFrames).toBeLessThanOrEqual(data.metrics.processedFrames);
    expect(new Set(data.observationsSampled.map(s=>s.task)).size).toBe(4);expect(data.metrics.movementCorrelation).toBeGreaterThan(.9);
  }finally{await browser.close();}
});
