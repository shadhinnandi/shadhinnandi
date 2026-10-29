import { Link } from 'react-router-dom';
import Img from '../ui/Img.jsx';
import Icon from '../ui/Icon.jsx';
import ExternalLink from '../ui/ExternalLink.jsx';
import StackList from '../ui/StackList.jsx';
import FallbackCover from './FallbackCover.jsx';
import { projectContext, projectPath } from '../../data/projects';

export default function ProjectCard({ project, headingLevel = 3, eager = false }) {
  const H = `h${headingLevel}`;
  const context = projectContext(project);
  const hasImage = !!project.image;

  return (
    <article className="pcard">
      <Link to={projectPath(project)} className="pcard__media" tabIndex={-1} aria-hidden="true">
        {hasImage ? (
          <Img
            media={project.image}
            sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
            eager={eager}
          />
        ) : (
          <FallbackCover title={project.title} area={project.area} />
        )}
      </Link>

      <div className="pcard__body">
        <p className="pcard__meta">
          {context.length > 0 ? context.join(' · ') : project.area}
        </p>

        <H className="pcard__title">
          <Link to={projectPath(project)}>{project.title}</Link>
        </H>

        <p className="pcard__desc">{project.summary}</p>

        <StackList items={project.stack} limit={3} />

        {project.award && (
          <p className="pcard__award">
            <Icon name="award" size={14} />
            <span>{project.award.title}</span>
          </p>
        )}

        <div className="pcard__foot">
          <Link className="text-link" to={projectPath(project)}>
            Case study<span className="visually-hidden">: {project.title}</span>
            <Icon name="arrowRight" />
          </Link>
          {project.github && (
            <ExternalLink className="text-link text-link--quiet" href={project.github}>
              Source<span className="visually-hidden"> for {project.title}</span>
              <Icon name="arrowUpRight" />
            </ExternalLink>
          )}
          {project.demo && (
            <ExternalLink className="text-link text-link--quiet" href={project.demo}>
              {project.demoLabel || 'Live demo'}
              <span className="visually-hidden"> of {project.title}</span>
              <Icon name="arrowUpRight" />
            </ExternalLink>
          )}
        </div>
      </div>
    </article>
  );
}
