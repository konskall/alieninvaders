import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NetcodeGuest } from '../../src/coop/NetcodeGuest.js';
import { NetcodeHost } from '../../src/coop/NetcodeHost.js';
import { MockTransport } from '../../src/coop/MockTransport.js';

function fakeGuestWorld() {
  return {
    applied: [],
    input: { x: 5, y: 6, firing: false, alive: true },
    getLocalInput() { return this.input; },
    applySnapshot(m) { this.applied.push(m); }
  };
}

test('tick sends an input message built from the local input', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeGuestWorld();
  const guest = new NetcodeGuest(a, world);
  const got = [];
  b.onMessage(m => got.push(m));

  guest.tick();

  assert.equal(got.length, 1);
  assert.deepEqual(got[0], { t: 'input', x: 5, y: 6, firing: false, alive: true });
});

test('applies a state message with a newer seq', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeGuestWorld();
  new NetcodeGuest(a, world);

  b.send({ t: 'state', seq: 0, ships: [] });
  b.send({ t: 'state', seq: 1, ships: [] });

  assert.equal(world.applied.length, 2);
});

test('drops a stale or equal seq (out-of-order delivery)', () => {
  const [a, b] = MockTransport.pair();
  const world = fakeGuestWorld();
  new NetcodeGuest(a, world);

  b.send({ t: 'state', seq: 5, ships: [] });
  b.send({ t: 'state', seq: 5, ships: [] });  // equal -> dropped
  b.send({ t: 'state', seq: 3, ships: [] });  // older -> dropped
  b.send({ t: 'state', seq: 6, ships: [] });  // newer -> applied

  assert.equal(world.applied.length, 2);
  assert.equal(world.applied[0].seq, 5);
  assert.equal(world.applied[1].seq, 6);
});

test('end-to-end over MockTransport: host snapshot reaches guest, guest input reaches host', () => {
  const [hostT, guestT] = MockTransport.pair();
  const hostWorld = {
    snapshot: { ships: [{ id: 'h', x: 1, y: 2 }], enemies: [], bullets: [], homing: [], boss: null, pickups: [], hud: {}, events: [] },
    remoteInputs: [],
    getSnapshot() { return this.snapshot; },
    applyRemoteInput(m) { this.remoteInputs.push(m); }
  };
  const guestWorld = fakeGuestWorld();
  const host = new NetcodeHost(hostT, hostWorld);
  const guest = new NetcodeGuest(guestT, guestWorld);

  host.tick();   // host -> guest snapshot
  guest.tick();  // guest -> host input

  assert.equal(guestWorld.applied.length, 1);
  assert.deepEqual(guestWorld.applied[0].ships, hostWorld.snapshot.ships);
  assert.equal(hostWorld.remoteInputs.length, 1);
  assert.equal(hostWorld.remoteInputs[0].x, 5);
});
