import { useMemo, useState } from 'react';

// Growth-rate chart for Module 04: the common complexity classes plotted on
// a logarithmic y axis, so 1, log n and 2^n fit on one picture. The slider
// changes the largest n shown.

const FUNCS = [
  { id: '1', label: '1', f: () => 1 },
  { id: 'log', label: 'log₂ n', f: (n) => Math.log2(n) },
  { id: 'n', label: 'n', f: (n) => n },
  { id: 'nlog', label: 'n log₂ n', f: (n) => n * Math.log2(n) },
  { id: 'n2', label: 'n²', f: (n) => n * n },
  { id: 'n3', label: 'n³', f: (n) => n * n * n },
  { id: 'exp', label: '2ⁿ', f: (n) => 2 ** n },
];

const W = 560;
const H = 300;
const PAD = { l: 52, r: 76, t: 14, b: 34 };

export default function GrowthChart() {
  const [maxN, setMaxN] = useState(32);
  const yMax = 1e12;
  const plot = useMemo(() => {
    const x = (n) => PAD.l + ((n - 1) / (maxN - 1)) * (W - PAD.l - PAD.r);
    const y = (v) => {
      const lv = Math.log10(Math.max(1, Math.min(v, yMax)));
      return H - PAD.b - (lv / 12) * (H - PAD.t - PAD.b);
    };
    const lines = FUNCS.map((fn, k) => {
      const pts = [];
      let endY = y(1);
      for (let i = 0; i <= 120; i += 1) {
        const n = 1 + ((maxN - 1) * i) / 120;
        const v = fn.f(n);
        endY = y(v);
        pts.push(`${x(n).toFixed(1)},${endY.toFixed(1)}`);
        if (v > yMax) break;                       // the curve has left the chart
      }
      return { ...fn, k, d: `M${pts.join('L')}`, endY };
    });
    const ticks = [0, 3, 6, 9, 12].map((p) => ({ p, y: y(10 ** p) }));
    const xticks = [1, Math.round(maxN / 2), maxN].map((n) => ({ n, x: x(n) }));
    return { lines, ticks, xticks };
  }, [maxN]);

  return (
    <figure className="dsa-viz" aria-label="Growth rate comparison chart">
      <p className="dsa-viz__title">Growth of common complexity classes (logarithmic y axis)</p>
      <div className="dsa-viz__stage">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Functions from n = 1 to ${maxN}`}>
          {plot.ticks.map((t) => (
            <g key={t.p}>
              <line className="dsa-viz__grid" x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} />
              <text className="dsa-viz__axis" x={PAD.l - 8} y={t.y + 4} textAnchor="end">
                {t.p === 0 ? '1' : `10^${t.p}`}
              </text>
            </g>
          ))}
          {plot.xticks.map((t) => (
            <text key={t.n} className="dsa-viz__axis" x={t.x} y={H - PAD.b + 18} textAnchor="middle">
              n = {t.n}
            </text>
          ))}
          {plot.lines.map((l) => (
            <g key={l.id}>
              <path className={`dsa-viz__line dsa-viz__line--${l.k}`} d={l.d} />
              <text className={`dsa-viz__label dsa-viz__label--${l.k}`} x={W - PAD.r + 6} y={l.endY + 4}>
                {l.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="dsa-viz__controls">
        <label className="dsa-viz__range">
          Largest n: <strong>{maxN}</strong>
          <input type="range" min="8" max="64" step="4" value={maxN} onChange={(e) => setMaxN(Number(e.target.value))} />
        </label>
      </div>
      <figcaption className="dsa-viz__caption">
        Each gridline is 1000 times the one below. 2ⁿ leaves the chart (above 10^12) near n = 40, while n³ is still below 10^6 at n = 64.
      </figcaption>
    </figure>
  );
}
