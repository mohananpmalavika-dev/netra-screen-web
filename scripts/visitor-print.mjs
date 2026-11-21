import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage({reducedMotion:'reduce',serviceWorkers:'block'});
try{await page.goto('http://127.0.0.1:8080/join.html',{waitUntil:'domcontentloaded',timeout:90000});await page.emulateMedia({media:'print'});await page.pdf({path:'../output/pdf/NETRA-SCREEN-visitor-QR-A4.pdf',format:'A4',printBackground:true,margin:{top:'8mm',right:'8mm',bottom:'8mm',left:'8mm'}});console.log('Exported clean white visitor QR card.');}finally{await browser.close();}
