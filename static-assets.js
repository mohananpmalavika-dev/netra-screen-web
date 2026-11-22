// Keep the service-worker precache and deployment package on the same explicit list.
globalThis.NETRA_ASSETS = [
  'investor.html','investor.css','investor.mjs','investor-copy.mjs','investor-evidence.json',
  'join.html','join.mjs','visitor-experience.css','project-knowledge.mjs','presenter.mjs','gaze-control.mjs','images/visitor-qr.svg','images/visitor-qr.png','index.html','eye-tests.html','tracking.html','about.html','presentation.html','presentation.js','project-copy.mjs','project-theme.css','research.css','professional.css','immersive.css','showcase-3d.mjs','images/child-welcome.jpg','companions/butterfly.svg','companions/fish.svg','companions/dot.svg','styles.css','tracking.css','wellness.css','app.js','eye-tests.js',
  'camera.mjs','child-guide.mjs','vision-core.mjs','offline-status.js','manifest.json','static-assets.js','production-readiness.md',
  'icons/icon-192.png','icons/icon-512.png','libs/tasks-vision.mjs','models/face_landmarker.task',
  'wasm/vision_wasm_internal.js','wasm/vision_wasm_internal.wasm',
  'wasm/vision_wasm_module_internal.js','wasm/vision_wasm_module_internal.wasm',
  'wasm/vision_wasm_nosimd_internal.js','wasm/vision_wasm_nosimd_internal.wasm',
  'vendor-manifest.json','third-party-notices.txt','APACHE-2.0.txt'
];
// The original presentation and slide assets remain available without increasing the offline app download.
globalThis.NETRA_EXTRA_ASSETS = [
  'media/NETRA-SCREEN-recorded-walkthrough.webm','media/walkthrough-poster.png','media/walkthrough-captions.vtt',
  'docs/NETRA_SCREEN_MindMesh.pdf','docs/NETRA-SCREEN-investor-brief.pdf','docs/NETRA-SCREEN-investor-deck.pdf',
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
  'deck-slides/slide-13.png',
  'deck-slides/slide-14.png'
];
