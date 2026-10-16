// Card artwork for Last Train Home: a steam train crossing a viaduct at dusk.
export default function TrainPreview() {
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2f5f" />
          <stop offset="0.6" stopColor="#e8875a" />
          <stop offset="1" stopColor="#f6c37a" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#gt-sky)" />
      <circle cx="300" cy="120" r="22" fill="#fff1d0" opacity="0.9" />
      <path d="M0 150 L60 90 L100 120 L160 70 L220 115 L280 80 L340 120 L400 95 L400 170 L0 170 Z" fill="#6a5a7a" />
      <path d="M150 74 L160 70 L170 76 Z M270 84 L280 80 L290 86 Z" fill="#ffffff" opacity="0.9" />
      <path d="M0 165 C 80 150, 160 160, 240 150 S 360 155, 400 150 L400 240 L0 240 Z" fill="#3f5f48" />
      {/* viaduct */}
      <rect x="0" y="168" width="400" height="8" fill="#5a4a3a" />
      {[20, 90, 160, 230, 300, 370].map((x) => (
        <path key={x} d={`M${x} 176 L${x} 240 L${x + 50} 240 L${x + 50} 176 Q ${x + 25} 196 ${x} 176`} fill="#6a5a48" opacity="0.9" />
      ))}
      <rect x="0" y="164" width="400" height="3" fill="#9aa0a8" />
      {/* carriages */}
      {[40, 110].map((x) => (
        <g key={x}>
          <rect x={x} y="134" width="64" height="30" rx="4" fill="#3a6a55" />
          <rect x={x} y="134" width="64" height="4" fill="#e9dcc0" />
          {[0, 1, 2].map((w) => (
            <rect key={w} x={x + 6 + w * 20} y="142" width="12" height="10" fill="#ffd88a" />
          ))}
          <circle cx={x + 12} cy="166" r="5" fill="#2a2a2e" />
          <circle cx={x + 52} cy="166" r="5" fill="#2a2a2e" />
        </g>
      ))}
      {/* tender and locomotive */}
      <rect x="180" y="140" width="40" height="24" fill="#24262c" />
      <rect x="222" y="122" width="24" height="42" fill="#1f2a3a" />
      <rect x="226" y="128" width="12" height="10" fill="#ffd88a" />
      <rect x="244" y="136" width="54" height="24" rx="11" fill="#2a3a50" />
      <rect x="282" y="120" width="9" height="16" fill="#16171a" />
      <path d="M298 150 L310 164 L298 164 Z" fill="#16171a" />
      {[254, 276].map((x) => (
        <circle key={x} cx={x} cy="162" r="8" fill="#2a2a2e" />
      ))}
      {/* smoke */}
      <g className="gp-anim gp-anim--drift">
        {[
          [282, 108, 9],
          [266, 96, 12],
          [246, 84, 15],
          [222, 74, 18],
        ].map(([x, y, r]) => (
          <circle key={x} cx={x} cy={y} r={r} fill="rgba(240,235,235,0.6)" />
        ))}
      </g>
      {/* headlamp */}
      <path d="M306 146 L400 126 L400 172 Z" fill="rgba(255,230,160,0.25)" />
      <g fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#ffffff">
        <rect x="12" y="12" width="150" height="36" rx="8" fill="rgba(14,16,22,0.7)" />
        <text x="22" y="26" fill="#ffd34d">
          NEXT · MOUNTAINS
        </text>
        <text x="22" y="40" fontFamily="IBM Plex Sans, sans-serif" fontSize="12" fontWeight="600">
          Greyfell · 12.4 km
        </text>
        <rect x="300" y="12" width="88" height="22" rx="8" fill="rgba(14,16,22,0.7)" />
        <text x="344" y="27" textAnchor="middle">
          Day 1 · 18:40
        </text>
      </g>
    </svg>
  );
}
