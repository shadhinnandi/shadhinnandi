import { Link, Navigate, useParams } from 'react-router-dom';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import { Tags, typeLabel } from '../components/ProjectCard.jsx';
import { getProject, academicProjects, otherProjects, isAcademic, projectPath } from '../data/projects';
import usePageTitle from '../lib/usePageTitle';
import NotFound from './NotFound.jsx';

function Block({ title, children }) {
  const id = `sec-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
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

// Rendered at /academic/:slug (section="academic") and /projects/:slug
// (section="projects"). A project opened under the wrong section redirects to
// its canonical URL, so older links keep working.
export default function ProjectDetails({ section = 'projects' }) {
  const { slug } = useParams();
  const project = getProject(slug);
  usePageTitle(project?.title, project?.summary);
  if (!project) return <NotFound />;

  const academic = isAcademic(project);
  if (academic !== (section === 'academic')) return <Navigate to={projectPath(project)} replace />;

  const d = project.details || {};
  const group = academic ? academicProjects : otherProjects;
  const index = group.indexOf(project);
  const next = group[(index + 1) % group.length];
  const back = academic ? { to: '/academic', label: 'Academic' } : { to: '/projects', label: 'All projects' };

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
            <Link to={back.to}>
              <Icon name="arrowLeft" /> {back.label}
            </Link>
          </nav>
          <p className="meta">
            {typeLabel[project.type] && <span className="meta__type">{typeLabel[project.type]}</span>}
            <span>{project.tagline}</span>
          </p>
          <h1>{project.title}</h1>
          <p className="lead">{project.summary}</p>
          {project.context && <p className="small muted">{project.context}</p>}
          {links.length > 0 && (
            <ul className="link-row link-row--buttons">
              {links.map((l, i) => (
                <li key={l.href}>
                  <a
                    className={`btn ${i === 0 ? 'btn--primary' : 'btn--outline'}`}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {l.label}
                    <Icon name="external" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {project.image && (
        <div className="container">
          <figure className={`detail-hero${project.image.fit === 'contain' ? ' detail-hero--contain' : ''}`}>
            <Img media={project.image} sizes="(min-width: 1160px) 1120px, 100vw" eager fit="contain" />
            {project.image.caption && <figcaption className="small muted">{project.image.caption}</figcaption>}
          </figure>
        </div>
      )}

      <div className="container detail-grid">
        <div className="detail-main">
          {d.problem && (
            <Block title="Problem">
              <p>{d.problem}</p>
            </Block>
          )}
          {d.solution && (
            <Block title="Solution">
              <p>{d.solution}</p>
            </Block>
          )}
          <Block title="Key features">
            <List items={d.recognition ? project.highlights.filter((h) => !/Runner-Up/.test(h)) : project.highlights} />
            {d.features && <List items={d.features} />}
          </Block>
          {d.implementation && (
            <Block title="Technical implementation">
              <List items={d.implementation} />
            </Block>
          )}
          {d.results && (
            <Block title="Results">
              <List items={d.results} />
            </Block>
          )}
          {d.contribution && (
            <Block title="Team and contribution">
              <p>{d.contribution}</p>
            </Block>
          )}
          {d.recognition && (
            <Block title="Recognition">
              <List items={d.recognition} />
            </Block>
          )}
          {d.scope && (
            <Block title="Scope">
              <p className="muted">{d.scope}</p>
            </Block>
          )}
          {project.gallery?.length > 0 && (
            <Block title="Images">
              <div className="gallery">
                {project.gallery.map((g) => (
                  <figure key={g.name}>
                    <Img media={g} sizes="(min-width: 960px) 360px, 100vw" />
                    <figcaption className="small muted" aria-hidden="true">
                      {g.alt}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Block>
          )}
        </div>

        <aside className="detail-aside" aria-label="Project facts">
          <dl className="facts facts--stacked">
            <div>
              <dt>Area</dt>
              <dd>{project.domain}</dd>
            </div>
            {project.context && (
              <div>
                <dt>Context</dt>
                <dd>{project.context}</dd>
              </div>
            )}
            <div>
              <dt>Technologies</dt>
              <dd>
                <Tags items={project.stack} />
              </dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>
                {project.github ? (
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    {project.github.replace('https://github.com/', '')}
                  </a>
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
          <p className="label">{academic ? 'Next academic project' : 'Next project'}</p>
          <Link to={projectPath(next)} className="next-project__link">
            {next.title}
            <Icon name="arrowRight" size={20} />
          </Link>
        </nav>
      </div>
    </article>
  );
}
