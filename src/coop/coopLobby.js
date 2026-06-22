// Co-op lobby controller: wires the #coop-screen DOM to Firebase room presence
// and bootstraps a CoopSession over RtdbTransport. Browser-only (DOM + Firebase),
// so it is verified by 2-tab / 2-device play, not node:test.
import { generateRoomCode, isValidRoomCode } from './roomCode.js';
import { connectCoop } from './connectCoop.js';
import { CoopSession } from './CoopSession.js';

const DIFFICULTIES = ['very_easy', 'easy', 'normal', 'hard', 'nightmare'];

export class CoopLobby {
  constructor(game) {
    this.game = game;
    this.db = (window.firebase && window.firebase.database) ? window.firebase.database() : null;
    this.code = null;
    this.role = null;
    this.roomRef = null;
    this._listeners = [];
    this._gen = 0;   // bumped on leave/re-entry to abort an in-flight connect
    this.el = {};
  }

  init() {
    const id = (x) => document.getElementById(x);
    this.el = {
      screen: id('coop-screen'),
      name: id('coop-name'),
      choice: id('coop-choice'),
      createBtn: id('coop-create-btn'),
      codeInput: id('coop-code-input'),
      joinBtn: id('coop-join-btn'),
      waiting: id('coop-waiting'),
      codeDisplay: id('coop-code-display'),
      status: id('coop-status'),
      difficulty: id('coop-difficulty'),
      startBtn: id('coop-start-btn'),
      backBtn: id('coop-back-btn'),
      cancelBtn: id('coop-cancel-btn'),
      error: id('coop-error'),
    };
    this.el.createBtn.addEventListener('click', () => this.createRoom());
    this.el.joinBtn.addEventListener('click', () => this.joinRoom());
    this.el.startBtn.addEventListener('click', () => this.hostStart());
    this.el.backBtn.addEventListener('click', () => this.leave());
    if (this.el.cancelBtn) this.el.cancelBtn.addEventListener('click', () => this.leave());
    this.el.codeInput.addEventListener('input', () => {
      this.el.codeInput.value = this.el.codeInput.value.toUpperCase().slice(0, 4);
    });
  }

  show() {
    // Fresh entry — drop any leftover listeners/refs and abort an in-flight connect.
    this._detach();
    this._gen++;
    this.roomRef = null; this.code = null; this.role = null;
    this.game.state = 'coopLobby';
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    this.el.screen.classList.remove('hidden');
    this._showChoice();
    this._setError('');
  }

  _showChoice() {
    this.el.choice.classList.remove('hidden');
    this.el.waiting.classList.add('hidden');
    this.el.startBtn.classList.add('hidden');
    this.el.startBtn.classList.remove('coop-start-ready');
    if (this.el.status) this.el.status.classList.remove('coop-status-joined');
  }

  _setError(msg) { if (this.el.error) this.el.error.textContent = msg; }
  _name() { return (this.el.name.value || '').trim().slice(0, 20) || 'Player'; }

  _requireDb() {
    if (!this.db) { this._setError('Το online co-op δεν είναι διαθέσιμο (Firebase).'); return false; }
    return true;
  }

  async createRoom() {
    if (!this._requireDb()) return;
    const myGen = ++this._gen;   // abort token: leave()/show() bump _gen, stranding this connect
    this.role = 'host';
    this.myName = this._name();
    // Atomically claim a free 4-char code (transaction avoids two hosts racing
    // onto the same generated code).
    let code = null;
    for (let i = 0; i < 6; i++) {
      const c = generateRoomCode();
      const res = await this.db.ref(`rooms/${c}/host`).transaction(
        cur => (cur === null ? { name: this.myName, ts: Date.now() } : undefined)
      );
      if (myGen !== this._gen) {                                  // user left mid-claim
        if (res.committed) this.db.ref(`rooms/${c}`).remove();    // undo the just-claimed room
        return;
      }
      if (res.committed) { code = c; break; }
    }
    if (!code) { this._setError('Δεν βρέθηκε ελεύθερο δωμάτιο, δοκίμασε ξανά.'); return; }
    this.code = code;
    this.roomRef = this.db.ref(`rooms/${code}`);
    await this.roomRef.child('status').set('waiting');
    if (myGen !== this._gen) { this.roomRef.remove(); this.roomRef = null; return; }   // left during the status write
    // Clean the room if the host disconnects from the lobby.
    this.roomRef.onDisconnect().remove();

    this.el.choice.classList.add('hidden');
    this.el.waiting.classList.remove('hidden');
    this.el.codeDisplay.textContent = code;
    this.el.difficulty.classList.remove('hidden');
    this.el.status.textContent = 'Περιμένω συμπαίκτη…';

    const guestRef = this.roomRef.child('guest');
    const cb = guestRef.on('value', (snap) => {
      const g = snap.val();
      if (g && g.name) {
        this.partnerName = g.name;
        this.el.status.textContent = `✅ Ο/Η ${g.name} συνδέθηκε — έτοιμοι!`;
        this.el.status.classList.add('coop-status-joined');
        this.el.startBtn.classList.remove('hidden');
        this.el.startBtn.classList.add('coop-start-ready');   // pop + pulse to grab the eye
      } else {
        // Guest left before start — can't begin alone.
        this.partnerName = null;
        this.el.status.textContent = 'Περιμένω συμπαίκτη…';
        this.el.status.classList.remove('coop-status-joined');
        this.el.startBtn.classList.add('hidden');
        this.el.startBtn.classList.remove('coop-start-ready');
      }
    });
    this._listeners.push([guestRef, 'value', cb]);
  }

  async joinRoom() {
    if (!this._requireDb()) return;
    const code = (this.el.codeInput.value || '').toUpperCase();
    if (!isValidRoomCode(code)) { this._setError('Μη έγκυρος κωδικός (4 χαρακτήρες).'); return; }
    const roomSnap = await this.db.ref(`rooms/${code}`).once('value');
    const room = roomSnap.val();
    if (!room || !room.host) { this._setError('Το δωμάτιο δεν βρέθηκε.'); return; }
    if (room.status !== 'waiting') { this._setError('Το παιχνίδι έχει ήδη ξεκινήσει.'); return; }

    const myGen = ++this._gen;   // abort token: leave()/show() bump _gen, stranding this connect
    this.myName = this._name();
    // Atomically claim the guest seat (transaction avoids two guests racing into
    // the same room; the second one is rejected rather than silently overwriting).
    const res = await this.db.ref(`rooms/${code}/guest`).transaction(
      cur => (cur === null ? { name: this.myName, ts: Date.now() } : undefined)
    );
    if (myGen !== this._gen) {                                          // user left mid-claim
      if (res.committed) this.db.ref(`rooms/${code}/guest`).remove();   // release the seat we grabbed
      return;
    }
    if (!res.committed) { this._setError('Το δωμάτιο είναι γεμάτο.'); return; }

    this.role = 'guest';
    this.code = code;
    this.partnerName = room.host.name;
    this.roomRef = this.db.ref(`rooms/${code}`);
    this.roomRef.child('guest').onDisconnect().remove();

    this.el.choice.classList.add('hidden');
    this.el.waiting.classList.remove('hidden');
    this.el.codeDisplay.textContent = code;
    this.el.difficulty.classList.add('hidden');   // only host picks difficulty
    this.el.status.textContent = `Συνδέθηκες με ${room.host.name}. Περιμένω έναρξη…`;

    const statusRef = this.roomRef.child('status');
    const cb = statusRef.on('value', (snap) => {
      if (snap.val() === 'playing') this._beginGame('guest');
    });
    this._listeners.push([statusRef, 'value', cb]);
  }

  async hostStart() {
    if (this.role !== 'host' || !this.roomRef) return;
    // Re-verify a guest is actually present (it may have left after Start appeared).
    const gSnap = await this.roomRef.child('guest').once('value');
    if (!gSnap.val()) { this._setError('Ο συμπαίκτης αποχώρησε.'); this.el.startBtn.classList.add('hidden'); return; }
    const difficulty = this.el.difficulty.value || 'easy';
    await this.roomRef.child('difficulty').set(difficulty);
    await this.roomRef.child('status').set('playing');
    this._beginGame('host');
  }

  _setConnecting(on) {
    const el = document.getElementById('coop-connecting');
    if (el) el.classList.toggle('hidden', !on);
  }

  async _beginGame(role) {
    const myGen = this._gen;   // abort if the user leaves during the async connect
    // Stop listening to lobby presence; cancel the host room auto-remove so the
    // room survives into gameplay.
    this._detach();
    // Re-arm onDisconnect as a CLEANUP for the gameplay phase: host removes the whole
    // room, guest removes its seat, when the tab/app closes mid-match (the common
    // abandon case; explicit cleanupRoom() in Game.stopCoop covers normal exits).
    // On the RTDB-relay transport a real disconnect also stalls the game data, so the
    // 4s watchdog ends the session before this fires. On WebRTC, gameplay rides the
    // P2P channel, so a transient RTDB-socket blip could delete the room mid-match —
    // but that's benign: the live DataChannel is unaffected, a 'playing' room isn't
    // joinable anyway, and the room is GC'd at session end regardless.
    if (this.role === 'host') this.roomRef.onDisconnect().remove();
    else this.roomRef.child('guest').onDisconnect().remove();
    this._setConnecting(true);   // visible feedback while the link establishes (can take a few s)

    try {
      const difficulty = this.role === 'host'
        ? (this.el.difficulty.value || 'easy')
        : ((await this.roomRef.child('difficulty').once('value')).val() || 'easy');
      if (myGen !== this._gen) { this._setConnecting(false); return; }   // left during the difficulty fetch

      const transport = await connectCoop(this.db, this.code, role);
      if (myGen !== this._gen) { this._setConnecting(false); try { transport.close(); } catch (e) {} return; }   // left during connect

      const world = this.game.makeCoopWorld(role);
      const session = new CoopSession(transport, role, world);
      const names = this.role === 'host'
        ? `${this.myName || 'Host'} & ${this.partnerName || 'Guest'}`
        : `${this.partnerName || 'Host'} & ${this.myName || 'Guest'}`;
      this.game.beginCoop(session, role, difficulty, this.code, names);
    } catch (e) {
      // Both transports failed (or RTDB read error): never leave the user stuck on
      // the spinner — clear it and return to the menu (leave() cleans up the room).
      this._setConnecting(false);
      if (myGen === this._gen) this.leave();
    }
  }

  _detach() {
    for (const [ref, ev, cb] of this._listeners) ref.off(ev, cb);
    this._listeners = [];
  }

  // Remove this client's RTDB footprint (host: the whole room; guest: its seat)
  // WITHOUT navigating. Called by the Game on co-op teardown (game over / menu /
  // restart) so finished rooms don't accumulate in Firebase forever. Safe no-op
  // when not in a room.
  cleanupRoom() {
    this._gen++;   // abort any in-flight connect
    this._detach();
    if (this.roomRef) {
      if (this.role === 'host') this.roomRef.remove();
      else this.roomRef.child('guest').remove();
    }
    this.roomRef = null; this.code = null; this.role = null;
  }

  leave() {
    this._setConnecting(false);
    this.cleanupRoom();
    this.game.showMenu();
  }
}
