import { Link, useParams } from 'react-router-dom';
import Img from '../components/ui/Img.jsx';
import Icon from '../components/ui/Icon.jsx';
import ExternalLink from '../components/ui/ExternalLink.jsx';
import StackList from '../components/ui/StackList.jsx';
import AwardNote from '../components/project/AwardNote.jsx';
import { getProject, projects, projectContext, projectPath } from '../data/projects';
import usePageTitle from '../lib/usePageTitle';
import NotFound from './NotFound.jsx';

function Block({ id, title, children }) {
  return (
    <section className="detail-block" aria-labelledby={id}>
      <h2 id={id} className="detail-block__title">
        {title}
      </h2>
      <div className="detail-block__body">{children}</div>
    </section>
  );
}

const List = ({ items }) => (
  <ul className="points">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

const linkIcon = { pdf: 'document', video: 'play' };

export default function ProjectDetails() {
  const { slug } = useParams();
  const project = getProject(slug);
  usePageTitle(project?.title, project?.summary);
  if (!project) return <NotFound />;

  const d = project.details || {};
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const context = projectContext(project);

  const links = [
    project.github && { label: 'Source on GitHub', href: project.github },
    project.demo && { label: 'Live demo', href: project.demo },
    ...(project.links || []),
  ].filter(Boolean);

  return (
    <article className="page project-detail">
      <header className="page-header">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <Link to="/projects">
              <Icon name="arrowLeft" /> All work
            </Link>
          </nav>
          {context.length > 0 && <p className="label">{context.join(' · ')}</p>}
          <h1>{project.title}</h1>
          <p className="lead">{project.summary}</p>
          <AwardNote award={project.award} />
          {links.length > 0 && (
            <ul className="button-row">
              {links.map((l, i) => (
                <li key={l.href}>
                  <ExternalLink className={`btn ${i === 0 ? 'btn--primary' : 'btn--ghost'}`} href={l.href}>
                    {l.label}
                    <Icon name={linkIcon[l.kind] || 'arrowUpRight'} />
                  </ExternalLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {project.image && (
        <div className="container">
          <figure className={`detail-hero${project.image.fit === 'contain' ? ' detail-hero--diagram' : ''}`}>
            <Img media={project.image} sizes="(min-width: 1200px) 1160px, 100vw" eager fit="contain" />
            {project.image.caption && <figcaption>{project.image.caption}</figcaption>}
          </figure>
        </div>
      )}

      <div className="container detail-grid">
        <div className="detail-main">
          {d.problem && (
            <Block id="problem" title="Problem">
              <p>{d.problem}</p>
            </Block>
          )}
          {d.solution && (
            <Block id="approach" title="Approach">
              <p>{d.solution}</p>
            </Block>
          )}
          <Block id="highlights" title="What it does">
            <List items={[...project.highlights, ...(d.features || [])]} />
          </Block>
          {d.implementation && (
            <Block id="implementation" title="Implementation">
              <List items={d.implementation} />
            </Block>
          )}
          {d.results && (
            <Block id="results" title="Results">
              <List items={d.results} />
            </Block>
          )}
          {d.contribution && (
            <Block id="team" title="Team and contribution">
              <p>{d.contribution}</p>
            </Block>
          )}
          {d.scope && (
            <Block id="scope" title="Scope and limitations">
              <p>{d.scope}</p>
            </Block>
          )}
          {project.gallery?.length > 0 && (
            <Block id="gallery" title="Images">
              <div className="gallery">
                {project.gallery.map((g) => (
                  <figure key={g.name} className={g.fit === 'contain' ? 'gallery__diagram' : undefined}>
                    <Img media={g} sizes="(min-width: 960px) 380px, 100vw" />
                    <figcaption aria-hidden="true">{g.alt}</figcaption>
                  </figure>
                ))}
              </div>
            </Block>
          )}
        </div>

        <aside className="detail-aside" aria-label="Project facts">
          <dl className="facts panel">
            <div>
              <dt>Area</dt>
              <dd>{project.area}</dd>
            </div>
            {project.course && (
              <div>
                <dt>Context</dt>
                <dd>{project.course}</dd>
              </div>
            )}
            {project.period && (
              <div>
                <dt>When</dt>
                <dd>{project.period}</dd>
              </div>
            )}
            {project.role && (
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
            )}
            <div>
              <dt>Stack</dt>
              <dd>
                <StackList items={project.stack} />
              </dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>
                {project.github ? (
                  <ExternalLink href={project.github}>{project.github.replace('https://github.com/', '')}</ExternalLink>
                ) : (
                  'Not publicly available'
                )}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="container">
        <nav className="next-project" aria-label="Next project">
          <p className="label">Next</p>
          <Link to={projectPath(next)} className="next-project__link">
            <span>{next.title}</span>
            <span className="next-project__tagline">{next.tagline}</span>
            <Icon name="arrowRight" size={22} />
          </Link>
        </nav>
      </div>
    </article>
  );
}
