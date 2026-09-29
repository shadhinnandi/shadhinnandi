import { Link } from 'react-router-dom';
import Img from '../ui/Img.jsx';
import StackList from '../ui/StackList.jsx';
import AwardNote from './AwardNote.jsx';
import ProjectLinks from './ProjectLinks.jsx';
import { projectContext, projectPath } from '../../data/projects';

// Large project card. `lead` lays image and text side by side on wide screens
// and shows one more highlight; the others stack image over text.
export default function FeaturedProject({ project, lead = false, headingLevel = 3, eager = false }) {
  const H = `h${headingLevel}`;
  const context = projectContext(project);
  return (
    <article className={`feature${lead ? ' feature--lead' : ''}`}>
      {project.image && (
        <Link to={projectPath(project)} className="feature__media" tabIndex={-1} aria-hidden="true">
          <Img media={project.image} sizes={lead ? '(min-width: 960px) 620px, 100vw' : '(min-width: 960px) 540px, 100vw'} eager={eager} />
        </Link>
      )}
      <div className="feature__body">
        {context.length > 0 && <p className="meta">{context.join(' · ')}</p>}
        <H className="feature__title">
          <Link to={projectPath(project)}>{project.title}</Link>
        </H>
        <p className="feature__summary">{project.summary}</p>
        <ul className="points">
          {project.highlights.slice(0, lead ? 3 : 2).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <AwardNote award={project.award} />
        <div className="feature__foot">
          <StackList items={project.stack} limit={lead ? 6 : 5} />
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}
