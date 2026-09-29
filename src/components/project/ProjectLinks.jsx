import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import ExternalLink from '../ui/ExternalLink.jsx';
import { projectPath } from '../../data/projects';

const extraIcon = { pdf: 'document', video: 'play' };

/** Case study, source, demo and any extra evidence (reports, videos). */
export default function ProjectLinks({ project, caseStudy = true, extras = false }) {
  const t = project.title;
  return (
    <ul className="link-row">
      {caseStudy && (
        <li>
          <Link className="text-link" to={projectPath(project)}>
            Case study<span className="visually-hidden">: {t}</span>
            <Icon name="arrowRight" />
          </Link>
        </li>
      )}
      {project.github && (
        <li>
          <ExternalLink className="text-link text-link--quiet" href={project.github}>
            Source<span className="visually-hidden"> code for {t} on GitHub</span>
            <Icon name="arrowUpRight" />
          </ExternalLink>
        </li>
      )}
      {project.demo && (
        <li>
          <ExternalLink className="text-link text-link--quiet" href={project.demo}>
            Live demo<span className="visually-hidden"> of {t}</span>
            <Icon name="arrowUpRight" />
          </ExternalLink>
        </li>
      )}
      {extras &&
        project.links?.map((l) => (
          <li key={l.href}>
            <ExternalLink className="text-link text-link--quiet" href={l.href}>
              {l.label}
              <span className="visually-hidden"> for {t}</span>
              <Icon name={extraIcon[l.kind] || 'arrowUpRight'} />
            </ExternalLink>
          </li>
        ))}
    </ul>
  );
}
