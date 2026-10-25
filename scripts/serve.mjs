import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep, basename } from 'node:path';
const root=resolve(process.env.NETRA_SERVE_DIST==='1'?'dist':'.');
const port=Number(process.env.PORT||8080);
const hosting=JSON.parse(await readFile('firebase.json','utf8'));
const csp=hosting.hosting[0].headers[0].headers.find(h=>h.key==='Content-Security-Policy').value;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.task':'application/octet-stream','.png':'image/png','.pdf':'application/pdf','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('Cross-Origin-Opener-Policy','same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy','credentialless');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Permissions-Policy','camera=(self), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',csp);
  res.setHeader('Cache-Control','no-cache');
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(path.endsWith('/')?path+'index.html':path));
    const relative=file.slice(root.length+1);
    if(!file.startsWith(root+sep)||relative.split(/[\\/]/).some(p=>p.startsWith('.'))||/^(node_modules|tests|scripts)([\\/]|$)/.test(relative)||['package.json','package-lock.json','firebase.json','serve.py'].includes(basename(file))){res.writeHead(404);res.end('Not found');return;}
    const info=await stat(file);if(!info.isFile())throw new Error('Not a file');
    const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`NetraScreen: http://localhost:${port} (${root})`));
function shutdown(){server.closeAllConnections();server.close(()=>process.exit(0));}
process.on('SIGTERM',shutdown);
process.on('SIGINT',shutdown);
