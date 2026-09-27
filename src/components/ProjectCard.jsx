import { Link } from 'react-router-dom';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import { projectPath } from '../data/projects';

export const typeLabel = {
  academic: 'Academic project',
  personal: 'Personal project',
};

export function ProjectLinks({ project, showDetails = true }) {
  return (
    <ul className="link-row">
      {showDetails && (
        <li>
          <Link className="text-link" to={projectPath(project)}>
            Details<span className="visually-hidden"> about {project.title}</span>
            <Icon name="arrowRight" />
          </Link>
        </li>
      )}
      {project.github && (
        <li>
          <a className="text-link" href={project.github} target="_blank" rel="noopener noreferrer">
            GitHub<span className="visually-hidden"> repository for {project.title}</span>
            <Icon name="external" />
          </a>
        </li>
      )}
      {project.demo && (
        <li>
          <a className="text-link" href={project.demo} target="_blank" rel="noopener noreferrer">
            Live demo<span className="visually-hidden"> of {project.title}</span>
            <Icon name="external" />
          </a>
        </li>
      )}
    </ul>
  );
}

export function Tags({ items, label = 'Technologies' }) {
  if (!items?.length) return null;
  return (
    <ul className="tags" aria-label={label}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export default function ProjectCard({ project, headingLevel = 3, eagerImage = false, maxPoints = 4, showType = true }) {
  const H = `h${headingLevel}`;
  const hasMedia = Boolean(project.image);
  return (
    <article className={`project${hasMedia ? '' : ' project--text'}`}>
      <div className="project__text">
        <p className="meta">
          {showType && typeLabel[project.type] && <span className="meta__type">{typeLabel[project.type]}</span>}
          <span>{project.tagline}</span>
        </p>
        <H className="project__title">
          <Link to={projectPath(project)}>{project.title}</Link>
        </H>
        {project.context && <p className="project__context small muted">{project.context}</p>}
        <ul className="points">
          {project.highlights.slice(0, maxPoints).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <Tags items={project.stack} />
        <ProjectLinks project={project} />
      </div>
      {hasMedia && (
        <Link to={projectPath(project)} className="project__media" tabIndex={-1} aria-hidden="true">
          <Img media={project.image} sizes="(min-width: 960px) 480px, 100vw" eager={eagerImage} />
        </Link>
      )}
    </article>
  );
}
