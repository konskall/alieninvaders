# Firebase Realtime Database — Security Rules

The leaderboard writes to a **public** Realtime Database. Without rules, anyone
can write arbitrary JSON to it (huge scores, hostile fields used for stored XSS,
or wiping the whole node). The client now also escapes every rendered field and
sanitizes records on read, but **the database rules are the real boundary** and
must be applied in the Firebase project — they are NOT deployed by GitHub Pages.

## What the rules in `database.rules.json` do

- **Read:** only `/leaderboard` is publicly readable; the rest of the DB is closed.
- **Write:** only under `/leaderboard/<pushId>`, and only for a *new* key
  (`!data.exists()`) — existing entries can't be edited or deleted, and the
  whole node can't be wiped from the client.
- **Validate:** each entry must have `name` (string, 1–20 chars), `score`
  (number, 0–100,000,000), `level` (number); optional `date`/`timestamp`/`id`
  are type/length-checked, and **any other field is rejected** (`$other` → false).

## How to apply them (one-time, ~1 min)

**Option A — Firebase Console (no tooling):**
1. Open the [Firebase Console](https://console.firebase.google.com/) → project `alieninvaders-908a8`.
2. Build → **Realtime Database** → **Rules** tab.
3. Paste the contents of `database.rules.json` and click **Publish**.

**Option B — Firebase CLI:**
```bash
npm i -g firebase-tools
firebase login
firebase deploy --only database   # uses database.rules.json (referenced from firebase.json)
```
(If you don't have a `firebase.json`, run `firebase init database` first and
point it at `database.rules.json`.)

## After applying
- New score submissions still work (they create fresh `push()` keys).
- The in-app "clear leaderboard" (`clearScores()`) will now be **denied** from
  the client by design — clear it from the Console instead if ever needed.
