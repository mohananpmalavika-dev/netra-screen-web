import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',timeout:45000,expect:{timeout:10000},fullyParallel:false,workers:1,
  reporter:[['list'],['json',{outputFile:'test-results/browser-results.json'}]],
  use:{baseURL:'http://127.0.0.1:8080',trace:'retain-on-failure',screenshot:'only-on-failure',serviceWorkers:'block'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:8080',reuseExistingServer:!process.env.CI,timeout:20000,gracefulShutdown:{signal:'SIGTERM',timeout:5000}}
});
