import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CoopRoster } from '../../src/coop/CoopRoster.js';

test('setLocal stores and returns the local player; local getter reads it', () => {
  const r = new CoopRoster();
  const p = { health: 3 };
  assert.equal(r.setLocal(p), p);
  assert.equal(r.local, p);
});

test('local is null on a fresh roster', () => {
  assert.equal(new CoopRoster().local, null);
});

test('aliveCount counts only players with health > 0', () => {
  const r = new CoopRoster();
  r.players = [{ health: 2 }, { health: 0 }, { health: 1 }];
  assert.equal(r.aliveCount(), 2);
});

test('isGameOver is false for an empty roster', () => {
  assert.equal(new CoopRoster().isGameOver(), false);
});

test('isGameOver is false while at least one player is alive', () => {
  const r = new CoopRoster();
  r.players = [{ health: 0 }, { health: 1 }];
  assert.equal(r.isGameOver(), false);
});

test('isGameOver is true only when all players are dead', () => {
  const r = new CoopRoster();
  r.players = [{ health: 0 }, { health: 0 }];
  assert.equal(r.isGameOver(), true);
});

test('solo: one player dead means game over', () => {
  const r = new CoopRoster();
  r.setLocal({ health: 0 });
  assert.equal(r.isGameOver(), true);
});

test('reset empties the players array', () => {
  const r = new CoopRoster();
  r.setLocal({ health: 3 });
  r.reset();
  assert.equal(r.players.length, 0);
  assert.equal(r.local, null);
});
