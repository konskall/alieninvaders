import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseTransport } from '../../src/coop/BaseTransport.js';

test('onMessage listeners receive emitted messages', () => {
  const t = new BaseTransport();
  const got = [];
  t.onMessage(m => got.push(m));
  t.onMessage(m => got.push(m));
  t._emitMessage({ t: 'ping' });
  assert.deepEqual(got, [{ t: 'ping' }, { t: 'ping' }]);
});

test('_emitClose fires onClose listeners exactly once', () => {
  const t = new BaseTransport();
  let count = 0;
  t.onClose(() => count++);
  t._emitClose();
  t._emitClose();
  assert.equal(count, 1);
  assert.equal(t._closed, true);
});

test('close() triggers onClose', () => {
  const t = new BaseTransport();
  let closed = false;
  t.onClose(() => { closed = true; });
  t.close();
  assert.equal(closed, true);
});

test('send() throws by default', () => {
  const t = new BaseTransport();
  assert.throws(() => t.send({ t: 'ping' }), /not implemented/);
});
