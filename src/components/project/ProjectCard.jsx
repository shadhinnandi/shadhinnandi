import { Link } from 'react-router-dom';
import Img from '../ui/Img.jsx';
import StackList from '../ui/StackList.jsx';
import AwardNote from './AwardNote.jsx';
import ProjectLinks from './ProjectLinks.jsx';
import { projectContext, projectPath } from '../../data/projects';

// Compact card for secondary projects: thumbnail, purpose, stack, links.
export default function ProjectCard({ project, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  const context = projectContext(project);
  return (
    <article className="card">
      {project.image && (
        <Link to={projectPath(project)} className="card__media" tabIndex={-1} aria-hidden="true">
          <Img media={project.image} sizes="(min-width: 960px) 360px, (min-width: 640px) 50vw, 100vw" />
        </Link>
      )}
      <div className="card__body">
        <p className="meta">{context.length ? context.join(' · ') : project.area}</p>
        <H className="card__title">
          <Link to={projectPath(project)}>{project.title}</Link>
        </H>
        <p className="card__summary">{project.summary}</p>
        <AwardNote award={project.award} />
        <div className="card__foot">
          <StackList items={project.stack} limit={4} />
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}
