import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { projectPath } from '../../data/projects';

// One line per project: for the "more work" lists where a full card would be
// too heavy. The whole row is a single link to the case study.
export default function ProjectRow({ project, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <li className="project-row">
      <Link to={projectPath(project)} className="project-row__link">
        <span className="project-row__main">
          <H className="project-row__title">{project.title}</H>
          <span className="project-row__tagline">{project.tagline}</span>
        </span>
        <span className="project-row__meta">
          {project.award && (
            <span className="project-row__award">
              <Icon name="award" size={14} />
              Award
            </span>
          )}
          <span>{project.area}</span>
        </span>
        <Icon name="arrowRight" className="project-row__arrow" />
      </Link>
    </li>
  );
}
