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
  }

  async connect() {
    const base = `rooms/${this.code}/${this.inDir}`;
    const liveRef = this.db.ref(`${base}/live`);
    const liveCb = liveRef.on('value', (snap) => {
      const v = snap.val();
      if (v) this._emitMessage(v);
    });
    const ctrlRef = this.db.ref(`${base}/ctrl`);
    const ctrlCb = ctrlRef.on('child_added', (snap) => {
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
