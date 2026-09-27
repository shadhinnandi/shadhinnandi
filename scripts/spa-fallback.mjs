// GitHub Pages serves 404.html for unknown paths. Copying the app shell there
// lets deep links such as /projects/vortex-arena load the React router.
import { copyFileSync, existsSync } from 'node:fs';

if (existsSync('dist/index.html')) {
  copyFileSync('dist/index.html', 'dist/404.html');
  console.log('spa-fallback: dist/404.html written');
}
