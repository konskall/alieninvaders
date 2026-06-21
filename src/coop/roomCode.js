// Pure room-code helpers. DOM-free and Firebase-free.
// Alphabet excludes ambiguous glyphs (0/O, 1/I/L) for easy verbal sharing.
export const ROOM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateRoomCode(len = 4, rnd = Math.random) {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += ROOM_ALPHABET[Math.floor(rnd() * ROOM_ALPHABET.length)];
  }
  return s;
}

export function isValidRoomCode(code) {
  return typeof code === 'string'
    && code.length === 4
    && [...code].every(ch => ROOM_ALPHABET.includes(ch));
}
