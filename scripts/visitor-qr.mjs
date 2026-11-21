import {fileURLToPath} from 'node:url';
import QRCode from 'qrcode';
import {mkdir,writeFile} from 'node:fs/promises';
const url='https://mindmesh-netra.web.app/',out=new URL('../images/',import.meta.url);await mkdir(out,{recursive:true});
await writeFile(new URL('visitor-qr.svg',out),await QRCode.toString(url,{type:'svg',errorCorrectionLevel:'H',margin:4,color:{dark:'#12172fff',light:'#ffffffff'}}));
await QRCode.toFile(fileURLToPath(new URL('visitor-qr.png',out)),url,{width:1200,errorCorrectionLevel:'H',margin:4,color:{dark:'#12172fff',light:'#ffffffff'}});
console.log('Generated print-ready QR for '+url);
