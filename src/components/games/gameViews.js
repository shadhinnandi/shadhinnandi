import { lazy } from 'react';

// Game slug → lazily loaded game view. Each game ships in its own chunk, so
// it adds nothing to the rest of the site until someone opens it.
export const gameViews = {
  shooter: lazy(() => import('./shooter/Shooter.jsx')),
  pool: lazy(() => import('./pool/Pool.jsx')),
  runner: lazy(() => import('./runner/Runner.jsx')),
  flight: lazy(() => import('./flight/Flight.jsx')),
  racer: lazy(() => import('./racer/Racer.jsx')),
  adventure: lazy(() => import('./adventure/Adventure.jsx')),
  train: lazy(() => import('./train/Train.jsx')),
};
