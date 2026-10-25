import test from 'node:test';
import assert from 'node:assert/strict';
import { AcuityRun, ActiveTimer, BlinkTracker, optotypePixels, researchMetrics, clinicalTriage, relativeIris, framing } from '../vision-core.mjs';

test('acuity cannot assign a passing result before five trials, and fails closed',()=>{
  const run=new AcuityRun('OD');
  for(let i=0;i<4;i++)run.answer('RIGHT','RIGHT');
  assert.equal(run.passed,null);assert.equal(run.done,false);
  run.answer('LEFT','RIGHT');assert.equal(run.passed,60);assert.equal(run.level,1);
  for(let i=0;i<5;i++)run.answer('LEFT','RIGHT');
  assert.equal(run.done,true);assert.equal(run.result().angularEquivalent,'6/60');
  run.answer('RIGHT','RIGHT');assert.equal(run.responses.length,10);
});
test('acuity all-wrong produces no passing level; all correct reaches 6/6',()=>{
  const fail=new AcuityRun('OS');for(let i=0;i<5;i++)fail.answer('LEFT','RIGHT');
  assert.equal(fail.done,true);assert.equal(fail.result().angularEquivalent,null);
  const pass=new AcuityRun('OD');for(let i=0;i<35;i++)pass.answer('UP','UP');
  assert.equal(pass.done,true);assert.equal(pass.result().angularEquivalent,'6/6');
});
test('physical E geometry scales with viewing distance and angular level',()=>{
  const pixels=optotypePixels(6,400,4);
  assert.ok(Math.abs(pixels-2.327106)<0.0001);
  assert.ok(Math.abs(optotypePixels(6,800,4)-pixels*2)<0.00001);
  assert.equal(optotypePixels(6,0,4),null);
});
test('timer excludes hidden/paused time and limits long scheduling gaps',()=>{
  const t=new ActiveTimer(1000);t.start(0);t.tick(200);t.pause();t.tick(50000);assert.equal(t.elapsedMs,200);
  t.start(50000);t.tick(50200);assert.equal(t.elapsedMs,400);
  t.tick(60000);assert.equal(t.elapsedMs,650);
  t.tick(60200);assert.equal(t.tick(60400),true);assert.equal(t.elapsedMs,1000);
});
test('blink tracker counts closure/reopening only; excludes long closures and face gaps',()=>{
  const b=new BlinkTracker();let now=0;
  for(let i=0;i<45;i++){b.observe(.3,now);now+=70;}
  b.observe(.1,now);now+=140;b.observe(.3,now);assert.equal(b.times.length,1);
  now+=100;b.observe(.1,now);now+=1000;b.observe(.3,now);assert.equal(b.times.length,1);
  now+=100;b.observe(.1,now);b.gap();now+=100;b.observe(.3,now);assert.equal(b.times.length,1);
  assert.equal(b.summary().blinksPerMinute,null);
  for(let i=0;i<230;i++){now+=70;b.observe(.3,now);}
  assert.ok(b.summary().blinksPerMinute>0);assert.ok(b.summary().observedSeconds<20);
});
test('invalid input cannot become plausible eye coordinates or good framing',()=>{
  assert.equal(relativeIris({x:0,y:0},{x:0,y:0},{x:0,y:0}),null);
  assert.equal(relativeIris({x:0,y:0},{x:50,y:0},{x:NaN,y:1}),null);
  assert.deepEqual(relativeIris({x:0,y:0},{x:50,y:0},{x:25,y:5}),{x:.5,y:.1});
  assert.equal(framing(null,640,480).ok,false);
});
test('empty and constant research capture remain unavailable, never fabricated healthy data',()=>{
  const empty=researchMetrics([],0);assert.equal(empty.movementCorrelation,null);assert.equal(empty.fixationRms,null);assert.equal(empty.acceptedFractionPct,null);
  const constant=Array.from({length:40},(_,i)=>({task:'HORIZONTAL',taskMs:i*50,left:{x:.5,y:0},right:{x:.5,y:0}}));
  const m=researchMetrics(constant,80);assert.equal(m.movementCorrelation,null);assert.equal(m.excursionDifferencePct,null);assert.equal(m.acceptedFractionPct,50);
});
test('correlation preserves negative values and ignores discontinuous acquisitions',()=>{
  const samples=Array.from({length:40},(_,i)=>({task:'HORIZONTAL',taskMs:i*50,acquiredMs:i*50,left:{x:Math.sin(i/5),y:.1},right:{x:-Math.sin(i/5),y:.1}}));
  const m=researchMetrics(samples,40);assert.ok(m.movementCorrelation<-.99);assert.ok(m.excursionDifferencePct<.001);
  samples.forEach((s,i)=>s.acquiredMs=i*1000);assert.equal(researchMetrics(samples,40).movementCorrelation,null);
});
test('fixation compares within each held target rather than between target jumps',()=>{
  const samples=Array.from({length:80},(_,i)=>{const taskMs=i*50;const x=Math.floor(taskMs/1000)%2;return {task:'JUMPS',taskMs,left:{x,y:0},right:{x,y:0}};});
  assert.equal(researchMetrics(samples,80).fixationRms,0);
});

test('clinical triage stratifies risk correctly and preserves safety disclaimer', () => {
  const normal = { acceptedFrames: 100, acceptedFractionPct: 85, excursionDifferencePct: 5, movementCorrelation: 0.9, fixationRms: 0.05 };
  const resNormal = clinicalTriage(normal, false, 'en');
  assert.equal(resNormal.priority, 'CONTINUE_MONITORING');
  assert.equal(resNormal.badgeClass, 'triage-monitoring');
  assert.ok(resNormal.disclaimer.includes('Automated screening aid'));

  const incomplete = { acceptedFrames: 20, acceptedFractionPct: 30, excursionDifferencePct: null, movementCorrelation: null, fixationRms: null };
  const resIncomplete = clinicalTriage(incomplete, false, 'en');
  assert.equal(resIncomplete.priority, 'INCONCLUSIVE_TEST');

  const critical = { acceptedFrames: 100, acceptedFractionPct: 85, excursionDifferencePct: 45, movementCorrelation: 0.9, fixationRms: 0.05 };
  const resCritical = clinicalTriage(critical, false, 'en');
  assert.equal(resCritical.priority, 'URGENT_EVALUATION');
  assert.equal(resCritical.badgeClass, 'triage-urgent');

  const routine = { acceptedFrames: 100, acceptedFractionPct: 85, excursionDifferencePct: 28, movementCorrelation: 0.8, fixationRms: 0.05 };
  const resRoutine = clinicalTriage(routine, false, 'en');
  assert.equal(resRoutine.priority, 'ROUTINE_CONSULTATION');
  assert.equal(resRoutine.badgeClass, 'triage-routine');

  const mlRes = clinicalTriage(critical, false, 'ml');
  assert.ok(mlRes.guidance.includes('ശിശു നേത്രരോഗ'));
});

