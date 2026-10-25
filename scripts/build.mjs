import { mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import '../static-assets.js';
const ASSETS=globalThis.NETRA_ASSETS;
const output=resolve('dist');
if(dirname(output)!==process.cwd())throw new Error('Build output must be the workspace dist directory.');
await rm(output,{recursive:true,force:true});
// Explicit allowlist: credentials, development tools and source tests are never published.
const receipt={version:'0.5.1',builtAt:new Date().toISOString(),clinicalRelease:false,files:[]};
for(const name of [...ASSETS,...globalThis.NETRA_EXTRA_ASSETS,'sw.js']){
  const bytes=await readFile(name);if(!bytes.length)throw new Error(`Empty asset: ${name}`);
  await mkdir(dirname(`dist/${name}`),{recursive:true});await copyFile(name,`dist/${name}`);
  receipt.files.push({path:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile('dist/build-receipt.json',JSON.stringify(receipt,null,2)+'\n');
console.log(`Packaged ${receipt.files.length} assets. Receipt: dist/build-receipt.json. Clinical release: false.`);
