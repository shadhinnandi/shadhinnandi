// Figures from the course's class notes (figures/*.webp), referenced in the
// Markdown as src="figures/<name>.webp" or href="figures/<name>.webp".
// Vite emits each file with a hashed name; this maps the written path to the
// published URL. A reference to a missing figure is left unchanged and is
// reported by scripts/check-computer-security.mjs.

const urls = import.meta.glob('./figures/*.webp', { eager: true, query: '?url', import: 'default' });

export function resolveFigures(html) {
  return html.replace(/(src|href)="figures\/([^"]+)"/g, (match, attr, file) => {
    const url = urls[`./figures/${file}`];
    return url ? `${attr}="${url}"` : match;
  });
}
