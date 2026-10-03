import { lazy } from 'react';

// Course slug → lazily loaded course view. Each course ships in its own
// chunk (with its content, styles and fonts), so it adds nothing to the
// rest of the site.
export const courseViews = {
  'beginner-c-programming': lazy(() => import('./beginner-c/BeginnerC.jsx')),
};
