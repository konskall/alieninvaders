// Pure interpolation helpers for smoothing remote entities between snapshots.
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// For each entity in `next`, lerp x/y from the same-id entity in `prev` by alpha.
// Entities with no prev match are returned as a shallow copy of next. Inputs may
// be null/undefined (treated as empty). Never mutates the inputs.
export function interpolateEntities(prev, next, alpha) {
  const prevById = new Map((prev || []).map(e => [e.id, e]));
  return (next || []).map(n => {
    const p = prevById.get(n.id);
    if (!p) return { ...n };
    return { ...n, x: lerp(p.x, n.x, alpha), y: lerp(p.y, n.y, alpha) };
  });
}
