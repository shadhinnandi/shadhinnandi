import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH lets the same build run at a domain root ("/", Vercel) or under
// a GitHub Pages project path such as "/shadhinnandi/".
const base = process.env.BASE_PATH || '/';

// SITE_URL (optional, public): the canonical address of the deployed site,
// e.g. https://example.com/. When set, the build adds a canonical link,
// absolute Open Graph URLs and a sitemap. Nothing secret belongs here.
const siteUrl = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/?$/, '/') : null;

// Content-Security-Policy for the built page. Everything is self-hosted, so
// the policy only allows this origin. Delivered as a <meta> tag so it also
// applies on GitHub Pages, which cannot send custom headers; vercel.json sends
// the same policy as a header plus the directives a <meta> cannot carry
// (frame-ancestors, upgrade-insecure-requests). Keep the two in sync.
export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

const staticRoutes = ['', 'projects', 'research', 'experience', 'about', 'skills', 'achievements', 'academic', 'contact'];

function projectSlugs() {
  const source = readFileSync(new URL('./src/data/projects.js', import.meta.url), 'utf8');
  return [...source.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((m) => `projects/${m[1]}`);
}

function courseSlugs() {
  const source = readFileSync(new URL('./src/data/courses.js', import.meta.url), 'utf8');
  return [...source.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((m) => `academic/${m[1]}`);
}

function transformHtml(html) {
  let out = html.replace(
    '<meta charset="UTF-8" />',
    `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
  );
  if (siteUrl) {
    out = out
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${siteUrl}og-image.png$2`)
      .replace('</title>', `</title>\n    <link rel="canonical" href="${siteUrl}" />\n    <meta property="og:url" content="${siteUrl}" />`);
  } else {
    // Open Graph images must be absolute URLs; without a known site URL
    // the tag would be useless, so leave it out.
    out = out.replace(/\s*<meta property="og:image[^>]*>/g, '');
  }
  return out;
}

/** Build-only: CSP meta, canonical/OG URLs, robots.txt and sitemap.xml. */
function siteMeta() {
  return {
    name: 'site-meta',
    apply: 'build',
    transformIndexHtml: {
      order: 'post', // after Vite has rewritten asset URLs for `base`
      handler: transformHtml,
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /'];
      if (siteUrl) {
        robots.push(`Sitemap: ${siteUrl}sitemap.xml`);
        const urls = [...staticRoutes, ...projectSlugs(), ...courseSlugs()]
          .map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`)
          .join('\n');
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        });
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` });
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), siteMeta()],
  build: {
    // Do not publish source maps: they would expose the original source tree.
    // (The shipped JavaScript is still readable; that is how the web works.)
    sourcemap: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Content-hashed names only, so file names do not mirror the source tree.
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: (info) => (/\.css$/.test(info.names?.[0] || '') ? 'assets/[hash][extname]' : 'assets/[name]-[hash][extname]'),
        manualChunks(id) {
          // Markdown and syntax highlighting are only used by courses: keep
          // them in the lazily loaded course chunk, not the shared vendor one.
          if (/node_modules[\\/](marked|highlight\.js)[\\/]/.test(id)) return undefined;
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
