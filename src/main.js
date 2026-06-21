import { Game } from './game.js';
import { initCreditsSplash } from './credits-splash.js';
import { CoopLobby } from './coop/coopLobby.js';

// Global game reference for Enemy class
let game = null;

// Initialize game when page loads
window.addEventListener('load', () => {
    initCreditsSplash();
    game = new Game();
    game.coopLobby = new CoopLobby(game);
    game.coopLobby.init();
    window.game = game;
});