import { useCallback, useEffect, useRef, useState } from 'react';
import ProjectCard from './ProjectCard.jsx';

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function ScrollShowcase({ projects, perScene = 3 }) {
  const scenes = chunk(projects, perScene);
  const total = scenes.length;
  const [active, setActive] = useState(0);
  const railRef = useRef(null);
  const sentinelRefs = useRef([]);

  useEffect(() => {
    const sentinels = sentinelRefs.current;
    if (!sentinels.length) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        let best = active;
        let bestRatio = -1;
        for (const entry of entries) {
          const idx = Number(entry.target.dataset.scene);
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = idx;
          }
        }
        if (bestRatio > 0) setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of sentinels) if (el) io.observe(el);
    return () => io.disconnect();
  }, [total]);

  const jumpTo = useCallback(
    (idx) => {
      const el = sentinelRefs.current[idx];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [],
  );

  const sceneState = (idx) => {
    if (idx === active) return 'active';
    return idx < active ? 'exit' : 'enter';
  };

  return (
    <div className="showcase" ref={railRef}>
      {/* Scroll height: one sentinel per scene drives the IntersectionObserver */}
      <div className="showcase__rail" aria-hidden="true">
        {scenes.map((_, i) => (
          <div
            key={i}
            className="showcase__sentinel"
            ref={(el) => { sentinelRefs.current[i] = el; }}
            data-scene={i}
          />
        ))}
      </div>

      {/* Sticky viewport */}
      <div className="showcase__sticky">
        <div className="showcase__glow" />

        {scenes.map((group, i) => (
          <div
            key={i}
            className="showcase__scene"
            data-state={sceneState(i)}
            aria-hidden={i !== active}
          >
            {group.map((p, j) => (
              <ProjectCard key={p.slug} project={p} eager={i === 0 && j < 3} />
            ))}
          </div>
        ))}

        <div className="showcase__progress" role="group" aria-label="Project scenes">
          {scenes.map((_, i) => (
            <button
              key={i}
              className="showcase__dot"
              aria-current={i === active ? 'true' : undefined}
              aria-label={`Scene ${i + 1} of ${total}`}
              onClick={() => jumpTo(i)}
            />
          ))}
          <span className="showcase__counter" aria-live="polite">
            {active + 1} / {total}
          </span>
        </div>
      </div>
    </div>
  );
}
