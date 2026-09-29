import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import { CurrentResearch, ResearchAreas } from '../components/sections/ResearchBlocks.jsx';
import { research, currentResearch, researchAreas } from '../data/research';
import usePageTitle from '../lib/usePageTitle';

export default function Research() {
  usePageTitle(
    'Research',
    'Research interests and ongoing work of Shadhin Nandi in AI and computational biology: enhancer–promoter interaction prediction, bioinformatics, protein AI, computer vision and human-centered AI.',
  );
  return (
    <div className="page">
      <PageHeader label="Research" title={research.title} lead={research.summary} />

      <div className="container">
        <section className="block" aria-labelledby="current-title">
          <h2 id="current-title" className="block__title">
            Current research
          </h2>
          {currentResearch.map((item) => (
            <CurrentResearch key={item.id} item={item} />
          ))}
        </section>

        <section className="block" aria-labelledby="areas-title">
          <h2 id="areas-title" className="block__title">
            Research areas
          </h2>
          <p className="block__intro">
            Each area is marked with how I am involved: ongoing research, work in progress, areas I am familiar with, or
            interests I want to pursue.
          </p>
          <ResearchAreas areas={researchAreas} detailed />
        </section>

        <p className="small muted research-footnote">
          Looking for engineering work? Software and security projects, including SICA, are under{' '}
          <Link to="/projects">Work</Link>.
        </p>
      </div>
    </div>
  );
}
