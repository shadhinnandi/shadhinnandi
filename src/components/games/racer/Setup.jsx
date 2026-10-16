import { TRACKS, buildTrack } from './tracks.js';
import { DIFFICULTY } from './ai.js';
import { fmtTime } from './race.js';
import { loadJSON, loadNumber } from '../shared/storage.js';

// Mode, track and difficulty for Apex Rush, shown on the start and results
// screens so a retry or a different track is one click away.

const outlines = new Map();
function outline(def) {
  if (outlines.has(def.id)) return outlines.get(def.id);
  const t = buildTrack(def);
  const { x0, y0, x1, y1 } = t.bounds;
  const s = Math.min(92 / (x1 - x0), 50 / (y1 - y0));
  const ox = (100 - (x1 - x0) * s) / 2;
  const oy = (60 - (y1 - y0) * s) / 2;
  let d = '';
  for (let i = 0; i < t.N; i += 8) d += `${i ? 'L' : 'M'}${(ox + (t.xs[i] - x0) * s).toFixed(1)} ${(oy + (t.ys[i] - y0) * s).toFixed(1)}`;
  const res = { d: `${d}Z`, start: [ox + (t.xs[0] - x0) * s, oy + (t.ys[0] - y0) * s] };
  outlines.set(def.id, res);
  return res;
}

const ACCENT = { coast: '#3fb5c9', mountain: '#7fb069', city: '#f2a531' };

export default function RacerSetup({ value, onChange, compact = false }) {
  const set = (patch) => {
    const next = { ...value, ...patch };
    next.playLabel = next.mode === 'race' ? 'Start race' : 'Start time trial';
    next.againLabel = next.mode === 'race' ? 'Race again' : 'Run again';
    onChange(next);
  };
  return (
    <div className="game-setup">
      <div>
        <p className="game-setup__label">Mode</p>
        <div className="game-seg" role="group" aria-label="Mode">
          <button type="button" aria-pressed={value.mode === 'race'} onClick={() => set({ mode: 'race' })}>
            Race vs 3 rivals
          </button>
          <button type="button" aria-pressed={value.mode === 'trial'} onClick={() => set({ mode: 'trial' })}>
            Time trial with ghost
          </button>
        </div>
      </div>
      <div>
        <p className="game-setup__label">Track</p>
        <div className="game-tracks" role="group" aria-label="Track">
          {TRACKS.map((def) => {
            const o = outline(def);
            const ghost = loadJSON(`racer:ghost:${def.id}`);
            const lap = loadNumber(`racer:bestlap:${def.id}`, 0);
            return (
              <button key={def.id} type="button" className="game-track" aria-pressed={value.track === def.id} onClick={() => set({ track: def.id })}>
                <svg viewBox="0 0 100 60" aria-hidden="true">
                  <path d={o.d} fill="none" stroke={ACCENT[def.id]} strokeWidth="3" strokeLinejoin="round" />
                  <circle cx={o.start[0]} cy={o.start[1]} r="2.6" fill="#ffffff" />
                </svg>
                <strong>{def.name}</strong>
                {!compact && <small>{ghost ? `PB ${fmtTime(ghost.time)}` : lap ? `Best lap ${fmtTime(lap)}` : def.blurb}</small>}
              </button>
            );
          })}
        </div>
      </div>
      {value.mode === 'race' && (
        <div>
          <p className="game-setup__label">Rivals</p>
          <div className="game-seg" role="group" aria-label="Difficulty">
            {Object.entries(DIFFICULTY).map(([id, d]) => (
              <button key={id} type="button" aria-pressed={value.difficulty === id} onClick={() => set({ difficulty: id })}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

RacerSetup.initial = () => ({ mode: 'race', track: 'coast', difficulty: 'pro', playLabel: 'Start race', againLabel: 'Race again' });
