import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import ExternalLink from '../components/ui/ExternalLink.jsx';
import FeaturedGrid from '../components/project/FeaturedGrid.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import { featuredProjects, additionalProjects, areas as allAreas } from '../data/projects';
import { profile } from '../data/profile';
import usePageTitle from '../lib/usePageTitle';

export default function Projects() {
  usePageTitle('Work', 'Full-stack, machine learning, security and tooling projects by Shadhin Nandi, with source code and case studies.');
  const areas = allAreas.filter((a) => additionalProjects.some((p) => p.area === a));
  const [params, setParams] = useSearchParams();
  const active = areas.includes(params.get('area')) ? params.get('area') : 'All';
  const shown = active === 'All' ? additionalProjects : additionalProjects.filter((p) => p.area === active);
  const count = (a) => (a === 'All' ? additionalProjects.length : additionalProjects.filter((p) => p.area === a).length);

  const select = (a) => setParams(a === 'All' ? {} : { area: a }, { replace: true, preventScrollReset: true });

  return (
    <div className="page">
      <PageHeader
        label="Work"
        title="Projects and case studies"
        lead="Course projects, independent builds and research code. Each case study covers the problem, what was built and how, with source linked where it is public."
      >
        <p className="small muted">
          More repositories on{' '}
          <ExternalLink href={profile.links.github.href}>GitHub</ExternalLink>.
        </p>
      </PageHeader>

      <div className="container">
        <section className="block" aria-labelledby="featured-title">
          <h2 id="featured-title" className="block__title">
            Featured
          </h2>
          <FeaturedGrid projects={featuredProjects} eager />
        </section>

        <section className="block" aria-labelledby="more-title">
          <div className="block__head">
            <h2 id="more-title" className="block__title">
              More projects
            </h2>
            <div className="segmented" role="group" aria-label="Filter projects by area">
              {['All', ...areas].map((a) => (
                <button key={a} type="button" aria-pressed={active === a} onClick={() => select(a)}>
                  {a}
                  <span className="segmented__count">{count(a)}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="visually-hidden" aria-live="polite">
            Showing {shown.length} {shown.length === 1 ? 'project' : 'projects'}
            {active !== 'All' ? ` in ${active}` : ''}.
          </p>
          <div className="card-grid">
            {shown.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
