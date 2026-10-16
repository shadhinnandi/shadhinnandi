// Card artwork for Lost Horizons: the explorer on a forest trail by the totems.
export default function AdventurePreview() {
  const trees = [
    [30, 40, 26],
    [80, 20, 22],
    [350, 30, 28],
    [380, 110, 22],
    [20, 150, 24],
    [60, 210, 26],
    [330, 200, 24],
    [300, 70, 18],
  ];
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="400" height="240" fill="#55924c" />
      <path d="M0 210 C 80 190, 120 150, 180 130 S 300 80, 400 60 L400 0 L0 0 Z" fill="#4c8a46" />
      <path d="M120 240 C 150 190, 170 160, 200 130 C 230 100, 240 80, 250 40" fill="none" stroke="#cfae74" strokeWidth="34" strokeLinecap="round" />
      <path d="M260 240 C 270 200, 300 170, 320 160 L400 150 L400 240 Z" fill="#2f86b3" />
      <path d="M270 236 C 280 204, 306 178, 330 170" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" className="gp-anim gp-anim--drift" />
      <circle cx="200" cy="80" r="44" fill="#86bf63" />
      {[
        [178, 62, 'sun'],
        [222, 62, 'wave'],
        [178, 100, 'star'],
        [222, 100, 'moon'],
      ].map(([x, y, k], i) => (
        <g key={k}>
          <ellipse cx={x + 3} cy={y + 14} rx="10" ry="4" fill="rgba(0,0,0,0.25)" />
          <rect x={x - 8} y={y - 18} width="16" height="32" fill="#7a5a3a" />
          <circle cx={x} cy={y - 8} r="5" fill={i < 2 ? '#ffd34d' : '#3a2a1a'} className={i < 2 ? 'gp-anim gp-anim--flicker' : undefined} />
        </g>
      ))}
      {trees.map(([x, y, r]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x + 8} cy={y + r * 0.5} rx={r} ry={r * 0.5} fill="rgba(0,0,0,0.22)" />
          <circle cx={x} cy={y} r={r} fill="#2f6b33" />
          <circle cx={x - 3} cy={y - 4} r={r * 0.75} fill="#3d8240" />
          <circle cx={x - 6} cy={y - 8} r={r * 0.45} fill="#5aa055" />
        </g>
      ))}
      {/* explorer */}
      <g transform="translate(170 168)">
        <ellipse cx="3" cy="16" rx="11" ry="5" fill="rgba(0,0,0,0.25)" />
        <rect x="-5" y="4" width="4" height="10" fill="#4b3b2a" />
        <rect x="1" y="4" width="4" height="10" fill="#4b3b2a" />
        <rect x="-7" y="-8" width="14" height="14" rx="4" fill="#c9a26a" />
        <circle cx="0" cy="-12" r="5.5" fill="#e0b48a" />
        <ellipse cx="0" cy="-15" rx="10" ry="4" fill="#8a6a3c" />
        <ellipse cx="0" cy="-17" rx="6" ry="4" fill="#a5824e" />
        <circle cx="16" cy="2" r="3" fill="#ffd88a" />
      </g>
      <g transform="translate(250 196)">
        <path d="M0 -14 L7 0 L0 10 L-7 0 Z" fill="#ffd34d" />
        <circle cx="0" cy="-2" r="16" fill="rgba(255,220,120,0.25)" className="gp-anim gp-anim--flicker" />
      </g>
      <g fontFamily="IBM Plex Sans, sans-serif">
        <rect x="12" y="12" width="166" height="40" rx="9" fill="rgba(14,16,22,0.72)" />
        <text x="22" y="27" fontFamily="IBM Plex Mono, monospace" fontSize="8" fill="#ffd34d">
          OBJECTIVE
        </text>
        <text x="22" y="42" fontSize="10" fill="#ffffff">
          Wake the four forest totems
        </text>
        <rect x="318" y="12" width="70" height="52" rx="8" fill="rgba(14,16,22,0.72)" />
        <path d="M330 52 C 336 30, 356 22, 376 30 C 380 44, 366 56, 350 56 Z" fill="#86bf63" opacity="0.85" />
        <circle cx="350" cy="40" r="2.5" fill="#ffffff" />
      </g>
    </svg>
  );
}
