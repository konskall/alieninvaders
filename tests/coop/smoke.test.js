import { test } from 'node:test';
import assert from 'node:assert/strict';

test('test harness runs ES module tests', () => {
  assert.equal(1 + 1, 2);
});
