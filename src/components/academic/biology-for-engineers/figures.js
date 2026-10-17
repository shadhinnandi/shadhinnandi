import dims from './figures.json';

// Original course figures (figures/*.webp): images taken from the lecture
// slides, whole final-lecture slides rendered from the PDFs, figures from the
// supplied solutions, and two diagrams from the supplied midterm answer scan.
//
// In the Markdown a figure is one line:
//
//   ::fig <name> | <caption> | <source>
//
// which becomes a captioned image with its size set (no layout shift) and an
// "Open full size" link. Vite emits each file with a hashed name; this maps the
// name to the published URL. scripts/check-biology-course.mjs reports names
// that do not exist.

const urls = import.meta.glob('./figures/*.webp', { eager: true, query: '?url', import: 'default' });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function figureUrl(name) {
  return urls[`./figures/${name}.webp`] || null;
}

export function expandFigures(md) {
  return md.replace(/^::fig\s+([a-z0-9-]+)\s*\|\s*([^|\n]*?)\s*(?:\|\s*([^\n]*?))?\s*$/gm, (line, name, caption, source) => {
    const url = figureUrl(name);
    if (!url) return line;
    const [w, h] = dims[name] || [];
    const size = w ? ` width="${w}" height="${h}"` : '';
    const src = source ? ` <span class="bio-fig-source">${esc(source)}</span>` : '';
    return (
      `<figure class="csec-figure csec-figure--image"><img src="${url}" alt="${esc(caption)}"${size} loading="lazy" decoding="async">` +
      `<figcaption>${esc(caption)}${src}<a href="${url}" target="_blank" rel="noopener">Open full size</a></figcaption></figure>`
    );
  });
}
