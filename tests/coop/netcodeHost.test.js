import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NetcodeHost } from '../../src/coop/NetcodeHost.js';
import { MockTransport } from '../../src/coop/MockTransport.js';

function fakeWorld() {
  return {
    snapshot: { ships: [{ id: 'h', x: 1, y: 2, health: 3, alive: true }], enemies: [], bullets: [], homing: [], boss: null, pickups: [], hud: { score: 0 }, events: [] },
    remoteInputs: [],
    getSnapshot() { return this.snapshot; },
    applyRemoteInput(m) { this.remoteInputs.push(m); }
  };
}

test('tick sends a state message with incrementing seq and the world snapshot', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeWorld();
  const host = new NetcodeHost(a, world);
  const got = [];
  b.onMessage(m => got.push(m));

  host.tick();
  host.tick();

  assert.equal(got.length, 2);
  assert.equal(got[0].t, 'state');
  assert.equal(got[0].seq, 0);
  assert.equal(got[1].seq, 1);
  assert.deepEqual(got[0].ships, world.snapshot.ships);
});

test('an inbound input message is routed to world.applyRemoteInput', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeWorld();
  new NetcodeHost(a, world);

  b.send({ t: 'input', x: 9, y: 8, firing: true, alive: true });

  assert.equal(world.remoteInputs.length, 1);
  assert.equal(world.remoteInputs[0].x, 9);
});

test('non-input inbound messages are ignored by the host', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeWorld();
  new NetcodeHost(a, world);

  b.send({ t: 'state', seq: 5, ships: [] });
  b.send({ t: 'ping' });

  assert.equal(world.remoteInputs.length, 0);
});
