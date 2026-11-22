import QRCode from 'qrcode';
import {mkdir,writeFile} from 'node:fs/promises';
const url='https://mindmesh-netra.web.app/investor.html';
await mkdir('../output/summit',{recursive:true});
await QRCode.toFile('../output/summit/NETRA-SCREEN-partner-QR.png',url,{width:1200,errorCorrectionLevel:'H',margin:4,color:{dark:'#12172fff',light:'#ffffffff'}});
await writeFile('../output/summit/NETRA-SCREEN-partner-QR.svg',await QRCode.toString(url,{type:'svg',errorCorrectionLevel:'H',margin:4,color:{dark:'#12172fff',light:'#ffffffff'}}));
console.log('Generated partner-pack QR: '+url);
