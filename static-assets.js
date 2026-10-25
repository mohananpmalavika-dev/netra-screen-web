// Keep the service-worker precache and deployment package on the same explicit list.
globalThis.NETRA_ASSETS = [
  'index.html','eye-tests.html','tracking.html','about.html','presentation.html','presentation.js','project-copy.mjs','project-theme.css','research.css','styles.css','tracking.css','wellness.css','app.js','eye-tests.js',
  'camera.mjs','child-guide.mjs','vision-core.mjs','offline-status.js','manifest.json','static-assets.js','production-readiness.md',
  'icons/icon-192.png','icons/icon-512.png','libs/tasks-vision.mjs','models/face_landmarker.task',
  'wasm/vision_wasm_internal.js','wasm/vision_wasm_internal.wasm',
  'wasm/vision_wasm_module_internal.js','wasm/vision_wasm_module_internal.wasm',
  'wasm/vision_wasm_nosimd_internal.js','wasm/vision_wasm_nosimd_internal.wasm',
  'vendor-manifest.json','third-party-notices.txt','APACHE-2.0.txt'
];
// The original presentation and slide assets remain available without increasing the offline app download.
globalThis.NETRA_EXTRA_ASSETS = [
  'docs/NETRA_SCREEN_MindMesh.pdf',
  'deck-slides/slide-1.png',
  'deck-slides/slide-2.png',
  'deck-slides/slide-3.png',
  'deck-slides/slide-4.png',
  'deck-slides/slide-5.png',
  'deck-slides/slide-6.png',
  'deck-slides/slide-7.png',
  'deck-slides/slide-8.png',
  'deck-slides/slide-9.png',
  'deck-slides/slide-10.png',
  'deck-slides/slide-11.png',
  'deck-slides/slide-12.png',
  'deck-slides/slide-13.png'
];
