import { PROJECT_COPY } from './project-copy.mjs';
import './offline-status.js';

let language = 'en';
let currentSimMode = 'horiz';
let simTimer = null;
let simStep = 0;

function render() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-project-copy]').forEach(el => {
    const val = PROJECT_COPY[language][el.dataset.projectCopy] || PROJECT_COPY.en[el.dataset.projectCopy] || '';
    if (val) el.textContent = val;
  });
  const langBtn = document.getElementById('presentationLang');
  if (langBtn) langBtn.textContent = language === 'en' ? 'മലയാളം' : 'English';
  updateSimMetrics();
}

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

document.getElementById('btnSimHoriz')?.addEventListener('click', () => setSimMode('horiz'));
document.getElementById('btnSimVert')?.addEventListener('click', () => setSimMode('vert'));
document.getElementById('btnSimDiag')?.addEventListener('click', () => setSimMode('diag'));
document.getElementById('btnSimFix')?.addEventListener('click', () => setSimMode('fix'));

document.getElementById('presentationLang')?.addEventListener('click', () => {
  language = language === 'en' ? 'ml' : 'en';
  render();
});

document.getElementById('printPresentation')?.addEventListener('click', () => window.print());

render();
runSimCycle();
if (simTimer) clearInterval(simTimer);
simTimer = setInterval(runSimCycle, 1600);
