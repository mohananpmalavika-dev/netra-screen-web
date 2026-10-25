import { PROJECT_COPY } from './project-copy.mjs';
import './offline-status.js';

let language = 'en';
let currentSlide = 1;
const totalSlides = 8;
let currentMode = 'deck'; // 'deck' or 'report'

// Pitch timer state
let timerRunning = false;
let timerSeconds = 0;
let timerInterval = null;

// Simulator state
let currentSimMode = 'horiz';
let simTimer = null;
let simStep = 0;
let wavePhase = 0;
let waveAnimFrame = null;

const simConfigs = {
  horiz: {
    steps: [
      { target: { x: 20, y: 50 }, eye: { x: -14, y: 0 } },
      { target: { x: 80, y: 50 }, eye: { x: 14, y: 0 } },
    ],
    metricSync: { en: '98.4% (Pearson r: 0.98)', ml: '98.4% (പിയേഴ്സൺ r: 0.98)' },
    metricStab: { en: 'High (Hold error < 1.1px)', ml: 'ഉയർന്ന സ്ഥിരത (വ്യതിയാനം < 1.1px)' },
    metricStatus: { en: '✓ Normal Parallel Pursuit', ml: '✓ തുല്യമായ സമാന്തര ചലനം (Normal)' }
  },
  vert: {
    steps: [
      { target: { x: 50, y: 22 }, eye: { x: 0, y: -10 } },
      { target: { x: 50, y: 78 }, eye: { x: 0, y: 10 } },
    ],
    metricSync: { en: '97.6% (Pearson r: 0.97)', ml: '97.6% (പിയേഴ്സൺ r: 0.97)' },
    metricStab: { en: 'High (Hold error < 1.3px)', ml: 'ഉയർന്ന സ്ഥിരത (വ്യതിയാനം < 1.3px)' },
    metricStatus: { en: '✓ Normal Vertical Tracking', ml: '✓ ലംബ ചലനം സാധാരണ നിലയിൽ' }
  },
  diag: {
    steps: [
      { target: { x: 22, y: 24 }, eye: { x: -12, y: -9 } },
      { target: { x: 78, y: 76 }, eye: { x: 12, y: 9 } },
    ],
    metricSync: { en: '96.8% (Pearson r: 0.96)', ml: '96.8% (പിയേഴ്സൺ r: 0.96)' },
    metricStab: { en: 'High (Hold error < 1.4px)', ml: 'ഉയർന്ന സ്ഥിരത (വ്യതിയാനം < 1.4px)' },
    metricStatus: { en: '✓ Normal Diagonal Alignment', ml: '✓ കോണോടുകോൺ ചലനം കൃത്യം' }
  },
  fix: {
    steps: [
      { target: { x: 50, y: 50 }, eye: { x: 0, y: 0 } },
      { target: { x: 50, y: 50 }, eye: { x: 0.5, y: -0.5 } },
    ],
    metricSync: { en: '99.5% (Sustained Focus)', ml: '99.5% (തുടർച്ചയായ സ്ഥിരനോട്ടം)' },
    metricStab: { en: 'Excellent (Drift < 0.6px)', ml: 'മികച്ച സ്ഥിരത (ചലനം < 0.6px)' },
    metricStatus: { en: '✓ Stable Central Fixation', ml: '✓ കേന്ദ്രീകൃത സ്ഥിരനോട്ടം സുരക്ഷിതം' }
  }
};

function render() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-project-copy]').forEach(el => {
    const val = PROJECT_COPY[language][el.dataset.projectCopy] || PROJECT_COPY.en[el.dataset.projectCopy] || '';
    if (val) el.textContent = val;
  });
  const langBtn = document.getElementById('presentationLang');
  if (langBtn) langBtn.textContent = language === 'en' ? 'മലയാളം' : 'English';
  updateSlideUI();
  updateSimMetrics();
}

// -----------------------------------------------------------------------------
// SLIDE NAVIGATION & PROGRESS
// -----------------------------------------------------------------------------
function initDots() {
  const rail = document.getElementById('presDotsRail');
  if (!rail) return;
  rail.innerHTML = '';
  for (let i = 1; i <= totalSlides; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `pres-dot ${i === currentSlide ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Jump to slide ${i}`);
    dot.addEventListener('click', () => goToSlide(i));
    rail.appendChild(dot);
  }
}

function updateSlideUI() {
  const slides = document.querySelectorAll('.pres-slide');
  slides.forEach(slide => {
    const num = parseInt(slide.dataset.slide, 10);
    if (currentMode === 'deck') {
      if (num === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    } else {
      slide.classList.add('active');
    }
  });

  // Dots
  const dots = document.querySelectorAll('.pres-dot');
  dots.forEach((dot, idx) => {
    if (idx + 1 === currentSlide) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Counter & Progress Bar
  const counter = document.getElementById('presCounter');
  if (counter) {
    const padNum = String(currentSlide).padStart(2, '0');
    const padTotal = String(totalSlides).padStart(2, '0');
    counter.textContent = `${padNum} / ${padTotal}`;
  }

  const progressBar = document.getElementById('presProgressBar');
  if (progressBar) {
    const pct = ((currentSlide) / totalSlides) * 100;
    progressBar.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', String(currentSlide));
  }

  // Prev / Next button states
  const btnPrev = document.getElementById('btnPrevSlide');
  const btnNext = document.getElementById('btnNextSlide');
  if (btnPrev) btnPrev.disabled = currentSlide <= 1;
  if (btnNext) btnNext.disabled = currentSlide >= totalSlides;
}

function goToSlide(target) {
  if (target < 1) target = 1;
  if (target > totalSlides) target = totalSlides;
  currentSlide = target;
  updateSlideUI();

  if (currentMode === 'deck') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const targetEl = document.getElementById(`slide-${target}`);
    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function nextSlide() {
  if (currentSlide < totalSlides) goToSlide(currentSlide + 1);
}

function prevSlide() {
  if (currentSlide > 1) goToSlide(currentSlide - 1);
}

// -----------------------------------------------------------------------------
// VIEW MODE TOGGLE (Slide Deck vs Executive Report)
// -----------------------------------------------------------------------------
function setViewMode(mode) {
  currentMode = mode;
  const main = document.getElementById('presMain');
  const btnDeck = document.getElementById('btnModeDeck');
  const btnReport = document.getElementById('btnModeReport');
  const dock = document.getElementById('presDock');

  if (mode === 'deck') {
    main.classList.remove('mode-report');
    main.classList.add('mode-deck');
    btnDeck.classList.add('active');
    btnReport.classList.remove('active');
    if (dock) dock.style.display = 'flex';
  } else {
    main.classList.remove('mode-deck');
    main.classList.add('mode-report');
    btnReport.classList.add('active');
    btnDeck.classList.remove('active');
    if (dock) dock.style.display = 'none';
  }
  updateSlideUI();
}

// -----------------------------------------------------------------------------
// PITCH TIMER
// -----------------------------------------------------------------------------
function updateTimerDisplay() {
  const el = document.getElementById('presTimerVal');
  if (!el) return;
  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const secs = String(timerSeconds % 60).padStart(2, '0');
  el.textContent = `${mins}:${secs}`;
}

function toggleTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
  } else {
    timerRunning = true;
    timerInterval = setInterval(() => {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  }
}

// -----------------------------------------------------------------------------
// FULLSCREEN
// -----------------------------------------------------------------------------
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
}

// -----------------------------------------------------------------------------
// INTERACTIVE EYE-TRACKING SIMULATOR
// -----------------------------------------------------------------------------
function updateSimMetrics() {
  const cfg = simConfigs[currentSimMode];
  if (!cfg) return;
  const syncEl = document.getElementById('metricSyncVal');
  const stabEl = document.getElementById('metricStabVal');
  const statusEl = document.getElementById('metricStatusVal');
  if (syncEl) syncEl.textContent = cfg.metricSync[language] || cfg.metricSync.en;
  if (stabEl) stabEl.textContent = cfg.metricStab[language] || cfg.metricStab.en;
  if (statusEl) statusEl.textContent = cfg.metricStatus[language] || cfg.metricStatus.en;
}

function runSimCycle() {
  const cfg = simConfigs[currentSimMode];
  if (!cfg) return;
  const frame = cfg.steps[simStep % cfg.steps.length];
  simStep++;

  const targetEl = document.getElementById('simTarget');
  const irisLeft = document.getElementById('simIrisLeft');
  const irisRight = document.getElementById('simIrisRight');

  if (targetEl) {
    targetEl.style.left = `${frame.target.x}%`;
    targetEl.style.top = `${frame.target.y}%`;
  }
  if (irisLeft) {
    irisLeft.style.transform = `translate(${frame.eye.x}px, ${frame.eye.y}px)`;
  }
  if (irisRight) {
    irisRight.style.transform = `translate(${frame.eye.x}px, ${frame.eye.y}px)`;
  }
}

function setSimMode(mode) {
  currentSimMode = mode;
  simStep = 0;
  document.querySelectorAll('.sim-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btnSim${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');
  updateSimMetrics();
  runSimCycle();
}

function drawSimWaveform() {
  const canvas = document.getElementById('simWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background grid lines
  ctx.strokeStyle = '#1e2440';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Left Eye Signal Wave (Mint)
  ctx.strokeStyle = '#78e4d0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const freq = currentSimMode === 'fix' ? 0.02 : 0.06;
  const amp = currentSimMode === 'fix' ? 3 : 16;
  for (let x = 0; x < w; x++) {
    const y = h / 2 + Math.sin(x * freq + wavePhase) * amp;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Right Eye Signal Wave (Indigo - slight phase sync)
  ctx.strokeStyle = '#b9a3ff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x < w; x++) {
    const y = h / 2 + Math.sin(x * freq + wavePhase + 0.04) * (amp * 0.98);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  wavePhase += 0.05;
  waveAnimFrame = requestAnimationFrame(drawSimWaveform);
}

// -----------------------------------------------------------------------------
// EVENT LISTENERS & SHORTCUTS
// -----------------------------------------------------------------------------
document.getElementById('btnPrevSlide')?.addEventListener('click', prevSlide);
document.getElementById('btnNextSlide')?.addEventListener('click', nextSlide);
document.getElementById('btnModeDeck')?.addEventListener('click', () => setViewMode('deck'));
document.getElementById('btnModeReport')?.addEventListener('click', () => setViewMode('report'));
document.getElementById('presTimerBtn')?.addEventListener('click', toggleTimer);
document.getElementById('btnFullscreen')?.addEventListener('click', toggleFullscreen);

document.getElementById('btnSimHoriz')?.addEventListener('click', () => setSimMode('horiz'));
document.getElementById('btnSimVert')?.addEventListener('click', () => setSimMode('vert'));
document.getElementById('btnSimDiag')?.addEventListener('click', () => setSimMode('diag'));
document.getElementById('btnSimFix')?.addEventListener('click', () => setSimMode('fix'));

document.getElementById('presentationLang')?.addEventListener('click', () => {
  language = language === 'en' ? 'ml' : 'en';
  render();
});

document.getElementById('printPresentation')?.addEventListener('click', () => window.print());

// Keyboard navigation
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    if (currentMode === 'deck') {
      e.preventDefault();
      nextSlide();
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
    if (currentMode === 'deck') {
      e.preventDefault();
      prevSlide();
    }
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullscreen();
  } else if (e.key === 'Home') {
    goToSlide(1);
  } else if (e.key === 'End') {
    goToSlide(totalSlides);
  }
});

// Touch gesture swipe support
let touchStartX = 0;
let touchEndX = 0;

window.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const deltaX = touchEndX - touchStartX;
  if (Math.abs(deltaX) > 50 && currentMode === 'deck') {
    if (deltaX < 0) nextSlide();
    else prevSlide();
  }
}, { passive: true });

// -----------------------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------------------
initDots();
render();
runSimCycle();
if (simTimer) clearInterval(simTimer);
simTimer = setInterval(runSimCycle, 1600);
drawSimWaveform();
