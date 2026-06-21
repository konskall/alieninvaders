import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MockTransport } from '../../src/coop/MockTransport.js';

test('pair() links two transports', () => {
  const [a, b] = MockTransport.pair();
  assert.equal(a.peer, b);
  assert.equal(b.peer, a);
});

test('send delivers a deep copy to the peer', () => {
  const [a, b] = MockTransport.pair();
  const got = [];
  b.onMessage(m => got.push(m));
  const payload = { t: 'state', seq: 1, nested: { hp: 3 } };
  a.send(payload);
  assert.deepEqual(got, [{ t: 'state', seq: 1, nested: { hp: 3 } }]);
  // mutating the original must not affect what the peer received (deep copy)
  payload.nested.hp = 99;
  assert.equal(got[0].nested.hp, 3);
  // sender records what it sent
  assert.equal(a.sent.length, 1);
});

test('closing one side fires onClose on both', () => {
  const [a, b] = MockTransport.pair();
  let aClosed = false, bClosed = false;
  a.onClose(() => { aClosed = true; });
  b.onClose(() => { bClosed = true; });
  a.close();
  assert.equal(aClosed, true);
  assert.equal(bClosed, true);
});

test('send after peer closed does not deliver', () => {
  const [a, b] = MockTransport.pair();
  const got = [];
  b.onMessage(m => got.push(m));
  b.close();
  a.send({ t: 'ping' });
  assert.equal(got.length, 0);
});
