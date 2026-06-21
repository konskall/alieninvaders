import { BaseTransport } from './BaseTransport.js';
import { getIceServers } from './iceConfig.js';

// NetTransport over a WebRTC DataChannel, using Firebase RTDB only for signaling
// (offer/answer/ICE under rooms/<code>/signaling). Browser-only; verified by
// 2-tab / 2-device play, not node:test. connect() resolves when the data channel
// opens — the connectCoop() helper races it against a timeout for fallback.
export class WebRtcTransport extends BaseTransport {
  constructor(db, code, role) {
    super();
    this.db = db;
    this.code = code;
    this.role = role;
    this.sigBase = `rooms/${code}/signaling`;
    this.outIce = role === 'host' ? 'hostIce' : 'guestIce';
    this.inIce = role === 'host' ? 'guestIce' : 'hostIce';
    this.pc = null;
    this.dc = null;
    this._subs = [];
    this._opened = false;
  }

  async connect() {
    const iceServers = await getIceServers();
    this.pc = new RTCPeerConnection({ iceServers });

    this.pc.onicecandidate = (e) => {
      if (e.candidate) this.db.ref(`${this.sigBase}/${this.outIce}`).push(e.candidate.toJSON());
    };
    const iceRef = this.db.ref(`${this.sigBase}/${this.inIce}`);
    const iceCb = iceRef.on('child_added', (snap) => {
      const cand = snap.val();
      if (cand && this.pc) this.pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
    });
    this._subs.push([iceRef, 'child_added', iceCb]);

    if (this.role === 'host') {
      this.dc = this.pc.createDataChannel('game');   // reliable, ordered
      this._wireChannel(this.dc);
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      await this.db.ref(`${this.sigBase}/offer`).set({ type: offer.type, sdp: offer.sdp });
      const ansRef = this.db.ref(`${this.sigBase}/answer`);
      const ansCb = ansRef.on('value', async (snap) => {
        const a = snap.val();
        if (a && this.pc && !this.pc.currentRemoteDescription) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(a)).catch(() => {});
        }
      });
      this._subs.push([ansRef, 'value', ansCb]);
    } else {
      this.pc.ondatachannel = (e) => { this.dc = e.channel; this._wireChannel(this.dc); };
      const offRef = this.db.ref(`${this.sigBase}/offer`);
      const offCb = offRef.on('value', async (snap) => {
        const o = snap.val();
        if (o && this.pc && !this.pc.currentRemoteDescription) {
          await this.pc.setRemoteDescription(new RTCSessionDescription(o)).catch(() => {});
          const ans = await this.pc.createAnswer();
          await this.pc.setLocalDescription(ans);
          await this.db.ref(`${this.sigBase}/answer`).set({ type: ans.type, sdp: ans.sdp });
        }
      });
      this._subs.push([offRef, 'value', offCb]);
    }

    await new Promise((resolve) => {
      this._openResolve = resolve;
      if (this._opened) resolve();
    });
  }

  _wireChannel(dc) {
    dc.onopen = () => { this._opened = true; if (this._openResolve) this._openResolve(); };
    dc.onmessage = (e) => { try { this._emitMessage(JSON.parse(e.data)); } catch (err) {} };
    dc.onclose = () => this._emitClose();
  }

  send(msg) {
    if (this.dc && this.dc.readyState === 'open') this.dc.send(JSON.stringify(msg));
  }

  close() {
    for (const [ref, ev, cb] of this._subs) ref.off(ev, cb);
    this._subs = [];
    if (this.dc) try { this.dc.close(); } catch (e) {}
    if (this.pc) try { this.pc.close(); } catch (e) {}
    this.pc = null;
    super.close();
  }
}
