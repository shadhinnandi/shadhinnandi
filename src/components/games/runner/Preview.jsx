// Card artwork for Skyline Run.
const STARS = [
  [30, 20], [80, 42], [130, 14], [175, 34], [240, 18], [290, 40], [340, 16], [375, 46], [60, 70], [320, 66], [210, 52], [110, 58],
];
const SKYLINE = [
  [0, 70, 28], [26, 52, 22], [46, 82, 30], [74, 60, 18], [90, 92, 26], [114, 66, 20], [132, 98, 30], [262, 96, 28], [288, 64, 22], [308, 88, 26], [332, 56, 20], [350, 80, 30], [378, 62, 24],
];

export default function RunnerPreview() {
  const lane = (t, k) => {
    // x of lane edge k (0..3) at depth t (0 = horizon, 1 = bottom)
    const top = 182 + (36 / 3) * k;
    const bottom = 10 + (380 / 3) * k;
    return top + (bottom - top) * t;
  };
  const y = (t) => 112 + 128 * t;
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0f24" />
          <stop offset="0.75" stopColor="#2b1d4f" />
          <stop offset="1" stopColor="#5a2a5e" />
        </linearGradient>
        <linearGradient id="gr-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1c2c" />
          <stop offset="1" stopColor="#2a2d40" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#gr-sky)" />
      {STARS.map(([sx, sy]) => (
        <circle key={`${sx}-${sy}`} cx={sx} cy={sy} r="1" fill="#e8ecff" opacity="0.7" />
      ))}
      <circle cx="318" cy="44" r="14" fill="#f5e7c8" opacity="0.9" />
      <g fill="#140f2a">
        {SKYLINE.map(([x, h, w]) => (
          <rect key={x} x={x} y={112 - h * 0.55} width={w} height={h * 0.55} />
        ))}
      </g>
      <g fill="#ffd27a" opacity="0.55">
        {[8, 52, 98, 140, 270, 316, 356].map((x) => (
          <rect key={x} x={x} y="84" width="3" height="3" />
        ))}
      </g>
      <path d={`M${lane(0, 0)} 112 L${lane(0, 3)} 112 L${lane(1, 3)} 240 L${lane(1, 0)} 240 Z`} fill="url(#gr-road)" />
      <path d={`M${lane(0, 0)} 112 L${lane(1, 0)} 240`} stroke="#ff4fd8" strokeWidth="3" opacity="0.8" />
      <path d={`M${lane(0, 3)} 112 L${lane(1, 3)} 240`} stroke="#45e1ff" strokeWidth="3" opacity="0.8" />
      {[1, 2].map((k) => (
        <path key={k} d={`M${lane(0, k)} 112 L${lane(1, k)} 240`} stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="10 12" />
      ))}
      {/* barrier in the right lane */}
      <g>
        <rect x={lane(0.42, 2) + 4} y={y(0.42) - 18} width={lane(0.42, 3) - lane(0.42, 2) - 8} height="18" fill="#2a2f44" stroke="#ffb347" strokeWidth="2" />
        <path d={`M${lane(0.42, 2) + 10} ${y(0.42) - 18} l10 18 M${lane(0.42, 2) + 26} ${y(0.42) - 18} l10 18 M${lane(0.42, 2) + 42} ${y(0.42) - 18} l10 18`} stroke="#ffb347" strokeWidth="3" />
      </g>
      {/* coins in the middle lane */}
      {[0.2, 0.32, 0.46, 0.62].map((t) => {
        const cx = (lane(t, 1) + lane(t, 2)) / 2;
        const r = 2 + t * 7;
        return (
          <g key={t} className="gp-anim gp-anim--bob">
            <ellipse cx={cx} cy={y(t) - r * 2.2} rx={r * 0.7} ry={r} fill="#ffd34d" stroke="#b8860b" strokeWidth="1" />
          </g>
        );
      })}
      {/* runner from behind, left lane */}
      <g transform="translate(118 168)">
        <ellipse cx="0" cy="66" rx="20" ry="5" fill="rgba(0,0,0,0.4)" />
        <path d="M-8 34 L-14 60" stroke="#262b45" strokeWidth="8" strokeLinecap="round" />
        <path d="M8 34 L12 52 L16 58" stroke="#262b45" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="-14" cy="62" r="4" fill="#45e1ff" />
        <circle cx="16" cy="59" r="4" fill="#45e1ff" />
        <rect x="-14" y="6" width="28" height="32" rx="10" fill="#ff5d8f" />
        <path d="M-13 12 L-24 28" stroke="#ff5d8f" strokeWidth="7" strokeLinecap="round" />
        <path d="M13 12 L22 0" stroke="#ff5d8f" strokeWidth="7" strokeLinecap="round" />
        <circle cx="0" cy="-4" r="10" fill="#2a1d1a" />
        <rect x="-10" y="-6" width="20" height="5" rx="2" fill="#45e1ff" opacity="0.9" />
      </g>
      <g fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="rgba(240,240,255,0.85)">
        <text x="14" y="20">1,284 m</text>
        <text x="386" y="20" textAnchor="end" fill="#ffd34d">
          ● 86
        </text>
      </g>
    </svg>
  );
}
