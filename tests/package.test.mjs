import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import '../static-assets.js';
test('shipped runtime and WASM match pinned vendor hashes and official model',async()=>{
  const manifest=JSON.parse(await readFile('vendor-manifest.json','utf8'));
  assert.equal(manifest.version,'1.1.1');
  for(const file of manifest.files){const bytes=await readFile(file.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256,file.path);}
  assert.equal(manifest.files.find(f=>f.path==='models/face_landmarker.task').sha256,'64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff');
});
test('deployment and offline package includes every source asset and excludes development files',async()=>{
  for(const name of globalThis.NETRA_ASSETS){assert.ok((await readFile(name)).length>0,name);assert.doesNotMatch(name,/node_modules|firebase\.json|^tests\//);}
  const config=JSON.parse(await readFile('firebase.json','utf8'));assert.ok(config.hosting.every(h=>h.public==='dist'));
  const combined=await Promise.all(['index.html','eye-tests.html','tracking.html','app.js','eye-tests.js'].map(p=>readFile(p,'utf8')));
  assert.doesNotMatch(combined.join('\n'),/osdi|osdiScore|renderOsdiQuestions|Healthy Bilateral|No Cylindrical Astigmatism|Normal Trichromatic/);
  assert.match(combined[0],/YIP/);
  assert.match(combined[0],/id="consentCheckbox" checked/);
  assert.ok(globalThis.NETRA_EXTRA_ASSETS.includes('docs/NETRA_SCREEN_MindMesh.pdf'));
  const rest=combined[4];
  assert.doesNotMatch(rest,/acuityScreen|gridScreen|taskScreen|monitorScreen|chartScreen|loadLandmarker|CameraSession|localStorage/);
  assert.ok(!globalThis.NETRA_ASSETS.some(name=>name.startsWith('archive/')));
});
