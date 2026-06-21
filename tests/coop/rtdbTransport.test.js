import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RtdbTransport } from '../../src/coop/RtdbTransport.js';

// Minimal fake Firebase db: records ref paths and set/push payloads, lets us
// fire 'value'/'child_added' callbacks manually.
function fakeDb() {
  const calls = { set: [], push: [], on: [], off: [] };
  const handlers = {};
  const db = {
    ref(path) {
      return {
        path,
        set(v) { calls.set.push({ path, v }); return Promise.resolve(); },
        push(v) { calls.push.push({ path, v }); return { key: 'k' }; },
        on(ev, cb) { calls.on.push({ path, ev }); handlers[`${path}|${ev}`] = cb; return cb; },
        off(ev, cb) { calls.off.push({ path, ev }); }
      };
    }
  };
  return { db, calls, handlers };
}

test('host send routes state to /fromHost/live (set) and ctrl to /fromHost/ctrl (push)', () => {
  const { db, calls } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'host');
  t.send({ t: 'state', seq: 1 });
  t.send({ t: 'start', difficulty: 'easy' });
  assert.deepEqual(calls.set[0], { path: 'rooms/K7QM/fromHost/live', v: { t: 'state', seq: 1 } });
  assert.equal(calls.push[0].path, 'rooms/K7QM/fromHost/ctrl');
});

test('guest connect subscribes to /fromHost/live and /fromHost/ctrl; inbound is emitted', async () => {
  const { db, handlers } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  const got = [];
  t.onMessage(m => got.push(m));
  await t.connect();
  // simulate Firebase firing the host's latest 'state' on the live node
  handlers['rooms/K7QM/fromHost/live|value']({ val: () => ({ t: 'state', seq: 9 }) });
  // simulate a queued control message
  handlers['rooms/K7QM/fromHost/ctrl|child_added']({ val: () => ({ t: 'start', difficulty: 'normal' }) });
  assert.equal(got.length, 2);
  assert.equal(got[0].seq, 9);
  assert.equal(got[1].t, 'start');
});

test('guest send routes input to /fromGuest/live (set)', () => {
  const { db, calls } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  t.send({ t: 'input', x: 1, y: 2 });
  assert.deepEqual(calls.set[0], { path: 'rooms/K7QM/fromGuest/live', v: { t: 'input', x: 1, y: 2 } });
});

test('close detaches listeners and fires onClose', async () => {
  const { db, calls } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  let closed = false;
  t.onClose(() => { closed = true; });
  await t.connect();
  t.close();
  assert.ok(calls.off.length >= 2);
  assert.equal(closed, true);
});
