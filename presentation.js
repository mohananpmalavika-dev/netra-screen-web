import { PROJECT_COPY } from './project-copy.mjs';
import './offline-status.js';

let language = 'en';
let currentSlide = 1;
const totalSlides = 13;
let currentMode = 'deck'; // 'deck' or 'report'

// Pitch timer state
let timerRunning = false;
let timerSeconds = 0;
let timerInterval = null;

// Simulator state & metrics
let currentSimMode = 'horiz'; // 'horiz', 'vert', 'diag', 'fix'
let simTime = 0;
let mouseActive = false;
let mouseX = 50;
let mouseY = 50;
let lastMouseTime = 0;
const waveHistory = [];
const MAX_WAVE_POINTS = 140;

const simConfigs = {
  horiz: {
    metricSync: { en: '98.8% (Pearson r: 0.99)', ml: '98.8% (പിയേഴ്സൺ r: 0.99)' },
    metricStab: { en: 'High (Hold error < 1.1px)', ml: 'ഉയർന്ന സ്ഥിരത (വ്യതിയാനം < 1.1px)' },
    metricStatus: { en: '✓ Normal Parallel Pursuit (H)', ml: '✓ തുല്യമായ സമാന്തര ചലനം (Normal)' }
  },
  vert: {
    metricSync: { en: '97.9% (Pearson r: 0.98)', ml: '97.9% (പിയേഴ്സൺ r: 0.98)' },
    metricStab: { en: 'High (Hold error < 1.2px)', ml: 'ഉയർന്ന സ്ഥിരത (വ്യതിയാനം < 1.2px)' },
    metricStatus: { en: '✓ Normal Vertical Tracking (V)', ml: '✓ ലംബ ചലനം സാധാരണ നിലയിൽ' }
  },
  diag: {
    metricSync: { en: '97.2% (Pearson r: 0.97)', ml: '97.2% (പിയേഴ്സൺ r: 0.97)' },
    metricStab: { en: 'High (Hold error < 1.4px)', ml: 'ഉയർന്ന സ്ഥിരത (വ്യതിയാനം < 1.4px)' },
    metricStatus: { en: '✓ Normal Diagonal Alignment', ml: '✓ കോണോടുകോൺ ചലനം കൃത്യം' }
  },
  fix: {
    metricSync: { en: '99.6% (Sustained Focus)', ml: '99.6% (തുടർച്ചയായ സ്ഥിരനോട്ടം)' },
    metricStab: { en: 'Excellent (Drift < 0.5px)', ml: 'മികച്ച സ്ഥിരത (ചലനം < 0.5px)' },
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

function setSimMode(mode) {
  currentSimMode = mode;
  mouseActive = false;
  document.querySelectorAll('.sim-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btnSim${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');
  updateSimMetrics();
}

function updateSimulatorLoop() {
  const targetEl = document.getElementById('simTarget');
  const irisLeft = document.getElementById('simIrisLeft');
  const irisRight = document.getElementById('simIrisRight');
  const targetCoord = document.getElementById('targetCoord');
  const coordOD = document.getElementById('coordOD');
  const coordOS = document.getElementById('coordOS');
  const canvas = document.getElementById('simWaveCanvas');

  // Compute stimulus target coordinate (tx, ty in % relative to sim-eyes-box)
  let tx = 50;
  let ty = 50;

  if (mouseActive && (Date.now() - lastMouseTime < 2200)) {
    tx = mouseX;
    ty = mouseY;
  } else {
    simTime += 0.024;
    if (currentSimMode === 'horiz') {
      tx = 50 + 35 * Math.sin(simTime);
      ty = 50 + 3 * Math.cos(simTime * 2);
    } else if (currentSimMode === 'vert') {
      tx = 50 + 3 * Math.sin(simTime * 2);
      ty = 50 + 30 * Math.sin(simTime);
    } else if (currentSimMode === 'diag') {
      tx = 50 + 32 * Math.sin(simTime);
      ty = 50 + 28 * Math.sin(simTime);
    } else if (currentSimMode === 'fix') {
      // Micro-saccades and physiological tremor
      tx = 50 + 0.6 * Math.sin(simTime * 3.4);
      ty = 50 + 0.5 * Math.cos(simTime * 4.1);
    }
  }

  // Iris physical excursion calculation
  // Eye socket is 120px wide, iris is 44px -> maximum excursion +- 24px horizontal, +- 13px vertical
  const normX = Math.max(-1, Math.min(1, (tx - 50) / 35));
  const normY = Math.max(-1, Math.min(1, (ty - 50) / 30));

  const jitterOD = currentSimMode === 'fix' ? (Math.random() - 0.5) * 0.35 : (Math.random() - 0.5) * 0.15;
  const jitterOS = currentSimMode === 'fix' ? (Math.random() - 0.5) * 0.35 : (Math.random() - 0.5) * 0.15;

  const dxOD = normX * 24 + jitterOD;
  const dyOD = normY * 13 + jitterOD;
  const dxOS = normX * 24 + jitterOS;
  const dyOS = normY * 13 + jitterOS;

  if (targetEl) {
    targetEl.style.left = `${tx.toFixed(1)}%`;
    targetEl.style.top = `${ty.toFixed(1)}%`;
  }
  if (targetCoord) {
    targetCoord.textContent = `T: (${tx.toFixed(1)}%, ${ty.toFixed(1)}%)`;
  }
  if (irisRight) {
    irisRight.style.transform = `translate(${dxOD.toFixed(1)}px, ${dyOD.toFixed(1)}px)`;
  }
  if (irisLeft) {
    irisLeft.style.transform = `translate(${dxOS.toFixed(1)}px, ${dyOS.toFixed(1)}px)`;
  }
  if (coordOD) {
    const sX = dxOD >= 0 ? `+${dxOD.toFixed(1)}` : dxOD.toFixed(1);
    const sY = dyOD >= 0 ? `+${dyOD.toFixed(1)}` : dyOD.toFixed(1);
    coordOD.textContent = `OD: Δx ${sX}px, Δy ${sY}px`;
  }
  if (coordOS) {
    const sX = dxOS >= 0 ? `+${dxOS.toFixed(1)}` : dxOS.toFixed(1);
    const sY = dyOS >= 0 ? `+${dyOS.toFixed(1)}` : dyOS.toFixed(1);
    coordOS.textContent = `OS: Δx ${sX}px, Δy ${sY}px`;
  }

  // Waveform point recording
  const waveValTarget = currentSimMode === 'vert' ? normY : normX;
  const waveValOD = currentSimMode === 'vert' ? (dyOD / 13) : (dxOD / 24);
  const waveValOS = currentSimMode === 'vert' ? (dyOS / 13) : (dxOS / 24);

  waveHistory.push({ t: waveValTarget, od: waveValOD, os: waveValOS });
  if (waveHistory.length > MAX_WAVE_POINTS) waveHistory.shift();

  // Draw Waveform Canvas
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Subtle zero-line
      ctx.strokeStyle = '#181e42';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      if (waveHistory.length > 1) {
        const step = w / (MAX_WAVE_POINTS - 1);

        // 1. Target line (cyan #38bdf8)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i < waveHistory.length; i++) {
          const px = i * step;
          const py = h / 2 - waveHistory[i].t * (h * 0.38);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // 2. OD line (mint #78e4d0)
        ctx.strokeStyle = '#78e4d0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < waveHistory.length; i++) {
          const px = i * step;
          const py = h / 2 - waveHistory[i].od * (h * 0.38);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // 3. OS line (pink #f472b6, dashed)
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        for (let i = 0; i < waveHistory.length; i++) {
          const px = i * step;
          const py = h / 2 - waveHistory[i].os * (h * 0.38);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  requestAnimationFrame(updateSimulatorLoop);
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

// Interactive Mouse / Touch steering over simEyesBox
const eyesBox = document.getElementById('simEyesBox');
function handleEyesBoxPointer(e) {
  if (!eyesBox) return;
  const rect = eyesBox.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const relX = ((clientX - rect.left) / rect.width) * 100;
  const relY = ((clientY - rect.top) / rect.height) * 100;
  mouseX = Math.max(12, Math.min(88, relX));
  mouseY = Math.max(15, Math.min(85, relY));
  mouseActive = true;
  lastMouseTime = Date.now();
}
eyesBox?.addEventListener('mousemove', handleEyesBoxPointer);
eyesBox?.addEventListener('touchmove', handleEyesBoxPointer, { passive: true });
eyesBox?.addEventListener('mousedown', handleEyesBoxPointer);
eyesBox?.addEventListener('touchstart', handleEyesBoxPointer, { passive: true });

// Simulator modal open/close
const btnToggleSim = document.getElementById('btnToggleSim');
const btnSimClose = document.getElementById('btnSimClose');
const simModal = document.getElementById('simModal');

btnToggleSim?.addEventListener('click', () => {
  if (simModal) simModal.style.display = 'flex';
});
btnSimClose?.addEventListener('click', () => {
  if (simModal) simModal.style.display = 'none';
});
simModal?.addEventListener('click', (e) => {
  if (e.target === simModal) simModal.style.display = 'none';
});

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
  } else if (e.key === 'Escape') {
    if (simModal && simModal.style.display === 'flex') {
      simModal.style.display = 'none';
    }
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
requestAnimationFrame(updateSimulatorLoop);
