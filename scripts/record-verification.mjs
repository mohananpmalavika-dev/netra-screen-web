import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const results=JSON.parse(await readFile('test-results/browser-results.json','utf8'));
const build=JSON.parse(await readFile('dist/build-receipt.json','utf8'));
if(results.stats.unexpected||results.stats.skipped||results.stats.flaky)throw new Error('Browser verification must pass with no skipped/flaky tests.');
for(const file of build.files){
  const hash=createHash('sha256').update(await readFile(file.path)).digest('hex');
  if(hash!==file.sha256)throw new Error(`Source changed since build: ${file.path}`);
}
const report={version:build.version,verifiedAt:new Date().toISOString(),buildReceipt:'dist/build-receipt.json',
  browserTests:{passed:results.stats.expected,failed:results.stats.unexpected,skipped:results.stats.skipped,flaky:results.stats.flaky,engine:'Chromium',packagedFiles:process.argv.includes('--packaged')},
  buildChecks:'Syntax checks, Node regression tests, pinned vendor integrity and explicit deployment allowlist passed in npm run build.',
  hardwareDevicesTested:[],clinicalValidation:false,deployed:false,
  limitations:['Test camera/landmark fixtures are software verification only.','Real Android Chrome and iOS Safari phone rehearsal remains pending.','Malayalam native-speaker and eye-care professional review remain pending.'],
  artifacts:build.files};
await writeFile('verification.json',JSON.stringify(report,null,2)+'\n');
console.log(`Receipt recorded: ${report.browserTests.passed} browser tests passed; no clinical validation or deployment claimed.`);
