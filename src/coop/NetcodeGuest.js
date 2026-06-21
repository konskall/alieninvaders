import { buildInput, MSG } from './protocol.js';

// Guest side: applies host snapshots (dropping stale/out-of-order seq) and sends
// the local ship's input each tick. Transport-agnostic and DOM-free.
export class NetcodeGuest {
  constructor(transport, world) {
    this.transport = transport;
    this.world = world;
    this.lastSeq = -1;
    transport.onMessage((m) => {
      if (!m || m.t !== MSG.STATE) return;
      if (m.seq <= this.lastSeq) return;   // stale or out-of-order
      this.lastSeq = m.seq;
      this.world.applySnapshot(m);
    });
  }

  tick() {
    this.transport.send(buildInput(this.world.getLocalInput()));
  }
}
