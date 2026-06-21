import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RtdbTransport } from '../../src/coop/RtdbTransport.js';

// Fake Firebase RTDB: records set/push/on/off, supports once('value') over
// existing children, and (like real Firebase) replays existing children to a
// new child_added subscriber and fires child_added on each push.
function fakeDb() {
  const calls = { set: [], push: [], on: [], off: [] };
  const handlers = {};      // `${path}|${ev}` -> cb
  const children = {};      // path -> [{ key, v }]
  let seq = 0;
  const childSnap = (key, v) => ({ key, val: () => v });
  const db = {
    ref(path) {
      return {
        path,
        set(v) { calls.set.push({ path, v }); return Promise.resolve(); },
        push(v) {
          const key = 'k' + (seq++);
          (children[path] || (children[path] = [])).push({ key, v });
          calls.push.push({ path, key, v });
          const cb = handlers[`${path}|child_added`];
          if (cb) cb(childSnap(key, v));
          return { key };
        },
        on(ev, cb) {
          calls.on.push({ path, ev });
          handlers[`${path}|${ev}`] = cb;
          if (ev === 'child_added') {
            for (const c of (children[path] || [])) cb(childSnap(c.key, c.v));
          }
          return cb;
        },
        off(ev, cb) { calls.off.push({ path, ev }); delete handlers[`${path}|${ev}`]; },
        once() {
          const list = children[path] || [];
          return Promise.resolve({ forEach: (f) => { for (const c of list) f(childSnap(c.key, c.v)); } });
        }
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

test('guest connect emits inbound state (live value) and new ctrl messages', async () => {
  const { db, handlers } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  const got = [];
  t.onMessage(m => got.push(m));
  await t.connect();
  handlers['rooms/K7QM/fromHost/live|value']({ val: () => ({ t: 'state', seq: 9 }) });
  db.ref('rooms/K7QM/fromHost/ctrl').push({ t: 'start', difficulty: 'normal' });
  assert.equal(got.length, 2);
  assert.equal(got[0].seq, 9);
  assert.equal(got[1].t, 'start');
});

test('guest connect does NOT replay ctrl messages that existed before connect', async () => {
  const { db } = fakeDb();
  db.ref('rooms/K7QM/fromHost/ctrl').push({ t: 'start', difficulty: 'old' });
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  const got = [];
  t.onMessage(m => got.push(m));
  await t.connect();
  db.ref('rooms/K7QM/fromHost/ctrl').push({ t: 'start', difficulty: 'new' });
  assert.equal(got.length, 1);
  assert.equal(got[0].difficulty, 'new');
});

test('guest send routes input to /fromGuest/live (set)', () => {
  const { db, calls } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  t.send({ t: 'input', x: 1, y: 2 });
  assert.deepEqual(calls.set[0], { path: 'rooms/K7QM/fromGuest/live', v: { t: 'input', x: 1, y: 2 } });
});

test('double connect does not create duplicate subscriptions', async () => {
  const { db, calls } = fakeDb();
  const t = new RtdbTransport(db, 'K7QM', 'guest');
  await t.connect();
  await t.connect();
  assert.equal(calls.on.length, 2);
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
