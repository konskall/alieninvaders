import { NetcodeHost } from './NetcodeHost.js';
import { NetcodeGuest } from './NetcodeGuest.js';

// Orchestrates one online co-op session: ties a NetTransport to the right
// netcode side (host or guest) over a world adapter, and exposes a simple
// connect()/tick()/stop() lifecycle. DOM-free and transport-agnostic — the
// Game supplies the world adapter and a concrete transport (RtdbTransport in
// production, MockTransport in tests).
export class CoopSession {
  constructor(transport, role, world) {
    if (role !== 'host' && role !== 'guest') {
      throw new Error(`CoopSession: invalid role "${role}"`);
    }
    this.transport = transport;
    this.role = role;
    this.world = world;
    this.netcode = role === 'host'
      ? new NetcodeHost(transport, world)
      : new NetcodeGuest(transport, world);
  }

  get isHost() {
    return this.role === 'host';
  }

  async connect() {
    await this.transport.connect();
  }

  // Drive one network step: host broadcasts a snapshot, guest sends its input.
  tick() {
    this.netcode.tick();
  }

  stop() {
    this.transport.close();
  }
}
