// Page loaders for English II. The outline lives in outline.js; every page is
// one Markdown file in content/, loaded on demand.

export { ENTRIES, GROUPS, SLIDES } from './outline.js';

const pageFiles = import.meta.glob('./content/*.md', { query: '?raw', import: 'default' });

export async function loadPage(entry) {
  const load = pageFiles[`./content/${entry.file}.md`];
  if (!load) throw new Error(`Unknown page ${entry.file}`);
  return load();
}
