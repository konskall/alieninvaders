import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerp, interpolateEntities } from '../../src/coop/interpolate.js';

test('lerp interpolates linearly', () => {
  assert.equal(lerp(0, 10, 0), 0);
  assert.equal(lerp(0, 10, 1), 10);
  assert.equal(lerp(0, 10, 0.5), 5);
});

test('interpolateEntities lerps x/y of matching ids at the midpoint', () => {
  const prev = [{ id: 'a', x: 0, y: 0, hp: 3 }];
  const next = [{ id: 'a', x: 10, y: 20, hp: 2 }];
  const out = interpolateEntities(prev, next, 0.5);
  assert.equal(out.length, 1);
  assert.equal(out[0].x, 5);
  assert.equal(out[0].y, 10);
  assert.equal(out[0].hp, 2);  // non-positional fields come from next
});

test('entities new in next (no prev match) are returned unchanged', () => {
  const out = interpolateEntities([], [{ id: 'b', x: 7, y: 8 }], 0.5);
  assert.deepEqual(out, [{ id: 'b', x: 7, y: 8 }]);
});

test('tolerates null prev and null next', () => {
  assert.deepEqual(interpolateEntities(null, [{ id: 'c', x: 1, y: 1 }], 0.5), [{ id: 'c', x: 1, y: 1 }]);
  assert.deepEqual(interpolateEntities([{ id: 'c', x: 1, y: 1 }], null, 0.5), []);
});

test('does not mutate the input entities', () => {
  const prev = [{ id: 'a', x: 0, y: 0 }];
  const next = [{ id: 'a', x: 10, y: 10 }];
  interpolateEntities(prev, next, 0.5);
  assert.equal(next[0].x, 10);
  assert.equal(prev[0].x, 0);
});
