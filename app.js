/**
 * NETRA-SCREEN Web / PWA Engine
 * Pediatric Ocular Tracking & Bilateral Iris Excursion Research
 * Runs in iOS Safari, Chrome, Edge, and Android Browsers.
 */

import { loadLandmarker, CameraSession, cameraError } from './camera.mjs';
import { VERSION, relativeIris, eyeAspectRatio, framing, researchMetrics, clinicalTriage } from './vision-core.mjs';
import './offline-status.js';
import { PROJECT_COPY } from './project-copy.mjs';
import { ChildGuide } from './child-guide.mjs';

// ================= BILINGUAL DICTIONARY (EN & ML) =================
// ================= BILINGUAL DICTIONARY (EN & ML) =================
const I18N = {
  en: {
    heroBadge: "OPTIONAL CAMERA TOOL",
    heroTitle: "Follow the target. Explore eye movement.",
    heroDesc: "Four short target paths record eye-landmark movement on your device. This experimental tool cannot assess eye health or diagnose a condition.",
    disclaimerHeader: "Before you begin",
    disclaimerBody: "Use even lighting and keep both eyes visible. Sit comfortably and stop if the activity causes discomfort. Measurements are experimental; they cannot confirm normal vision or replace an eye examination.",
    chooseCompanion: "Choose a target",
    compButterflyTitle: "Butterfly",
    compButterflyDesc: "Fluttering target",
    compFishTitle: "Fish",
    compFishDesc: "Swimming target",
    compDotTitle: "Smiling Dot",
    compDotDesc: "High Contrast Target",
    consentText: "I agree to local camera processing for this session. No camera images are stored or uploaded. A parent or guardian must supervise children.",
    btnStartLive: "Start eye movement capture",
    btnStartDemo: "Preview target movement · camera free",
    iosInstallHint: "On iPhone, use Safari’s Share menu → Add to Home Screen for quick access.",
    chipFraming: "Face framing",
    chipLighting: "Lighting heuristic",
    chipHead: "Head roll",
    chipEyes: "Eye visibility",
    warnPleaseFace: "Please look directly at screen",
    warnLightingDesc: "Keep face centered in good lighting with both eyes unobstructed.",
    pipTitle: "Live Landmark Analysis",
    reportTitle: "RESEARCH OBSERVATION REPORT",
    reportHeading: "Ocular Pursuit & Bilateral Iris Excursion",
    
    // Evaluation Banner
    evalBannerTitleNormal: "Research observations · no clinical classification",
    evalBannerDescNormal: "Landmark measurements cannot confirm normal vision or diagnose an eye condition.",
    evalBannerTitleWarn: "Research observations · no clinical classification",
    evalBannerDescWarn: "Landmark measurements cannot determine a clinical referral decision.",

    // Trajectory & Judge Guide
    trajVisualizerHeading: "Target & Iris Trajectories",
    trajVisualizerSub: "Spatial alignment of visual pursuit across tasks",
    tabAll: "All 4 Tasks",
    tabHorizontal: "Horizontal",
    tabVertical: "Vertical",
    tabDiagonal: "Diagonal",
    tabJumps: "Jumps",
    task1Title: "Task 1: Horizontal Pursuit",
    task1Desc: "Lateral conjugate tracking (Left ⇄ Right)",
    task2Title: "Task 2: Vertical Pursuit",
    task2Desc: "Elevation & depression tracking (Up ↕ Down)",
    task3Title: "Task 3: Diagonal Pursuit",
    task3Desc: "Combined oblique visual field tracking",
    task4Title: "Task 4: Saccadic Jumps & Fixation",
    task4Desc: "Rapid refixation steps & quadrant stability",
    plotTarget: "Target Trajectory (Screen Normalized)",
    plotEyes: "Bilateral Iris Centroids (Left: Blue, Right: Amber)",
    legendTarget: "Visual Target Path",
    legendLeftEye: "Left Eye Iris Centroid",
    legendRightEye: "Right Eye Iris Centroid",
    graphGuideHeading: "How Evaluators & Judges Read this Graph:",
    graphGuideText: "The cyan curve is the path of the visual target. The blue (Left eye) and amber (Right eye) curves map real-time iris movement. When both eye curves closely mirror each other and track the target with smooth arcs, eye movement is coordinated. If one curve diverges, lags, or stops short, it indicates potential eye turn (squint) or muscle imbalance.",

    // Metrics & Descriptions
    metricsHeading: "Engineering & Pursuit Metrics",
    metricsSub: "Calculated from accepted offline facial landmark telemetry",
    metricBilateralCorr: "Bilateral Movement Correlation",
    metricCorrExplain: "Measures whether both eyes move together in unison in the same direction at the same speed. High correlation confirms synchronized binocular pursuit.",
    metricFixationStability: "Fixation Stability (RMS Jitter)",
    metricFixExplain: "Measures involuntary eye shaking when holding gaze at a fixed point. A lower value indicates a calm, steady gaze without nystagmus or wandering attention.",
    metricSymmetry: "Symmetry Discrepancy",
    metricSymmExplain: "Compares the maximum turning distance reached by the left vs right eye. A low difference indicates balanced extraocular muscle strength on both sides.",
    metricValidPct: "Accepted Frames Fraction",
    metricValidExplain: "The percentage of test frames that met all quality criteria (centered face, level head pose, even lighting, unobstructed eyes). Proves test reliability.",

    // Specialist Decision Protocol
    specialistDecisionTitle: "When Should a Pediatric Eye Specialist Be Consulted?",
    specialistDecisionSubtitle: "Clinical triage protocol for school screenings and community health workers",
    telemetryTriggersTitle: "⚠️ Telemetry Warning Triggers:",
    trig1: "Bilateral Movement Correlation persistently below 0.75",
    trig2: "Symmetry Discrepancy greater than 10.0% across repeated tests",
    trig3: "Fixation Stability RMS jitter exceeding 0.080",
    physicalSignsTitle: "🚨 Physical Red Flags Observed by Parents:",
    sign1: "Visible eye turn or squint (one eye turns in or out, even occasionally)",
    sign2: "Child tilts or turns head sideways when looking at TV, books, or objects",
    sign3: "Frequent eye rubbing, squinting, or complaining of headaches",
    sign4: "Abnormal white or mismatched reflection in pupil during flash photos",
    disclaimerFooterText: "Important Notice: NetraScreen is an early research triage tool designed to flag potential tracking anomalies for clinical review. It does not replace a comprehensive pediatric eye examination by a certified ophthalmologist or optometrist.",

    btnPrint: "Print / Save PDF Report",
    btnExportJSON: "Download JSON Data",
    btnNewSession: "Start New Session",
    taskHorizontalName: "HORIZONTAL PURSUIT",
    taskVerticalName: "VERTICAL PURSUIT",
    taskDiagonalName: "DIAGONAL PURSUIT",
    taskJumpsName: "FIXATION JUMPS",
    navOtherTests: "All activities",
    otherTestsTitle: "Eye care studio · activities & exercises",
    otherTestsSub: "Guided eye comfort, near-vision tasks, Amsler grid, contrast and color matching. No symptom surveys.",
    btnOpenOtherTests: "Back to activities"
  },
  ml: {
    heroBadge: "ക്യാമറ ഉപയോഗിച്ചുള്ള പ്രവർത്തനം",
    heroTitle: "ലക്ഷ്യത്തെ പിന്തുടർന്ന് കണ്ണിന്റെ ചലനം നിരീക്ഷിക്കൂ.",
    heroDesc: "നാല് ചെറിയ ലക്ഷ്യപാതകളിലൂടെ കണ്ണിന്റെ ലാൻഡ്മാർക്ക് ചലനം ഉപകരണത്തിൽ രേഖപ്പെടുത്തുന്നു. ഇതിന് കണ്ണിന്റെ ആരോഗ്യമോ രോഗമോ നിർണയിക്കാനാവില്ല.",
    disclaimerHeader: "തുടങ്ങുന്നതിന് മുമ്പ്",
    disclaimerBody: "നല്ല വെളിച്ചത്തിൽ ഇരുകണ്ണുകളും വ്യക്തമായി കാണിക്കുക. സുഖമായി ഇരിക്കുക; അസ്വസ്ഥതയുണ്ടെങ്കിൽ നിർത്തുക. ഇവ പരീക്ഷണാത്മക അളവുകളാണ്; നേത്രപരിശോധനയ്ക്ക് പകരമല്ല.",
    chooseCompanion: "ഒരു ലക്ഷ്യം തിരഞ്ഞെടുക്കുക",
    compButterflyTitle: "ചിത്രശലഭം",
    compButterflyDesc: "പാറിപ്പറക്കുന്ന വർണ്ണ ശലഭം",
    compFishTitle: "മത്സ്യം",
    compFishDesc: "നീന്തിത്തുടിക്കുന്ന കുഞ്ഞുമത്സ്യം",
    compDotTitle: "പുഞ്ചിരിക്കുന്ന കുത്ത്",
    compDotDesc: "വ്യക്തതയുള്ള വലിയ കുത്ത്",
    consentText: "ഈ സെഷനിലെ പ്രാദേശിക ക്യാമറ പ്രോസസ്സിംഗിന് സമ്മതിക്കുന്നു. ചിത്രങ്ങൾ സംഭരിക്കുകയോ അപ്‌ലോഡ് ചെയ്യുകയോ ഇല്ല. കുട്ടികൾക്ക് രക്ഷിതാവിന്റെ മേൽനോട്ടം വേണം.",
    btnStartLive: "കണ്ണിന്റെ ചലനം രേഖപ്പെടുത്തുക",
    btnStartDemo: "ലക്ഷ്യചലനം മുൻകൂട്ടി കാണുക · ക്യാമറ വേണ്ട",
    iosInstallHint: "ഐഫോണിൽ വേഗം തുറക്കാൻ Safari-യിലെ Share → Add to Home Screen ഉപയോഗിക്കുക.",
    chipFraming: "മുഖത്തിന്റെ സ്ഥാനം",
    chipLighting: "വെളിച്ചം",
    chipHead: "തലയുടെ ചരിവ്",
    chipEyes: "കണ്ണുകളുടെ ദൃശ്യത",
    warnPleaseFace: "സ്ക്രീനിലേക്ക് നേരെ നോക്കുക",
    warnLightingDesc: "നല്ല വെളിച്ചത്തിൽ ഇരു കണ്ണുകളും വ്യക്തമായി കാണത്തക്ക വിധം ഇരിക്കുക.",
    pipTitle: "തത്സമയ ലാൻഡ്‌മാർക്ക് വിശകലനം",
    reportTitle: "ഗവേഷണ നിരീക്ഷണ റിപ്പോർട്ട്",
    reportHeading: "നേത്ര ചലന പാതയും ഐറിസ് ട്രാക്കിംഗും",

    // Evaluation Banner
    evalBannerTitleNormal: "Research observations · no clinical classification",
    evalBannerDescNormal: "Landmark measurements cannot confirm normal vision or diagnose an eye condition.",
    evalBannerTitleWarn: "Research observations · no clinical classification",
    evalBannerDescWarn: "Landmark measurements cannot determine a clinical referral decision.",

    // Trajectory & Judge Guide
    trajVisualizerHeading: "ടാർഗറ്റും കൃഷ്ണമണി ചലന പാതകളും",
    trajVisualizerSub: "വിവിധ ചലനങ്ങളിലെ കണ്ണ് ട്രാക്കിംഗ് വിന്യാസം",
    tabAll: "എല്ലാ 4 ചലനങ്ങളും",
    tabHorizontal: "തിരശ്ചീനം",
    tabVertical: "ലംബം",
    tabDiagonal: "കോണോടുകോൺ",
    tabJumps: "ചാട്ടങ്ങൾ",
    task1Title: "ചലനം 1: തിരശ്ചീന പാത (Horizontal)",
    task1Desc: "ഇടത്തും വലത്തുമുള്ള ഐറിസ് ചലന സമന്വയം",
    task2Title: "ചലനം 2: ലംബ പാത (Vertical)",
    task2Desc: "മുകളിലേക്കും താഴേക്കുമുള്ള ഐറിസ് ചലനം",
    task3Title: "ചലനം 3: കോണോടുകോൺ പാത (Diagonal)",
    task3Desc: "കോണോടുകോൺ ചരിഞ്ഞുള്ള നേത്ര ചലനം",
    task4Title: "ചലനം 4: ദ്രുത ചാട്ടങ്ങൾ (Saccadic Jumps)",
    task4Desc: "വിവിധ കോണുകളിലേക്കുള്ള ദ്രുത ഫോക്കസിംഗ്",
    plotTarget: "സ്ക്രീൻ ടാർഗറ്റ് പാത",
    plotEyes: "ഇരു കൃഷ്ണമണികൾ (ഇടത്: നീല, വലത്: മഞ്ഞ)",
    legendTarget: "ടാർഗറ്റ് ചലന പാത",
    legendLeftEye: "ഇടത് കണ്ണ് കൃഷ്ണമണി",
    legendRightEye: "വലത് കണ്ണ് കൃഷ്ണമണി",
    graphGuideHeading: "ഈ ഗ്രാഫ് എങ്ങനെ വിലയിരുത്താം:",
    graphGuideText: "സിയാൻ (Cyan) നിറത്തിലുള്ള വര സ്ക്രീനിലെ ടാർഗറ്റ് പാതയാണ്. നീല (ഇടത് കണ്ണ്), മഞ്ഞ (വലത് കണ്ണ്) വരകൾ കൃഷ്ണമണിയുടെ തത്സമയ ചലനമാണ്. ഇരു കണ്ണുകളുടെയും വരകൾ സമാനമായി നീങ്ങുമ്പോൾ കണ്ണുകളുടെ ചലനം ഏകോപിതമാണ്. ഒരു വര വ്യതിചലിക്കുകയോ പിന്നിലാവുകയോ ചെയ്താൽ അത് കോങ്കണ്ണിന്റെയോ പേശീ ബലഹീനതയുടെയോ ലക്ഷണമാകാം.",

    // Metrics & Descriptions
    metricsHeading: "ഗവേഷണ അളവുകോലുകൾ",
    metricsSub: "ഫേസ് ലാൻഡ്‌മാർക്ക് ടെലിമെട്രിയിൽ നിന്ന് കണക്കാക്കിയത്",
    metricBilateralCorr: "ഇരു കണ്ണുകളുടെ സമന്വയം",
    metricCorrExplain: "രണ്ട് കണ്ണുകളും ഒരേ വേഗതയിലും ഒരേ ദിശയിലും ഒന്നിച്ച് ചലിക്കുന്നുണ്ടോ എന്ന് അളക്കുന്നു. ഉയർന്ന കോറിലേഷൻ കണ്ണുകളുടെ മികച്ച ഏകോപനത്തെ കാണിക്കുന്നു.",
    metricFixationStability: "ഫോക്കസിംഗ് സ്ഥിരത (വിറയൽ അളവ്)",
    metricFixExplain: "ഒരു ബിന്ദുവിലേക്ക് നോക്കുമ്പോൾ കണ്ണുകൾ വിറയ്ക്കാതെ നിൽക്കുന്നുണ്ടോ എന്ന് അളക്കുന്നു. കുറഞ്ഞ മൂല്യം ദൃഷ്ടിയിലെ സ്ഥിരതയെ സൂചിപ്പിക്കുന്നു.",
    metricSymmetry: "ചലന അസമമിതി (Symmetry Discrepancy)",
    metricSymmExplain: "ഇടതും വലതും കണ്ണുകൾ തിരിയുന്ന ദൂരത്തിലെ വ്യത്യാസം താരതമ്യം ചെയ്യുന്നു. കുറഞ്ഞ വ്യത്യാസം കണ്ണുകളിലെ പേശികളുടെ സമതുലിതമായ ശക്തിയെ കാണിക്കുന്നു.",
    metricValidPct: "സ്വീകരിച്ച ഫ്രെയിമുകൾ",
    metricValidExplain: "ഗുണനിലവാര മാനദണ്ഡങ്ങൾ പാലിച്ച ഫ്രെയിമുകളുടെ ശതമാനം. ഉയർന്ന ശതമാനം പരിശോധനയുടെ വിശ്വാസ്യത ഉറപ്പാക്കുന്നു.",

    // Specialist Decision Protocol
    specialistDecisionTitle: "എപ്പോഴാണ് ഒരു നേത്രരോഗ വിദഗ്ദ്ധനെ കാണേണ്ടത്?",
    specialistDecisionSubtitle: "സ്കൂൾ സ്ക്രീനിംഗുകൾക്കും ആരോഗ്യ പ്രവർത്തകർക്കുമുള്ള ക്ലിനിക്കൽ ട്രിയാജ് പ്രോട്ടോക്കോൾ",
    telemetryTriggersTitle: "⚠️ പ്രധാന മുന്നറിയിപ്പ് സൂചകങ്ങൾ:",
    trig1: "കണ്ണുകളുടെ ചലന ഏകോപനം (Correlation) തുടർച്ചയായി 0.75-ൽ താഴെയായാൽ",
    trig2: "ചലന അസമമിതി (Symmetry Discrepancy) 10.0%-ൽ കൂടുതലായാൽ",
    trig3: "ദൃഷ്ടി സ്ഥിരതയിലെ വിറയൽ (Fixation Jitter) 0.080-ൽ കൂടുതലായാൽ",
    physicalSignsTitle: "🚨 രക്ഷിതാക്കൾ ശ്രദ്ധിക്കേണ്ട ശാരീരിക ലക്ഷണങ്ങൾ:",
    sign1: "കോങ്കണ്ണ് (ഒരു കണ്ണ് ഇടയ്ക്കോ സ്ഥിരമായോ ഉള്ളിലേക്കോ പുറത്തേക്കോ തിരിയുക)",
    sign2: "ടിവിയോ പുസ്തകങ്ങളോ നോക്കുമ്പോൾ കുട്ടി തല ഒരു വശത്തേക്ക് ചരിച്ചുപിടിക്കുക",
    sign3: "അടിക്കടി കണ്ണ് തിരുമ്മുക, കണ്ണുചിമ്മി നോക്കുക, അല്ലെങ്കിൽ തലവേദന പറയുക",
    sign4: "ഫോട്ടോ എടുക്കുമ്പോൾ ഫ്ലാഷിൽ ഒരു കണ്ണിൽ മാത്രം വെള്ളപ്പാടോ പ്രകാശ വ്യത്യാസമോ കാണുക",
    disclaimerFooterText: "പ്രധാന അറിയിപ്പ്: ക്ലിനിക്കൽ അവലോകനത്തിനായി ട്രാക്കിംഗ് അപാകതകൾ കണ്ടെത്താൻ രൂപകൽപ്പന ചെയ്ത ഒരു പ്രാരംഭ സ്ക്രീനിംഗ് ഉപകരണമാണ് നെത്രസ്ക്രീൻ. സർട്ടിഫൈഡ് നേത്രരോഗവിദഗ്ദ്ധന്റെ സമഗ്രമായ നേത്രപരിശോധനയ്ക്ക് ഇത് പകരമാവില്ല.",

    btnPrint: "റിപ്പോർട്ട് പ്രിന്റ് / PDF ആയി സേവ് ചെയ്യുക",
    btnExportJSON: "ഡാറ്റ ഡൗൺലോഡ് ചെയ്യുക (JSON)",
    btnNewSession: "പുതിയ സെഷൻ ആരംഭിക്കുക",
    taskHorizontalName: "തിരശ്ചീന ചലനം",
    taskVerticalName: "ലംബ ചലനം",
    taskDiagonalName: "കോണോടുകോൺ ചലനം",
    taskJumpsName: "സ്ഥാനം മാറുന്ന ചാട്ടങ്ങൾ",
    navOtherTests: "എല്ലാ പ്രവർത്തനങ്ങളും",
    otherTestsTitle: "കണ്ണുകളുടെ പരിചരണം · പ്രവർത്തനങ്ങളും വ്യായാമങ്ങളും",
    otherTestsSub: "കണ്ണുകൾക്ക് വിശ്രമം, സമീപകാഴ്ച പ്രവർത്തനങ്ങൾ, ആംസ്‌ലർ ഗ്രിഡ്, നിറം പൊരുത്തപ്പെടുത്തൽ.",
    btnOpenOtherTests: "പ്രവർത്തനങ്ങളിലേക്ക് മടങ്ങുക"
  }
};

Object.assign(I18N.en, PROJECT_COPY.en);
Object.assign(I18N.ml, PROJECT_COPY.ml);

// ================= APP STATE =================
const STATE = {
  lang: "en",
  companion: "butterfly",
  soundEnabled: true,
  isLive: false,
  isDemo: false,
  isPaused: false,
  currentTaskIndex: 0,
  taskStartTime: 0,
  sessionStartTime: 0,
  elapsedSessionMs: 0,
  activeTaskDurationMs: 8000,
  recordedSamples: [], // { task, taskMs, target, leftEye, rightEye, qualityOk }
  landmarker: null,
  webcamRunning: false,
  showPipOverlay: false,
  audioCtx: null
};

const TASKS = [
  { id: "HORIZONTAL", nameKey: "taskHorizontalName" },
  { id: "VERTICAL", nameKey: "taskVerticalName" },
  { id: "DIAGONAL", nameKey: "taskDiagonalName" },
  { id: "JUMPS", nameKey: "taskJumpsName" }
];

const COMPANIONS = {
  butterfly: { emoji: "🦋", nameKey: "compButterflyTitle" },
  fish: { emoji: "🐠", nameKey: "compFishTitle" },
  dot: { emoji: "🟢", nameKey: "compDotTitle" }
};

// ================= DOM ELEMENTS =================
const dom = {
  viewHome: document.getElementById("viewHome"),
  viewTracking: document.getElementById("viewTracking"),
  viewReport: document.getElementById("viewReport"),
  langToggleBtn: document.getElementById("langToggleBtn"),
  langLabel: document.getElementById("langLabel"),
  audioToggleBtn: document.getElementById("audioToggleBtn"),
  audioIcon: document.getElementById("audioIcon"),
  companionQuickSelect: document.getElementById("companionQuickSelect"),
  consentCheckbox: document.getElementById("consentCheckbox"),
  btnStartLive: document.getElementById("btnStartLive"),
  btnStartDemo: document.getElementById("btnStartDemo"),
  
  // Tracking View
  hudTaskBadge: document.getElementById("hudTaskBadge"),
  hudTaskStep: document.getElementById("hudTaskStep"),
  taskProgressBar: document.getElementById("taskProgressBar"),
  hudTimer: document.getElementById("hudTimer"),
  btnPauseSession: document.getElementById("btnPauseSession"),
  btnExitSession: document.getElementById("btnExitSession"),
  targetCompanion: document.getElementById("targetCompanion"),
  companionGraphic: document.getElementById("companionGraphic"),
  qualityWarningOverlay: document.getElementById("qualityWarningOverlay"),
  webcamVideo: document.getElementById("webcamVideo"),
  landmarkOverlayCanvas: document.getElementById("landmarkOverlayCanvas"),
  btnTogglePipOverlay: document.getElementById("btnTogglePipOverlay"),
  fpsCounter: document.getElementById("fpsCounter"),
  irisDisp: document.getElementById("irisDisp"),

  // Quality Chips
  chipFaceDist: document.getElementById("chipFaceDist"),
  chipLighting: document.getElementById("chipLighting"),
  chipPose: document.getElementById("chipPose"),
  chipEyes: document.getElementById("chipEyes"),

  // Report View
  targetTrajCanvas: document.getElementById("targetTrajCanvas"),
  eyesTrajCanvas: document.getElementById("eyesTrajCanvas"),
  trajTaskTabs: document.getElementById("trajTaskTabs"),
  metricCorrelation: document.getElementById("metricCorrelation"),
  metricFixation: document.getElementById("metricFixation"),
  metricExcursionDiff: document.getElementById("metricExcursionDiff"),
  metricValidFrames: document.getElementById("metricValidFrames"),
  reportTimestamp: document.getElementById("reportTimestamp"),
  reportCompanionUsed: document.getElementById("reportCompanionUsed"),
  btnPrintReport: document.getElementById("btnPrintReport"),
  btnExportJSON: document.getElementById("btnExportJSON"),
  btnRestartSession: document.getElementById("btnRestartSession"),

  // Report Evaluator Enhancements
  evalSummaryBanner: document.getElementById("evalSummaryBanner"),
  evalBannerIcon: document.getElementById("evalBannerIcon"),
  evalBannerTitle: document.getElementById("evalBannerTitle"),
  evalBannerDesc: document.getElementById("evalBannerDesc"),
  badgeCorr: document.getElementById("badgeCorr"),
  badgeFix: document.getElementById("badgeFix"),
  badgeSymm: document.getElementById("badgeSymm"),
  badgeValid: document.getElementById("badgeValid"),
  triageBanner: document.getElementById("triageBanner"),
  triageBadge: document.getElementById("triageBadge"),
  triageTitle: document.getElementById("triageTitle"),
  triageDesc: document.getElementById("triageDesc"),
  triageNotice: document.getElementById("triageNotice")
};

// ================= WEB AUDIO SOUND CHIMES =================
let preparedDemo = false, lastGuideTask = -1, invalidSince = null, lastFramingGuide = -Infinity;
const companionSuffix = () => STATE.companion === 'butterfly' ? 'Butterfly' : STATE.companion === 'fish' ? 'Fish' : 'Dot';
const guide = new ChildGuide({
  language: () => STATE.lang, enabled: () => STATE.soundEnabled,
  onStatus: key => { const el = document.getElementById('readyVoiceStatus'); el.textContent = key ? I18N[STATE.lang][key] : ''; }
});
function updateReadyScreen() {
  const copy = I18N[STATE.lang], title = copy['ready' + companionSuffix()];
  document.getElementById('readyTitle').textContent = title;
  document.getElementById('readyHint').textContent = copy.readyHint;
  document.getElementById('readyCompanion').textContent = COMPANIONS[STATE.companion].emoji;
  document.getElementById('btnFocusReady').setAttribute('aria-label', title);
}
function prepareSession(isDemo) {
  stopSession(); preparedDemo = isDemo;
  sessionNotice(''); showView('viewReady'); updateLanguage(STATE.lang);
  guide.say('ready' + companionSuffix());
}
function playChime(freq = 520, duration = 0.25) {
  if (!STATE.soundEnabled) return;
  try {
    if (!STATE.audioCtx) {
      STATE.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (STATE.audioCtx.state === 'suspended') {
      STATE.audioCtx.resume();
    }
    const osc = STATE.audioCtx.createOscillator();
    const gain = STATE.audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, STATE.audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, STATE.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, STATE.audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(STATE.audioCtx.destination);
    osc.start();
    osc.stop(STATE.audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
}

// ================= I18N LOCALIZATION =================
function updateLanguage(lang) {
  STATE.lang = lang;
  document.documentElement.lang = lang;
  document.body.classList.toggle("lang-ml", lang === "ml");
  dom.langLabel.textContent = lang === "en" ? "മലയാളം" : "English";

  const strings = I18N[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (strings[key]) {
      el.innerHTML = strings[key];
    }
  });

  // Update current task badge if tracking
  if (dom.viewTracking.classList.contains("active-view")) {
    const task = TASKS[STATE.currentTaskIndex];
    if(task) dom.hudTaskBadge.textContent = strings[task.nameKey];
  }
  updateReadyScreen();
}

// ================= COMPANION SELECTOR =================
function selectCompanion(companionKey) {
  if (!COMPANIONS[companionKey]) return;
  STATE.companion = companionKey;
  const companion = COMPANIONS[companionKey];
  dom.companionGraphic.textContent = companion.emoji;

  // Update companion buttons
  document.querySelectorAll(".comp-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.companion === companionKey);
  });
  document.querySelectorAll(".companion-card").forEach(card => {
    card.classList.toggle("active", card.dataset.comp === companionKey);
    card.setAttribute("aria-pressed",String(card.dataset.comp === companionKey));
  });

  playChime(640, 0.15);
}

// ================= MEDIAPIPE FACE LANDMARKER SETUP =================
async function initMediaPipe() {
  if (!STATE.landmarker) STATE.landmarker = await loadLandmarker();
  return STATE.landmarker;
}

// ================= MATHEMATICAL EYE COORDINATE CALCULATION =================
// Matches NetraScreen's LandmarkAnalyzer.kt formula exactly!
function calculateRelativeIrisPoint(outer, inner, iris) { return relativeIris(outer, inner, iris); }

// ================= TARGET POSITION CALCULATION =================
// Exact equation from NetraScreen's TargetPath.kt
function calculateTargetPosition(taskKey, localMs) {
  const phase = 2 * Math.PI * (localMs % 4000) / 4000.0;
  const wave = 0.5 - 0.34 * Math.cos(phase);

  switch (taskKey) {
    case "HORIZONTAL":
      return { x: wave, y: 0.5 };
    case "VERTICAL":
      return { x: 0.5, y: wave };
    case "DIAGONAL":
      return { x: wave, y: wave };
    case "JUMPS":
      const jumpIndex = Math.floor(localMs / 1000) % 4;
      const jumpPoints = [
        { x: 0.25, y: 0.5 },
        { x: 0.75, y: 0.5 },
        { x: 0.5, y: 0.25 },
        { x: 0.5, y: 0.75 }
      ];
      return jumpPoints[jumpIndex];
    default:
      return { x: 0.5, y: 0.5 };
  }
}

// ================= VIEW SWITCHER =================
function showView(viewId) {
  [dom.viewHome, document.getElementById('viewReady'), dom.viewTracking, dom.viewReport].forEach(v => {
    if (v) v.classList.remove("active-view");
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active-view");
  }
  const vp = document.querySelector(".content-viewport");
  if (vp) vp.scrollTop = 0;
  window.scrollTo(0, 0);
}

// ================= SESSION RUNTIME =================
let animFrameId = null;
let lastVideoTime = -1;
let frameCount = 0, lastFpsTime = 0;
let sessionActive = false, sessionGeneration = 0, taskElapsedMs = 0, previousLoopTime = 0;
let qualityAt = -Infinity, processedFrames = 0, sessionMetrics = null, sessionTimestamp = null;
let mainCamera = new CameraSession(dom.webcamVideo);
const lightCanvas = document.createElement('canvas');
lightCanvas.width = lightCanvas.height = 16;
const lightContext = lightCanvas.getContext('2d', { willReadFrequently: true });

function sessionNotice(message) {
  let banner = document.getElementById('sessionNotice');
  if (!banner) {
    banner = document.createElement('div'); banner.id = 'sessionNotice'; banner.className = 'runtime-notice';
    banner.setAttribute('role','status'); document.querySelector('.content-viewport').prepend(banner);
  }
  banner.textContent = message; banner.hidden = !message;
}
function setSourceNotice() {
  sessionNotice(STATE.isDemo
    ? (STATE.lang === 'ml' ? 'ക്യാമറയില്ലാത്ത വിശദീകരണം · അളവുകൾ സൃഷ്ടിക്കുന്നില്ല' : 'CAMERA-FREE WALKTHROUGH · No eye measurements are generated')
    : (STATE.lang === 'ml' ? 'തത്സമയ ഗവേഷണ രേഖപ്പെടുത്തൽ · രോഗനിർണയമല്ല' : 'LIVE RESEARCH CAPTURE · No clinical classification'));
}
async function startSession(isDemoMode = false) {
  if (sessionActive) return;
  stopSession(); sessionActive = true;
  const token = sessionGeneration;
  STATE.isDemo = isDemoMode; STATE.isLive = !isDemoMode; STATE.isPaused = false;
  STATE.currentTaskIndex = 0; STATE.recordedSamples = []; processedFrames = 0; sessionMetrics = null;
  sessionTimestamp = new Date().toISOString(); taskElapsedMs = 0; qualityAt = -Infinity; previousLoopTime = 0;
  frameCount = 0; lastFpsTime = performance.now(); lastVideoTime = -1;
  dom.btnPauseSession.textContent = 'Pause';
  dom.fpsCounter.textContent = 'FPS: —'; dom.irisDisp.textContent = 'Waiting for camera';
  showView('viewTracking'); updateLanguage(STATE.lang); setSourceNotice();
  lastGuideTask = -1; invalidSince = null; lastFramingGuide = -Infinity;
  document.querySelector('.quality-hud').hidden=isDemoMode;
  dom.qualityWarningOverlay.classList.remove('hidden');
  updateQualityChips(false,false,false,false);
  if (!isDemoMode) {
    try {
      await initMediaPipe();
      if (token !== sessionGeneration) return;
      if (!await mainCamera.start() || token !== sessionGeneration) return;
      STATE.webcamRunning = true;
      attachCameraEnd(token);
    } catch (error) {
      if (token !== sessionGeneration) return;
      stopSession(); showView('viewHome'); sessionNotice(cameraError(error)); return;
    }
  }
  if (token !== sessionGeneration) return;
  previousLoopTime = performance.now();
  runTrackingLoop();
}
function attachCameraEnd(token) {
  dom.webcamVideo.srcObject?.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
    if (token === sessionGeneration && sessionActive) { pauseTracking(); sessionNotice('Camera stopped. Restore camera access and press Resume to continue.'); }
  }));
}
function stopSession() {
  sessionGeneration++; sessionActive = false; cancelAnimationFrame(animFrameId); animFrameId = null;
  guide.cancel();
  mainCamera.stop(); STATE.webcamRunning = false; qualityAt = -Infinity;
}
function pauseTracking() {
  if (!sessionActive) return;
  sessionGeneration++; // Cancel camera/model starts that were awaiting permission or initialization.
  STATE.isPaused = true; mainCamera.stop(); STATE.webcamRunning = false; qualityAt = -Infinity;
  guide.cancel(); if (!document.hidden) guide.say('guidePause');
  dom.btnPauseSession.textContent = 'Resume'; dom.qualityWarningOverlay.classList.remove('hidden');
  document.getElementById('warnTitle').textContent = STATE.lang === 'ml' ? 'നിർത്തി · തുടരാൻ Resume അമർത്തുക' : 'Paused · press Resume to continue';
}
async function resumeTracking() {
  if (!sessionActive || !STATE.isPaused || dom.btnPauseSession.disabled) return;
  const token = sessionGeneration;
  dom.btnPauseSession.disabled = true;
  try {
    if (STATE.isLive) {
      if (!await mainCamera.start() || token !== sessionGeneration) return;
      STATE.webcamRunning = true; attachCameraEnd(token);
    }
    if (token !== sessionGeneration) return;
    STATE.isPaused = false; qualityAt = -Infinity; lastVideoTime = -1; previousLoopTime = performance.now();
    guide.say('guideResume'); lastGuideTask = STATE.currentTaskIndex;
    dom.btnPauseSession.textContent = 'Pause'; updateLanguage(STATE.lang); setSourceNotice();
    if (animFrameId === null) runTrackingLoop();
  } catch (error) { if (token === sessionGeneration) sessionNotice(cameraError(error)); }
  finally { dom.btnPauseSession.disabled = false; }
}
function runTrackingLoop() {
  if (!sessionActive) return;
  const now = performance.now(), delta = Math.max(0,Math.min(100,now-previousLoopTime)); previousLoopTime = now;
  const currentTask = TASKS[STATE.currentTaskIndex], localTaskMs = taskElapsedMs;
  const targetPos = calculateTargetPosition(currentTask.id,localTaskMs);
  const stage = document.getElementById('stageWrapper');
  dom.targetCompanion.style.left = `${targetPos.x*stage.clientWidth}px`;
  dom.targetCompanion.style.top = `${targetPos.y*stage.clientHeight}px`;
  let left = null, right = null, fresh = false;
  if (!STATE.isPaused && STATE.isLive && dom.webcamVideo.readyState >= 2 && dom.webcamVideo.currentTime !== lastVideoTime) {
    lastVideoTime = dom.webcamVideo.currentTime; fresh = true; processedFrames++; frameCount++;
    try {
      const results = STATE.landmarker.detectForVideo(dom.webcamVideo,now);
      const raw = results.faceLandmarks?.length === 1 ? results.faceLandmarks[0] : null;
      const w = dom.webcamVideo.videoWidth,h = dom.webcamVideo.videoHeight;
      const quality = framing(raw,w,h);
      const p = raw?.map(pt=>({x:pt.x*w,y:pt.y*h}));
      if (p) { left = relativeIris(p[263],p[362],p[473]); right = relativeIris(p[33],p[133],p[468]); }
      let lighting = false;
      if(raw && quality.ok) {
        const x=Math.min(raw[234].x,raw[454].x)*w, y=Math.max(0,raw[10].y*h);
        const cw=Math.abs(raw[454].x-raw[234].x)*w, ch=Math.max(1,(raw[152].y-raw[10].y)*h);
        lightContext.drawImage(dom.webcamVideo,x,y,cw,ch,0,0,16,16);
        const rgba=lightContext.getImageData(0,0,16,16).data;let sum=0;
        for(let i=0;i<rgba.length;i+=4)sum+=.2126*rgba[i]+.7152*rgba[i+1]+.0722*rgba[i+2];
        const mean=sum/256;lighting=mean>=35 && mean<=235;
      }
      const ear=p?eyeAspectRatio(p):null, eyes=!!left&&!!right&&ear!==null&&ear>0.15;
      updateQualityChips(quality.distance,lighting,quality.pose,eyes);
      const good=quality.ok&&lighting&&eyes;
      qualityAt=good?now:-Infinity;
      if (!good) {left=null;right=null;}
      if(raw&&STATE.showPipOverlay)drawLandmarkOverlay(raw,w,h);
      else dom.landmarkOverlayCanvas.getContext('2d').clearRect(0,0,dom.landmarkOverlayCanvas.width,dom.landmarkOverlayCanvas.height);
    } catch(error) {pauseTracking();sessionNotice(cameraError(error));}
  }
  const qualityOk=!STATE.isPaused&&(STATE.isDemo||now-qualityAt<250);
  if (qualityOk) {
    invalidSince = null;
    if (lastGuideTask !== STATE.currentTaskIndex) { lastGuideTask = STATE.currentTaskIndex; guide.say('follow' + companionSuffix()); }
  } else if (!STATE.isPaused && STATE.isLive) {
    if (invalidSince === null) invalidSince = now;
    if (now - invalidSince > 1800 && now - lastFramingGuide > 10000) { guide.say('guideFrame'); lastFramingGuide = now; }
  }
  dom.qualityWarningOverlay.classList.toggle('hidden',qualityOk);
  if (qualityOk && fresh && left && right) STATE.recordedSamples.push({task:currentTask.id,taskMs:localTaskMs,acquiredMs:now,target:targetPos,left,right,qualityOk:true});
  if(qualityOk)taskElapsedMs+=delta;
  dom.taskProgressBar.style.width=`${Math.min(100,taskElapsedMs/STATE.activeTaskDurationMs*100)}%`;
  dom.hudTimer.textContent=`${Math.max(0,Math.ceil((STATE.activeTaskDurationMs-taskElapsedMs)/1000))}s`;
  dom.hudTaskStep.textContent=`Task ${STATE.currentTaskIndex+1}/${TASKS.length}`;
  if(now-lastFpsTime>=1000){dom.fpsCounter.textContent=STATE.isDemo?'Camera off':`FPS: ${Math.round(frameCount*1000/(now-lastFpsTime))}`;frameCount=0;lastFpsTime=now;}
  dom.irisDisp.textContent=STATE.isDemo?'Walkthrough · no data':qualityOk?'Landmarks acquired':'Waiting for valid capture';
  if(taskElapsedMs>=STATE.activeTaskDurationMs){
    STATE.currentTaskIndex++;taskElapsedMs=0;qualityAt=-Infinity;
    if(STATE.currentTaskIndex>=TASKS.length){finishSession();return;}
    updateLanguage(STATE.lang);
  }
  animFrameId=requestAnimationFrame(runTrackingLoop);
}

function updateQualityChips(okDist, okLight, okPose, okEyes) {
  setChipState(dom.chipFaceDist, okDist);
  setChipState(dom.chipLighting, okLight);
  setChipState(dom.chipPose, okPose);
  setChipState(dom.chipEyes, okEyes);
}

function setChipState(chipEl, isOk) {
  chipEl.classList.toggle("chip-ok", isOk);
  chipEl.classList.toggle("chip-warn", !isOk);
}

function drawLandmarkOverlay(landmarks, w, h) {
  const canvas = dom.landmarkOverlayCanvas;
  if (!canvas) return;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);

  // Highlight eye corners & irises
  const eyeIndices = [33, 133, 263, 362, 468, 473];
  eyeIndices.forEach(idx => {
    const pt = landmarks[idx];
    if (pt) {
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, idx >= 468 ? 4 : 2, 0, 2 * Math.PI);
      ctx.fillStyle = idx >= 468 ? "#38bdf8" : "#f59e0b";
      ctx.fill();
    }
  });
}

function finishSession() {
  stopSession();
  guide.say('guideFinish');
  playChime(880, 0.4);
  showView("viewReport");
  generateResearchReport();
}

// ================= RESEARCH REPORT & TRAJECTORY RENDERER =================
function generateResearchReport() {
  sessionMetrics=researchMetrics(STATE.recordedSamples,processedFrames);
  dom.reportTimestamp.textContent=new Date(sessionTimestamp).toLocaleString();
  dom.reportCompanionUsed.textContent=`Companion: ${COMPANIONS[STATE.companion].emoji}`;
  const value=(n,d=2)=>n===null?'Unavailable':n.toFixed(d);
  dom.metricCorrelation.textContent=value(sessionMetrics.movementCorrelation);
  dom.metricFixation.textContent=value(sessionMetrics.fixationRms,3);
  dom.metricExcursionDiff.textContent=sessionMetrics.excursionDifferencePct===null?'Unavailable':`${value(sessionMetrics.excursionDifferencePct,1)}%`;
  dom.metricValidFrames.textContent=sessionMetrics.acceptedFractionPct===null?'Unavailable':`${value(sessionMetrics.acceptedFractionPct,1)}%`;
  dom.evalSummaryBanner.classList.remove('banner-warn'); dom.evalBannerIcon.textContent='ℹ';
  dom.evalBannerTitle.textContent=STATE.isDemo?'Walkthrough complete · no measurements':STATE.lang==='ml'?'ഗവേഷണ രേഖപ്പെടുത്തൽ പൂർത്തിയായി':'Research capture complete';
  dom.evalBannerDesc.textContent=STATE.lang==='ml'?'ഇവ ലാൻഡ്മാർക്ക് അടിസ്ഥാനത്തിലുള്ള ഗവേഷണ അളവുകളാണ്. സാധാരണ കാഴ്ചയോ കണ്ണിന്റെ ആരോഗ്യസ്ഥിതിയോ ഇവ ഉറപ്പാക്കുന്നില്ല.':'These are landmark-based engineering measurements. They cannot confirm normal vision, diagnose an eye condition, or decide clinical referral.';
    function setBadge(el, ok, text) {
    if (!el) return;
    el.textContent = text;
    el.className = `dm-badge ${ok ? 'badge-normal' : 'badge-warn'}`;
  }

  const corr = sessionMetrics.movementCorrelation;
  const fix = sessionMetrics.fixationRms;
  const symm = sessionMetrics.excursionDifferencePct;
  const valid = sessionMetrics.acceptedFractionPct;

  if (corr === null) {
    setBadge(dom.badgeCorr, false, 'Unavailable');
  } else if (corr >= 0.75) {
    setBadge(dom.badgeCorr, true, STATE.lang === 'ml' ? 'സാധാരണം (≥ 0.75)' : 'Normal (≥ 0.75)');
  } else {
    setBadge(dom.badgeCorr, false, STATE.lang === 'ml' ? 'പരിശോധിക്കുക (< 0.75)' : 'Review (< 0.75)');
  }

  if (fix === null) {
    setBadge(dom.badgeFix, false, 'Unavailable');
  } else if (fix <= 0.050) {
    setBadge(dom.badgeFix, true, STATE.lang === 'ml' ? 'സാധാരണം (< 0.050)' : 'Normal (< 0.050)');
  } else {
    setBadge(dom.badgeFix, false, STATE.lang === 'ml' ? 'വ്യതിയാനം (≥ 0.050)' : 'Elevated Jitter (≥ 0.050)');
  }

  if (symm === null) {
    setBadge(dom.badgeSymm, false, 'Unavailable');
  } else if (symm <= 10.0) {
    setBadge(dom.badgeSymm, true, STATE.lang === 'ml' ? 'സാധാരണം (≤ 10%)' : 'Normal (≤ 10%)');
  } else {
    setBadge(dom.badgeSymm, false, STATE.lang === 'ml' ? 'അസമമിതി (> 10%)' : 'Discrepancy (> 10%)');
  }

  if (valid === null) {
    setBadge(dom.badgeValid, false, 'Unavailable');
  } else if (valid >= 80.0) {
    setBadge(dom.badgeValid, true, STATE.lang === 'ml' ? 'ഉയർന്ന ഗുണനിലവാരം (> 80%)' : 'High Quality (> 80%)');
  } else {
    setBadge(dom.badgeValid, false, STATE.lang === 'ml' ? 'കുറഞ്ഞ നിരക്ക് (< 80%)' : 'Low (< 80%)');
  }
  document.getElementById('reportSessionStatus').textContent=STATE.isDemo?'Walkthrough · no participant data':`${STATE.recordedSamples.length} accepted / ${processedFrames} processed frames`;
  const triage = clinicalTriage(sessionMetrics, STATE.isDemo, STATE.lang);
  if (dom.triageBanner && dom.triageBadge && dom.triageTitle && dom.triageDesc && dom.triageNotice) {
    dom.triageBanner.className = `triage-banner ${triage.badgeClass}`;
    dom.triageBadge.textContent = triage.badgeText;
    dom.triageTitle.textContent = triage.title;
    dom.triageDesc.textContent = triage.guidance;
    dom.triageNotice.textContent = triage.disclaimer;
  }
  setSourceNotice();renderAllTrajectoryPlots();
}

function renderAllTrajectoryPlots() {
  const taskKeys = ["HORIZONTAL", "VERTICAL", "DIAGONAL", "JUMPS"];
  taskKeys.forEach(taskKey => {
    const tCanvas = document.getElementById(`targetTrajCanvas_${taskKey}`);
    const eCanvas = document.getElementById(`eyesTrajCanvas_${taskKey}`);
    if (tCanvas && eCanvas) {
      drawTrajectoryPlotForTask(taskKey, tCanvas, eCanvas);
    }
  });
}

function drawTrajectoryPlotForTask(taskKey, targetCanvas, eyesCanvas) {
  if (!targetCanvas || !eyesCanvas) return;

  const tCtx = targetCanvas.getContext("2d");
  const eCtx = eyesCanvas.getContext("2d");
  const w = targetCanvas.width;
  const h = targetCanvas.height;

  // Redraw for paper during printing and restore the dark app palette afterwards.
  const printing = window.matchMedia('print').matches;
  [tCtx, eCtx].forEach(ctx => {
    ctx.fillStyle = printing ? '#ffffff' : '#161b2f';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = printing ? 'rgba(38,79,99,0.12)' : 'rgba(181,189,215,0.10)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  });

  // Filter samples for selected task
  let taskSamples = STATE.recordedSamples.filter(s => s.task === taskKey);

  if (taskSamples.length < 2) {
    [tCtx,eCtx].forEach(ctx=>{ctx.fillStyle=printing?'#526575':'#b5bdd7';ctx.font='14px sans-serif';ctx.fillText('No captured observations',30,100);});
    return;
  }

  const pad = 20;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;

  // 1. Draw Target Trajectory (Canvas 1)
  tCtx.strokeStyle = "#38bdf8";
  tCtx.lineWidth = 3;
  tCtx.shadowColor = "rgba(56, 189, 248, 0.5)";
  tCtx.shadowBlur = 8;
  tCtx.beginPath();
  taskSamples.forEach((s, idx) => {
    const px = pad + s.target.x * plotW;
    const py = pad + s.target.y * plotH;
    if (idx === 0) tCtx.moveTo(px, py);
    else tCtx.lineTo(px, py);
  });
  tCtx.stroke();
  tCtx.shadowBlur = 0;

  // Target scatter dots
  tCtx.fillStyle = "#38bdf8";
  taskSamples.forEach((s, idx) => {
    if (idx % 2 === 0) {
      const px = pad + s.target.x * plotW;
      const py = pad + s.target.y * plotH;
      tCtx.beginPath();
      tCtx.arc(px, py, 2.5, 0, 2 * Math.PI);
      tCtx.fill();
    }
  });

  // 2. Draw Bilateral Iris Centroids (Canvas 2)
  const validLeft = taskSamples.map(s => s.left).filter(p => p && isFinite(p.x) && isFinite(p.y));
  const validRight = taskSamples.map(s => s.right).filter(p => p && isFinite(p.x) && isFinite(p.y));
  const allPts = [...validLeft, ...validRight];

  if (allPts.length >= 2) {
    let minX = Math.min(...allPts.map(p => p.x));
    let maxX = Math.max(...allPts.map(p => p.x));
    let minY = Math.min(...allPts.map(p => p.y));
    let maxY = Math.max(...allPts.map(p => p.y));

    const span = Math.max(0.08, Math.max(maxX - minX, maxY - minY) * 1.35);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const boundMinX = midX - span / 2;
    const boundMinY = midY - span / 2;

    function projectEye(p) {
      const normX = Math.max(0, Math.min(1, (p.x - boundMinX) / span));
      const normY = Math.max(0, Math.min(1, (p.y - boundMinY) / span));
      return {
        x: pad + normX * plotW,
        y: h - pad - normY * plotH
      };
    }

    // Left Eye (Blue #60a5fa) Path
    eCtx.strokeStyle = "#60a5fa";
    eCtx.lineWidth = 2.5;
    eCtx.shadowColor = "rgba(96, 165, 250, 0.5)";
    eCtx.shadowBlur = 6;
    eCtx.beginPath();
    validLeft.forEach((p, idx) => {
      const pt = projectEye(p);
      if (idx === 0) eCtx.moveTo(pt.x, pt.y);
      else eCtx.lineTo(pt.x, pt.y);
    });
    eCtx.stroke();

    // Left Eye Scatter Dots
    eCtx.fillStyle = "#60a5fa";
    validLeft.forEach((p, idx) => {
      if (idx % 2 === 0) {
        const pt = projectEye(p);
        eCtx.beginPath();
        eCtx.arc(pt.x, pt.y, 2.5, 0, 2 * Math.PI);
        eCtx.fill();
      }
    });

    // Right Eye (Amber #f59e0b) Path
    eCtx.strokeStyle = "#f59e0b";
    eCtx.lineWidth = 2.5;
    eCtx.shadowColor = "rgba(245, 158, 11, 0.5)";
    eCtx.shadowBlur = 6;
    eCtx.beginPath();
    validRight.forEach((p, idx) => {
      const pt = projectEye(p);
      if (idx === 0) eCtx.moveTo(pt.x, pt.y);
      else eCtx.lineTo(pt.x, pt.y);
    });
    eCtx.stroke();

    // Right Eye Scatter Dots
    eCtx.fillStyle = "#f59e0b";
    validRight.forEach((p, idx) => {
      if (idx % 2 === 0) {
        const pt = projectEye(p);
        eCtx.beginPath();
        eCtx.arc(pt.x, pt.y, 2.5, 0, 2 * Math.PI);
        eCtx.fill();
      }
    });

    eCtx.shadowBlur = 0;
  }
}

// ================= EXPORT HANDLERS =================
function exportJSON() {
  if(!sessionMetrics)return;
  const reportData={schemaVersion:1,app:'NETRA-SCREEN Web/PWA',version:VERSION,timestamp:sessionTimestamp,
    source:STATE.isDemo?'walkthrough':'live-research',clinicalClassification:null,
    limitations:'Unvalidated landmark research proxies. Not calibrated gaze, diagnosis, or clinical referral.',
    companion:STATE.companion,metrics:sessionMetrics,observationsSampled:STATE.recordedSamples.filter((_,i)=>i%Math.max(1,Math.ceil(STATE.recordedSamples.length/320))===0)};
  const blob=new Blob([JSON.stringify(reportData,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`NETRA-SCREEN-${STATE.isDemo?'walkthrough':'research'}-${Date.now()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Language Toggle
  dom.langToggleBtn.addEventListener("click", () => {
    updateLanguage(STATE.lang === "en" ? "ml" : "en");
    playChime(500, 0.1);
    guide.cancel();
    if (document.getElementById('viewReady').classList.contains('active-view')) guide.say('ready' + companionSuffix());
    else if (sessionActive && !STATE.isPaused) guide.say('follow' + companionSuffix());
  });

  // Sound Toggle
  dom.audioToggleBtn.addEventListener("click", () => {
    STATE.soundEnabled = !STATE.soundEnabled;
    dom.audioIcon.textContent = STATE.soundEnabled ? '🔊' : '🔇';
    dom.audioToggleBtn.setAttribute('aria-pressed', String(STATE.soundEnabled));
    dom.audioToggleBtn.setAttribute('aria-label', STATE.soundEnabled ? 'Mute voice guidance' : 'Turn on voice guidance');
    guide.cancel();
    if (STATE.soundEnabled) {
      if (document.getElementById('viewReady').classList.contains('active-view')) guide.say('ready' + companionSuffix());
      else if (sessionActive && !STATE.isPaused) guide.say('follow' + companionSuffix());
      else playChime(700, .15);
    }
  });

  // Companion selection buttons
  document.querySelectorAll(".comp-btn").forEach(btn => {
    btn.addEventListener("click", () => selectCompanion(btn.dataset.companion));
  });
  document.querySelectorAll(".companion-card").forEach(card => {
    card.addEventListener("click", () => selectCompanion(card.dataset.comp));
  });

  dom.btnStartLive.addEventListener("click", () => {
    if (!dom.consentCheckbox.checked) {
      sessionNotice(STATE.lang === "ml" ? "ക്യാമറ തുടങ്ങുന്നതിന് മുമ്പ് സമ്മതം നൽകുക." : "Please agree to local camera processing before starting.");
      dom.consentCheckbox.focus();
      const box = document.querySelector(".consent-box");
      if (box) {
        box.classList.add("shake-highlight");
        setTimeout(() => box.classList.remove("shake-highlight"), 800);
      }
      playChime(360, 0.2);
      return;
    }
    prepareSession(false);
  });

  dom.btnStartDemo.addEventListener("click", () => {
    prepareSession(true);
  });
  document.getElementById('btnFocusReady').addEventListener('click', () => {
    if (!document.getElementById('viewReady').classList.contains('active-view')) return;
    // Consent may have changed while the ready screen was open.
    if (!preparedDemo && !dom.consentCheckbox.checked) { guide.cancel(); showView('viewHome'); return; }
    startSession(preparedDemo);
  });
  document.getElementById('btnReadyBack').addEventListener('click', () => { guide.cancel(); showView('viewHome'); });

  // Pause / Resume
  dom.btnPauseSession.addEventListener('click',()=>{if(STATE.isPaused)resumeTracking();else pauseTracking();});

  // Exit Session
  dom.btnExitSession.addEventListener("click", () => {
    stopSession();
    showView("viewHome");
  });

  // PIP Overlay toggle
  dom.btnTogglePipOverlay.addEventListener("click", () => {
    STATE.showPipOverlay = !STATE.showPipOverlay;
    dom.landmarkOverlayCanvas.style.display = STATE.showPipOverlay ? "block" : "none";
  });

  // Trajectory Task Tabs
  dom.trajTaskTabs.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      dom.trajTaskTabs.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const selectedTask = btn.dataset.task;
      const blocks = document.querySelectorAll(".trajectory-task-block");
      blocks.forEach(block => {
        if (selectedTask === "ALL" || block.dataset.task === selectedTask) {
          block.classList.remove("tab-hidden");
        } else {
          block.classList.add("tab-hidden");
        }
      });
      playChime(600, 0.1);
    });
  });

  // Export & Print
  dom.btnPrintReport.addEventListener("click", () => {
    window.scrollTo(0, 0);
    const vp = document.querySelector(".content-viewport");
    if (vp) vp.scrollTop = 0;
    if (dom.viewReport) dom.viewReport.scrollTop = 0;
    renderAllTrajectoryPlots();
    setTimeout(() => {
      window.print();
    }, 150);
  });

  window.addEventListener("beforeprint", () => {
    window.scrollTo(0, 0);
    const vp = document.querySelector(".content-viewport");
    if (vp) vp.scrollTop = 0;
    if (dom.viewReport) dom.viewReport.scrollTop = 0;
    renderAllTrajectoryPlots();
  });
  window.addEventListener('afterprint', renderAllTrajectoryPlots);

  dom.btnExportJSON.addEventListener("click", () => {
    exportJSON();
  });

  dom.btnRestartSession.addEventListener("click", () => {
    guide.cancel();
    showView("viewHome");
  });
}

// Initial bootstrap
window.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateLanguage("en");
});

document.addEventListener('visibilitychange',()=>{if(document.hidden){guide.cancel();if(sessionActive)pauseTracking();}});
window.addEventListener('orientationchange',()=>{if(sessionActive)pauseTracking();});
window.addEventListener('pagehide',()=>{stopSession();STATE.landmarker?.close();STATE.landmarker=null;});
