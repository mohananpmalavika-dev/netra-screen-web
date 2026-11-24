/**
 * NETRA-SCREEN PWA Installation Manager
 * Handles beforeinstallprompt, in-app browser detection (WhatsApp, Instagram, Lens),
 * iOS Safari guidance, desktop/mobile install buttons, and floating banner.
 */

let deferredPrompt = null;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInApp = /FBAN|FBAV|Instagram|WhatsApp|Line|GSA|Snapchat|MicroMessenger/i.test(navigator.userAgent);

// Inject self-contained styles for PWA dialog and bottom bar
function injectPwaStyles() {
  if (document.getElementById('pwaInstallerStyles')) return;
  const style = document.createElement('style');
  style.id = 'pwaInstallerStyles';
  style.textContent = `
    .pwa-dialog {
      background: #140e26;
      color: #f1f5f9;
      border: 1px solid rgba(167, 139, 250, 0.35);
      border-radius: 16px;
      padding: 24px;
      max-width: 480px;
      width: calc(100vw - 32px);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(16px);
      z-index: 100000;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
      box-sizing: border-box;
      font-family: inherit;
    }
    .pwa-dialog::backdrop {
      background: rgba(5, 3, 15, 0.75);
      backdrop-filter: blur(4px);
    }
    .pwa-bottom-bar {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 460px;
      background: rgba(22, 16, 40, 0.94);
      border: 1px solid rgba(167, 139, 250, 0.35);
      border-radius: 14px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
      z-index: 99990;
      box-sizing: border-box;
      animation: pwaSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes pwaSlideUp {
      from { transform: translate(-50%, 40px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    .pwa-bar-info {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .pwa-bar-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    .pwa-bar-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .pwa-bar-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pwa-bar-sub {
      font-size: 11.5px;
      color: #cbd5e1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pwa-bar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn-pwa-install-now {
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 7px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: filter 0.2s, transform 0.15s;
    }
    .btn-pwa-install-now:hover {
      filter: brightness(1.15);
      transform: translateY(-1px);
    }
    .btn-pwa-dismiss {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
    }
    .btn-pwa-dismiss:hover {
      color: #f1f5f9;
      background: rgba(255, 255, 255, 0.1);
    }
    .inapp-banner-strip {
      background: rgba(245, 158, 11, 0.15);
      border-bottom: 1px solid rgba(245, 158, 11, 0.35);
      color: #fef3c7;
      padding: 8px 16px;
      font-size: 12.5px;
      line-height: 1.5;
      text-align: center;
      position: relative;
      z-index: 99995;
    }
    .inapp-banner-strip b {
      color: #fbbf24;
    }
  `;
  document.head.appendChild(style);
}

function getStatusElement() {
  return document.querySelector('[data-join-status]') || document.querySelector('#pwaModalStatus');
}

export function showInstallInstructions(customMessage) {
  injectPwaStyles();
  let modal = document.getElementById('pwaInstallModal');
  if (!modal) {
    modal = document.createElement('dialog');
    modal.id = 'pwaInstallModal';
    modal.className = 'pwa-dialog';
    modal.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <strong style="font-size:17px;color:#f0eafa;display:flex;align-items:center;gap:8px">📲 Install NETRA-SCREEN</strong>
        <button type="button" id="pwaModalClose" style="background:none;border:none;color:#b2a8cb;font-size:22px;cursor:pointer;padding:0 4px">&times;</button>
      </div>
      <div id="pwaModalBody" style="font-size:13.5px;line-height:1.7;color:#d7d1e8"></div>
      <div style="margin-top:20px;text-align:right">
        <button type="button" id="pwaModalAction" style="background:linear-gradient(110deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:8px;padding:9px 18px;font-weight:600;cursor:pointer">Got it</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#pwaModalClose').onclick = () => modal.close();
    modal.querySelector('#pwaModalAction').onclick = () => modal.close();
    modal.onclick = (e) => { if (e.target === modal) modal.close(); };
  }

  const body = modal.querySelector('#pwaModalBody');
  if (customMessage) {
    body.innerHTML = customMessage;
  } else if (isInApp) {
    body.innerHTML = `
      <p style="margin-top:0"><strong>⚠️ Open in full browser required</strong></p>
      <p>You scanned or opened this inside an in-app viewer (WhatsApp, Instagram, or Google Lens). In-app viewers disable the app install banner and offline storage.</p>
      <div style="background:#1f1934;border:1px solid rgba(167,139,250,0.3);border-radius:10px;padding:12px;margin:12px 0">
        <b>To install and use full features:</b><br>
        1. Tap the <b>3 dots menu (⋮ or ⋯)</b> at top/bottom corner.<br>
        2. Tap <b>"Open in Chrome"</b> or <b>"Open in Safari / Default Browser"</b>.<br>
        3. Tap <b>Install App</b> for 100% offline access at the summit stall.
      </div>
      <p lang="ml" style="font-size:12.5px;color:#c0b7db">മുകളിൽ കാണുന്ന 3 കുത്തുകളിൽ (⋮) ടാപ്പ് ചെയ്ത് <b>"Open in Chrome / Safari"</b> നൽകുക.</p>
    `;
  } else if (isIOS) {
    body.innerHTML = `
      <p style="margin-top:0"><strong>How to install on iPhone &amp; iPad:</strong></p>
      <div style="background:#1f1934;border:1px solid rgba(167,139,250,0.3);border-radius:10px;padding:12px;margin:12px 0">
        1. Tap the <b>Share icon</b> (<span style="font-size:16px">📤</span>) at the bottom bar of Safari.<br>
        2. Scroll down and tap <b>"Add to Home Screen"</b> (<span style="font-size:15px">➕</span>).<br>
        3. Tap <b>"Add"</b> in the top right corner.
      </div>
      <p style="font-size:12.5px;color:#b9b0d3">The app will appear on your home screen and run full-screen offline!</p>
      <p lang="ml" style="font-size:12.5px;color:#c0b7db">Safari-യുടെ Share (📤) ബട്ടൺ അമർത്തി "Add to Home Screen" തിരഞ്ഞെടുക്കുക.</p>
    `;
  } else {
    body.innerHTML = `
      <p style="margin-top:0"><strong>Install on Android / Desktop:</strong></p>
      <div style="background:#1f1934;border:1px solid rgba(167,139,250,0.3);border-radius:10px;padding:12px;margin:12px 0">
        1. In Chrome / Edge, tap the <b>3 dots menu (⋮)</b> in the top right.<br>
        2. Tap <b>"Install app"</b> or <b>"Add to Home screen"</b>.<br>
        3. Tap <b>"Install"</b> to confirm.
      </div>
      <p style="font-size:12.5px;color:#b9b0d3">After installing, NETRA-SCREEN launches instantly from your home screen without internet!</p>
    `;
  }

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    alert(body.textContent);
  }
}

export async function promptInstall() {
  const statusEl = getStatusElement();
  if (isStandalone) {
    if (statusEl) statusEl.textContent = '✓ NETRA-SCREEN is already installed and running as an app.';
    showInstallInstructions('<p><strong>✓ App is already installed</strong></p><p>NETRA-SCREEN is running on this device in standalone mode with full offline caching enabled.</p>');
    return;
  }

  if (isInApp) {
    showInstallInstructions();
    if (statusEl) statusEl.textContent = 'Open in Chrome or Safari (via 3 dots menu) to install as an app.';
    return;
  }

  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        if (statusEl) statusEl.textContent = '✓ Shortcut installation requested!';
        dismissBanner();
      } else {
        if (statusEl) statusEl.textContent = 'Installation postponed. You can install anytime from the top button.';
      }
      deferredPrompt = null;
    } catch {
      showInstallInstructions();
    }
  } else if (isIOS) {
    showInstallInstructions();
  } else {
    showInstallInstructions();
  }
}

function dismissBanner() {
  const banner = document.getElementById('pwaFloatingBanner');
  if (banner) {
    banner.style.display = 'none';
    try { sessionStorage.setItem('netra_pwa_banner_dismissed', '1'); } catch {}
  }
}

function initPwaUI() {
  injectPwaStyles();

  // If in an in-app browser, inject helper warning banner at top
  if (isInApp && !document.getElementById('inAppBannerStrip')) {
    const strip = document.createElement('div');
    strip.id = 'inAppBannerStrip';
    strip.className = 'inapp-banner-strip';
    strip.innerHTML = `⚠️ Viewing in WhatsApp/App view. For offline install & camera, tap <b>⋮</b> &rarr; <b>Open in Chrome / Safari</b>.`;
    document.body.prepend(strip);
  }

  // Update all install buttons on page
  const installButtons = document.querySelectorAll('#btnInstallApp, [data-install], .js-pwa-install');
  installButtons.forEach(btn => {
    btn.style.display = 'inline-flex';
    if (isStandalone) {
      btn.innerHTML = '<span class="btn-icon">✓</span> <span class="deck-btn-text">App installed</span>';
      btn.title = 'App installed on device';
    } else {
      btn.onclick = (e) => {
        e.preventDefault();
        promptInstall();
      };
    }
  });

  // Floating banner on mobile / tablet if not standalone and not dismissed
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('netra_pwa_banner_dismissed') === '1'; } catch {}
  if (!isStandalone && !dismissed) {
    if (!document.getElementById('pwaFloatingBanner')) {
      const banner = document.createElement('div');
      banner.id = 'pwaFloatingBanner';
      banner.className = 'pwa-bottom-bar';
      banner.innerHTML = `
        <div class="pwa-bar-info">
          <span class="pwa-bar-icon">📲</span>
          <div class="pwa-bar-text">
            <span class="pwa-bar-title">Install NETRA-SCREEN</span>
            <span class="pwa-bar-sub">Add to home screen for offline stall demo</span>
          </div>
        </div>
        <div class="pwa-bar-actions">
          <button type="button" class="btn-pwa-install-now" id="btnBannerInstall">Install</button>
          <button type="button" class="btn-pwa-dismiss" id="btnBannerDismiss" aria-label="Dismiss">&times;</button>
        </div>
      `;
      document.body.appendChild(banner);
      banner.querySelector('#btnBannerInstall').onclick = promptInstall;
      banner.querySelector('#btnBannerDismiss').onclick = dismissBanner;
    }
  }
}

// Capture beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  initPwaUI();
});

// Capture appinstalled
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  dismissBanner();
  const statusEl = getStatusElement();
  if (statusEl) statusEl.textContent = '✓ NETRA-SCREEN installed successfully!';
});

// Run UI check when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPwaUI);
} else {
  initPwaUI();
}
