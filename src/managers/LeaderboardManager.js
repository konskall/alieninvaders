export class LeaderboardManager {
    constructor() {
        // Firebase Configuration - ΑΛΛΑΞΤΕ ΜΕ ΤΑ ΔΙΚΑ ΣΑΣ
        this.firebaseConfig = {
            apiKey: "AIzaSyBFXMiDJkpo9vFCzR6iFI3vHTWL2gKbDLU",
            authDomain: "alieninvaders-908a8.firebaseapp.com",
            databaseURL: "https://alieninvaders-908a8-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "alieninvaders-908a8",
            storageBucket: "alieninvaders-908a8.appspot.com",
            messagingSenderId: "255819258195",
            appId: "1:255819258195:web:13bcc6e025d09d506b29a6",
            measurementId: "G-P4RHJJF2G9"

        };

        this.scores = [];
        this.coopScores = [];
        this.initialized = false;
        this.initFirebase();
    }

    initFirebase() {
        if (!window.firebase) {
            console.warn('Firebase SDK not loaded. Using localStorage fallback.');
            this.scores = this.loadScoresLocal();
            this.initialized = true;
            return;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
        }

        this.db = firebase.database();
        this.loadScoresFromCloud();
        this.loadCoopScoresFromCloud();
    }

    loadCoopScoresFromCloud() {
        this.db.ref('leaderboardCoop').on('value', (snapshot) => {
            const data = snapshot.val();
            this.coopScores = data ? this._sanitizeCoop(Object.values(data)) : [];
        }, () => { /* keep whatever we have on read error */ });
    }

    _sanitizeCoop(list) {
        return list
            .filter(e => e && typeof e.names !== 'undefined' && Number.isFinite(Number(e.score)))
            .map(e => ({ ...e, score: Number(e.score) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);
    }

    addCoopScore(names, score, level) {
        const entry = {
            names: (names || '').toString().slice(0, 41) || 'Co-op',
            score: Math.floor(Number(score) || 0),
            level: Number(level) || 1,
            date: new Date().toLocaleDateString('el-GR'),
            timestamp: Date.now(),
            id: Date.now().toString()
        };
        if (this.initialized && this.db) {
            const ref = this.db.ref('leaderboardCoop').push();
            entry.id = ref.key;
            this.coopScores = this._sanitizeCoop([...this.coopScores, entry]);
            ref.set(entry).catch(e => console.warn('Co-op score save failed:', e));
        } else {
            this.coopScores = this._sanitizeCoop([...this.coopScores, entry]);
        }
        return entry;
    }

    getCoopScores() {
        return this.coopScores;
    }

    loadScoresFromCloud() {
        const ref = this.db.ref('leaderboard');

        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            // Sanitize: the DB is an open trust boundary — drop malformed entries
            // and coerce score to a number so a poisoned record can't corrupt sorting.
            this.scores = data ? this._sanitize(Object.values(data)) : [];
            this.initialized = true;
        }, (error) => {
            console.warn('Firebase error, using localStorage:', error);
            this.scores = this.loadScoresLocal();
            this.initialized = true;
        });
    }

    loadScoresLocal() {
        try {
            const stored = localStorage.getItem('spaceGameLeaderboard');
            return stored ? this._sanitize(JSON.parse(stored)) : [];
        } catch (e) {
            return [];
        }
    }

    addScore(playerName, score, level) {
        const entry = {
            name: (playerName || '').trim().slice(0, 20) || 'Anonymous',
            score: Math.floor(Number(score) || 0),
            level: Number(level) || 1,
            date: new Date().toLocaleDateString('el-GR'),
            timestamp: Date.now(),
            id: Date.now().toString()
        };

        if (this.initialized && this.db) {
            // push() gives a collision-free key (Date.now() collides across devices).
            const ref = this.db.ref('leaderboard').push();
            entry.id = ref.key;
            this._mergeEntry(entry);           // optimistic: show it immediately
            ref.set(entry).catch(error => {
                console.warn('Firebase save failed, using localStorage:', error);
                this.saveScoresLocal(this.scores);
            });
        } else {
            this._mergeEntry(entry);
            this.saveScoresLocal(this.scores);
        }
        return entry;
    }

    // Merge an entry into the in-memory list (sorted, top-50) so the UI updates
    // without waiting for the cloud round-trip.
    _mergeEntry(entry) {
        this.scores = this._sanitize([...this.scores, entry]);
    }

    // Keep only well-formed entries, coerce score to a number, sort desc, top 50.
    _sanitize(list) {
        return list
            .filter(e => e && typeof e.name !== 'undefined' && Number.isFinite(Number(e.score)))
            .map(e => ({ ...e, score: Number(e.score) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);
    }

    saveScoresLocal(scores) {
        this.scores = this._sanitize(scores);     // keep in-memory list in sync (was stale before)
        try {
            localStorage.setItem('spaceGameLeaderboard', JSON.stringify(this.scores));
        } catch (e) {
            console.warn('localStorage save failed:', e);
        }
    }

    getScores() {
        return this.scores;
    }

    clearScores() {
        this.scores = [];
        if (this.db) {
            this.db.ref('leaderboard').remove()
                .catch(error => console.warn('Error clearing leaderboard:', error));
        }
        localStorage.removeItem('spaceGameLeaderboard');
    }

    isTopScore(score) {
        if (this.scores.length < 50) return true;
        const last = this.scores[this.scores.length - 1];
        return score > (Number(last && last.score) || 0);
    }
}
