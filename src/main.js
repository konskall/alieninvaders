import { Game } from './game.js';
import { initCreditsSplash } from './credits-splash.js';
import { CoopLobby } from './coop/coopLobby.js';
import { initPwaInstall } from './pwaInstall.js';

// Global game reference for Enemy class
let game = null;

// Initialize game when page loads
window.addEventListener('load', () => {
    initCreditsSplash();
    game = new Game();
    game.coopLobby = new CoopLobby(game);
    game.coopLobby.init();
    window.game = game;

    // PWA: discreet install affordance + a minimal (no-cache) service worker that
    // only exists to make the app installable. Both are best-effort — wrapped so a
    // failure here can never break the game.
    try { initPwaInstall(); } catch (_) { /* non-fatal */ }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => { /* install affordance just won't show */ });
    }
});