// ICE servers for the WebRTC transport (Phase 2).
// STUN (Google + metered) + metered TURN. The metered keys are free/public by
// design (200GB/mo) — exposing them in the client is the expected model.
// Primary: fetch ephemeral credentials from metered's REST API (rotating).
// Fallback: a static iceServers list if the fetch fails.

const STATIC_ICE = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun.relay.metered.ca:80'] },
  { urls: 'turn:standard.relay.metered.ca:80', username: 'a677c6a0f9c04435300e4e2e', credential: 'oW8BuSmaTrW3Th+s' },
  { urls: 'turn:standard.relay.metered.ca:80?transport=tcp', username: 'a677c6a0f9c04435300e4e2e', credential: 'oW8BuSmaTrW3Th+s' },
  { urls: 'turn:standard.relay.metered.ca:443', username: 'a677c6a0f9c04435300e4e2e', credential: 'oW8BuSmaTrW3Th+s' },
  { urls: 'turns:standard.relay.metered.ca:443?transport=tcp', username: 'a677c6a0f9c04435300e4e2e', credential: 'oW8BuSmaTrW3Th+s' },
];

const METERED_URL = 'https://konskall.metered.live/api/v1/turn/credentials?apiKey=733d0043af16b7094fb2e104b3615c56f8a2';

export async function getIceServers() {
  try {
    const res = await fetch(METERED_URL);
    const servers = await res.json();
    if (Array.isArray(servers) && servers.length) return servers;
  } catch (e) {
    // network/CORS error — fall back to the static list
  }
  return STATIC_ICE;
}
