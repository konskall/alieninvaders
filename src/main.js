import { Game } from './game.js';
import { initCreditsSplash } from './credits-splash.js';

// Global game reference for Enemy class
let game = null;

// Initialize game when page loads
window.addEventListener('load', () => {
    initCreditsSplash();
    game = new Game();
    window.game = game;
});