// Pure measurement and session logic shared by the browser modules.
export const VERSION = '0.5.1';
export const DIRECTIONS = ['RIGHT', 'DOWN', 'LEFT', 'UP'];
export const ACUITY_LEVELS = [60, 36, 24, 18, 12, 9, 6];
const point = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);

export function randomIndex(length, random = Math.random) {
  return Math.min(length - 1, Math.floor(random() * length));
}

export function optotypePixels(denominator, distanceMm, pixelsPerMm) {
  if (![denominator, distanceMm, pixelsPerMm].every(n => Number.isFinite(n) && n > 0)) return null;
  return 2 * distanceMm * Math.tan((5 * denominator / 6) * Math.PI / 21600) * pixelsPerMm;
}

export class AcuityRun {
  constructor(eye) {
    this.eye = eye;
    this.level = 0;
    this.responses = [];
    this.passed = null;
    this.done = false;
  }
  answer(direction, expected) {
    if (this.done || !DIRECTIONS.includes(direction)) return;
    this.responses.push({ denominator: ACUITY_LEVELS[this.level], correct: direction === expected });
    const block = this.responses.filter(r => r.denominator === ACUITY_LEVELS[this.level]);
    if (block.length === 5) {
      if (block.filter(r => r.correct).length >= 4) {
        this.passed = ACUITY_LEVELS[this.level];
        this.level++;
        this.done = this.level === ACUITY_LEVELS.length;
      } else this.done = true;
    }
  }
  result() {
    return { eye: this.eye, completed: this.done, angularEquivalent: this.done && this.passed ? `6/${this.passed}` : null,
      passedDenominator: this.passed, stopReason: this.stopReason || (this.done ? 'task-complete' : null), trials: this.responses.map(r => ({ ...r })) };
  }
}

export function relativeIris(outer, inner, iris) {
  if (![outer, inner, iris].every(point)) return null;
  const [lo, hi] = outer.x < inner.x ? [outer, inner] : [inner, outer];
  const dx = hi.x - lo.x, dy = hi.y - lo.y, d2 = dx * dx + dy * dy;
  if (d2 < 25) return null; // Pixel coordinates; reject eyes narrower than 5 pixels.
  const result = { x: ((iris.x - lo.x) * dx + (iris.y - lo.y) * dy) / d2,
    y: (-(iris.x - lo.x) * dy + (iris.y - lo.y) * dx) / d2 };
  return point(result) && result.x >= -0.2 && result.x <= 1.2 && Math.abs(result.y) <= 0.6 ? result : null;
}

export function eyeAspectRatio(p) {
  const side = ids => {
    if (!ids.every(i => point(p[i]))) return null;
    const d = (a, b) => Math.hypot(p[a].x - p[b].x, p[a].y - p[b].y);
    const width = d(ids[0], ids[3]);
    return width >= 5 ? (d(ids[1], ids[5]) + d(ids[2], ids[4])) / (2 * width) : null;
  };
  const l = side([362, 385, 387, 263, 373, 380]);
  const r = side([33, 160, 158, 133, 153, 144]);
  return l !== null && r !== null ? (l + r) / 2 : null;
}

export function framing(raw, width, height) {
  if (!raw || ![33, 263, 234, 454].every(i => point(raw[i]))) return { ok: false, distance: false, pose: false };
  const fraction = Math.abs(raw[454].x - raw[234].x);
  const roll = Math.atan2((raw[263].y - raw[33].y) * height, (raw[263].x - raw[33].x) * width) * 180 / Math.PI;
  const distance = fraction >= 0.18 && fraction <= 0.85;
  const pose = Math.abs(roll) < 18;
  return { ok: distance && pose, distance, pose, fraction };
}

export class BlinkTracker {
  constructor() {
    this.baseline = [];
    this.times = [];
    this.observedMs = 0;
    this.lastTime = null;
    this.closedAt = null;
    this.lastBlink = null;
  }
  gap() { this.lastTime = null; this.closedAt = null; }
  observe(ear, now) {
    if (!Number.isFinite(ear) || ear < 0.04 || ear > 0.6 || !Number.isFinite(now)) { this.gap(); return; }
    const delta = this.lastTime === null ? 0 : now - this.lastTime;
    if (delta > 250 || delta < 0) this.closedAt = null;
    else if (this.baseline.length >= 45) this.observedMs += delta;
    this.lastTime = now;
    if (this.baseline.length < 45) { this.baseline.push(ear); return; }
    const ordered = [...this.baseline].sort((a, b) => a - b);
    const base = ordered[Math.floor(ordered.length * 0.75)];
    if (ear < base * 0.65 && this.closedAt === null) this.closedAt = now;
    if (ear > base * 0.8 && this.closedAt !== null) {
      const duration = now - this.closedAt;
      if (duration >= 50 && duration <= 800 && (this.lastBlink === null || now - this.lastBlink > 200)) {
        this.times.push(now);
        this.lastBlink = now;
      }
      this.closedAt = null;
    }
  }
  summary() {
    return { blinks: this.times.length, observedSeconds: Math.round(this.observedMs / 1000),
      blinksPerMinute: this.observedMs >= 15000 ? +(this.times.length * 60000 / this.observedMs).toFixed(1) : null,
      calibrated: this.baseline.length === 45 };
  }
}

function correlation(a, b) {
  if (a.length < 20) return null;
  const mean = values => values.reduce((s, v) => s + v, 0) / values.length;
  const ma = mean(a), mb = mean(b);
  let numerator = 0, va = 0, vb = 0;
  for (let i = 0; i < a.length; i++) { const da = a[i] - ma, db = b[i] - mb; numerator += da * db; va += da * da; vb += db * db; }
  return va > 1e-8 && vb > 1e-8 ? Math.max(-1, Math.min(1, numerator / Math.sqrt(va * vb))) : null;
}

export function researchMetrics(samples, processedFrames) {
  const valid = samples.filter(s => point(s.left) && point(s.right));
  const pairs = [];
  for (let i = 1; i < valid.length; i++) {
    const a = valid[i - 1], b = valid[i];
    const gap = (b.acquiredMs ?? b.taskMs) - (a.acquiredMs ?? a.taskMs);
    if (a.task === b.task && b.taskMs > a.taskMs && gap > 0 && gap <= 250) pairs.push([a, b]);
  }
  const corr = correlation(pairs.flatMap(([a,b]) => [b.left.x-a.left.x,b.left.y-a.left.y]),
    pairs.flatMap(([a,b]) => [b.right.x-a.right.x,b.right.y-a.right.y]));
  let excursionDifferencePct = null;
  if (pairs.length >= 20) {
    const sums = ['left', 'right'].map(eye => pairs.reduce((sum, [a,b]) => sum + Math.hypot(b[eye].x-a[eye].x,b[eye].y-a[eye].y),0));
    const maximum = Math.max(...sums);
    if (maximum > 1e-8) excursionDifferencePct = 100 * Math.abs(sums[0]-sums[1]) / maximum;
  }
  const groups = new Map();
  for (const s of valid.filter(s => s.task === 'JUMPS' && s.taskMs % 1000 >= 300)) {
    const key = Math.floor(s.taskMs / 1000);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  let squared = 0, count = 0;
  for (const group of groups.values()) {
    if (group.length < 5) continue;
    for (const eye of ['left','right']) {
      const mx = group.reduce((n,s) => n+s[eye].x,0)/group.length;
      const my = group.reduce((n,s) => n+s[eye].y,0)/group.length;
      for (const s of group) { squared += (s[eye].x-mx)**2+(s[eye].y-my)**2; count++; }
    }
  }
  return { movementCorrelation: corr, fixationRms: count >= 20 ? Math.sqrt(squared/count) : null,
    excursionDifferencePct, acceptedFrames: valid.length, processedFrames,
    acceptedFractionPct: processedFrames > 0 ? 100 * valid.length/processedFrames : null };
}

export class ActiveTimer {
  constructor(durationMs) { this.durationMs = durationMs; this.elapsedMs = 0; this.last = null; this.running = false; }
  start(now) { this.last = now; this.running = true; }
  pause() { this.running = false; this.last = null; }
  tick(now) {
    if (this.running && this.last !== null) this.elapsedMs = Math.min(this.durationMs, this.elapsedMs + Math.max(0, Math.min(250, now-this.last)));
    if (this.running) this.last = now;
    return this.elapsedMs >= this.durationMs;
  }
}
