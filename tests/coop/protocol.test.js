import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MSG, buildHello, buildStart, buildInput, buildState, isValidMessage } from '../../src/coop/protocol.js';

test('MSG has the spec message types', () => {
  assert.deepEqual(
    { ...MSG },
    { HELLO:'hello', START:'start', STATE:'state', INPUT:'input', PING:'ping', PONG:'pong', BYE:'bye' }
  );
});

test('buildInput shapes a ship input message', () => {
  const msg = buildInput({ x: 12.5, y: 30, firing: 1, alive: true, extra: 'ignored' });
  assert.deepEqual(msg, { t: 'input', x: 12.5, y: 30, firing: true, alive: true });
});

test('buildState includes seq and all world fields', () => {
  const world = {
    ships: [{ id: 'h', x: 1, y: 2, health: 2, alive: true }],
    enemies: [{ id: 'e1', type: 'scout_drone', x: 5, y: 6, hp: 3 }],
    bullets: [{ id: 'b1', x: 1, y: 1, vx: 0, vy: -5, kind: 'player' }],
    homing: [],
    boss: null,
    pickups: [],
    hud: { score: 100, level: 1, wave: 1, combo: 0, kills: 0 },
    events: [{ e: 'explosion', x: 5, y: 6, size: 1 }]
  };
  const msg = buildState(7, world);
  assert.equal(msg.t, 'state');
  assert.equal(msg.seq, 7);
  assert.equal(msg.boss, null);
  assert.deepEqual(msg.enemies, world.enemies);
  assert.deepEqual(msg.events, world.events);
});

test('buildState defaults boss to null and events to []', () => {
  const msg = buildState(1, { ships: [], enemies: [], bullets: [], homing: [], pickups: [], hud: {} });
  assert.equal(msg.boss, null);
  assert.deepEqual(msg.events, []);
});

test('isValidMessage rejects junk and accepts typed objects', () => {
  assert.equal(isValidMessage(null), false);
  assert.equal(isValidMessage(42), false);
  assert.equal(isValidMessage({}), false);
  assert.equal(isValidMessage({ t: 123 }), false);
  assert.equal(isValidMessage({ t: 'state' }), true);
});
