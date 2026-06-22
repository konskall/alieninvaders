// Discreet "install app" affordance for the main menu. Purely additive and fully
// capability-gated — if install isn't possible, nothing shows and the game is untouched.
//
//   * Chromium (Android / desktop): capture the `beforeinstallprompt` event, reveal
//     our own button, and fire the native install prompt when it's tapped.
//   * iOS Safari fires no such event, so the same button instead opens a short
//     "Add to Home Screen" instructions popup (iOS has no programmatic install).
//   * Already installed (running standalone) or unsupported -> the button stays hidden.
export function initPwaInstall() {
  const btn = document.getElementById('pwa-install-btn');
  if (!btn) return;
  const popup = document.getElementById('pwa-ios-popup');

  // Running as an already-installed app? Never show the affordance.
  const standalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  if (standalone) return;

  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1); // iPadOS reports as Mac

  const show = () => btn.classList.remove('hidden');
  const hide = () => btn.classList.add('hidden');
  const openPopup = () => { if (popup) popup.classList.remove('hidden'); };
  const closePopup = () => { if (popup) popup.classList.add('hidden'); };

  let deferredPrompt = null;

  // Chromium: the browser is offering install — suppress its mini-infobar and
  // drive the flow from our own button instead.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    show();
  });

  // iOS: no event ever fires, so decide up front.
  if (isIOS) show();

  btn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) { /* dismissed */ }
      deferredPrompt = null;
      hide();                       // installed or dismissed — don't nag
    } else if (isIOS) {
      openPopup();
    }
  });

  // Popup close: the × button, any element marked data-pwa-close, or a backdrop tap.
  if (popup) {
    popup.querySelectorAll('[data-pwa-close]').forEach((el) => el.addEventListener('click', closePopup));
    popup.addEventListener('click', (e) => { if (e.target === popup) closePopup(); });
  }

  // Once actually installed, retire the button for good.
  window.addEventListener('appinstalled', () => { deferredPrompt = null; hide(); });
}
