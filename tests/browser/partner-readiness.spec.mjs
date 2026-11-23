import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('partner evidence gaps and support ask stay visible on a narrow phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/investor.html');
 await expect(page.locator('.partner-lead')).toContainText('guided research workflow');
 await expect(page.locator('.ask-card')).toContainText('Incubation');
 await expect(page.locator('#next-evidence')).toContainText('No real-phone report is published');
 await expect(page.locator('#next-evidence')).toContainText('ophthalmologist or researcher');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('actual-phone log preserves failures and requires all stages for completion',async({page})=>{
 await page.setContent(await readFile('../output/summit/NETRA-SCREEN-team-playbook.html','utf8'));
 const form=page.locator('#phoneRun');
 for(const [name,value] of Object.entries({runId:'TEST-ONLY',tester:'Fixture reviewer',device:'Test handset / OS / browser',build:'test build',conditions:'fixture only',notes:'Test fixture; no physical phone tested'}))await form.locator(`[name=${name}]`).fill(value);
 await form.locator('[name=consent]').check();await form.locator('[name=outcome]').selectOption('completed');
 await form.getByRole('button').click();await expect(page.locator('#runStatus')).toContainText('needs every stage');
 await form.locator('[name=outcome]').selectOption('failed');
 let download=page.waitForEvent('download');await form.getByRole('button').click();
 let saved=JSON.parse(await readFile(await (await download).path(),'utf8'));
 expect(saved.run.outcome).toBe('failed');expect(saved.run.shareApproved).toBe(false);expect(saved.clinicalValidation).toBe(false);
 await form.locator('[name=outcome]').selectOption('completed');await form.locator('[name=reportRef]').fill('private-test-report.json');
 for(let i=0;i<8;i++)await form.locator(`[name=stage${i}]`).check();
 download=page.waitForEvent('download');await form.getByRole('button').click();
 saved=JSON.parse(await readFile(await (await download).path(),'utf8'));
 expect(saved.run.completedStages).toHaveLength(8);expect(saved.run.completedStages).toContain('Diagonal task');
});

test('review export keeps quotation permission separate and sends no data',async({page})=>{
 const writes=[];page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());});
 await page.setContent(await readFile('../output/summit/NETRA-SCREEN-team-playbook.html','utf8'));
 const form=page.locator('#reviewForm');
 for(const [name,value] of Object.entries({context:'Test build',currentMethod:'Test workflow',feedback:'Test feedback'}))await form.locator(`[name=${name}]`).fill(value);
 await form.locator('[name=retainPermission]').check();await form.locator('[name=quotePermission]').check();
 await form.getByRole('button').click();await expect(page.locator('#reviewStatus')).toContainText('exact approved quotation');
 await form.locator('[name=quotePermission]').uncheck();const download=page.waitForEvent('download');await form.getByRole('button').click();
 const saved=JSON.parse(await readFile(await (await download).path(),'utf8'));
 expect(saved.review.retainPermission).toBe(true);expect(saved.review.quotePermission).toBe(false);expect(saved.clinicalEndorsement).toBe(false);expect(writes).toEqual([]);
});
