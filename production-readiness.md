# Browser release 0.5.1

`index.html` is the NETRA-SCREEN / MindMesh YIP research home. The main four-task research session is primary; `tracking.html` is a compatible direct route. `presentation.html` explains the project in English/Malayalam and links the original project PDF. The only companion module is camera-free eye rest at `eye-tests.html`, which opens directly at “Take a short rest for your eyes.” The previous vision activities and blink monitor are hidden from the product, and their UI code is archived outside the deployment package. The original deck remains a historical presentation: current implementation limitations and evidence on the project overview take precedence over historical slide claims. Research camera consent defaults checked at the user's explicit request; no camera starts before the user chooses Start. Unchecking prevents capture. `about.html` explains scope and privacy.

This release is for personal eye comfort and experimental landmark research. Clinical classification, clinical referral decisions and prescription estimation are disabled. An engineering build is not clinical validation. The native Android app is outside this browser-first upgrade.

## Working product flows

- Guided 20-second distance break, gentle blink routine, one-minute rest and foreground 20-minute break reminder. Timers pause when the page is hidden and require explicit resume. Completion shows a timer event, not verified participation or vision improvement. No camera, measurements, storage or activity-result reports are used by this module.
- Vision charts, direction/color tasks, blink monitoring and their activity summaries are unavailable in this version. Old query/hash links still open the rest page. No hidden activity event handler or camera import remains in its shipped UI script. The shared pure measurement library retains inactive algorithms and regression coverage for source preservation; these do not expose product activities.
- Research tracking: camera/model errors stop with an actionable message. No automatic simulated data. Camera-free walkthroughs move the target without generating eye observations. Capture time freezes for rejected/stale frames and pause/background; pause releases the camera. Metrics use actual observations, preserve unavailable values and make no clinical classification. Missing graphs remain empty.
- Research reports support the existing JSON and print/PDF flow. The rest page has no summary/history controls. Previously saved anonymous activity summaries are preserved, not displayed or automatically deleted; users can remove them through browser site-data settings. Externally exported copies require separate deletion.
- English/Malayalam core instructions. Some technical labels remain English; Malayalam clinical comprehension and native speaker review remain pending.

## Reproduce

Use Node 24 or later in `web/`:

    npm ci
    npm run build
    npm run serve

Open http://localhost:8080. Real phone cameras require an HTTPS address. `serve.py` is a development helper; deploy the packaged static files through HTTPS hosting. `npm run build` runs syntax checks and measurement regressions, then copies an explicit asset allowlist to `web/dist`. It writes file hashes and a build receipt. Firebase serves only `dist/`, never the source/dependency folders. The browser Git checkout is `web/`; the parent directory is not a Git repository.

Browser regressions use `npm run test:browser` after installing dev dependencies and Playwright Chromium (`npx playwright install chromium`). They cover interactions, error paths, fake camera/model fixtures, actual bundled-model initialization with test camera frames, exports, privacy, mobile layout, printing and offline reload. Fake fixtures establish software behavior, not real camera accuracy. See `verification.json` for the latest local receipt when present. The runtime/WASM/model vendor hashes are checked during every build.

## Offline behavior

First online load installs the app/model/WASM package (about 45 MB). The footer reports installation status. Offline access starts only after installation finishes. Keep the page open while the model downloads. The YIP project overview is included offline; the original 32 MB PDF is an online/downloadable attachment. No external fonts or CDN runtime fallback are required. The compatible route update activates the new package so the next navigation shows the YIP research home; it does not reload a running activity or erase saved summaries. Browser storage cleanup can remove offline files. Personal exports are never cached by the service worker.

## Release work that cannot be established on desktop

Before public distribution, rehearse actual Android Chrome and iOS Safari camera permission denial/revocation, background/resume, rotation, optical calibration, glasses/lighting/skin-tone variation, low-memory performance, thermal behavior, offline cold start, print/share and update migration. Review Malayalam with native speakers and eye-care guidance with an eye professional. Establish clinical evidence and applicable release requirements before making medical screening claims. No such clinical evidence is supplied by this update.

Deployment is deliberately separate from local validation. Build and review the package before deploying a selected Firebase site. Do not deploy both configured hosting sites by accident. Use the project owner's existing hosting credentials.

## Guidance sources

- American Academy of Ophthalmology: https://www.aao.org/eye-health/tips-prevention/computer-usage
- American Optometric Association 20/20/20 guidance: https://www.aoa.org/AOA/Images/Patients/Eye%20Conditions/20-20-20-rule.pdf
- AAO eye-exercise limitations: https://www.aao.org/eye-health/tips-prevention/five-vision-myths
- American Macular Degeneration Foundation Amsler instructions: https://www.macular.org/about-macular-degeneration/what-is-macular-degeneration/monitoring-your-macular-degeneration/amsler-chart

These sources inform general instructions; they do not validate this software or its measurements.
