// Card artwork for Ring Pilot.
const CLOUDS = [
  [60, 70, 1],
  [300, 54, 0.8],
  [350, 120, 0.6],
  [20, 140, 0.7],
];
const RINGS = [
  [232, 112, 8],
  [222, 118, 14],
  [206, 128, 24],
  [184, 142, 40],
];

export default function FlightPreview() {
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f5f9e" />
          <stop offset="0.55" stopColor="#7aa7d6" />
          <stop offset="0.8" stopColor="#f1c08f" />
          <stop offset="1" stopColor="#f39a6b" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#gf-sky)" />
      <circle cx="96" cy="150" r="26" fill="#ffe0a8" opacity="0.85" />
      <path d="M0 196 L40 170 L78 186 L126 158 L170 182 L214 164 L262 186 L304 160 L350 182 L400 166 L400 240 L0 240 Z" fill="#5d6f9a" opacity="0.55" />
      <path d="M0 214 L52 194 L110 210 L160 192 L224 212 L286 196 L344 212 L400 198 L400 240 L0 240 Z" fill="#43527a" opacity="0.8" />
      {CLOUDS.map(([x, y, s]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`} fill="#ffffff" opacity="0.85" className="gp-anim gp-anim--drift">
          <ellipse cx="0" cy="0" rx="34" ry="12" />
          <ellipse cx="-14" cy="-8" rx="16" ry="12" />
          <ellipse cx="10" cy="-10" rx="20" ry="14" />
        </g>
      ))}
      {RINGS.map(([x, y, r], i) => (
        <g key={r}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 1.05} fill="none" stroke="rgba(120,60,0,0.35)" strokeWidth={2 + i * 1.6} transform="translate(1.5 2)" />
          <ellipse cx={x} cy={y} rx={r} ry={r * 1.05} fill="none" stroke={i === 3 ? '#ffd34d' : '#ffc94a'} strokeWidth={2 + i * 1.6} />
        </g>
      ))}
      {/* balloon obstacle */}
      <g transform="translate(318 98)">
        <path d="M0 18 L-3 26 L3 26 Z" fill="#5a3a1a" />
        <ellipse cx="0" cy="0" rx="13" ry="16" fill="#ff5d6c" />
        <ellipse cx="-4" cy="-6" rx="4" ry="6" fill="rgba(255,255,255,0.35)" />
      </g>
      {/* plane from behind */}
      <g transform="translate(200 196) rotate(-8)">
        <ellipse cx="0" cy="26" rx="60" ry="6" fill="rgba(30,40,70,0.25)" />
        <path d="M-78 4 L-10 -2 L10 -2 L78 4 L78 9 L10 6 L-10 6 L-78 9 Z" fill="#e9eef7" stroke="#9aa9c4" strokeWidth="1.5" />
        <path d="M-78 4 L-70 4 L-70 9 L-78 9 Z" fill="#ff5d6c" />
        <path d="M78 4 L70 4 L70 9 L78 9 Z" fill="#45c1ff" />
        <path d="M-26 -14 L-4 -14 L4 -14 L26 -14 L26 -10 L-26 -10 Z" fill="#dfe6f2" stroke="#9aa9c4" strokeWidth="1.2" />
        <path d="M-3 -34 L3 -34 L5 -10 L-5 -10 Z" fill="#ff8a3d" />
        <ellipse cx="0" cy="2" rx="13" ry="14" fill="#f3f6fb" stroke="#9aa9c4" strokeWidth="1.5" />
        <ellipse cx="0" cy="-3" rx="7" ry="5" fill="#26324d" />
        <circle cx="0" cy="4" r="20" fill="rgba(255,255,255,0.15)" className="gp-anim gp-anim--flicker" />
      </g>
      <g fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="rgba(255,255,255,0.92)">
        <text x="14" y="20">FUEL</text>
        <rect x="46" y="12" width="70" height="6" rx="3" fill="rgba(0,0,0,0.25)" />
        <rect x="46" y="12" width="48" height="6" rx="3" fill="#ffd34d" />
        <text x="386" y="20" textAnchor="end">
          RINGS 24
        </text>
      </g>
    </svg>
  );
}
