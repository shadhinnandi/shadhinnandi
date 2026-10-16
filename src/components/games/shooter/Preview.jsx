// Card artwork for Last Stand, drawn in the game's own style.
export default function ShooterPreview() {
  const grid = [];
  for (let x = 0; x <= 400; x += 40) grid.push(<line key={`x${x}`} x1={x} y1="0" x2={x} y2="240" />);
  for (let y = 0; y <= 240; y += 40) grid.push(<line key={`y${y}`} x1="0" y1={y} x2="400" y2={y} />);
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="400" height="240" fill="#10141c" />
      <rect x="40" y="40" width="40" height="40" fill="#131925" />
      <rect x="240" y="160" width="40" height="40" fill="#131925" />
      <rect x="320" y="40" width="40" height="40" fill="#131925" />
      <g stroke="rgba(120,140,180,0.1)" strokeWidth="1.5">{grid}</g>
      <circle cx="200" cy="120" r="62" fill="none" stroke="rgba(94,230,255,0.1)" strokeWidth="3" />

      {[
        [92, 64, 22],
        [318, 186, 22],
        [330, 70, 16],
      ].map(([x, y, r]) => (
        <g key={x}>
          <ellipse cx={x + 4} cy={y + 6} rx={r} ry={r * 0.95} fill="rgba(0,0,0,0.45)" />
          <circle cx={x} cy={y} r={r} fill="#232b3d" stroke="#4b5878" strokeWidth="2" />
          <circle cx={x} cy={y} r={r * 0.6} fill="none" stroke="rgba(94,230,255,0.3)" strokeWidth="1.5" />
        </g>
      ))}

      <g strokeLinecap="round" className="gp-anim gp-anim--flicker">
        <line x1="226" y1="108" x2="268" y2="92" stroke="rgba(255,190,90,0.4)" strokeWidth="6" />
        <line x1="236" y1="104" x2="268" y2="92" stroke="#fff3cf" strokeWidth="2" />
        <line x1="190" y1="80" x2="170" y2="44" stroke="rgba(255,190,90,0.4)" strokeWidth="6" />
        <line x1="186" y1="73" x2="170" y2="44" stroke="#fff3cf" strokeWidth="2" />
      </g>

      {/* grunt */}
      <g transform="translate(300 84)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d="M12 -3 L18 0 L12 3 Z" fill="#ff5d6c" transform={`rotate(${a})`} />
        ))}
        <circle r="12" fill="#141922" stroke="#ff5d6c" strokeWidth="2.5" />
        <circle cx="-5" r="3" fill="#ff5d6c" />
      </g>
      {/* runner */}
      <g transform="translate(150 196) rotate(-50)">
        <path d="M14 0 L-9 -9 L-4 0 L-9 9 Z" fill="#141922" stroke="#ffb547" strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      {/* gunner */}
      <g transform="translate(110 150)">
        <path d="M14 0 L7 12 L-7 12 L-14 0 L-7 -12 L7 -12 Z" fill="#141922" stroke="#b48cff" strokeWidth="2.5" />
        <circle r="4" fill="#d6beff" />
      </g>
      <line x1="122" y1="146" x2="186" y2="126" stroke="rgba(200,160,255,0.6)" strokeWidth="1.5" strokeDasharray="5 6" />
      {/* brute */}
      <g transform="translate(170 30) rotate(70)">
        <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#141922" stroke="#58d68d" strokeWidth="3" />
        <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#58d68d" opacity="0.85" />
      </g>

      {/* player */}
      <g transform="translate(200 120) rotate(-22)">
        <rect x="8" y="-4" width="20" height="8" rx="2" fill="#2b3a4d" />
        <circle r="15" fill="#1f3346" stroke="#5ee6ff" strokeWidth="2.5" />
        <path d="M0 0 L6.5 -6 A8 8 0 0 1 6.5 6 Z" fill="#5ee6ff" />
        <g className="gp-anim gp-anim--flicker">
          <circle cx="34" cy="0" r="12" fill="rgba(255,200,120,0.3)" />
          <path d="M28 0 L40 -4 L46 0 L40 4 Z" fill="#ffe39a" />
        </g>
      </g>

      <g fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="rgba(230,236,245,0.8)">
        <text x="16" y="22">WAVE 7</text>
        <rect x="16" y="30" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.12)" />
        <rect x="16" y="30" width="56" height="5" rx="2.5" fill="#5ef0a0" />
        <text x="384" y="24" textAnchor="end" fontSize="14" fontFamily="IBM Plex Sans, sans-serif" fontWeight="600" fill="#f2f4f8">
          18,420
        </text>
      </g>
    </svg>
  );
}
