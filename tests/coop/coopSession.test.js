import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CoopSession } from '../../src/coop/CoopSession.js';
import { MockTransport } from '../../src/coop/MockTransport.js';

function hostWorld() {
  return {
    snapshot: { ships: [{ id: 'h', x: 1, y: 2 }], enemies: [], bullets: [], homing: [], boss: null, pickups: [], hud: {}, events: [] },
    remoteInputs: [],
    getSnapshot() { return this.snapshot; },
    applyRemoteInput(m) { this.remoteInputs.push(m); }
  };
}
function guestWorld() {
  return {
    applied: [],
    input: { x: 5, y: 6, firing: false, alive: true },
    getLocalInput() { return this.input; },
    applySnapshot(m) { this.applied.push(m); }
  };
}

test('rejects an invalid role', () => {
  const [a] = MockTransport.pair();
  assert.throws(() => new CoopSession(a, 'spectator', {}), /invalid role/);
});

test('host session: isHost true; tick broadcasts a state snapshot to the peer', () => {
  const [a, b] = MockTransport.pair();
  const session = new CoopSession(a, 'host', hostWorld());
  const got = [];
  b.onMessage(m => got.push(m));
  assert.equal(session.isHost, true);
  session.tick();
  assert.equal(got.length, 1);
  assert.equal(got[0].t, 'state');
});

test('guest session: isHost false; tick sends input to the peer', () => {
  const [a, b] = MockTransport.pair();
  const session = new CoopSession(a, 'guest', guestWorld());
  const got = [];
  b.onMessage(m => got.push(m));
  assert.equal(session.isHost, false);
  session.tick();
  assert.equal(got.length, 1);
  assert.equal(got[0].t, 'input');
});

test('end-to-end: paired host/guest sessions exchange snapshot and input', () => {
  const [hostT, guestT] = MockTransport.pair();
  const hw = hostWorld();
  const gw = guestWorld();
  const host = new CoopSession(hostT, 'host', hw);
  const guest = new CoopSession(guestT, 'guest', gw);
  host.tick();
  guest.tick();
  assert.equal(gw.applied.length, 1);
  assert.equal(hw.remoteInputs.length, 1);
  assert.equal(hw.remoteInputs[0].x, 5);
});

test('connect awaits the transport; stop closes it', async () => {
  let connected = false, closed = false;
  const fakeTransport = {
    onMessage() {}, onClose() {},
    async connect() { connected = true; },
    close() { closed = true; },
    send() {}
  };
  const session = new CoopSession(fakeTransport, 'guest', guestWorld());
  await session.connect();
  session.stop();
  assert.equal(connected, true);
  assert.equal(closed, true);
});
