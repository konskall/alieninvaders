// Co-op lobby controller: wires the #coop-screen DOM to Firebase room presence
// and bootstraps a CoopSession over RtdbTransport. Browser-only (DOM + Firebase),
// so it is verified by 2-tab / 2-device play, not node:test.
import { generateRoomCode, isValidRoomCode } from './roomCode.js';
import { RtdbTransport } from './RtdbTransport.js';
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
      error: id('coop-error'),
    };
    this.el.createBtn.addEventListener('click', () => this.createRoom());
    this.el.joinBtn.addEventListener('click', () => this.joinRoom());
    this.el.startBtn.addEventListener('click', () => this.hostStart());
    this.el.backBtn.addEventListener('click', () => this.leave());
    this.el.codeInput.addEventListener('input', () => {
      this.el.codeInput.value = this.el.codeInput.value.toUpperCase().slice(0, 4);
    });
  }

  show() {
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
  }

  _setError(msg) { if (this.el.error) this.el.error.textContent = msg; }
  _name() { return (this.el.name.value || '').trim().slice(0, 20) || 'Player'; }

  _requireDb() {
    if (!this.db) { this._setError('Το online co-op δεν είναι διαθέσιμο (Firebase).'); return false; }
    return true;
  }

  async createRoom() {
    if (!this._requireDb()) return;
    this.role = 'host';
    this.myName = this._name();
    // Find a free 4-char code.
    let code = generateRoomCode();
    for (let i = 0; i < 5; i++) {
      const snap = await this.db.ref(`rooms/${code}/host`).once('value');
      if (!snap.val()) break;
      code = generateRoomCode();
    }
    this.code = code;
    this.roomRef = this.db.ref(`rooms/${code}`);
    await this.roomRef.child('host').set({ name: this._name(), ts: Date.now() });
    await this.roomRef.child('status').set('waiting');
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
        this.el.status.textContent = `Ο/Η ${g.name} συνδέθηκε! Έτοιμοι.`;
        this.el.startBtn.classList.remove('hidden');
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
    if (room.guest) { this._setError('Το δωμάτιο είναι γεμάτο.'); return; }
    if (room.status !== 'waiting') { this._setError('Το παιχνίδι έχει ήδη ξεκινήσει.'); return; }

    this.role = 'guest';
    this.code = code;
    this.myName = this._name();
    this.partnerName = room.host.name;
    this.roomRef = this.db.ref(`rooms/${code}`);
    await this.roomRef.child('guest').set({ name: this._name(), ts: Date.now() });
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
    const difficulty = this.el.difficulty.value || 'easy';
    await this.roomRef.child('difficulty').set(difficulty);
    await this.roomRef.child('status').set('playing');
    this._beginGame('host');
  }

  async _beginGame(role) {
    // Stop listening to lobby presence; cancel the host room auto-remove so the
    // room survives into gameplay.
    this._detach();
    if (this.role === 'host') this.roomRef.onDisconnect().cancel();

    const difficulty = this.role === 'host'
      ? (this.el.difficulty.value || 'easy')
      : ((await this.roomRef.child('difficulty').once('value')).val() || 'easy');

    const transport = new RtdbTransport(this.db, this.code, role);
    await transport.connect();
    const world = this.game.makeCoopWorld(role);
    const session = new CoopSession(transport, role, world);
    const names = this.role === 'host'
      ? `${this.myName || 'Host'} & ${this.partnerName || 'Guest'}`
      : `${this.partnerName || 'Host'} & ${this.myName || 'Guest'}`;
    this.game.beginCoop(session, role, difficulty, this.code, names);
  }

  _detach() {
    for (const [ref, ev, cb] of this._listeners) ref.off(ev, cb);
    this._listeners = [];
  }

  leave() {
    this._detach();
    if (this.roomRef) {
      if (this.role === 'host') this.roomRef.remove();
      else this.roomRef.child('guest').remove();
    }
    this.roomRef = null; this.code = null; this.role = null;
    this.game.showMenu();
  }
}
