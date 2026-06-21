import { BaseTransport } from './BaseTransport.js';

// In-memory loopback transport for tests and local development. DOM-free.
export class MockTransport extends BaseTransport {
  constructor() {
    super();
    this.peer = null;
    this.sent = [];
  }

  static pair() {
    const a = new MockTransport();
    const b = new MockTransport();
    a.peer = b;
    b.peer = a;
    return [a, b];
  }

  async connect() { /* already "connected" */ }

  send(msg) {
    const copy = JSON.parse(JSON.stringify(msg));
    this.sent.push(copy);
    if (this.peer && !this.peer._closed) {
      this.peer._emitMessage(JSON.parse(JSON.stringify(msg)));
    }
  }

  close() {
    super.close();
    if (this.peer && !this.peer._closed) this.peer._emitClose();
  }
}
