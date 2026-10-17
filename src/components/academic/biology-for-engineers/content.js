// Course outline and content loaders for Biology for Engineers (BIO 3105).
// Every page is one Markdown file in content/, loaded on demand. Pages are
// read in this order: the general introduction, then the midterm and final
// sections (introduction, slides, topics, slide figures, suggestions,
// solutions), then the question bank (questions only, no answers).

export const GROUPS = [
  { id: 'start', label: 'Start here' },
  { id: 'mid', label: 'Midterm preparation' },
  { id: 'final', label: 'Final preparation' },
  { id: 'qb', label: 'Question bank' },
];

const SECTION = [
  { slug: 'introduction', name: 'Introduction' },
  { slug: 'slides', name: 'Lecture Slides' },
  { slug: 'topics', name: 'Main Topics' },
  { slug: 'figures', name: 'Original Slide Figures' },
  { slug: 'suggestions', name: 'Suggestions' },
  { slug: 'solutions', name: 'Solutions', layout: 'qa' },
];

const exam = (group, letter, label) =>
  SECTION.map((s, i) => ({
    group,
    idx: `${letter}${i + 1}`,
    name: `${label} ${s.name}`,
    short: s.name,
    file: `${group}-${s.slug}`,
    path: `${group}/${s.slug}`,
    layout: s.layout || 'page',
    kicker: label,
  }));

/** Previous papers in the question bank, oldest first. `file` is the original in public/documents. */
export const PAPERS = [
  { id: 'mid-spring-2025', exam: 'Midterm', term: 'Spring 2025', file: 'mid-spring-2025.pdf' },
  { id: 'mid-summer-2025', exam: 'Midterm', term: 'Summer 2025', file: 'mid-summer-2025.pdf' },
  { id: 'mid-fall-2025', exam: 'Midterm', term: 'Fall 2025', file: 'mid-fall-2025.pdf' },
  { id: 'mid-spring-2026', exam: 'Midterm', term: 'Spring 2026', file: 'mid-spring-2026.pdf' },
  { id: 'mid-summer-2026', exam: 'Midterm', term: 'Summer 2026', file: 'mid-summer-2026.jpg' },
  { id: 'final-summer-2025', exam: 'Final', term: 'Summer 2025', file: 'final-summer-2025.pdf' },
  { id: 'final-fall-2025', exam: 'Final', term: 'Fall 2025', file: 'final-fall-2025.pdf' },
  { id: 'final-spring-2026', exam: 'Final', term: 'Spring 2026', file: 'final-spring-2026.pdf' },
  { id: 'final-summer-2026', exam: 'Final', term: 'Summer 2026', file: 'final-summer-2026.jpg' },
];

/** Everything the reader can show, in reading order. */
export const ENTRIES = [
  { group: 'start', idx: '00', name: 'General Introduction', short: 'General Introduction', file: 'introduction', path: 'introduction', layout: 'page', kicker: 'Course' },
  ...exam('mid', 'M', 'Midterm'),
  ...exam('final', 'F', 'Final'),
  { group: 'qb', idx: 'QB', name: 'Question Bank', short: 'Overview', file: 'qb-overview', path: 'questions', layout: 'page', kicker: 'Question bank' },
  ...PAPERS.map((p, i) => ({
    group: 'qb',
    idx: `Q${i + 1}`,
    name: `${p.exam} · ${p.term}`,
    short: `${p.exam} · ${p.term}`,
    file: `qb-${p.id}`,
    path: `questions/${p.id}`,
    layout: 'page',
    kicker: `Previous ${p.exam.toLowerCase()} paper`,
    paper: p,
  })),
];

const pageFiles = import.meta.glob('./content/*.md', { query: '?raw', import: 'default' });

export async function loadPage(entry) {
  const load = pageFiles[`./content/${entry.file}.md`];
  if (!load) throw new Error(`Unknown page ${entry.file}`);
  return load();
}
