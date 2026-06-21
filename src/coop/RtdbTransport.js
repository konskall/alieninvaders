import { BaseTransport } from './BaseTransport.js';
import { MSG } from './protocol.js';

// NetTransport over Firebase Realtime DB. Host and guest each own an outbound
// direction; high-frequency state/input use latest-wins set() on a /live node,
// control messages are push()ed to a /ctrl queue. Firebase-bound: verified in
// the browser / on two devices, not under node:test.
export class RtdbTransport extends BaseTransport {
  constructor(db, code, role) {
    super();
    this.db = db;
    this.code = code;
    this.role = role;
    this.outDir = role === 'host' ? 'fromHost' : 'fromGuest';
    this.inDir  = role === 'host' ? 'fromGuest' : 'fromHost';
    this._subs = [];
    this.relay = true;   // server-relayed (not P2P) — the game ticks slower on this
  }

  async connect() {
    if (this._subs.length) return;   // guard: no duplicate subscriptions on re-connect
    const base = `rooms/${this.code}/${this.inDir}`;

    const liveRef = this.db.ref(`${base}/live`);
    const liveCb = liveRef.on('value', (snap) => {
      const v = snap.val();
      if (v) this._emitMessage(v);   // null => node deleted/empty; skip
    });

    // child_added replays ALL existing children on subscribe. Record the keys
    // present at connect time and skip them, so stale ctrl messages (e.g. from a
    // reused room) are not re-delivered; only genuinely new ones are emitted.
    const ctrlRef = this.db.ref(`${base}/ctrl`);
    const seen = new Set();
    const initial = await ctrlRef.once('value');
    initial.forEach((child) => { seen.add(child.key); });
    const ctrlCb = ctrlRef.on('child_added', (snap) => {
      if (seen.has(snap.key)) return;
      const v = snap.val();
      if (v) this._emitMessage(v);
    });

    this._subs.push([liveRef, 'value', liveCb], [ctrlRef, 'child_added', ctrlCb]);
  }

  send(msg) {
    const base = `rooms/${this.code}/${this.outDir}`;
    if (msg.t === MSG.STATE || msg.t === MSG.INPUT) {
      this.db.ref(`${base}/live`).set(msg);     // latest-wins
    } else {
      this.db.ref(`${base}/ctrl`).push(msg);    // queued
    }
  }

  close() {
    for (const [ref, ev, cb] of this._subs) ref.off(ev, cb);
    this._subs = [];
    super.close();
  }
}
