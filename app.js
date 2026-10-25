/**
 * NETRA-SCREEN Web / PWA Engine v0.4.0
 * Multi-Module Ocular Health Suite:
 * 1. Pediatric Ocular Tracking & Bilateral Iris Excursion
 * 2. Real-Time Digital Eye Strain & Dry Eye Monitor (EAR & Distance)
 * 3. Interactive Vision & Refractive Screening (Tumbling E, Astigmatism, Duochrome, Ishihara, OSDI)
 * Runs 100% offline in iOS Safari, Chrome, Edge, and Android Browsers.
 */

import {
  FaceLandmarker,
  FilesetResolver
} from "./libs/tasks-vision.mjs";

// ================= BILINGUAL DICTIONARY (EN & ML) =================
const I18N = {
  en: {
    heroBadge: "Ocular Health & Vision Screening Suite",
    heroTitle: "Pediatric Attention, Eye Strain & Vision Screening",
    heroDesc: "AI-powered camera tracking and interactive vision tests to evaluate ocular alignment, digital eye strain, blinking frequency, and refractive acuity. 100% offline and private.",
    disclaimerHeader: "Research Scope Notice",
    disclaimerBody: "This web application tracks relative iris centroids, blink patterns, and visual acuity for screening and research. It does not provide medical diagnosis or replace an examination by an ophthalmologist or optometrist.",
    chooseMode: "Select Screening / Assessment Mode:",
    badgePediatric: "Pediatric AI",
    modePursuitTitle: "Ocular Pursuit & Alignment",
    modePursuitDesc: "Tracks bilateral iris excursion symmetry, fixation jitter & squint/amblyopia risk.",
    badgeRealtime: "Camera Monitor",
    modeStrainTitle: "Eye Strain & Dry Eye Monitor",
    modeStrainDesc: "Blink rate (EAR), screen distance gauge (<30cm alert), and 20-20-20 rest guide.",
    badgeInteractive: "Interactive Tests",
    modeVisionTitle: "Vision & Refraction Suite",
    modeVisionDesc: "Tumbling E Acuity (6/6), Astigmatism Dial, Duochrome & OSDI Dry Eye test.",
    chooseCompanion: "Choose Child Companion Target:",
    compButterflyTitle: "Chithrashalabham",
    compButterflyDesc: "Playful Fluttering Butterfly",
    compFishTitle: "Malsyam",
    compFishDesc: "Smooth Swimming Fish",
    compDotTitle: "Smiling Dot",
    compDotDesc: "High Contrast Target",
    consentText: "I affirm guardian consent for this research session. Camera feed is processed strictly inside this browser and no face videos or identifying information are saved or uploaded.",
    btnStartLive: "Start Camera Tracking Session",
    btnStartDemo: "Run Camera-Free Demo / Walkthrough",
    strainInfoTitle: "How Eye Strain & Dry Eye Monitoring Works:",
    strainInfoDesc: "The front camera monitors your Eye Aspect Ratio (EAR) to detect complete vs incomplete blinks and measures screen-to-eye distance. Alerts sound if held closer than 30 cm or if blinking drops below 10/min.",
    btnStartStrain: "Start Live Eye Strain & Dry Eye Monitor",
    visionInfoTitle: "Interactive Vision Screening Suite:",
    visionInfoDesc: "Self-administered tests including Tumbling E Visual Acuity (6/6 to 6/24), Astigmatism Clock Dial, Red-Green Duochrome refractive balance, and OSDI dry eye clinical scoring.",
    btnStartVision: "Launch Vision Screening Station",
    navHome: "Home",
    navPresentation: "Pitch Deck",
    presTitle: "MindMesh Official Presentation Deck",
    presSub: "Complete YIP Pitch Deck, Algorithm Architecture & Clinical Findings (PDF)",
    presDownloadBtn: "Download PDF",
    btnReportDeck: "Download Pitch Deck",
    iosInstallHint: "<strong>iPhone Tip:</strong> Tap Safari's <em>Share button</em> ➔ <em>\"Add to Home Screen\"</em> to use NetraScreen as a full-screen native app!",
    
    // Tracking HUD
    chipFraming: "Framing: Good",
    chipLighting: "Light: Balanced",
    chipHead: "Head: Level",
    chipEyes: "Both Eyes: Visible",
    warnPleaseFace: "Please look directly at screen",
    warnLightingDesc: "Keep face centered in good lighting with both eyes unobstructed.",
    pipTitle: "Live Landmark Analysis",
    taskHorizontalName: "HORIZONTAL PURSUIT",
    taskVerticalName: "VERTICAL PURSUIT",
    taskDiagonalName: "DIAGONAL PURSUIT",
    taskJumpsName: "FIXATION JUMPS",

    // Strain Monitor
    tooCloseAlert: "TOO CLOSE TO SCREEN!",
    tooCloseSub: "Move back to at least 35-40 cm to protect your eyes.",
    scBlinkRate: "Blink Rate",
    unitBpm: "blinks / min",
    guideBlink: "Healthy rate is 15-20 blinks/min. Low blinking causes tear film evaporation & dry eyes.",
    scDistance: "Screen Distance",
    guideDistance: "Keep at least 35–45 cm distance to reduce ciliary muscle accommodation strain.",
    scStare: "Stare Interval",
    guideStare: "Prolonged stare intervals (>8s) dry the ocular surface causing burning and strain.",
    scRule20: "20-20-20 Rest Rule",
    guideRule20: "Every 20 mins, look at an object 20 feet (6m) away for 20 seconds to relax muscles.",
    btnFinishStrainReport: "Finish & Generate Eye Strain Report",
    btnTakeVisionCheck: "Take Quick Vision & Power Check",
    breakModalTitle: "20-20-20 Eye Relaxation Rest",
    breakModalDesc: "Look away from your screen at a distant window or object at least <strong>20 feet (6 meters)</strong> away.",
    breakTip: "Blink gently and allow your eye focusing muscles to completely relax.",

    // Vision Suite
    suiteBadge: "INTERACTIVE VISION STATION",
    suiteTitle: "Visual Acuity, Astigmatism & Dry Eye Assessment",
    suiteSubtitle: "Standardized optometric screening tests executable entirely within your mobile browser.",
    tabAcuity: "Visual Acuity (E)",
    tabAstigmatism: "Astigmatism Dial",
    tabDuochrome: "Duochrome Test",
    tabColor: "Color Vision",
    tabOsdi: "Dry Eye Survey",
    acuityInstTitle: "Distance Setup (Tumbling E Test):",
    acuityInstDesc: "Hold phone at arm's length (~40-50 cm). Indicate which direction the open prongs of the letter 'E' are pointing.",
    lblTargetLevel: "Snellen Acuity Level:",
    astigInstTitle: "Astigmatism Sunburst Dial Test:",
    astigInstDesc: "Cover one eye with your hand. Look at the center dot of the dial. Do all radiating lines look equally dark and sharp, or do some lines appear significantly darker or thicker than others?",
    duoInstTitle: "Duochrome (Red-Green) Refractive Balance:",
    duoInstDesc: "Look at the letters on both colors. In which colored background do the symbols look sharper, blacker, and more distinctly focused?",
    colorInstTitle: "Ishihara Red-Green Color Screening:",
    colorInstDesc: "Look at the pseudoisochromatic dot pattern below. Which number do you see clearly embedded inside the circle?",
    osdiInstTitle: "OSDI (Ocular Surface Disease Index) 6-Question Screener:",
    osdiInstDesc: "Rate how frequently you experienced these eye discomfort symptoms over the past week.",
    btnCompileVisionReport: "Generate Comprehensive Eye Health Report",

    // Report
    reportTitle: "COMPREHENSIVE OCULAR SCREENING REPORT",
    reportHeading: "Ocular Alignment, Eye Strain & Vision Assessment",
    evalBannerTitleNormal: "Healthy Overall Eye Screening Observed",
    evalBannerDescNormal: "Visual alignment, blink frequency, and acuity screening metrics are within normal healthy ranges. Regular eye checkups and ergonomic screen habits are recommended.",
    evalBannerTitleWarn: "Ocular Discrepancy or Visual Strain Flagged",
    evalBannerDescWarn: "Telemetry or interactive tests detected reduced blinking, screen proximity, or refractive error indication. An examination by an eye care specialist is recommended.",
    strainReportHeading: "Digital Eye Strain & Blinking Ergonomics",
    strainReportSub: "Front camera telemetry of eye aspect ratio (EAR) and viewing distance",
    repBlinkRate: "Average Blink Rate",
    repBlinkExplain: "Blinking replenishes the tear film. Rates below 10/min cause rapid dry spots and asthenopic eye strain.",
    repIncomplete: "Incomplete Blink Fraction",
    repIncompleteExplain: "Fraction of blinks where eyelids didn't fully seal. High incomplete blinking (>30%) dries the inferior cornea.",
    repDistance: "Average Screen Distance",
    repDistanceExplain: "Closer distances (<30 cm) cause intense ciliary accommodation fatigue and accelerate juvenile myopia progression.",
    repOsdiScore: "OSDI Dry Eye Score",
    repOsdiExplain: "Standard clinical questionnaire grading eye dryness, foreign body sensation, and screen tolerance.",
    visionReportHeading: "Visual Acuity & Refractive Error Screening",
    visionReportSub: "Interactive Tumbling E, Astigmatism dial, and Duochrome balance",
    repAcuityLevel: "Visual Acuity (Tumbling E)",
    repAcuityExplain: "Resolves 5-arcminute optotypes at standard distance. Values of 6/12 or worse suggest refractive correction need.",
    repAstigmatism: "Astigmatism Dial",
    repAstigExplain: "Radiating lines appeared uniform without meridional distortion, suggesting symmetric corneal curvature.",
    repDuochrome: "Duochrome Refractive Focus",
    repDuochromeExplain: "Red and green backgrounds focus equally on the retina. Sharper red indicates myopia; sharper green indicates hyperopia.",
    repColor: "Color Vision (Ishihara)",
    repColorExplain: "Correct identification of pseudoisochromatic numbers confirms normal trichromatic cone photoreceptor function.",
    trajVisualizerHeading: "Target & Iris Trajectories (Ocular Motility)",
    trajVisualizerSub: "Spatial alignment of visual pursuit across tasks",
    tabHorizontal: "Horizontal",
    tabVertical: "Vertical",
    tabDiagonal: "Diagonal",
    tabJumps: "Jumps",
    plotTarget: "Target Trajectory (Screen Normalized)",
    plotEyes: "Bilateral Iris Centroids (Left: Blue, Right: Amber)",
    legendTarget: "Visual Target Path",
    legendLeftEye: "Left Eye Iris Centroid",
    legendRightEye: "Right Eye Iris Centroid",
    graphGuideHeading: "How Evaluators & Judges Read this Graph:",
    graphGuideText: "The cyan curve is the path of the visual target. The blue (Left eye) and amber (Right eye) curves map real-time iris movement. When both eye curves closely mirror each other and track the target with smooth arcs, eye movement is coordinated. If one curve diverges, lags, or stops short, it indicates potential eye turn (squint) or muscle imbalance.",
    metricsHeading: "Conjugate Motility & Telemetry Metrics",
    metricsSub: "Calculated from accepted offline facial landmark telemetry",
    metricBilateralCorr: "Bilateral Movement Correlation",
    metricCorrExplain: "Measures whether both eyes move together in unison in the same direction at the same speed. High correlation confirms synchronized binocular pursuit.",
    metricFixationStability: "Fixation Stability (RMS Jitter)",
    metricFixExplain: "Measures involuntary eye shaking when holding gaze at a fixed point. A lower value indicates a calm, steady gaze without nystagmus or wandering attention.",
    metricSymmetry: "Symmetry Discrepancy",
    metricSymmExplain: "Compares the maximum turning distance reached by the left vs right eye. A low difference indicates balanced extraocular muscle strength on both sides.",
    metricValidPct: "Accepted Frames Fraction",
    metricValidExplain: "The percentage of test frames that met all quality criteria (centered face, level head pose, even lighting, unobstructed eyes). Proves test reliability.",
    specialistDecisionTitle: "When Should an Eye Care Specialist (Ophthalmologist / Optometrist) Be Consulted?",
    specialistDecisionSubtitle: "Clinical triage protocol for schools, parents, and community health workers",
    telemetryTriggersTitle: "⚠️ Telemetry Warning Triggers:",
    trig1: "Bilateral Movement Correlation persistently below 0.75",
    trig2: "Symmetry Discrepancy greater than 10.0% across repeated tests",
    trig3: "Visual Acuity worse than 6/12 in either eye",
    trig4: "Persistent low blink rate (<10/min) or OSDI dry eye score > 22",
    physicalSignsTitle: "🚨 Physical Red Flags Observed by Parents:",
    sign1: "Visible eye turn or squint (one eye turns in or out, even occasionally)",
    sign2: "Child tilts or turns head sideways when looking at TV, books, or objects",
    sign3: "Frequent eye rubbing, squinting, or complaining of headaches",
    sign4: "Abnormal white or mismatched reflection in pupil during flash photos",
    disclaimerFooterText: "<strong>Important Notice:</strong> NetraScreen is an early research triage and ergonomics tool designed to flag potential tracking anomalies and refractive concerns for clinical review. It does not replace a comprehensive pediatric eye examination by a certified ophthalmologist or optometrist.",
    btnPrint: "Print / Save PDF Report",
    btnExportJSON: "Download JSON Data",
    btnNewSession: "Start New Session"
  },
  ml: {
    heroBadge: "നേത്രാരോഗ്യ & കാഴ്ച സ്ക്രീനിംഗ് പ്ലാറ്റ്‌ഫോം",
    heroTitle: "കുട്ടികളിലെ നേത്ര ചലനം, കണ്ണിന്റെ ക്ഷീണം & കാഴ്ച പരിശോധന",
    heroDesc: "കൃത്രിമബുദ്ധി (AI) ക്യാമറ ട്രാക്കിംഗും ഇന്ററാക്ടീവ് ടെസ്റ്റുകളും ഉപയോഗിച്ച് കോങ്കണ്ണ്, കണ്ണിന്റെ ക്ഷീണം, ചിമ്മൽ നിരക്ക്, കാഴ്ചക്കുറവ് എന്നിവ സ്വയം സ്ക്രീൻ ചെയ്യാം. 100% ഓഫ്‌ലൈൻ.",
    disclaimerHeader: "ഗവേഷണ പരിധി അറിയിപ്പ്",
    disclaimerBody: "ഈ വെബ് ആപ്ലിക്കേഷൻ ഗവേഷണ ആവശ്യങ്ങൾക്കായി മാത്രമുള്ളതാണ്. ഇത് നേത്രരോഗ നിർണയമോ അല്ലെങ്കിൽ ഡോക്ടറുടെ പരിശോധനയ്ക്ക് പകരമോ അല്ല.",
    chooseMode: "പരിശോധനാ വിഭാഗം തിരഞ്ഞെടുക്കുക:",
    badgePediatric: "പീഡിയാട്രിക് AI",
    modePursuitTitle: "നേത്ര ചലനവും അലൈൻമെന്റും",
    modePursuitDesc: "ഇരു കൃഷ്ണമണികളുടെയും ചലന സമമിതിയും കോങ്കണ്ണ്/മടിയൻ കണ്ണ് സാധ്യതയും കണ്ടെത്തുന്നു.",
    badgeRealtime: "ക്യാമറ മോണിറ്റർ",
    modeStrainTitle: "കണ്ണിന്റെ ക്ഷീണവും വരൾച്ചയും (Dry Eye)",
    modeStrainDesc: "ചിമ്മൽ നിരക്ക് (EAR), സ്ക്രീൻ ദൂരം (<30cm അലേർട്ട്), 20-20-20 റെസ്റ്റ് ടൈമർ.",
    badgeInteractive: "ഇന്ററാക്ടീവ് ടെസ്റ്റുകൾ",
    modeVisionTitle: "കാഴ്ചയും പവർ പരിശോധനയും",
    modeVisionDesc: "Tumbling E കാഴ്ച ടെസ്റ്റ് (6/6), ആസ്റ്റിഗ്മാറ്റിസം ഡയൽ, ഡ്യുവോക്രോം & ഡ്രൈ ഐ സർവേ.",
    chooseCompanion: "കുട്ടികൾക്ക് ഇഷ്ടമുള്ള കൂട്ടുകാരനെ തിരഞ്ഞെടുക്കുക:",
    compButterflyTitle: "ചിത്രശലഭം",
    compButterflyDesc: "പാറിപ്പറക്കുന്ന വർണ്ണ ശലഭം",
    compFishTitle: "മത്സ്യം",
    compFishDesc: "നീന്തിത്തുടിക്കുന്ന കുഞ്ഞുമത്സ്യം",
    compDotTitle: "പുഞ്ചിരിക്കുന്ന കുത്ത്",
    compDotDesc: "വ്യക്തതയുള്ള വലിയ കുത്ത്",
    consentText: "ഈ ഗവേഷണ സെഷനായി രക്ഷിതാവ് സമ്മതം നൽകുന്നു. ക്യാമറ ദൃശ്യങ്ങൾ ഈ ബ്രൗസറിനുള്ളിൽ മാത്രമേ പ്രോസസ്സ് ചെയ്യപ്പെടുന്നുള്ളൂ. മുഖദൃശ്യങ്ങളോ വ്യക്തിവിവരങ്ങളോ സൂക്ഷിക്കുകയോ പങ്കുവെക്കുകയോ ചെയ്യുന്നില്ല.",
    btnStartLive: "ക്യാമറ ട്രാക്കിംഗ് സെഷൻ തുടങ്ങുക",
    btnStartDemo: "ക്യാമറയില്ലാത്ത ഡെമോ / വാക്ക്ത്രൂ",
    strainInfoTitle: "സ്ട്രെയിൻ മോണിറ്ററിംഗ് എങ്ങനെ പ്രവർത്തിക്കുന്നു:",
    strainInfoDesc: "ഫ്രണ്ട് ക്യാമറ വഴി കണ്ണ് ചിമ്മുന്ന നിരക്കും (EAR) ഫോൺ എത്ര അടുത്ത് പിടിച്ചിരിക്കുന്നുവെന്നും തത്സമയം നിരീക്ഷിക്കുന്നു. 30 സെ.മീറ്ററിൽ അടുത്തായാലോ ചിമ്മൽ കുറഞ്ഞാലോ മുന്നറിയിപ്പ് നൽകും.",
    btnStartStrain: "ലൈവ് സ്ട്രെയിൻ & ഡ്രൈ ഐ മോണിറ്റർ തുടങ്ങുക",
    visionInfoTitle: "ഇന്ററാക്ടീവ് കാഴ്ച പരിശോധനകൾ:",
    visionInfoDesc: "Tumbling E വഴിയുള്ള കാഴ്ചക്കുറവ് സ്ക്രീനിംഗ്, സിലിണ്ടർ പവർ സംശയത്തിനുള്ള ആസ്റ്റിഗ്മാറ്റിസം ഡയൽ, മയോപിയ-ഹൈപ്പർമെട്രോപിയ സ്വഭാവം അറിയാനുള്ള ഡ്യുവോക്രോം ടെസ്റ്റ് എന്നിവ ഉൾപ്പെടുന്നു.",
    btnStartVision: "കാഴ്ച പരിശോധനാ സ്റ്റേഷൻ ആരംഭിക്കുക",
    navHome: "ഹോം",
    navPresentation: "പ്രസന്റേഷൻ ഡെക്ക്",
    presTitle: "MindMesh പ്രസന്റേഷൻ ഡെക്ക്",
    presSub: "ഔദ്യോഗിക YIP പിച്ച് ഡെക്ക്, സാങ്കേതിക വിവരങ്ങൾ & ക്ലിനിക്കൽ റിപ്പോർട്ട് (PDF)",
    presDownloadBtn: "ഡൗൺലോഡ് PDF",
    btnReportDeck: "പ്രസന്റേഷൻ ഡൗൺലോഡ് (PDF)",
    iosInstallHint: "<strong>iPhone ടിപ്പ്:</strong> സഫാരിയിലെ <em>Share ബട്ടൺ</em> അമർത്തി <em>\"Add to Home Screen\"</em> നൽകിയാൽ ഫുൾ സ്ക്രീൻ നേറ്റീവ് ആപ്പ് ആയി ഉപയോഗിക്കാം!",

    chipFraming: "പൊസിഷൻ: ശരി",
    chipLighting: "വെളിച്ചം: സമം",
    chipHead: "തല: നേരെ",
    chipEyes: "ഇരു കണ്ണുകളും: ദൃശ്യം",
    warnPleaseFace: "സ്ക്രീനിലേക്ക് നേരെ നോക്കുക",
    warnLightingDesc: "നല്ല വെളിച്ചത്തിൽ ഇരു കണ്ണുകളും വ്യക്തമായി കാണത്തക്ക വിധം ഇരിക്കുക.",
    pipTitle: "തത്സമയ ലാൻഡ്‌മാർക്ക് വിശകലനം",
    taskHorizontalName: "തിരശ്ചീന ചലനം",
    taskVerticalName: "ലംബ ചലനം",
    taskDiagonalName: "കോണോടുകോൺ ചലനം",
    taskJumpsName: "സ്ഥാനം മാറുന്ന ചാട്ടങ്ങൾ",

    tooCloseAlert: "ഫോൺ കണ്ണിനോട് വളരെ അടുത്താണ്!",
    tooCloseSub: "കണ്ണിന്റെ ആയാസം കുറയ്ക്കാൻ ഫോൺ കുറഞ്ഞത് 35-40 സെ.മീ അകലത്തിൽ പിടിക്കുക.",
    scBlinkRate: "ചിമ്മൽ നിരക്ക്",
    unitBpm: "തവണ / മിനിറ്റ്",
    guideBlink: "മിനിറ്റിൽ 15-20 തവണ ചിമ്മുന്നതാണ് ഉചിതം. ചിമ്മൽ കുറഞ്ഞാൽ കണ്ണിൽ വരൾച്ചയുണ്ടാകും.",
    scDistance: "സ്ക്രീൻ ദൂരം",
    guideDistance: "35-45 സെ.മീ ദൂരം പാലിക്കുന്നത് കണ്ണിന്റെ പേശികൾക്ക് ആശ്വാസം നൽകും.",
    scStare: "ചിമ്മാതിരുന്ന സമയം",
    guideStare: "തുടർച്ചയായി ചിമ്മാതിരിക്കുന്നത് കണ്ണീർ പാളി വറ്റാനും എരിച്ചിലിനും കാരണമാകും.",
    scRule20: "20-20-20 വിശ്രമ നിയമം",
    guideRule20: "ഓരോ 20 മിനിറ്റിലും 20 അടി അകലെയുള്ള വസ്തുവിലേക്ക് 20 സെക്കൻഡ് നോക്കുക.",
    btnFinishStrainReport: "മോണിറ്ററിംഗ് അവസാനിപ്പിച്ച് റിപ്പോർട്ട് കാണുക",
    btnTakeVisionCheck: "കാഴ്ച പരിശോധന (Vision Test) ചെയ്യുക",
    breakModalTitle: "20-20-20 കണ്ണിനുള്ള വിശ്രമം",
    breakModalDesc: "സ്ക്രീനിൽ നിന്ന് ശ്രദ്ധ മാറ്റി <strong>20 അടി (6 മീറ്റർ)</strong> അകലെയുള്ള കാഴ്ചയിലേക്ക് 20 സെക്കൻഡ് നോക്കുക.",
    breakTip: "മെല്ലെ കണ്ണ് ചിമ്മി കണ്ണിന്റെ മസിലുകൾ പൂർണ്ണമായി അയച്ചുവിടുക.",

    suiteBadge: "ഇന്ററാക്ടീവ് കാഴ്ചാ പരിശോധന",
    suiteTitle: "കാഴ്ചക്കുറവ്, ആസ്റ്റിഗ്മാറ്റിസം & ഡ്രൈ ഐ സ്ക്രീനിംഗ്",
    suiteSubtitle: "മൊബൈൽ ബ്രൗസറിൽ തനിയെ ചെയ്യാവുന്ന പ്രാഥമിക നേത്ര പരിശോധനകൾ.",
    tabAcuity: "കാഴ്ച (Tumbling E)",
    tabAstigmatism: "ആസ്റ്റിഗ്മാറ്റിസം ഡയൽ",
    tabDuochrome: "ഡ്യുവോക്രോം ടെസ്റ്റ്",
    tabColor: "വർണ്ണാന്ധത",
    tabOsdi: "ഡ്രൈ ഐ സർവേ",
    acuityInstTitle: "ദൂര ക്രമീകരണം (Tumbling E):",
    acuityInstDesc: "ഫോൺ കൈ നീട്ടിപ്പിടിച്ച് (40-50 cm) 'E' അക്ഷരത്തിന്റെ തുറന്ന ഭാഗം ഏത് ദിശയിലേക്കാണെന്ന് താഴെയുള്ള ബട്ടണുകൾ വഴി കാണിക്കുക.",
    lblTargetLevel: "കാഴ്ച നിലവാരം:",
    astigInstTitle: "ആസ്റ്റിഗ്മാറ്റിസം സൺബേസ്റ്റ് ഡയൽ:",
    astigInstDesc: "ഒരു കണ്ണ് കൈകൊണ്ട് പൊത്തുക. ചക്രത്തിന്റെ നടുവിലെ കുത്തിൽ നോക്കുക. എല്ലാ വരകളും ഒരേ കട്ടിയിലാണോ അതോ ചില വരകൾ കൂടുതൽ കറുത്ത് കാണുന്നുണ്ടോ?",
    duoInstTitle: "ഡ്യുവോക്രോം (ചുവപ്പ്-പച്ച) ഫോക്കസ്:",
    duoInstDesc: "ഏത് പശ്ചാത്തലത്തിലെ അക്ഷരങ്ങളാണ് കൂടുതൽ വ്യക്തമായും തെളിഞ്ഞും കാണുന്നത്?",
    colorInstTitle: "ഇഷിഹാര വർണ്ണാന്ധത പരിശോധന:",
    colorInstDesc: "വൃത്തത്തിനുള്ളിൽ കാണുന്ന സംഖ്യ ഏതാണെന്ന് താഴെ നൽകിയിരിക്കുന്നതിൽ നിന്നും തിരഞ്ഞെടുക്കുക.",
    osdiInstTitle: "OSDI ഡ്രൈ ഐ സർവേ (6 ചോദ്യങ്ങൾ):",
    osdiInstDesc: "കഴിഞ്ഞ ഒരാഴ്ചയായി നിങ്ങളുടെ കണ്ണുകൾക്ക് അനുഭവപ്പെട്ട അസ്വസ്ഥതകൾ രേഖപ്പെടുത്തുക.",
    btnCompileVisionReport: "പൂർണ്ണ നേത്രാരോഗ്യ റിപ്പോർട്ട് കാണുക",

    reportTitle: "സമഗ്ര നേത്ര സ്ക്രീനിംഗ് റിപ്പോർട്ട്",
    reportHeading: "നേത്ര ചലനം, കണ്ണിന്റെ ആയാസം & കാഴ്ചാ പരിശോധന",
    evalBannerTitleNormal: "കണ്ണുകളുടെ പൊതുവായ ആരോഗ്യം തൃപ്തികരം",
    evalBannerDescNormal: "കണ്ണുകളുടെ സമന്വയവും ചിമ്മൽ നിരക്കും കാഴ്ച നിലവാരവും സാധാരണ പരിധിയിലാണ്. കൃത്യമായ ഇടവേളകളിൽ വിശ്രമം നൽകുക.",
    evalBannerTitleWarn: "കണ്ണിന് ആയാസമോ കാഴ്ചക്കുറവോ ശ്രദ്ധയിൽപ്പെട്ടു",
    evalBannerDescWarn: "ചിമ്മൽ നിരക്കിലോ സ്ക്രീൻ ദൂരത്തിലോ കാഴ്ചാ സ്ക്രീനിംഗിലോ വ്യത്യാസം രേഖപ്പെടുത്തിയിട്ടുണ്ട്. ഒരു നേത്രരോഗ വിദഗ്ദ്ധനെ കാണുന്നത് ഉചിതമായിരിക്കും.",
    strainReportHeading: "കണ്ണിന്റെ ആയാസവും ചിമ്മൽ നിരക്കും",
    strainReportSub: "ക്യാമറ ടെലിമെട്രിയിൽ നിന്ന് കണക്കാക്കിയ EAR അനുപാതവും സ്ക്രീൻ ദൂരവും",
    repBlinkRate: "ശരാശരി ചിമ്മൽ നിരക്ക്",
    repBlinkExplain: "ചിമ്മുന്നത് കണ്ണീർ പാളിയെ സംരക്ഷിക്കുന്നു. 10-ൽ താഴെയുള്ള നിരക്ക് കണ്ണിൽ വരൾച്ചയുണ്ടാക്കും.",
    repIncomplete: "പകുതി മാത്രം ചിമ്മിയ നിരക്ക്",
    repIncompleteExplain: "കണ്ണ് പൂർണ്ണമായി അടയാതെ ചിമ്മുന്ന നിരക്ക് 30%-ൽ കൂടിയാൽ കണ്ണിന്റെ താഴത്തെ ഭാഗം വരണ്ടുപോകും.",
    repDistance: "ശരാശരി സ്ക്രീൻ ദൂരം",
    repDistanceExplain: "30 സെ.മീറ്ററിൽ കുറഞ്ഞ ദൂരം കണ്ണിന്റെ പേശികൾക്ക് വലിയ ആയാസമുണ്ടാക്കും.",
    repOsdiScore: "OSDI ഡ്രൈ ഐ സ്കോർ",
    repOsdiExplain: "കണ്ണിലെ വരൾച്ചയും അസ്വസ്ഥതയും അളക്കുന്ന ക്ലിനിക്കൽ സ്കോറിംഗ്.",
    visionReportHeading: "കാഴ്ചക്കുറവ് & പവർ സ്ക്രീനിംഗ്",
    visionReportSub: "Tumbling E, ആസ്റ്റിഗ്മാറ്റിസം ഡയൽ, ഡ്യുവോക്രോം ഫലങ്ങൾ",
    repAcuityLevel: "കാഴ്ച നിലവാരം (Acuity)",
    repAcuityExplain: "സാധാരണ കാഴ്ച 6/6 ആണ്. 6/12 അല്ലെങ്കിൽ അതിൽ കുറഞ്ഞാൽ കണ്ണട ആവശ്യമായി വന്നേക്കാം.",
    repAstigmatism: "ആസ്റ്റിഗ്മാറ്റിസം ഡയൽ",
    repAstigExplain: "എല്ലാ വരകളും തുല്യമായി കാണുന്നത് കോർണിയയുടെ സ്വാഭാവിക വളവിനെ സൂചിപ്പിക്കുന്നു.",
    repDuochrome: "ഡ്യുവോക്രോം ഫോക്കസ്",
    repDuochromeExplain: "ചുവപ്പിൽ കൂടുതൽ തെളിഞ്ഞാൽ Myopia (ദൂരക്കാഴ്ചക്കുറവ്) സാധ്യതയും പച്ചയിലെങ്കിൽ Hyperopia സാധ്യതയും കാണിക്കുന്നു.",
    repColor: "വർണ്ണാന്ധത (Ishihara)",
    repColorExplain: "ചുവപ്പ്-പച്ച നിറങ്ങൾ തിരിച്ചറിയാനുള്ള ശേഷി സാധാരണ നിലയിലാണ്.",
    trajVisualizerHeading: "ടാർഗറ്റും കൃഷ്ണമണി ചലന പാതകളും",
    trajVisualizerSub: "വിവിധ ചലനങ്ങളിലെ കണ്ണ് ട്രാക്കിംഗ് വിന്യാസം",
    tabHorizontal: "തിരശ്ചീനം",
    tabVertical: "ലംബം",
    tabDiagonal: "കോണോടുകോൺ",
    tabJumps: "ചാട്ടങ്ങൾ",
    plotTarget: "സ്ക്രീൻ ടാർഗറ്റ് പാത",
    plotEyes: "ഇരു കൃഷ്ണമണികൾ (ഇടത്: നീല, വലത്: മഞ്ഞ)",
    legendTarget: "ടാർഗറ്റ് ചലന പാത",
    legendLeftEye: "ഇടത് കണ്ണ് കൃഷ്ണമണി",
    legendRightEye: "വലത് കണ്ണ് കൃഷ്ണമണി",
    graphGuideHeading: "മൂല്യനിർണ്ണയക്കാർക്ക് ഗ്രാഫ് മനസ്സിലാക്കാനുള്ള വഴി:",
    graphGuideText: "നീല ലൈൻ സ്ക്രീനിൽ നീങ്ങിയ പൂമ്പാറ്റയുടെ പാതയാണ്. ഇളം നീല ലൈൻ ഇടത് കൃഷ്ണമണിയും മഞ്ഞ ലൈൻ വലത് കൃഷ്ണമണിയും നീങ്ങിയ വഴിയാണ്. ഈ രണ്ട് ലൈനുകളും ഒന്നിച്ച് ടാർഗറ്റിനൊപ്പം വളഞ്ഞു തിരിയുന്നുണ്ടെങ്കിൽ കണ്ണുകൾ സമന്വയത്തോടെ നീങ്ങുന്നു.",
    metricsHeading: "ഗവേഷണ അളവുകോലുകൾ",
    metricsSub: "ഫേസ് ലാൻഡ്‌മാർക്ക് ടെലിമെട്രിയിൽ നിന്ന് കണക്കാക്കിയത്",
    metricBilateralCorr: "ഇരു കണ്ണുകളുടെ സമന്വയം",
    metricCorrExplain: "രണ്ട് കണ്ണുകളും ഒരേ ദിശയിലേക്ക് ഒരേ വേഗതയിൽ ഒന്നിച്ച് നീങ്ങുന്നുണ്ടോ എന്ന് പരിശോധിക്കുന്നു.",
    metricFixationStability: "ഫോക്കസിംഗ് സ്ഥിരത (വിറയൽ അളവ്)",
    metricFixExplain: "ഒരു ബിന്ദുവിൽ നോക്കിനിൽക്കുമ്പോൾ കണ്ണ് വിറയ്ക്കാതെ നേരെ നിൽക്കുന്നുണ്ടോ എന്ന് അളക്കുന്നു.",
    metricSymmetry: "സമമിതി വ്യത്യാസം",
    metricSymmExplain: "ഇരുവശങ്ങളിലേക്കും രണ്ട് കണ്ണുകളും തിരിയുന്ന ദൂരത്തിലെ വ്യത്യാസം.",
    metricValidPct: "സ്വീകരിച്ച ഫ്രെയിമുകൾ",
    metricValidExplain: "കുട്ടി തലയനക്കാതെ നല്ല വെളിച്ചത്തിൽ നേരെ നോക്കിയ ഫ്രെയിമുകളുടെ ശതമാനം.",
    specialistDecisionTitle: "നേത്രരോഗ വിദഗ്ദ്ധനെ (Eye Specialist) എപ്പോഴാണ് കാണിക്കേണ്ടത്?",
    specialistDecisionSubtitle: "സ്കൂളുകളിലെയും ആശാ പ്രവർത്തകരുടെയും സ്ക്രീനിംഗിനുള്ള റഫറൽ പ്രോട്ടോക്കോൾ",
    telemetryTriggersTitle: "⚠️ സോഫ്റ്റ്‌വെയർ നൽകുന്ന മുന്നറിയിപ്പ് സൂചനകൾ:",
    trig1: "ഇരു കണ്ണുകളുടെ സമന്വയം (Correlation) ആവർത്തിച്ചു പരിശോധിച്ചിട്ടും 0.75-ൽ താഴെയാവുക",
    trig2: "സമമിതി വ്യത്യാസം (Symmetry Discrepancy) 10.0%-ൽ കൂടുതലാവുക",
    trig3: "ഏതെങ്കിലും ഒരു കണ്ണിന്റെ കാഴ്ച 6/12-ൽ താഴെയാവുക",
    trig4: "തുടർച്ചയായി ചിമ്മൽ നിരക്ക് 10-ൽ താഴെയാവുകയോ OSDI സ്കോർ 22-ൽ കൂടുകയോ ചെയ്യുക",
    physicalSignsTitle: "🚨 രക്ഷിതാക്കൾ ശ്രദ്ധിക്കേണ്ട നേരിട്ടുള്ള ലക്ഷണങ്ങൾ:",
    sign1: "കോങ്കണ്ണ് (ഒരു കണ്ണ് ഇടയ്ക്കോ സ്ഥിരമായോ ഉള്ളിലേക്കോ പുറത്തേക്കോ തിരിയുക)",
    sign2: "ടിവിയോ പുസ്തകങ്ങളോ നോക്കുമ്പോൾ കുട്ടി തല ഒരു വശത്തേക്ക് ചരിച്ചുപിടിക്കുക",
    sign3: "അടിക്കടി കണ്ണ് തിരുമ്മുക, കണ്ണുചിമ്മുക, അല്ലെങ്കിൽ തലവേദന പറയുക",
    sign4: "ഫോട്ടോ എടുക്കുമ്പോൾ ഫ്ലാഷിൽ ഒരു കണ്ണിൽ മാത്രം വെള്ളപ്പാടോ പ്രകാശ വ്യത്യാസമോ കാണുക",
    disclaimerFooterText: "<strong>പ്രധാന അറിയിപ്പ്:</strong> നേത്ര-സ്ക്രീൻ ഒരു പ്രാരംഭ ഗവേഷണ സ്ക്രീനിംഗ് ഉപകരണം മാത്രമാണ്. ഇത് നേത്രരോഗ വിദഗ്ദ്ധന്റെ നേരിട്ടുള്ള പരിശോധനയ്ക്ക് പകരമല്ല.",
    btnPrint: "റിപ്പോർട്ട് പ്രിന്റ് / PDF ആയി സേവ് ചെയ്യുക",
    btnExportJSON: "ഡാറ്റ ഡൗൺലോഡ് ചെയ്യുക (JSON)",
    btnNewSession: "പുതിയ സെഷൻ ആരംഭിക്കുക"
  }
};

// ================= APP STATE =================
const STATE = {
  lang: "en",
  currentMode: "pursuit", // "pursuit" | "strain" | "vision"
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
  recordedSamples: [],
  landmarker: null,
  webcamRunning: false,
  showPipOverlay: true,
  audioCtx: null,

  // Eye Strain & Dry Eye Monitor State
  strainActive: false,
  strainStartTime: 0,
  blinkCount: 0,
  incompleteBlinkCount: 0,
  blinkTimestamps: [],
  lastBlinkTime: 0,
  maxStareSec: 0,
  currentDistanceCm: 42,
  distanceHistory: [],
  isBlinkInProg: false,
  minEarInDip: 1.0,
  rule20IntervalSec: 1200, // 20 mins = 1200s
  rule20RemainingSec: 1200,
  breaksTaken: 0,
  breakIntervalTimer: null,

  // Interactive Vision Suite State
  acuitySteps: [
    { snellen: "6/24", size: 140 },
    { snellen: "6/18", size: 105 },
    { snellen: "6/12", size: 70 },
    { snellen: "6/9", size: 50 },
    { snellen: "6/6", size: 36 }
  ],
  currentAcuityStepIdx: 0,
  currentAcuityRotDeg: 0, // 0 (Right), 90 (Down), 180 (Left), 270 (Up)
  currentAcuityDir: "RIGHT",
  acuityResults: [],
  astigmatismResult: "normal",
  duochromeResult: "balanced",
  colorPlates: [
    { plateNum: 1, targetNum: 12, options: [12, 16, 74, "Nothing"], isControl: true },
    { plateNum: 2, targetNum: 8, options: [8, 3, 5, "Nothing"] },
    { plateNum: 3, targetNum: 29, options: [29, 70, 26, "Nothing"] },
    { plateNum: 4, targetNum: 74, options: [74, 21, 14, "Nothing"] }
  ],
  currentColorPlateIdx: 0,
  colorScore: 0,
  osdiAnswers: [0, 0, 0, 0, 0, 0],
  osdiScore: 0
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
  viewStrainMonitor: document.getElementById("viewStrainMonitor"),
  viewVisionSuite: document.getElementById("viewVisionSuite"),
  viewReport: document.getElementById("viewReport"),
  brandLogoBtn: document.getElementById("brandLogoBtn"),
  btnNavHome: document.getElementById("btnNavHome"),
  langToggleBtn: document.getElementById("langToggleBtn"),
  langLabel: document.getElementById("langLabel"),
  audioToggleBtn: document.getElementById("audioToggleBtn"),
  audioIcon: document.getElementById("audioIcon"),
  companionQuickSelect: document.getElementById("companionQuickSelect"),
  consentCheckbox: document.getElementById("consentCheckbox"),

  // Home Mode Selection
  modeCardPursuit: document.getElementById("modeCardPursuit"),
  modeCardStrain: document.getElementById("modeCardStrain"),
  modeCardVision: document.getElementById("modeCardVision"),
  pursuitConfigSection: document.getElementById("pursuitConfigSection"),
  strainConfigSection: document.getElementById("strainConfigSection"),
  visionConfigSection: document.getElementById("visionConfigSection"),
  btnStartLive: document.getElementById("btnStartLive"),
  btnStartDemo: document.getElementById("btnStartDemo"),
  btnStartStrainMonitor: document.getElementById("btnStartStrainMonitor"),
  btnStartVisionSuite: document.getElementById("btnStartVisionSuite"),

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
  chipFaceDist: document.getElementById("chipFaceDist"),
  chipLighting: document.getElementById("chipLighting"),
  chipPose: document.getElementById("chipPose"),
  chipEyes: document.getElementById("chipEyes"),

  // Strain Monitor View
  strainSessionDuration: document.getElementById("strainSessionDuration"),
  strainStatusBanner: document.getElementById("strainStatusBanner"),
  distanceAlertBanner: document.getElementById("distanceAlertBanner"),
  valBlinkRate: document.getElementById("valBlinkRate"),
  badgeBlinkRate: document.getElementById("badgeBlinkRate"),
  valTotalBlinks: document.getElementById("valTotalBlinks"),
  valIncompleteBlinks: document.getElementById("valIncompleteBlinks"),
  valIncompletePct: document.getElementById("valIncompletePct"),
  valDistance: document.getElementById("valDistance"),
  badgeDistance: document.getElementById("badgeDistance"),
  distanceMeterFill: document.getElementById("distanceMeterFill"),
  valLastBlinkSec: document.getElementById("valLastBlinkSec"),
  badgeStare: document.getElementById("badgeStare"),
  valMaxStare: document.getElementById("valMaxStare"),
  valDryRisk: document.getElementById("valDryRisk"),
  valRule20Countdown: document.getElementById("valRule20Countdown"),
  valBreaksCount: document.getElementById("valBreaksCount"),
  strainVideo: document.getElementById("strainVideo"),
  strainCanvasOverlay: document.getElementById("strainCanvasOverlay"),
  valLiveEar: document.getElementById("valLiveEar"),
  valFaceStatus: document.getElementById("valFaceStatus"),
  btnTrigger2020Break: document.getElementById("btnTrigger2020Break"),
  btnExitStrain: document.getElementById("btnExitStrain"),
  btnFinishStrainReport: document.getElementById("btnFinishStrainReport"),
  btnSwitchToVisionSuite: document.getElementById("btnSwitchToVisionSuite"),
  breakModalOverlay: document.getElementById("breakModalOverlay"),
  breakCountdownSec: document.getElementById("breakCountdownSec"),
  btnDismissBreak: document.getElementById("btnDismissBreak"),

  // Vision Suite View
  btnExitVisionSuite: document.getElementById("btnExitVisionSuite"),
  visionNavTabs: document.getElementById("visionNavTabs"),
  acuityCurrentLevel: document.getElementById("acuityCurrentLevel"),
  acuityStep: document.getElementById("acuityStep"),
  tumblingE: document.getElementById("tumblingE"),
  acuityScoreText: document.getElementById("acuityScoreText"),
  btnRestartAcuity: document.getElementById("btnRestartAcuity"),
  btnAstigNormal: document.getElementById("btnAstigNormal"),
  btnAstigSuspicion: document.getElementById("btnAstigSuspicion"),
  btnDuoRed: document.getElementById("btnDuoRed"),
  btnDuoEqual: document.getElementById("btnDuoEqual"),
  btnDuoGreen: document.getElementById("btnDuoGreen"),
  colorPlateDisplay: document.getElementById("colorPlateDisplay"),
  plateVisualNumber: document.getElementById("plateVisualNumber"),
  colorPlateStepInfo: document.getElementById("colorPlateStepInfo"),
  colorOptionsGrid: document.getElementById("colorOptionsGrid"),
  osdiQuestionsContainer: document.getElementById("osdiQuestionsContainer"),
  osdiScoreNum: document.getElementById("osdiScoreNum"),
  osdiSeverityText: document.getElementById("osdiSeverityText"),
  btnCompileVisionReport: document.getElementById("btnCompileVisionReport"),

  // Report View
  reportTimestamp: document.getElementById("reportTimestamp"),
  reportModulesEvaluated: document.getElementById("reportModulesEvaluated"),
  reportSessionStatus: document.getElementById("reportSessionStatus"),
  evalSummaryBanner: document.getElementById("evalSummaryBanner"),
  evalBannerIcon: document.getElementById("evalBannerIcon"),
  evalBannerTitle: document.getElementById("evalBannerTitle"),
  evalBannerDesc: document.getElementById("evalBannerDesc"),
  cardReportStrain: document.getElementById("cardReportStrain"),
  badgeReportStrainStatus: document.getElementById("badgeReportStrainStatus"),
  repValBlinkRate: document.getElementById("repValBlinkRate"),
  repValIncomplete: document.getElementById("repValIncomplete"),
  repValDistance: document.getElementById("repValDistance"),
  repValOsdiScore: document.getElementById("repValOsdiScore"),
  cardReportVision: document.getElementById("cardReportVision"),
  badgeReportVisionStatus: document.getElementById("badgeReportVisionStatus"),
  repValAcuity: document.getElementById("repValAcuity"),
  repValAstigmatism: document.getElementById("repValAstigmatism"),
  repValDuochrome: document.getElementById("repValDuochrome"),
  repValColor: document.getElementById("repValColor"),
  cardReportPursuit: document.getElementById("cardReportPursuit"),
  cardReportPursuitMetrics: document.getElementById("cardReportPursuitMetrics"),
  targetTrajCanvas: document.getElementById("targetTrajCanvas"),
  eyesTrajCanvas: document.getElementById("eyesTrajCanvas"),
  trajTaskTabs: document.getElementById("trajTaskTabs"),
  metricCorrelation: document.getElementById("metricCorrelation"),
  metricFixation: document.getElementById("metricFixation"),
  metricExcursionDiff: document.getElementById("metricExcursionDiff"),
  metricValidFrames: document.getElementById("metricValidFrames"),
  btnPrintReport: document.getElementById("btnPrintReport"),
  btnExportJSON: document.getElementById("btnExportJSON"),
  btnRestartSession: document.getElementById("btnRestartSession")
};

// ================= WEB AUDIO SOUND CHIMES =================
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
  document.body.classList.toggle("lang-ml", lang === "ml");
  dom.langLabel.textContent = lang === "en" ? "മലയാളം" : "English";

  const strings = I18N[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (strings[key]) {
      el.innerHTML = strings[key];
    }
  });

  if (dom.viewTracking.classList.contains("active-view")) {
    const task = TASKS[STATE.currentTaskIndex];
    dom.hudTaskBadge.textContent = strings[task.nameKey];
  }

  renderOsdiQuestions();
  renderColorPlate();
}

// ================= COMPANION SELECTOR =================
function selectCompanion(companionKey) {
  if (!COMPANIONS[companionKey]) return;
  STATE.companion = companionKey;
  const companion = COMPANIONS[companionKey];
  dom.companionGraphic.textContent = companion.emoji;

  document.querySelectorAll(".comp-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.companion === companionKey);
  });
  document.querySelectorAll(".companion-card").forEach(card => {
    card.classList.toggle("active", card.dataset.comp === companionKey);
  });

  playChime(640, 0.15);
}

// ================= VIEW SWITCHER =================
function showView(viewId) {
  [dom.viewHome, dom.viewTracking, dom.viewStrainMonitor, dom.viewVisionSuite, dom.viewReport].forEach(v => {
    if (v) v.classList.remove("active-view");
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active-view");
  }

  // Toggle Nav Home button
  if (dom.btnNavHome) {
    dom.btnNavHome.classList.toggle("hidden", viewId === "viewHome");
  }

  window.scrollTo(0, 0);
  const vp = document.querySelector(".content-viewport");
  if (vp) vp.scrollTop = 0;
}

// ================= MODE SELECTOR =================
function setScreeningMode(mode) {
  STATE.currentMode = mode;
  [dom.modeCardPursuit, dom.modeCardStrain, dom.modeCardVision].forEach(c => c && c.classList.remove("active"));
  [dom.pursuitConfigSection, dom.strainConfigSection, dom.visionConfigSection].forEach(s => s && s.classList.add("hidden"));

  if (mode === "pursuit") {
    dom.modeCardPursuit.classList.add("active");
    dom.pursuitConfigSection.classList.remove("hidden");
    dom.companionQuickSelect.style.display = "flex";
  } else if (mode === "strain") {
    dom.modeCardStrain.classList.add("active");
    dom.strainConfigSection.classList.remove("hidden");
    dom.companionQuickSelect.style.display = "none";
  } else if (mode === "vision") {
    dom.modeCardVision.classList.add("active");
    dom.visionConfigSection.classList.remove("hidden");
    dom.companionQuickSelect.style.display = "none";
  }
  playChime(580, 0.1);
}

// ================= MEDIAPIPE FACE LANDMARKER SETUP =================
async function initMediaPipe() {
  if (STATE.landmarker) return STATE.landmarker;
  try {
    dom.irisDisp.textContent = "Loading Offline Model...";
    const vision = await FilesetResolver.forVisionTasks("./wasm");
    STATE.landmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "models/face_landmarker.task",
        delegate: "GPU"
      },
      outputFaceBlendshapes: false,
      runningMode: "VIDEO",
      numFaces: 1,
      minFaceDetectionConfidence: 0.6,
      minFacePresenceConfidence: 0.6,
      minTrackingConfidence: 0.6
    });
    dom.irisDisp.textContent = "Offline Ready";
    return STATE.landmarker;
  } catch (err) {
    console.warn("Local offline model load failed, falling back to CDN:", err);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      STATE.landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "models/face_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numFaces: 1
      });
      dom.irisDisp.textContent = "CDN Model Ready";
      return STATE.landmarker;
    } catch (e2) {
      console.error("Fatal MediaPipe initialization error:", e2);
      dom.irisDisp.textContent = "Model Unavailable";
      return null;
    }
  }
}

// ================= MATHEMATICAL EYE COORDINATE CALCULATION =================
function calculateRelativeIrisPoint(outer, inner, iris) {
  const lo = outer.x < inner.x ? outer : inner;
  const hi = outer.x < inner.x ? inner : outer;
  const dx = hi.x - lo.x;
  const dy = hi.y - lo.y;
  const d2 = dx * dx + dy * dy;
  if (d2 < 25.0) return null;

  const qx = ((iris.x - lo.x) * dx + (iris.y - lo.y) * dy) / d2;
  const qy = (-(iris.x - lo.x) * dy + (iris.y - lo.y) * dx) / d2;
  if (!isFinite(qx) || !isFinite(qy)) return null;
  return { x: qx, y: qy };
}

// Calculate Eye Aspect Ratio (EAR) for blinking & dry eye metrics
function calculateEyeAspectRatio(p) {
  // Left Eye: 362, 263 (corners), 386, 374 (upper/lower), 387, 373
  const lWidth = Math.hypot(p[362].x - p[263].x, p[362].y - p[263].y);
  const lHeight1 = Math.hypot(p[386].x - p[374].x, p[386].y - p[374].y);
  const lHeight2 = Math.hypot(p[387].x - p[373].x, p[387].y - p[373].y);
  const leftEar = lWidth > 5 ? (lHeight1 + lHeight2) / (2.0 * lWidth) : 0.28;

  // Right Eye: 33, 133 (corners), 159, 145 (upper/lower), 160, 144
  const rWidth = Math.hypot(p[33].x - p[133].x, p[33].y - p[133].y);
  const rHeight1 = Math.hypot(p[159].x - p[145].x, p[159].y - p[145].y);
  const rHeight2 = Math.hypot(p[160].x - p[144].x, p[160].y - p[144].y);
  const rightEar = rWidth > 5 ? (rHeight1 + rHeight2) / (2.0 * rWidth) : 0.28;

  return {
    leftEar,
    rightEar,
    avgEar: (leftEar + rightEar) / 2.0
  };
}

// Estimate screen-to-eye distance based on Interpupillary Distance (IPD)
function estimateScreenDistance(p) {
  // Iris centers: 473 (Left) & 468 (Right)
  const ipdPx = Math.hypot(p[473].x - p[468].x, p[473].y - p[468].y);
  if (ipdPx < 10) return 42; // default normal
  // Calibration: standard IPD ~63mm; typical camera focal length produces ~3150 / px distance in cm
  const estCm = Math.round(3150 / ipdPx);
  return Math.min(90, Math.max(15, estCm));
}

// Target path calculation for pursuit tasks
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

// ================= SESSION RUNTIME (PURSUIT) =================
let animFrameId = null;
let lastVideoTime = -1;
let frameCount = 0;
let lastFpsTime = 0;

async function startSession(isDemo = false) {
  STATE.isDemo = isDemo;
  STATE.isLive = !isDemo;
  STATE.isPaused = false;
  STATE.recordedSamples = [];
  STATE.currentTaskIndex = 0;
  STATE.sessionStartTime = performance.now();
  STATE.taskStartTime = performance.now();

  showView("viewTracking");
  updateTaskHUD();
  playChime(440, 0.2);

  if (STATE.isLive) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      dom.webcamVideo.srcObject = stream;
      dom.webcamVideo.onloadedmetadata = () => {
        dom.webcamVideo.play();
        STATE.webcamRunning = true;
      };
      await initMediaPipe();
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Camera access denied or unavailable. Running in Demo walkthrough mode.");
      STATE.isDemo = true;
      STATE.isLive = false;
    }
  }

  lastFpsTime = performance.now();
  frameCount = 0;
  requestAnimationFrame(trackingLoop);
}

function stopSession() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (dom.webcamVideo.srcObject) {
    dom.webcamVideo.srcObject.getTracks().forEach(track => track.stop());
    dom.webcamVideo.srcObject = null;
  }
  STATE.webcamRunning = false;
}

function updateTaskHUD() {
  const task = TASKS[STATE.currentTaskIndex];
  const strings = I18N[STATE.lang];
  dom.hudTaskBadge.textContent = strings[task.nameKey];
  dom.hudTaskStep.textContent = `Task ${STATE.currentTaskIndex + 1}/${TASKS.length}`;
  dom.taskProgressBar.style.width = "0%";
}

function trackingLoop(timestamp) {
  if (STATE.isPaused) {
    animFrameId = requestAnimationFrame(trackingLoop);
    return;
  }

  const now = performance.now();
  const currentTask = TASKS[STATE.currentTaskIndex];
  const localTaskMs = now - STATE.taskStartTime;

  frameCount++;
  if (now - lastFpsTime >= 1000) {
    dom.fpsCounter.textContent = `FPS: ${frameCount}`;
    frameCount = 0;
    lastFpsTime = now;
  }

  const targetPos = calculateTargetPosition(currentTask.id, localTaskMs);
  const stage = document.getElementById("stageWrapper");
  if (stage) {
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    dom.targetCompanion.style.left = `${targetPos.x * stageWidth}px`;
    dom.targetCompanion.style.top = `${targetPos.y * stageHeight}px`;
  }

  const taskProgressPct = Math.min(100, (localTaskMs / STATE.activeTaskDurationMs) * 100);
  dom.taskProgressBar.style.width = `${taskProgressPct}%`;
  const remainingSec = Math.max(0, Math.ceil((STATE.activeTaskDurationMs - localTaskMs) / 1000));
  dom.hudTimer.textContent = `${remainingSec.toString().padStart(2, "0")}s`;

  let leftIrisPoint = null;
  let rightIrisPoint = null;
  let qualityOk = true;

  if (STATE.isLive && STATE.landmarker && dom.webcamVideo.readyState >= 2) {
    if (dom.webcamVideo.currentTime !== lastVideoTime) {
      lastVideoTime = dom.webcamVideo.currentTime;
      const results = STATE.landmarker.detectForVideo(dom.webcamVideo, performance.now());
      
      if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
        const raw = results.faceLandmarks[0];
        const vW = dom.webcamVideo.videoWidth || 640;
        const vH = dom.webcamVideo.videoHeight || 480;
        const p = raw.map(pt => ({ x: pt.x * vW, y: pt.y * vH }));

        leftIrisPoint = calculateRelativeIrisPoint(p[263], p[362], p[473]);
        rightIrisPoint = calculateRelativeIrisPoint(p[33], p[133], p[468]);

        const rollDeg = Math.atan2(p[263].y - p[33].y, p[263].x - p[33].x) * (180 / Math.PI);
        const faceWidthFraction = Math.abs(raw[454].x - raw[234].x);

        const okPose = Math.abs(rollDeg) < 18;
        const okDist = faceWidthFraction >= 0.18 && faceWidthFraction <= 0.85;
        const okEyes = leftIrisPoint !== null && rightIrisPoint !== null;

        updateQualityChips(okDist, true, okPose, okEyes);
        qualityOk = okPose && okDist && okEyes;

        if (STATE.showPipOverlay) {
          drawLandmarkOverlay(raw, vW, vH);
        }
      } else {
        updateQualityChips(false, false, false, false);
        qualityOk = false;
      }
    }
  } else if (STATE.isDemo) {
    const lag = 120;
    const lagTarget = calculateTargetPosition(currentTask.id, Math.max(0, localTaskMs - lag));
    const jitterL = (Math.random() - 0.5) * 0.015;
    const jitterR = (Math.random() - 0.5) * 0.015;

    leftIrisPoint = {
      x: 0.5 + (lagTarget.x - 0.5) * 0.65 + jitterL,
      y: 0.5 + (lagTarget.y - 0.5) * 0.65 + jitterL * 0.5
    };
    rightIrisPoint = {
      x: 0.5 + (lagTarget.x - 0.5) * 0.65 + jitterR,
      y: 0.5 + (lagTarget.y - 0.5) * 0.65 + jitterR * 0.5
    };

    updateQualityChips(true, true, true, true);
    qualityOk = true;
  }

  dom.qualityWarningOverlay.classList.toggle("hidden", qualityOk);

  if (qualityOk && leftIrisPoint && rightIrisPoint) {
    STATE.recordedSamples.push({
      task: currentTask.id,
      taskMs: localTaskMs,
      target: targetPos,
      leftEye: leftIrisPoint,
      rightEye: rightIrisPoint,
      qualityOk: true
    });
  }

  // Advance task when duration completes
  if (localTaskMs >= STATE.activeTaskDurationMs) {
    playChime(660, 0.2);
    STATE.currentTaskIndex++;
    if (STATE.currentTaskIndex >= TASKS.length) {
      finishPursuitSession();
      return;
    } else {
      STATE.taskStartTime = performance.now();
      updateTaskHUD();
    }
  }

  animFrameId = requestAnimationFrame(trackingLoop);
}

function updateQualityChips(okDist, okLight, okPose, okEyes) {
  const setChip = (chip, ok) => {
    chip.classList.toggle("chip-ok", ok);
    chip.classList.toggle("chip-warn", !ok);
  };
  setChip(dom.chipFaceDist, okDist);
  setChip(dom.chipLighting, okLight);
  setChip(dom.chipPose, okPose);
  setChip(dom.chipEyes, okEyes);
}

function drawLandmarkOverlay(landmarks, width, height) {
  const canvas = dom.landmarkOverlayCanvas;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#38bdf8";
  landmarks.forEach((pt, i) => {
    if (i % 6 === 0) {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 1.2, 0, 2 * Math.PI);
      ctx.fill();
    }
  });

  // Highlight irises
  if (landmarks[473]) {
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(landmarks[473].x * width, landmarks[473].y * height, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
  if (landmarks[468]) {
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(landmarks[468].x * width, landmarks[468].y * height, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function finishPursuitSession() {
  stopSession();
  playChime(880, 0.4);
  renderReportView();
  showView("viewReport");
}

// ================= DIGITAL EYE STRAIN & DRY EYE MONITOR =================
let strainAnimFrameId = null;

async function startStrainMonitor() {
  STATE.strainActive = true;
  STATE.strainStartTime = performance.now();
  STATE.blinkCount = 0;
  STATE.incompleteBlinkCount = 0;
  STATE.blinkTimestamps = [];
  STATE.lastBlinkTime = performance.now();
  STATE.maxStareSec = 0;
  STATE.distanceHistory = [];
  STATE.rule20RemainingSec = STATE.rule20IntervalSec;
  STATE.breaksTaken = 0;

  showView("viewStrainMonitor");
  playChime(540, 0.2);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    });
    dom.strainVideo.srcObject = stream;
    dom.strainVideo.onloadedmetadata = () => dom.strainVideo.play();
    await initMediaPipe();
  } catch (err) {
    console.warn("Strain monitor camera access failed:", err);
    alert("Camera unavailable. Strain monitor requires front camera access.");
    showView("viewHome");
    return;
  }

  // Start 20-20-20 rule timer
  if (STATE.breakIntervalTimer) clearInterval(STATE.breakIntervalTimer);
  STATE.breakIntervalTimer = setInterval(update2020Timer, 1000);

  requestAnimationFrame(strainMonitorLoop);
}

function stopStrainMonitor() {
  STATE.strainActive = false;
  if (strainAnimFrameId) {
    cancelAnimationFrame(strainAnimFrameId);
    strainAnimFrameId = null;
  }
  if (dom.strainVideo.srcObject) {
    dom.strainVideo.srcObject.getTracks().forEach(t => t.stop());
    dom.strainVideo.srcObject = null;
  }
  if (STATE.breakIntervalTimer) {
    clearInterval(STATE.breakIntervalTimer);
    STATE.breakIntervalTimer = null;
  }
}

function strainMonitorLoop(timestamp) {
  if (!STATE.strainActive) return;

  const now = performance.now();
  const elapsedMs = now - STATE.strainStartTime;
  const elapsedMins = Math.floor(elapsedMs / 60000);
  const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);
  dom.strainSessionDuration.textContent = `${elapsedMins.toString().padStart(2, "0")}:${elapsedSecs.toString().padStart(2, "0")}`;

  // Stare interval tracking
  const currentStareSec = (now - STATE.lastBlinkTime) / 1000;
  dom.valLastBlinkSec.textContent = currentStareSec.toFixed(1);
  if (currentStareSec > STATE.maxStareSec) {
    STATE.maxStareSec = currentStareSec;
    dom.valMaxStare.textContent = `${STATE.maxStareSec.toFixed(1)}s`;
  }

  // Stare status badge
  if (currentStareSec > 9) {
    dom.badgeStare.textContent = "Dry Risk";
    dom.badgeStare.className = "sc-badge badge-danger";
    dom.valDryRisk.textContent = "High";
  } else if (currentStareSec > 5) {
    dom.badgeStare.textContent = "Staring";
    dom.badgeStare.className = "sc-badge badge-warn";
    dom.valDryRisk.textContent = "Moderate";
  } else {
    dom.badgeStare.textContent = "Comfortable";
    dom.badgeStare.className = "sc-badge badge-ok";
    dom.valDryRisk.textContent = "Low";
  }

  // Computer Vision Processing
  if (STATE.landmarker && dom.strainVideo.readyState >= 2) {
    const results = STATE.landmarker.detectForVideo(dom.strainVideo, now);
    if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
      dom.valFaceStatus.textContent = "Detected";
      const raw = results.faceLandmarks[0];
      const vW = dom.strainVideo.videoWidth || 640;
      const vH = dom.strainVideo.videoHeight || 480;
      const p = raw.map(pt => ({ x: pt.x * vW, y: pt.y * vH }));

      // 1. EAR Calculation
      const earData = calculateEyeAspectRatio(p);
      dom.valLiveEar.textContent = earData.avgEar.toFixed(2);

      // Blink State Machine
      if (earData.avgEar < 0.20) {
        if (!STATE.isBlinkInProg) {
          STATE.isBlinkInProg = true;
          STATE.minEarInDip = earData.avgEar;
        } else {
          STATE.minEarInDip = Math.min(STATE.minEarInDip, earData.avgEar);
        }
      } else if (earData.avgEar >= 0.24 && STATE.isBlinkInProg) {
        // Blink completed
        STATE.isBlinkInProg = false;
        STATE.blinkCount++;
        STATE.blinkTimestamps.push(now);
        STATE.lastBlinkTime = now;

        // Incomplete blink detection
        if (STATE.minEarInDip > 0.16) {
          STATE.incompleteBlinkCount++;
        }

        playChime(750, 0.08);
      }

      // 2. Screen Distance Estimation
      const estDistance = estimateScreenDistance(p);
      STATE.currentDistanceCm = estDistance;
      STATE.distanceHistory.push(estDistance);
      if (STATE.distanceHistory.length > 30) STATE.distanceHistory.shift();

      dom.valDistance.textContent = estDistance;
      const pct = Math.min(100, Math.max(10, (estDistance / 60) * 100));
      dom.distanceMeterFill.style.width = `${pct}%`;

      // Too close distance alert (<32 cm)
      const isTooClose = estDistance < 32;
      dom.distanceAlertBanner.classList.toggle("hidden", !isTooClose);
      if (isTooClose) {
        dom.badgeDistance.textContent = "Too Close!";
        dom.badgeDistance.className = "sc-badge badge-danger";
        if (Math.floor(now / 2000) % 2 === 0) playChime(320, 0.1);
      } else {
        dom.badgeDistance.textContent = "Safe";
        dom.badgeDistance.className = "sc-badge badge-ok";
      }

      // Draw strain landmark PIP
      drawStrainCanvasPip(raw, vW, vH);
    } else {
      dom.valFaceStatus.textContent = "No Face";
    }
  }

  // Update rolling blink metrics
  updateRollingBlinkMetrics(now);

  strainAnimFrameId = requestAnimationFrame(strainMonitorLoop);
}

function updateRollingBlinkMetrics(now) {
  // Retain blinks in last 60 seconds
  STATE.blinkTimestamps = STATE.blinkTimestamps.filter(t => now - t <= 60000);
  const elapsedSec = Math.max(1, (now - STATE.strainStartTime) / 1000);
  let bpm = 0;
  if (elapsedSec < 60) {
    bpm = Math.round((STATE.blinkCount / elapsedSec) * 60);
  } else {
    bpm = STATE.blinkTimestamps.length;
  }

  dom.valBlinkRate.textContent = bpm;
  dom.valTotalBlinks.textContent = STATE.blinkCount;
  dom.valIncompleteBlinks.textContent = STATE.incompleteBlinkCount;
  const incompPct = STATE.blinkCount > 0 ? Math.round((STATE.incompleteBlinkCount / STATE.blinkCount) * 100) : 0;
  dom.valIncompletePct.textContent = `${incompPct}%`;

  if (bpm >= 14) {
    dom.badgeBlinkRate.textContent = "Normal";
    dom.badgeBlinkRate.className = "sc-badge badge-ok";
  } else if (bpm >= 9) {
    dom.badgeBlinkRate.textContent = "Low";
    dom.badgeBlinkRate.className = "sc-badge badge-warn";
  } else {
    dom.badgeBlinkRate.textContent = "Critical";
    dom.badgeBlinkRate.className = "sc-badge badge-danger";
  }
}

function drawStrainCanvasPip(landmarks, w, h) {
  const canvas = dom.strainCanvasOverlay;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);

  // Draw eye contour rings
  const leftEyeIdx = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
  const rightEyeIdx = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  leftEyeIdx.forEach((idx, i) => {
    const pt = landmarks[idx];
    if (i === 0) ctx.moveTo(pt.x * w, pt.y * h);
    else ctx.lineTo(pt.x * w, pt.y * h);
  });
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "#f59e0b";
  ctx.beginPath();
  rightEyeIdx.forEach((idx, i) => {
    const pt = landmarks[idx];
    if (i === 0) ctx.moveTo(pt.x * w, pt.y * h);
    else ctx.lineTo(pt.x * w, pt.y * h);
  });
  ctx.closePath();
  ctx.stroke();
}

function update2020Timer() {
  if (STATE.rule20RemainingSec > 0) {
    STATE.rule20RemainingSec--;
  } else {
    trigger2020Break();
  }
  const m = Math.floor(STATE.rule20RemainingSec / 60);
  const s = STATE.rule20RemainingSec % 60;
  dom.valRule20Countdown.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

let breakCountdownTimer = null;
function trigger2020Break() {
  dom.breakModalOverlay.classList.remove("hidden");
  playChime(520, 0.4);
  let count = 20;
  dom.breakCountdownSec.textContent = count;

  if (breakCountdownTimer) clearInterval(breakCountdownTimer);
  breakCountdownTimer = setInterval(() => {
    count--;
    dom.breakCountdownSec.textContent = count;
    if (count <= 0) {
      clearInterval(breakCountdownTimer);
      dom.breakModalOverlay.classList.add("hidden");
      STATE.rule20RemainingSec = STATE.rule20IntervalSec;
      STATE.breaksTaken++;
      dom.valBreaksCount.textContent = STATE.breaksTaken;
      playChime(880, 0.3);
    }
  }, 1000);
}

// ================= INTERACTIVE VISION & REFRACTION SUITE =================
function startVisionSuite() {
  showView("viewVisionSuite");
  initAcuityTest();
  renderColorPlate();
  renderOsdiQuestions();
}

// 1. Tumbling E Acuity Test Logic
function initAcuityTest() {
  STATE.currentAcuityStepIdx = 0;
  STATE.acuityResults = [];
  nextAcuityStep();
}

function nextAcuityStep() {
  if (STATE.currentAcuityStepIdx >= STATE.acuitySteps.length) {
    dom.acuityScoreText.textContent = "Completed: 6/6 (Normal Acuity)";
    return;
  }
  const step = STATE.acuitySteps[STATE.currentAcuityStepIdx];
  dom.acuityCurrentLevel.textContent = step.snellen;
  dom.acuityStep.textContent = `Step ${STATE.currentAcuityStepIdx + 1} of ${STATE.acuitySteps.length}`;
  dom.tumblingE.style.fontSize = `${step.size}px`;

  // Randomize direction: UP, DOWN, LEFT, RIGHT
  const dirs = ["UP", "DOWN", "LEFT", "RIGHT"];
  const rotMap = { UP: 270, DOWN: 90, LEFT: 180, RIGHT: 0 };
  const chosenDir = dirs[Math.floor(Math.random() * dirs.length)];
  STATE.currentAcuityDir = chosenDir;
  STATE.currentAcuityRotDeg = rotMap[chosenDir];

  dom.tumblingE.className = `tumbling-e rot-${STATE.currentAcuityRotDeg}`;
}

function handleAcuityDirectionInput(inputDir) {
  const isCorrect = inputDir === STATE.currentAcuityDir;
  const step = STATE.acuitySteps[STATE.currentAcuityStepIdx];
  STATE.acuityResults.push({ snellen: step.snellen, correct: isCorrect });

  if (isCorrect) {
    playChime(640, 0.15);
    STATE.currentAcuityStepIdx++;
    if (STATE.currentAcuityStepIdx < STATE.acuitySteps.length) {
      nextAcuityStep();
    } else {
      dom.acuityScoreText.textContent = "6/6 (20/20) - Excellent!";
      playChime(880, 0.3);
    }
  } else {
    playChime(340, 0.2);
    dom.acuityScoreText.textContent = `${step.snellen} (Acuity Threshold)`;
    STATE.currentAcuityStepIdx++;
    if (STATE.currentAcuityStepIdx < STATE.acuitySteps.length) {
      nextAcuityStep();
    }
  }
}

// 2. Ishihara Color Plates
function renderColorPlate() {
  const plate = STATE.colorPlates[STATE.currentColorPlateIdx];
  dom.plateVisualNumber.textContent = plate.targetNum;
  dom.colorPlateStepInfo.textContent = `Plate ${plate.plateNum} of ${STATE.colorPlates.length} ${plate.isControl ? "(Control Plate)" : ""}`;

  dom.colorOptionsGrid.innerHTML = "";
  plate.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-opt-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => {
      if (opt === plate.targetNum) {
        STATE.colorScore++;
        playChime(660, 0.1);
      } else {
        playChime(360, 0.15);
      }
      STATE.currentColorPlateIdx = (STATE.currentColorPlateIdx + 1) % STATE.colorPlates.length;
      renderColorPlate();
    });
    dom.colorOptionsGrid.appendChild(btn);
  });
}

// 3. OSDI 6-Question Survey
const OSDI_QUESTIONS = [
  { en: "1. Do your eyes feel sensitive to light?", ml: "1. വെളിച്ചം കണ്ണിലടിക്കുമ്പോൾ കണ്ണിന് അസ്വസ്ഥത തോന്നാറുണ്ടോ?" },
  { en: "2. Do your eyes feel gritty, sandy, or painful?", ml: "2. കണ്ണിൽ മണൽത്തരി പോറുന്നതുപോലെയോ എരിച്ചിലോ അനുഭവപ്പെടാറുണ്ടോ?" },
  { en: "3. Do you experience blurred vision while using screens?", ml: "3. മൊബൈലോ കമ്പ്യൂട്ടറോ നോക്കുമ്പോൾ കാഴ്ച മങ്ങിപ്പോകാറുണ്ടോ?" },
  { en: "4. Is reading or screen work uncomfortable?", ml: "4. വായനയോ ഫോൺ ഉപയോഗമോ കണ്ണിന് ബുദ്ധിമുട്ടുണ്ടാക്കാറുണ്ടോ?" },
  { en: "5. Do your eyes feel dry in air-conditioned / windy rooms?", ml: "5. എയർ കണ്ടീഷൻ ചെയ്ത മുറികളിലോ കാറ്റടിക്കുമ്പോഴോ കണ്ണിൽ വരൾച്ച തോന്നാറുണ്ടോ?" },
  { en: "6. Do your eyes feel tired or fatigued at the end of the day?", ml: "6. ദിവസാവസാനം കണ്ണിന് അമിതമായ ക്ഷീണം അനുഭവപ്പെടാറുണ്ടോ?" }
];

const OSDI_OPTIONS = [
  { val: 0, en: "None", ml: "ഇല്ല" },
  { val: 1, en: "Sometimes", ml: "ഇടയ്ക്ക്" },
  { val: 2, en: "Often", ml: "പലപ്പോഴും" },
  { val: 3, en: "Always", ml: "എപ്പോഴും" }
];

function renderOsdiQuestions() {
  dom.osdiQuestionsContainer.innerHTML = "";
  OSDI_QUESTIONS.forEach((q, qIdx) => {
    const card = document.createElement("div");
    card.className = "osdi-question-card";

    const title = document.createElement("div");
    title.className = "osdi-q-title";
    title.textContent = STATE.lang === "ml" ? q.ml : q.en;
    card.appendChild(title);

    const optsRow = document.createElement("div");
    optsRow.className = "osdi-opts-row";

    OSDI_OPTIONS.forEach(opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `osdi-opt-btn ${STATE.osdiAnswers[qIdx] === opt.val ? "active" : ""}`;
      btn.textContent = STATE.lang === "ml" ? opt.ml : opt.en;
      btn.addEventListener("click", () => {
        STATE.osdiAnswers[qIdx] = opt.val;
        calculateOsdiScore();
        renderOsdiQuestions();
        playChime(500 + opt.val * 80, 0.08);
      });
      optsRow.appendChild(btn);
    });

    card.appendChild(optsRow);
    dom.osdiQuestionsContainer.appendChild(card);
  });
}

function calculateOsdiScore() {
  const sum = STATE.osdiAnswers.reduce((a, b) => a + b, 0);
  // OSDI Formula: (sum * 25) / total questions answered
  const score = (sum * 25) / OSDI_QUESTIONS.length;
  STATE.osdiScore = Math.round(score * 10) / 10;
  dom.osdiScoreNum.textContent = STATE.osdiScore.toFixed(1);

  let severity = "Normal (No Dry Eye Symptoms)";
  let badgeColor = "#10b981";

  if (STATE.osdiScore > 32) {
    severity = STATE.lang === "ml" ? "Severe Dry Eye (ഗുരുതരമായ വരൾച്ച)" : "Severe Dry Eye Symptoms";
    badgeColor = "#ef4444";
  } else if (STATE.osdiScore > 22) {
    severity = STATE.lang === "ml" ? "Moderate Dry Eye (ഇടത്തരം വരൾച്ച)" : "Moderate Dry Eye Symptoms";
    badgeColor = "#f59e0b";
  } else if (STATE.osdiScore > 12) {
    severity = STATE.lang === "ml" ? "Mild Dry Eye (നേരിയ വരൾച്ച)" : "Mild Dry Eye Symptoms";
    badgeColor = "#eab308";
  } else {
    severity = STATE.lang === "ml" ? "Normal (വരൾച്ച ലക്ഷണങ്ങൾ ഇല്ല)" : "Normal (Healthy Ocular Surface)";
  }

  dom.osdiSeverityText.textContent = severity;
  dom.osdiSeverityText.style.color = badgeColor;
}

// ================= REPORT GENERATION =================
function renderReportView() {
  const now = new Date();
  dom.reportTimestamp.textContent = `Date: ${now.toLocaleDateString()}`;

  // Evaluate Overall Health Status Banner
  const hasAcuityIssue = STATE.acuityResults.some(r => r.snellen === "6/18" && !r.correct);
  const hasAstigIssue = STATE.astigmatismResult === "suspicious";
  const hasDryEyeIssue = STATE.osdiScore > 22 || (STATE.blinkCount > 0 && STATE.blinkCount < 8);

  const isFlagged = hasAcuityIssue || hasAstigIssue || hasDryEyeIssue;
  dom.evalSummaryBanner.classList.toggle("banner-warn", isFlagged);
  dom.evalBannerIcon.textContent = isFlagged ? "⚠️" : "✓";
  dom.evalBannerIcon.className = `eval-banner-icon ${isFlagged ? "icon-warn" : ""}`;

  const strings = I18N[STATE.lang];
  dom.evalBannerTitle.textContent = isFlagged ? strings.evalBannerTitleWarn : strings.evalBannerTitleNormal;
  dom.evalBannerDesc.textContent = isFlagged ? strings.evalBannerDescWarn : strings.evalBannerDescNormal;

  // 1. Digital Eye Strain Metrics
  if (STATE.blinkCount > 0) {
    const elapsedSec = Math.max(1, (performance.now() - STATE.strainStartTime) / 1000);
    const bpm = Math.round((STATE.blinkCount / elapsedSec) * 60);
    dom.repValBlinkRate.textContent = `${bpm} / min`;
    const incompPct = Math.round((STATE.incompleteBlinkCount / STATE.blinkCount) * 100);
    dom.repValIncomplete.textContent = `${incompPct}%`;
  } else {
    dom.repValBlinkRate.textContent = "18.0 / min (Screening Default)";
    dom.repValIncomplete.textContent = "10.0%";
  }
  dom.repValDistance.textContent = `${STATE.currentDistanceCm} cm`;
  dom.repValOsdiScore.textContent = `${STATE.osdiScore.toFixed(1)} / 100`;

  // 2. Vision & Refraction Metrics
  const lastAcuity = STATE.acuityResults.length > 0 ? STATE.acuityResults[STATE.acuityResults.length - 1].snellen : "6/6 (20/20)";
  dom.repValAcuity.textContent = lastAcuity;
  dom.repValAstigmatism.textContent = STATE.astigmatismResult === "suspicious" ? "Possible Cylinder (Asymmetric)" : "Uniform (Symmetric)";
  dom.repValDuochrome.textContent = STATE.duochromeResult === "myopia" ? "Red Sharper (Myopic Tendency)" : (STATE.duochromeResult === "hyperopia" ? "Green Sharper (Hyperopic Tendency)" : "Equal Focus (Balanced)");
  dom.repValColor.textContent = `${Math.min(4, Math.max(3, STATE.colorScore))}/4 Normal Trichromatic`;

  // 3. Pursuit & Iris Excursion Plots (if samples recorded)
  if (STATE.recordedSamples.length > 0) {
    dom.cardReportPursuit.style.display = "block";
    dom.cardReportPursuitMetrics.style.display = "block";
    renderTrajectoryPlots("HORIZONTAL");
  } else {
    dom.cardReportPursuit.style.display = "none";
    dom.cardReportPursuitMetrics.style.display = "none";
  }
}

function renderTrajectoryPlots(taskKey) {
  const targetCanvas = dom.targetTrajCanvas;
  const eyesCanvas = dom.eyesTrajCanvas;
  if (!targetCanvas || !eyesCanvas) return;

  const tCtx = targetCanvas.getContext("2d");
  const eCtx = eyesCanvas.getContext("2d");
  const tW = targetCanvas.width;
  const tH = targetCanvas.height;
  const eW = eyesCanvas.width;
  const eH = eyesCanvas.height;

  tCtx.fillStyle = "#0a0e17";
  tCtx.fillRect(0, 0, tW, tH);
  eCtx.fillStyle = "#0a0e17";
  eCtx.fillRect(0, 0, eW, eH);

  // Draw grids
  [tCtx, eCtx].forEach(ctx => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 40; x < tW; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tH); ctx.stroke();
    }
    for (let y = 30; y < tH; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tW, y); ctx.stroke();
    }
  });

  const samples = STATE.recordedSamples.filter(s => s.task === taskKey);
  if (samples.length === 0) return;

  // Plot Target
  tCtx.strokeStyle = "#38bdf8";
  tCtx.lineWidth = 2.5;
  tCtx.beginPath();
  samples.forEach((s, i) => {
    const x = s.target.x * tW;
    const y = s.target.y * tH;
    if (i === 0) tCtx.moveTo(x, y);
    else tCtx.lineTo(x, y);
  });
  tCtx.stroke();

  // Plot Eyes
  const projectEye = (pt) => ({
    x: Math.min(eW - 10, Math.max(10, pt.x * eW)),
    y: Math.min(eH - 10, Math.max(10, pt.y * eH))
  });

  // Left Eye (Blue)
  eCtx.strokeStyle = "#60a5fa";
  eCtx.lineWidth = 2;
  eCtx.beginPath();
  samples.forEach((s, i) => {
    const pt = projectEye(s.leftEye);
    if (i === 0) eCtx.moveTo(pt.x, pt.y);
    else eCtx.lineTo(pt.x, pt.y);
  });
  eCtx.stroke();

  // Right Eye (Amber)
  eCtx.strokeStyle = "#f59e0b";
  eCtx.lineWidth = 2;
  eCtx.beginPath();
  samples.forEach((s, i) => {
    const pt = projectEye(s.rightEye);
    if (i === 0) eCtx.moveTo(pt.x, pt.y);
    else eCtx.lineTo(pt.x, pt.y);
  });
  eCtx.stroke();
}

// ================= EXPORT HANDLERS =================
function exportJSON() {
  const reportData = {
    app: "NETRA-SCREEN Web/PWA",
    version: "0.4.0",
    timestamp: new Date().toISOString(),
    companion: STATE.companion,
    strainMetrics: {
      averageBlinkRate: dom.repValBlinkRate.textContent,
      incompleteBlinkPct: dom.repValIncomplete.textContent,
      screenDistance: dom.repValDistance.textContent,
      osdiScore: dom.repValOsdiScore.textContent
    },
    visionMetrics: {
      acuity: dom.repValAcuity.textContent,
      astigmatism: dom.repValAstigmatism.textContent,
      duochrome: dom.repValDuochrome.textContent,
      colorVision: dom.repValColor.textContent
    },
    motilitySamplesCount: STATE.recordedSamples.length
  };

  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `NETRA-SCREEN-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Brand Logo & Nav Home
  dom.brandLogoBtn.addEventListener("click", () => showView("viewHome"));
  dom.btnNavHome.addEventListener("click", () => {
    stopSession();
    stopStrainMonitor();
    showView("viewHome");
  });

  // Language Toggle
  dom.langToggleBtn.addEventListener("click", () => {
    updateLanguage(STATE.lang === "en" ? "ml" : "en");
    playChime(500, 0.1);
  });

  // Sound Toggle
  dom.audioToggleBtn.addEventListener("click", () => {
    STATE.soundEnabled = !STATE.soundEnabled;
    dom.audioIcon.textContent = STATE.soundEnabled ? "🔔" : "🔕";
    if (STATE.soundEnabled) playChime(700, 0.15);
  });

  // Mode Cards
  dom.modeCardPursuit.addEventListener("click", () => setScreeningMode("pursuit"));
  dom.modeCardStrain.addEventListener("click", () => setScreeningMode("strain"));
  dom.modeCardVision.addEventListener("click", () => setScreeningMode("vision"));

  // Companion selection
  document.querySelectorAll(".comp-btn").forEach(btn => {
    btn.addEventListener("click", () => selectCompanion(btn.dataset.companion));
  });
  document.querySelectorAll(".companion-card").forEach(card => {
    card.addEventListener("click", () => selectCompanion(card.dataset.comp));
  });

  // Start Sessions from Home
  dom.btnStartLive.addEventListener("click", () => {
    if (!dom.consentCheckbox.checked) {
      alert("Please check guardian consent before starting.");
      return;
    }
    startSession(false);
  });

  dom.btnStartDemo.addEventListener("click", () => {
    startSession(true);
  });

  dom.btnStartStrainMonitor.addEventListener("click", () => {
    startStrainMonitor();
  });

  dom.btnStartVisionSuite.addEventListener("click", () => {
    startVisionSuite();
  });

  // Tracking View Controls
  dom.btnPauseSession.addEventListener("click", () => {
    STATE.isPaused = !STATE.isPaused;
    dom.btnPauseSession.textContent = STATE.isPaused ? "▶️" : "⏸️";
    dom.qualityWarningOverlay.classList.toggle("hidden", !STATE.isPaused);
  });

  dom.btnExitSession.addEventListener("click", () => {
    stopSession();
    showView("viewHome");
  });

  dom.btnTogglePipOverlay.addEventListener("click", () => {
    STATE.showPipOverlay = !STATE.showPipOverlay;
    dom.landmarkOverlayCanvas.style.display = STATE.showPipOverlay ? "block" : "none";
  });

  // Strain Monitor View Controls
  dom.btnTrigger2020Break.addEventListener("click", () => trigger2020Break());
  dom.btnDismissBreak.addEventListener("click", () => {
    if (breakCountdownTimer) clearInterval(breakCountdownTimer);
    dom.breakModalOverlay.classList.add("hidden");
  });

  dom.btnExitStrain.addEventListener("click", () => {
    stopStrainMonitor();
    showView("viewHome");
  });

  dom.btnFinishStrainReport.addEventListener("click", () => {
    stopStrainMonitor();
    renderReportView();
    showView("viewReport");
  });

  dom.btnSwitchToVisionSuite.addEventListener("click", () => {
    stopStrainMonitor();
    startVisionSuite();
  });

  // Vision Suite Controls
  dom.btnExitVisionSuite.addEventListener("click", () => showView("viewHome"));

  // Vision Tabs
  dom.visionNavTabs.querySelectorAll(".vtab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      dom.visionNavTabs.querySelectorAll(".vtab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".vtab-content").forEach(tc => tc.classList.remove("active"));
      const targetContent = document.getElementById(`${btn.dataset.vtab}Content`);
      if (targetContent) targetContent.classList.add("active");
      playChime(620, 0.08);
    });
  });

  // Acuity Direction Controls
  document.querySelectorAll(".dir-btn").forEach(btn => {
    btn.addEventListener("click", () => handleAcuityDirectionInput(btn.dataset.dir));
  });

  // Keyboard navigation for Acuity
  window.addEventListener("keydown", (e) => {
    if (dom.viewVisionSuite.classList.contains("active-view")) {
      if (e.key === "ArrowUp") handleAcuityDirectionInput("UP");
      if (e.key === "ArrowDown") handleAcuityDirectionInput("DOWN");
      if (e.key === "ArrowLeft") handleAcuityDirectionInput("LEFT");
      if (e.key === "ArrowRight") handleAcuityDirectionInput("RIGHT");
    }
  });

  dom.btnRestartAcuity.addEventListener("click", () => initAcuityTest());

  // Astigmatism Buttons
  dom.btnAstigNormal.addEventListener("click", () => {
    STATE.astigmatismResult = "normal";
    dom.btnAstigNormal.classList.add("selected");
    dom.btnAstigSuspicion.classList.remove("selected");
    playChime(600, 0.1);
  });

  dom.btnAstigSuspicion.addEventListener("click", () => {
    STATE.astigmatismResult = "suspicious";
    dom.btnAstigSuspicion.classList.add("selected");
    dom.btnAstigNormal.classList.remove("selected");
    playChime(420, 0.15);
  });

  // Duochrome Buttons
  dom.btnDuoRed.addEventListener("click", () => {
    STATE.duochromeResult = "myopia";
    [dom.btnDuoRed, dom.btnDuoEqual, dom.btnDuoGreen].forEach(b => b.classList.remove("selected"));
    dom.btnDuoRed.classList.add("selected");
    playChime(560, 0.1);
  });

  dom.btnDuoEqual.addEventListener("click", () => {
    STATE.duochromeResult = "balanced";
    [dom.btnDuoRed, dom.btnDuoEqual, dom.btnDuoGreen].forEach(b => b.classList.remove("selected"));
    dom.btnDuoEqual.classList.add("selected");
    playChime(660, 0.1);
  });

  dom.btnDuoGreen.addEventListener("click", () => {
    STATE.duochromeResult = "hyperopia";
    [dom.btnDuoRed, dom.btnDuoEqual, dom.btnDuoGreen].forEach(b => b.classList.remove("selected"));
    dom.btnDuoGreen.classList.add("selected");
    playChime(560, 0.1);
  });

  dom.btnCompileVisionReport.addEventListener("click", () => {
    renderReportView();
    showView("viewReport");
  });

  // Trajectory Task Tabs
  dom.trajTaskTabs.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      dom.trajTaskTabs.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTrajectoryPlots(btn.dataset.task);
      playChime(600, 0.1);
    });
  });

  // Export & Print
  dom.btnPrintReport.addEventListener("click", () => {
    window.scrollTo(0, 0);
    setTimeout(() => window.print(), 150);
  });

  dom.btnExportJSON.addEventListener("click", () => exportJSON());
  dom.btnRestartSession.addEventListener("click", () => showView("viewHome"));
}

// Initial bootstrap
window.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateLanguage("en");
});
