import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('QR partner path exposes the evidence, customer hypothesis and a concrete ask',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/join.html');await page.getByRole('link',{name:'Open partner pack'}).click();
 await expect(page).toHaveURL(/investor.html$/);await expect(page.locator('h1')).toContainText('Eye-movement research');
 await expect(page.locator('#connect')).toContainText('Public email and phone details have not been selected');
 await expect(page.locator('#plan')).toContainText('does not promise clinical validation');
 for(const path of ['/docs/NETRA-SCREEN-investor-brief.pdf','/docs/NETRA-SCREEN-investor-deck.pdf','/media/NETRA-SCREEN-recorded-walkthrough.webm','/media/walkthrough-captions.vtt'])expect((await page.request.get(path)).status()).toBe(200);
 const video=page.locator('video');await expect(video).not.toHaveAttribute('autoplay');expect(await video.evaluate(el=>el.paused)).toBe(true);
 expect(errors).toEqual([]);
});
test('discussion note downloads locally and never claims to send a meeting request',async({page})=>{
 const writes=[];page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());});
 await page.goto('/investor.html');await page.locator('#discussionName').fill('Example visitor');await page.locator('#discussionContact').fill('visitor@example.invalid');await page.locator('#discussionNext').fill('Discuss device testing.');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Save discussion note'}).click();
 const content=await readFile(await (await download).path(),'utf8');expect(content).toContain('visitor@example.invalid');expect(content).toContain('not been sent or submitted');
 await expect(page.locator('[data-discussion-status]')).toContainText('It has not been sent');expect(writes).toEqual([]);
 await page.reload();await expect(page.locator('#discussionContact')).toHaveValue('');
});
test('presenter answers the buyer and milestone questions without inventing traction',async({page})=>{
 await page.goto('/investor.html');await page.locator('.guide-launcher').click();
 const guide=page.locator('#netraGuide');await guide.locator('#guideQuestion').fill('Who pays?');await guide.locator('button[type=submit]').click();await expect(guide.locator('[data-guide-answer]')).toContainText('possible buyer');
 await guide.locator('#guideQuestion').fill('What are the 90 day milestones?');await guide.locator('button[type=submit]').click();await expect(guide.locator('[data-guide-answer]')).toContainText('does not promise clinical validation');
});
