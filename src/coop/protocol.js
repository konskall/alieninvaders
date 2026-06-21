// Co-op wire protocol — pure, DOM-free. Every message is a JSON-able object
// with a string `t` (type) field.
export const MSG = Object.freeze({
  HELLO: 'hello',
  START: 'start',
  STATE: 'state',
  INPUT: 'input',
  PING:  'ping',
  PONG:  'pong',
  BYE:   'bye'
});

export function buildHello(name) {
  return { t: MSG.HELLO, name: String(name ?? '').slice(0, 20) };
}

export function buildStart(difficulty) {
  return { t: MSG.START, difficulty: String(difficulty) };
}

export function buildInput(ship) {
  return {
    t: MSG.INPUT,
    x: ship.x,
    y: ship.y,
    firing: !!ship.firing,
    alive: !!ship.alive
  };
}

export function buildState(seq, world) {
  return {
    t: MSG.STATE,
    seq,
    ships:   world.ships,
    enemies: world.enemies,
    bullets: world.bullets,
    homing:  world.homing,
    boss:    world.boss ?? null,
    pickups: world.pickups,
    hud:     world.hud,
    events:  world.events ?? []
  };
}

export function isValidMessage(msg) {
  return !!msg && typeof msg === 'object' && typeof msg.t === 'string';
}
