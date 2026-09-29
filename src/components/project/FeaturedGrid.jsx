import Reveal from '../ui/Reveal.jsx';
import FeaturedProject from './FeaturedProject.jsx';

// First project as a wide lead card, the rest as a pair below it.
export default function FeaturedGrid({ projects, eager = false }) {
  const [lead, ...rest] = projects;
  return (
    <div className="features">
      <Reveal>
        <FeaturedProject project={lead} lead eager={eager} />
      </Reveal>
      <div className="features__pair">
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={i * 80}>
            <FeaturedProject project={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
