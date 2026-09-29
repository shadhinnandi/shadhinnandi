import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import usePageTitle from '../lib/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="page">
      <PageHeader label="404" title="Page not found" lead="The page you were looking for does not exist or has moved.">
        <ul className="button-row">
          <li>
            <Link className="btn btn--primary" to="/">
              Home
            </Link>
          </li>
          <li>
            <Link className="btn btn--ghost" to="/projects">
              Work
            </Link>
          </li>
        </ul>
      </PageHeader>
    </div>
  );
}
