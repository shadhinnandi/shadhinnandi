// Card artwork for Apex Rush: a coastal corner seen from above.
function Car({ x, y, rot, color, ghost = false }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={ghost ? 0.45 : 1}>
      {!ghost && <rect x="-19" y="-7" width="40" height="18" rx="6" fill="rgba(0,0,0,0.3)" />}
      <rect x="11" y="-10.5" width="9" height="5" fill="#111" />
      <rect x="11" y="5.5" width="9" height="5" fill="#111" />
      <rect x="-15" y="-10.5" width="9" height="5" fill="#111" />
      <rect x="-15" y="5.5" width="9" height="5" fill="#111" />
      <rect x="-20" y="-9" width="40" height="18" rx="6" fill={color} stroke={ghost ? '#bff6ff' : 'none'} />
      <rect x="-18" y="-1.5" width="36" height="3" fill="rgba(255,255,255,0.85)" />
      <path d="M8 -6.5 L3 -6 L3 6 L8 6.5 Z" fill="#1b2433" />
      <rect x="-11" y="-5.5" width="4.5" height="11" fill="#1b2433" />
    </g>
  );
}

export default function RacerPreview() {
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gr-sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3fb5c9" />
          <stop offset="1" stopColor="#1d5f8f" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="#c9b98a" />
      <path d="M260 240 C 300 190, 340 170, 400 150 L400 240 Z" fill="#d9ca98" />
      <path d="M290 240 C 320 205, 355 188, 400 176 L400 240 Z" fill="url(#gr-sea)" />
      <path d="M300 236 C 326 208, 358 194, 400 184" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
      {/* road: shoulder, asphalt, curbs */}
      <path d="M-20 70 C 120 60, 220 40, 270 110 C 310 170, 230 230, 150 260" fill="none" stroke="#e9edf2" strokeWidth="122" />
      <path d="M-20 70 C 120 60, 220 40, 270 110 C 310 170, 230 230, 150 260" fill="none" stroke="#d8cfae" strokeWidth="116" />
      <path d="M-20 70 C 120 60, 220 40, 270 110 C 310 170, 230 230, 150 260" fill="none" stroke="#4a4e57" strokeWidth="86" />
      <path d="M-20 70 C 120 60, 220 40, 270 110 C 310 170, 230 230, 150 260" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeDasharray="12 12" />
      <path d="M200 30 C 248 40, 270 70, 296 104" fill="none" stroke="#e8473f" strokeWidth="9" strokeDasharray="10 10" />
      <path d="M200 30 C 248 40, 270 70, 296 104" fill="none" stroke="#f4f1ea" strokeWidth="9" strokeDasharray="10 10" strokeDashoffset="10" />
      {/* drift marks and smoke */}
      <path d="M150 74 C 190 70, 222 78, 238 100" fill="none" stroke="rgba(20,20,22,0.35)" strokeWidth="4" />
      <path d="M150 88 C 186 84, 214 92, 228 112" fill="none" stroke="rgba(20,20,22,0.35)" strokeWidth="4" />
      <circle cx="226" cy="98" r="14" fill="rgba(235,235,240,0.55)" className="gp-anim gp-anim--flicker" />
      <circle cx="212" cy="92" r="10" fill="rgba(235,235,240,0.4)" />
      <Car x={246} y={118} rot={55} color="#2f7ff0" />
      <Car x={120} y={70} rot={-4} color="#f2a531" />
      <Car x={60} y={84} rot={-3} color="#2fbf71" />
      <Car x={196} y={64} rot={14} color="#7fe7ff" ghost />
      {/* palms */}
      {[
        [40, 170],
        [92, 196],
        [340, 40],
        [370, 92],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <ellipse cx="8" cy="8" rx="16" ry="11" fill="rgba(0,0,0,0.2)" />
          {[0, 52, 104, 156, 208, 260, 312].map((a) => (
            <path key={a} d="M0 0 Q 8 -4 18 0 Q 8 4 0 0 Z" fill={a % 104 ? '#2f8a4a' : '#3fa35a'} transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
      <g fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#ffffff">
        <rect x="10" y="10" width="92" height="38" rx="8" fill="rgba(8,10,14,0.55)" />
        <text x="20" y="25" fill="#8fe9ff">
          LAP 2/3
        </text>
        <text x="20" y="41" fontSize="13" fontWeight="600">
          0:42.18
        </text>
        <text x="200" y="30" textAnchor="middle" fontFamily="IBM Plex Sans, sans-serif" fontSize="24" fontWeight="700">
          1st
        </text>
        <circle cx="360" cy="200" r="24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" />
        <path d="M343 217 A24 24 0 1 1 382 210" fill="none" stroke="#ffd166" strokeWidth="5" strokeLinecap="round" />
        <text x="360" y="204" textAnchor="middle" fontSize="12" fontWeight="600">
          238
        </text>
      </g>
    </svg>
  );
}
