// Shared listener plumbing for all transports. DOM-free.
export class BaseTransport {
  constructor() {
    this._msgCbs = [];
    this._closeCbs = [];
    this._closed = false;
  }

  onMessage(cb) { this._msgCbs.push(cb); }
  onClose(cb) { this._closeCbs.push(cb); }

  _emitMessage(msg) {
    for (const cb of this._msgCbs) cb(msg);
  }

  _emitClose() {
    if (this._closed) return;
    this._closed = true;
    for (const cb of this._closeCbs) cb();
  }

  // Overridden by concrete transports.
  async connect() { /* no-op default */ }

  send(_msg) {
    throw new Error('send() not implemented');
  }

  close() {
    this._emitClose();
  }
}
