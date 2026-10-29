const palette = {
  'Full-stack': ['#1a3a5c', '#2a5a8c'],
  'Machine learning': ['#2d1b4e', '#4a2d7a'],
  Security: ['#1b3a2d', '#2d5c4a'],
  Embedded: ['#3a2a1a', '#5c4a2d'],
  Tools: ['#1a2a3a', '#2d4a5c'],
  Games: ['#3a1a2d', '#5c2d4a'],
};

const icons = {
  'Full-stack': '</>',
  'Machine learning': 'ML',
  Security: '🛡',
  Embedded: '⚙',
  Tools: '🔧',
  Games: '🎮',
};

export default function FallbackCover({ title, area }) {
  const [bg1, bg2] = palette[area] || palette.Tools;
  return (
    <div
      className="fallback-cover"
      style={{ background: `linear-gradient(145deg, ${bg1}, ${bg2})` }}
      aria-hidden="true"
    >
      <div className="fallback-cover__icon">{icons[area] || '📁'}</div>
      <span className="fallback-cover__text">{title}</span>
      <span className="fallback-cover__area">{area}</span>
    </div>
  );
}
