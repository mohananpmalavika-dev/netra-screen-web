import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('rest page opens directly with only the three routines; retired activity links cannot open tests',async({page})=>{
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{window.cameraCalls=0;navigator.mediaDevices.getUserMedia=()=>{window.cameraCalls++;throw new Error('Rest must not open camera');};});
  for(const suffix of ['', '?activity=acuity#monitor']){
    await page.goto('/eye-tests.html'+suffix);await expect(page.locator('h1')).toHaveText('Take a short rest for your eyes');await expect(page.locator('.activity-card')).toHaveCount(3);
    await expect(page.locator('[data-action="acuity"],[data-action="grid"],[data-action="contrast"],[data-action="color"],[data-action="monitor"],[data-action="dial"],[data-action="duochrome"],#studioHistory,video,input')).toHaveCount(0);
    await page.evaluate(()=>{const b=document.createElement('button');b.dataset.action='monitor';b.textContent='Retired action fixture';document.body.append(b);b.click();b.remove();});
    await expect(page.locator('h1')).toHaveText('Take a short rest for your eyes');expect(await page.evaluate(()=>window.cameraCalls)).toBe(0);
  }
  expect(requests.some(url=>/camera\.mjs|face_landmarker|wasm/.test(url))).toBe(false);
});
test('rest timers pause, resume, complete once and can be cancelled without recording results',async({page})=>{
  await page.clock.install();await page.goto('/eye-tests.html');await page.locator('[data-kind="distance"]').click();await page.clock.runFor(5000);
  await page.locator('[data-action="exercise-pause"]').click();const frozen=await page.locator('#exerciseClock').textContent();await page.clock.runFor(10000);await expect(page.locator('#exerciseClock')).toHaveText(frozen);
  await page.locator('[data-action="exercise-pause"]').click();await page.clock.runFor(16000);await expect(page.locator('#exercisePrompt')).toHaveText('Routine timer complete');await expect(page.locator('#exercisePause')).toBeDisabled();
  await page.locator('[data-action="exercise-home"]').click();await expect(page.locator('h1')).toHaveText('Take a short rest for your eyes');await page.locator('[data-kind="rest"]').click();await page.clock.runFor(1000);await page.locator('[data-action="exercise-home"]').click();await page.clock.runFor(61000);await expect(page.locator('h1')).toHaveText('Take a short rest for your eyes');
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
});
test('backgrounding pauses rest, reminder leads into distance break, and language switch cancels the old timer',async({page})=>{
  // Exercise the reminder-completion branch with a short timer fixture, keeping foreground
  // accumulation itself covered by the real ActiveTimer regressions.
  const source=await readFile('eye-tests.js','utf8');
  await page.route('**/eye-tests.js',route=>route.fulfill({contentType:'text/javascript',body:source.replace('new ActiveTimer(r.seconds*1000)',"new ActiveTimer(kind==='reminder'?1000:r.seconds*1000)")}));
  await page.clock.install();await page.goto('/eye-tests.html');await page.locator('[data-kind="blink"]').click();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('#exerciseState')).toContainText('Paused while page was hidden');const frozen=await page.locator('#exerciseClock').textContent();await page.clock.runFor(35000);await expect(page.locator('#exerciseClock')).toHaveText(frozen);
  await page.locator('#studioHome').click();await page.locator('[data-action="reminder"]').click();await page.clock.runFor(1500);await expect(page.locator('h1')).toHaveText('Distance break');await expect(page.locator('#exerciseClock')).toHaveText(/00:(19|20)/);
  await page.locator('#studioLang').click();await expect(page.locator('html')).toHaveAttribute('lang','ml');await expect(page.locator('h1')).toContainText('കണ്ണുകൾക്ക്');await expect(page.locator('.activity-card')).toHaveCount(3);await page.clock.runFor(25000);await expect(page.locator('.activity-card')).toHaveCount(3);
});
test('rest and YIP presentation remain available offline; mobile rest layout fits',async({browser})=>{
  const context=await browser.newContext({serviceWorkers:'allow',viewport:{width:360,height:800}}),page=await context.newPage();
  try{
    await page.goto('http://127.0.0.1:8080/eye-tests.html');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
    await context.setOffline(true);await page.reload();await expect(page.locator('h1')).toHaveText('Take a short rest for your eyes');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/rest-mobile.png',fullPage:true});
    await page.locator('[data-kind="rest"]').click();await expect(page.locator('#exerciseClock')).toBeVisible();await page.locator('a[href="./index.html"]').first().click();await expect(page.locator('#btnStartLive')).toBeVisible();await page.locator('#btnNavPresentation').click();await expect(page.locator('h1')).toContainText('Show the idea');
    const keys=await page.evaluate(async()=>{const names=await caches.keys();return names.filter(n=>n.startsWith('netra-screen-offline-'));});expect(keys).toEqual(['netra-screen-offline-v23']);
  }finally{await context.close();}
});
