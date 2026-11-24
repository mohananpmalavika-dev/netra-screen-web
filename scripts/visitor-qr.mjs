import {fileURLToPath} from 'node:url';
import QRCode from 'qrcode';
import {mkdir,writeFile} from 'node:fs/promises';
const url='https://mindmesh-netra.web.app/',out=new URL('../images/',import.meta.url);await mkdir(out,{recursive:true});
await writeFile(new URL('visitor-qr.svg',out),await QRCode.toString(url,{type:'svg',errorCorrectionLevel:'M',margin:3,color:{dark:'#0c1024ff',light:'#ffffffff'}}));
await QRCode.toFile(fileURLToPath(new URL('visitor-qr.png',out)),url,{width:1200,errorCorrectionLevel:'M',margin:3,color:{dark:'#0c1024ff',light:'#ffffffff'}});
console.log('Generated high-contrast, fast-scanning QR for '+url);
