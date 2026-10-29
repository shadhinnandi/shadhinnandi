import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import ExternalLink from '../components/ui/ExternalLink.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import SkillTable from '../components/sections/SkillTable.jsx';
import { projects, areas as allAreas } from '../data/projects';
import { profile } from '../data/profile';
import { skills } from '../data/skills';
import usePageTitle from '../lib/usePageTitle';

export default function Projects() {
  usePageTitle('Projects', 'Full-stack, machine learning, security and tooling projects by Shadhin Nandi, with source code, case studies and the skills each one evidences.');
  const areas = allAreas.filter((a) => projects.some((p) => p.area === a));
  const [params, setParams] = useSearchParams();
  const active = areas.includes(params.get('area')) ? params.get('area') : 'All';
  const shown = active === 'All' ? projects : projects.filter((p) => p.area === active);
  const count = (a) => (a === 'All' ? projects.length : projects.filter((p) => p.area === a).length);

  const select = (a) => setParams(a === 'All' ? {} : { area: a }, { replace: true, preventScrollReset: true });

  return (
    <div className="page">
      <PageHeader
        label="Projects"
        title="Projects and case studies"
        lead="Course projects, independent builds and research code. Each case study covers the problem, what was built and how, with source linked where it is public."
      />

      <div className="container">
        <section id="skills" className="block" aria-labelledby="skills-title">
          <h2 id="skills-title" className="block__title">
            Skills
          </h2>
          <p className="block__intro">
            Technologies I have used in coursework, teaching and projects. Each group notes where it can be verified.
          </p>
          <SkillTable groups={skills} />
        </section>

        <section className="block" aria-labelledby="projects-title">
          <div className="block__head">
            <h2 id="projects-title" className="block__title">
              All projects
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
          <div className="pgrid">
            {shown.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <ProjectCard project={p} eager={i < 3} />
              </Reveal>
            ))}
          </div>
        </section>

        <p className="small muted" style={{ textAlign: 'center', paddingBottom: 'var(--space-7)' }}>
          More repositories on{' '}
          <ExternalLink href={profile.links.github.href}>GitHub</ExternalLink>.
        </p>
      </div>
    </div>
  );
}
