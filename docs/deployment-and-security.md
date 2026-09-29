# Deployment and security notes

The site is a static React (Vite) build. There is no backend, no form, no
database and no third-party script: every file is served from the same origin.

## Deploy targets

| Target | Build | Headers |
|---|---|---|
| Vercel | `npm run build` (base `/`) | `vercel.json`: CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, long-lived caching for hashed assets, SPA rewrite |
| GitHub Pages | `.github/workflows/deploy.yml` (base `/<repo>/`) | GitHub Pages cannot send custom headers. The CSP is also injected as a `<meta>` tag at build time, which covers script/style/image sources but not framing. Enable **Settings → Pages → Enforce HTTPS**. |

Optional: set `SITE_URL` (the public canonical address, including any sub-path,
e.g. `https://shadhinnandi.github.io/shadhinnandi/`) as a build environment
variable. The build then adds a canonical link, absolute Open Graph image URL
and `sitemap.xml`. Without it those are omitted rather than emitted wrong.

## What is in place

- **Content-Security-Policy**: `'self'` only for scripts, styles, fonts, images
  and connections; `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`;
  on Vercel also `frame-ancestors 'none'` and `upgrade-insecure-requests`. The
  policy lives in `vite.config.js` (meta) and `vercel.json` (header); keep them
  in sync. It is not applied to `/documents/` and `/resume/` so browser PDF
  viewers keep working.
- **No inline scripts or styles** in the HTML, so the CSP needs no
  `'unsafe-inline'`. The theme bootstrap is `public/theme-init.js`.
- **No production source maps** (`build.sourcemap: false`).
- **External links** open with `rel="noopener noreferrer"` via `ExternalLink`.
- **No HTML injection**: no `dangerouslySetInnerHTML`; all content is static data
  rendered as text by React.
- **No secrets**: the project uses no API keys. Any `VITE_*` variable is
  compiled into public JavaScript, so never put a secret in one.
- `npm audit`: 0 known vulnerabilities at the time of the redesign.

## What cannot be hidden

Everything the browser downloads (HTML, JavaScript, CSS, images, and the PDFs
in `public/`) is public and inspectable. Disabling right-click or DevTools does
not change that and is deliberately not done. Treat every file under `public/`
(resume, certificates, recommendation letter, reports) as published.

## Suggested next steps

- Pin GitHub Actions to commit SHAs and enable Dependabot for npm and Actions.
- If a custom domain is added, submit it to the HSTS preload list only after
  confirming every subdomain serves HTTPS.
