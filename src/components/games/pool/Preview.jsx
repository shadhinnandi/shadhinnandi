// Card artwork for Eight Ball.
const RACK = [
  [1, '#f2c230', false],
  [9, '#f2c230', true],
  [2, '#2f5fd0', false],
  [10, '#2f5fd0', true],
  [8, '#16171a', false],
  [3, '#d23a32', false],
  [11, '#d23a32', true],
  [4, '#6a3aa8', false],
  [14, '#1f8a4c', true],
  [5, '#ea7a24', false],
];

function Ball({ x, y, n, color, stripe }) {
  const c = 6.93; // half chord of the stripe edge (r = 8, band half-height 4)
  return (
    <g>
      <circle cx={x} cy={y} r="8" fill={color} />
      {stripe && (
        <>
          <path d={`M${x - c} ${y - 4} A8 8 0 0 1 ${x + c} ${y - 4} Z`} fill="#f4efe4" />
          <path d={`M${x - c} ${y + 4} A8 8 0 0 0 ${x + c} ${y + 4} Z`} fill="#f4efe4" />
        </>
      )}
      <circle cx={x} cy={y} r="3.4" fill="#f8f5ee" />
      <text x={x} y={y + 1.6} fontSize="4.2" textAnchor="middle" fontFamily="IBM Plex Sans, sans-serif" fontWeight="600" fill="#111">
        {n}
      </text>
      <circle cx={x - 2.6} cy={y - 2.8} r="1.8" fill="rgba(255,255,255,0.5)" />
    </g>
  );
}

export default function PoolPreview() {
  const balls = [];
  let i = 0;
  for (let row = 0; row < 4; row += 1) {
    for (let k = 0; k <= row; k += 1) {
      const [n, color, stripe] = RACK[i];
      balls.push(<Ball key={n} x={262 + row * 14} y={120 + (k - row / 2) * 16.5} n={n} color={color} stripe={stripe} />);
      i += 1;
    }
  }
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="gp-felt" cx="50%" cy="45%" r="65%">
          <stop offset="0" stopColor="#1d7a55" />
          <stop offset="1" stopColor="#0f4a34" />
        </radialGradient>
        <linearGradient id="gp-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b3d22" />
          <stop offset="1" stopColor="#3f2213" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="#0b0d10" />
      <rect x="18" y="22" width="364" height="196" rx="18" fill="url(#gp-wood)" />
      <rect x="38" y="42" width="324" height="156" rx="6" fill="url(#gp-felt)" />
      <rect x="38" y="42" width="324" height="156" rx="6" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="6" />
      {[
        [40, 44],
        [200, 40],
        [360, 44],
        [40, 196],
        [200, 200],
        [360, 196],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="10" fill="#050506" stroke="#2a1a10" strokeWidth="2" />
      ))}
      {[90, 145, 255, 310].map((x) => (
        <g key={x} fill="#e8dcc0" opacity="0.7">
          <circle cx={x} cy="31" r="2" />
          <circle cx={x} cy="209" r="2" />
        </g>
      ))}
      <line x1="120" y1="42" x2="120" y2="198" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      {balls}
      <line x1="126" y1="131.3" x2="246" y2="121" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeDasharray="4 5" />
      <circle cx="248" cy="120.8" r="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <circle cx="118" cy="132" r="8" fill="#f7f4ec" />
      <circle cx="115.5" cy="129.4" r="2" fill="rgba(255,255,255,0.9)" />
      <g className="gp-anim gp-anim--cue">
        <line x1="104" y1="133.2" x2="10" y2="141.6" stroke="#d9b779" strokeWidth="5" strokeLinecap="round" />
        <line x1="104" y1="133.2" x2="97" y2="133.8" stroke="#2f6fd1" strokeWidth="5" />
        <line x1="40" y1="139" x2="10" y2="141.6" stroke="#2b1a10" strokeWidth="6" strokeLinecap="round" />
      </g>
      <g fontFamily="IBM Plex Mono, monospace" fontSize="9">
        <rect x="144" y="5" width="112" height="15" rx="7.5" fill="rgba(0,0,0,0.5)" />
        <text x="200" y="15.5" textAnchor="middle" fill="#e8f1ec">
          YOUR SHOT · SOLIDS
        </text>
      </g>
    </svg>
  );
}
