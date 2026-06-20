import { Game } from './game.js';

// Global game reference for Enemy class
let game = null;

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new Game();
    window.game = game;
});