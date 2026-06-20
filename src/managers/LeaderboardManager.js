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
    }

    loadScoresFromCloud() {
        const ref = this.db.ref('leaderboard');

        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                this.scores = Object.values(data);
                this.scores.sort((a, b) => b.score - a.score);
                this.scores = this.scores.slice(0, 50);
            } else {
                this.scores = [];
            }
            this.initialized = true;
            console.log('Leaderboard loaded:', this.scores);
        }, (error) => {
            console.warn('Firebase error, using localStorage:', error);
            this.scores = this.loadScoresLocal();
            this.initialized = true;
        });
    }

    loadScoresLocal() {
        try {
            const stored = localStorage.getItem('spaceGameLeaderboard');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    addScore(playerName, score, level) {
        const entry = {
            name: playerName.trim() || 'Anonymous',
            score: Math.floor(score),
            level: level,
            date: new Date().toLocaleDateString('el-GR'),
            timestamp: Date.now(),
            id: Date.now().toString()
        };

        if (this.initialized && this.db) {
            // Προσπάθεια αποθήκευσης στο Firebase
            this.db.ref('leaderboard/' + entry.id).set(entry)
                .then(() => {
                    console.log('Score saved to Firebase:', entry);
                })
                .catch(error => {
                    console.warn('Firebase save failed, using localStorage:', error);
                    this.saveScoresLocal([...this.scores, entry]);
                });
        } else {
            // Fallback σε localStorage
            this.saveScoresLocal([...this.scores, entry]);
        }
        return entry;
    }

    saveScoresLocal(scores) {
        try {
            localStorage.setItem('spaceGameLeaderboard', JSON.stringify(scores));
            console.log('Score saved to localStorage');
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
                .then(() => console.log('Leaderboard cleared'))
                .catch(error => console.warn('Error clearing leaderboard:', error));
        }
        localStorage.removeItem('spaceGameLeaderboard');
    }

    isTopScore(score) {
        if (this.scores.length < 50) return true;
        return score > this.scores[this.scores.length - 1].score;
    }
}
