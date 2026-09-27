import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { otherProjects as projects, domains as allDomains } from '../data/projects';
import { githubUrl } from '../data/profile';
import usePageTitle from '../lib/usePageTitle';

export default function Projects() {
  usePageTitle('Projects', 'Full-stack, machine learning and tooling projects by Shadhin Nandi, with source code on GitHub.');
  const domains = allDomains.filter((d) => projects.some((p) => p.domain === d));
  const [params, setParams] = useSearchParams();
  const active = domains.includes(params.get('area')) ? params.get('area') : 'All';
  const shown = active === 'All' ? projects : projects.filter((p) => p.domain === active);

  const counts = Object.fromEntries(domains.map((d) => [d, projects.filter((p) => p.domain === d).length]));

  const select = (d) => {
    if (d === 'All') setParams({}, { replace: true });
    else setParams({ area: d }, { replace: true });
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Projects"
        title="Projects"
        lead="Full-stack applications, machine learning pipelines, tools and games. Source code is linked where it is public."
      >
        <p className="small muted">
          Course projects, including the two CSE Project Show placements, are on the{' '}
          <Link to="/academic">Academic</Link> page. More repositories on{' '}
          <a href={githubUrl} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </PageHeader>

      <div className="container">
        <div className="filter" role="group" aria-label="Filter projects by area">
          {['All', ...domains].map((d) => (
            <button
              key={d}
              type="button"
              className="filter__btn"
              aria-pressed={active === d}
              onClick={() => select(d)}
            >
              {d}
              <span className="filter__count">{d === 'All' ? projects.length : counts[d]}</span>
            </button>
          ))}
        </div>

        <p className="visually-hidden" aria-live="polite">
          Showing {shown.length} {shown.length === 1 ? 'project' : 'projects'}
          {active !== 'All' ? ` in ${active}` : ''}.
        </p>

        <div className="project-list project-list--page">
          {shown.map((p, i) => (
            <ProjectCard key={p.slug} project={p} headingLevel={2} eagerImage={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
