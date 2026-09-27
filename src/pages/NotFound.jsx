import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import usePageTitle from '../lib/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="page">
      <PageHeader eyebrow="404" title="Page not found" lead="The page you were looking for does not exist or has moved.">
        <p>
          <Link className="btn btn--primary" to="/">
            Back to home
          </Link>{' '}
          <Link className="btn btn--outline" to="/projects">
            Browse projects
          </Link>
        </p>
      </PageHeader>
    </div>
  );
}
