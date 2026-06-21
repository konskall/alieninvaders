import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOM_ALPHABET, generateRoomCode, isValidRoomCode } from '../../src/coop/roomCode.js';

test('ROOM_ALPHABET excludes ambiguous characters', () => {
  for (const ch of '01OIL') assert.ok(!ROOM_ALPHABET.includes(ch), `should not include ${ch}`);
});

test('generateRoomCode returns 4 chars, all from the alphabet', () => {
  const code = generateRoomCode();
  assert.equal(code.length, 4);
  for (const ch of code) assert.ok(ROOM_ALPHABET.includes(ch));
});

test('generateRoomCode is deterministic with an injected rng', () => {
  // rnd always returns 0 -> first alphabet char repeated
  const code = generateRoomCode(4, () => 0);
  assert.equal(code, ROOM_ALPHABET[0].repeat(4));
});

test('generateRoomCode respects a custom length', () => {
  assert.equal(generateRoomCode(6, () => 0).length, 6);
});

test('isValidRoomCode accepts a generated code', () => {
  assert.equal(isValidRoomCode(generateRoomCode(4, () => 0.5)), true);
});

test('isValidRoomCode rejects wrong length, lowercase, ambiguous chars, and non-strings', () => {
  assert.equal(isValidRoomCode('ABC'), false);     // too short
  assert.equal(isValidRoomCode('ABCDE'), false);   // too long
  assert.equal(isValidRoomCode('abcd'), false);    // lowercase
  assert.equal(isValidRoomCode('AB0I'), false);    // ambiguous chars not in alphabet
  assert.equal(isValidRoomCode(1234), false);      // not a string
  assert.equal(isValidRoomCode(null), false);
});
