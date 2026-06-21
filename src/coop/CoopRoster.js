// Holds the players in a game session and answers the co-op game-over question.
// DOM-free and engine-agnostic: a "player" is any object with a numeric `health`.
export class CoopRoster {
  constructor() {
    this.players = [];
    this.localIndex = 0;
  }

  setLocal(player) {
    this.players[this.localIndex] = player;
    return player;
  }

  get local() {
    return this.players[this.localIndex] || null;
  }

  aliveCount() {
    return this.players.filter(p => p && p.health > 0).length;
  }

  isGameOver() {
    return this.players.length > 0 && this.aliveCount() === 0;
  }

  reset() {
    this.players = [];
  }
}
