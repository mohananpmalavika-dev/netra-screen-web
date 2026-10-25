import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
test('YIP research stays home, checked consent never auto-starts camera, presentation and tools are accessible',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.cameraRequests=0;navigator.mediaDevices.getUserMedia=()=>{window.cameraRequests++;return Promise.reject(new Error('Unexpected camera start'));};});
  for(const route of ['/','/index.html','/tracking.html']){
    await page.goto(route);await expect(page.locator('h1')).toContainText('Understanding how eyes move');await expect(page.locator('.hero-badge')).toContainText('YIP');await expect(page.locator('#consentCheckbox')).toBeChecked();await expect(page.locator('#btnStartLive')).toBeVisible();expect(await page.evaluate(()=>window.cameraRequests)).toBe(0);
  }
  await page.locator('[data-comp="fish"]').focus();await page.keyboard.press('Enter');await expect(page.locator('[data-comp="fish"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('#btnNavPresentation').click();await expect(page).toHaveURL(/presentation.html$/);await expect(page.locator('h1')).toContainText('Show the idea');await expect(page.locator('body')).toContainText('clinical accuracy');
  const pdf=await page.request.get('/docs/NETRA_SCREEN_MindMesh.pdf');expect(pdf.status()).toBe(200);expect(pdf.headers()['content-type']).toBe('application/pdf');
  await page.locator('#presentationLang').click();await expect(page.locator('html')).toHaveAttribute('lang','ml');await expect(page.locator('h1')).toContainText('ആശയം');
  await page.goto('/index.html');await expect(page.locator('#btnNavOtherTests .deck-btn-text')).toHaveText('Eye rest');await page.locator('#btnNavOtherTests').click();await expect(page).toHaveURL(/eye-tests.html$/);await expect(page.locator('h1')).toHaveText('Take a short rest for your eyes');await expect(page.locator('.activity-card')).toHaveCount(3);
  await page.locator('a[href="./index.html"]').first().click();await expect(page.locator('#btnStartLive')).toBeVisible();expect(errors).toEqual([]);
});
test('redesign fits desktop and phone in both languages; setup and reports remain reachable',async({page})=>{
  await mkdir('test-results',{recursive:true});
  for(const width of [1440,360]){
    await page.setViewportSize({width,height:width===1440?1100:800});await page.goto('/index.html');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('#viewHome').evaluate(el=>el.scrollTop=0);await page.screenshot({path:`test-results/yip-home-${width}.png`,fullPage:true});
    await page.locator('a[href="#researchSetup"]').click();await expect(page.locator('#consentCheckbox')).toBeInViewport();
    for(const lang of ['ml','en']){await page.locator('#langToggleBtn').click();await expect(page.locator('html')).toHaveAttribute('lang',lang);await expect(page.locator('#consentCheckbox')).toBeChecked();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
    await page.goto('/presentation.html');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/yip-presentation-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1100});await page.goto('/index.html');await page.clock.install();await page.locator('#btnStartDemo').click();await page.screenshot({path:'test-results/yip-capture.png'});await page.clock.runFor(33500);await expect(page.locator('#viewReport')).toHaveClass(/active-view/);await page.screenshot({path:'test-results/yip-report.png',fullPage:true});await expect(page.locator('#metricCorrelation')).toHaveText('Unavailable');
  await page.locator('#btnRestartSession').click();await expect(page.locator('.hero-badge')).toContainText('YIP');
});
