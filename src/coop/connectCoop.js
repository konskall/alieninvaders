import { WebRtcTransport } from './WebRtcTransport.js';
import { RtdbTransport } from './RtdbTransport.js';

// Hybrid connector: try a low-latency WebRTC DataChannel first; if it can't open
// within `timeoutMs` (strict NAT, no TURN reachable, signaling failure), fall
// back to the RTDB transport. Returns a CONNECTED NetTransport either way. The
// game logic is unaware of which wire is active.
export async function connectCoop(db, code, role, timeoutMs = 6000) {
  const webrtc = new WebRtcTransport(db, code, role);
  try {
    await Promise.race([
      webrtc.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('webrtc-timeout')), timeoutMs)),
    ]);
    return webrtc;                       // data channel opened
  } catch (e) {
    try { webrtc.close(); } catch (_) {}
    const rtdb = new RtdbTransport(db, code, role);
    await rtdb.connect();
    return rtdb;                         // fallback
  }
}
