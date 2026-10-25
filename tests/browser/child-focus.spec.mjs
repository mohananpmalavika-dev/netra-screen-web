import {test,expect} from '@playwright/test';
const english={name:'Installed English',lang:'en-IN',localService:true};
const malayalam={name:'Installed Malayalam',lang:'ml-IN',localService:true};
async function fakeSpeech(page,voices=[english]){
  await page.addInitScript(initial=>{
    let voices=initial;window.spoken=[];window.speechCancels=0;
    const synth=new EventTarget();
    synth.getVoices=()=>voices;synth.cancel=()=>window.speechCancels++;
    synth.speak=utterance=>window.spoken.push({text:utterance.text,lang:utterance.lang,voice:utterance.voice.name});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});
    window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
    window.setTestVoices=next=>{voices=next;synth.dispatchEvent(new Event('voiceschanged'));};
    window.cameraCalls=0;navigator.mediaDevices.getUserMedia=()=>{window.cameraCalls++;throw new DOMException('Denied','NotAllowedError');};
  },voices);
}
test('a child can start by tapping their picture; the ready screen never opens the camera',async({page})=>{
  await fakeSpeech(page);await page.goto('/index.html');await page.locator('[data-comp="fish"]').click();await page.locator('#btnStartLive').click();
  await expect(page.locator('#viewReady')).toHaveClass(/active-view/);await expect(page.locator('.ready-hand')).toBeVisible();
  await expect(page.locator('#readyCompanion')).toHaveText('🐠');await expect(page.locator('#btnFocusReady')).toHaveAccessibleName('Tap the fish');
  expect(await page.evaluate(()=>window.cameraCalls)).toBe(0);expect(await page.evaluate(()=>window.spoken.at(-1).text)).toContain('Tap the fish');
  await page.locator('#btnReadyBack').click();await expect(page.locator('#viewHome')).toHaveClass(/active-view/);expect(await page.evaluate(()=>window.cameraCalls)).toBe(0);
  await page.locator('#btnStartLive').click();await page.locator('#btnFocusReady').click();await expect.poll(()=>page.evaluate(()=>window.cameraCalls)).toBe(1);
  await expect(page.locator('#sessionNotice')).toContainText('permission was denied');
});
test('voice guides practice, respects mute, and stops on background and exit',async({page})=>{
  await fakeSpeech(page);await page.clock.install();await page.goto('/index.html');await page.locator('#btnStartDemo').click();
  await page.locator('#btnFocusReady').click();await expect(page.locator('#viewTracking')).toHaveClass(/active-view/);
  expect(await page.evaluate(()=>window.spoken.at(-1).text)).toContain('Follow the butterfly');
  await expect(page.locator('#camPip')).toHaveAttribute('aria-hidden','true');await expect(page.locator('#camPip')).toHaveCSS('opacity','0');await expect(page.locator('.mini-cam-pip')).toHaveCount(0);
  const origin=await page.locator('#targetCompanion').getAttribute('style');await page.clock.runFor(1000);expect(await page.locator('#targetCompanion').getAttribute('style')).not.toBe(origin);
  await page.locator('#audioToggleBtn').click();await expect(page.locator('#audioToggleBtn')).toHaveAttribute('aria-pressed','false');
  const muted=await page.evaluate(()=>window.spoken.length);await page.clock.runFor(8500);expect(await page.evaluate(()=>window.spoken.length)).toBe(muted);
  await page.locator('#audioToggleBtn').click();expect(await page.evaluate(()=>window.spoken.length)).toBeGreaterThan(muted);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const hidden=await page.evaluate(()=>({count:window.spoken.length,cancels:window.speechCancels}));await page.clock.runFor(10000);
  expect(await page.evaluate(()=>window.spoken.length)).toBe(hidden.count);await expect(page.locator('#btnPauseSession')).toHaveText('Resume');
  await page.locator('#btnExitSession').click();expect(await page.evaluate(()=>window.speechCancels)).toBeGreaterThan(hidden.cancels);expect(await page.evaluate(()=>window.cameraCalls)).toBe(0);
});
test('Malayalam uses an installed local voice; a missing voice has an explicit guardian fallback',async({page})=>{
  await fakeSpeech(page,[english,malayalam]);await page.goto('/index.html');await page.locator('#langToggleBtn').click();await page.locator('#btnStartDemo').click();
  expect(await page.evaluate(()=>window.spoken.at(-1).lang)).toBe('ml-IN');await expect(page.locator('#readyVoiceStatus')).toBeEmpty();
  await page.locator('#btnReadyBack').click();await page.evaluate(en=>window.setTestVoices([en,{name:'Online Malayalam',lang:'ml-IN',localService:false}]),english);await page.locator('#btnStartDemo').click();
  expect(await page.evaluate(()=>window.spoken.at(-1).voice)).toBe('Installed English');await expect(page.locator('#readyVoiceStatus')).not.toBeEmpty();
  await page.locator('#btnReadyBack').click();await page.evaluate(()=>window.setTestVoices([{name:'Online only',lang:'en-US',localService:false}]));
  const count=await page.evaluate(()=>window.spoken.length);await page.locator('#btnStartDemo').click();expect(await page.evaluate(()=>window.spoken.length)).toBe(count);await expect(page.locator('#readyVoiceStatus')).not.toBeEmpty();
});
test('late voice availability cannot speak after the child has left the ready screen; ready fits a phone',async({page})=>{
  await fakeSpeech(page,[]);await page.setViewportSize({width:320,height:700});await page.goto('/index.html');await page.locator('#langToggleBtn').click();await page.locator('#btnStartDemo').click();
  expect(await page.evaluate(()=>window.spoken.length)).toBe(0);const target=await page.locator('#btnFocusReady').boundingBox();expect(target.width).toBeGreaterThanOrEqual(140);expect(target.x+target.width).toBeLessThanOrEqual(320);
  await expect(page.locator('#btnFocusReady')).toBeInViewport({ratio:1});expect(target.y+target.height).toBeLessThanOrEqual((await page.locator('.app-footer').boundingBox()).y);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'test-results/child-ready-mobile.png'});
  await page.locator('#btnReadyBack').click();await page.evaluate(en=>window.setTestVoices([en]),english);expect(await page.evaluate(()=>window.spoken.length)).toBe(0);
  await page.locator('#btnStartDemo').click();expect(await page.evaluate(()=>window.spoken.length)).toBe(1);
});
