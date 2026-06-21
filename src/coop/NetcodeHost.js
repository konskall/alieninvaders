import { buildState, MSG } from './protocol.js';

// Host-authoritative side: broadcasts the world snapshot each tick and applies
// the guest's input to the world. Transport-agnostic and DOM-free.
export class NetcodeHost {
  constructor(transport, world) {
    this.transport = transport;
    this.world = world;
    this.seq = 0;
    transport.onMessage((m) => {
      if (m && m.t === MSG.INPUT) this.world.applyRemoteInput(m);
    });
  }

  tick() {
    this.transport.send(buildState(this.seq++, this.world.getSnapshot()));
  }
}
