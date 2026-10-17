// Checks the Biology for Engineers course.
//
//   src/components/academic/biology-for-engineers/content/*.md   one file per reader entry
//   src/components/academic/biology-for-engineers/figures/*.webp original course figures
//   public/documents/biology-for-engineers/*                      original question papers
//
// Checks that:
//   - every entry in content.js has its Markdown file, with a "# " title, and no file is unlisted
//   - every "::fig <name>" line names an existing figure, and every figure is used
//   - every solution ("### " block on a Solutions page) has a **Source:** label and an answer
//   - question-bank pages hold questions only: no answers, no Source or Review labels
//   - every question-bank paper links to an existing original file
//   - no em dashes in text written for the course (quoted exam wording is allowed)
// and writes stats.json (pages, figures, papers, questions, solutions) for the course card.
//
// Usage:
//   node scripts/check-biology-course.mjs                 check everything
//   node scripts/check-biology-course.mjs --write-stats   check, then write stats.json

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../src/components/academic/biology-for-engineers/', import.meta.url);
const CONTENT = new URL('content/', ROOT);
const FIGURES = new URL('figures/', ROOT);
const PAPERS_DIR = new URL('../public/documents/biology-for-engineers/', import.meta.url);
const STATS = new URL('stats.json', ROOT);

const writeStats = process.argv.includes('--write-stats');
const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);

// content.js uses import.meta.glob (Vite only), so read the entry list from its source.
const src = readFileSync(new URL('content.js', ROOT), 'utf8');
const sectionSlugs = [...src.matchAll(/\{ slug: '([a-z-]+)'/g)].map((m) => m[1]);
const paperRows = [...src.matchAll(/\{ id: '([a-z0-9-]+)', exam: '(\w+)', term: '([^']+)', file: '([^']+)' \}/g)].map((m) => ({
  id: m[1],
  exam: m[2],
  term: m[3],
  file: m[4],
}));
const files = [
  'introduction',
  ...['mid', 'final'].flatMap((g) => sectionSlugs.map((s) => `${g}-${s}`)),
  'qb-overview',
  ...paperRows.map((p) => `qb-${p.id}`),
];

const figureNames = new Set(readdirSync(FIGURES).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5)));
const used = new Set();
let solutions = 0;
let qbQuestions = 0;

const onDisk = readdirSync(CONTENT).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
for (const f of onDisk) if (!files.includes(f)) fail(`content/${f}.md`, 'not listed in content.js');

for (const name of files) {
  const where = `content/${name}.md`;
  if (!existsSync(new URL(`${name}.md`, CONTENT))) {
    fail(where, 'missing');
    continue;
  }
  const md = readFileSync(new URL(`${name}.md`, CONTENT), 'utf8').replace(/\r\n?/g, '\n');
  if (!/^# .+/m.test(md)) fail(where, 'missing "# <title>"');
  const lines = md.split('\n');

  lines.forEach((line, i) => {
    const m = line.match(/^::fig\s+([a-z0-9-]+)\s*\|/);
    if (m) {
      used.add(m[1]);
      if (!figureNames.has(m[1])) fail(`${where}:${i + 1}`, `unknown figure "${m[1]}"`);
    } else if (/^::fig/.test(line)) fail(`${where}:${i + 1}`, 'malformed ::fig line');
    // Em dashes only inside quoted exam wording (question-bank tables).
    if (line.includes('—') && !(name.startsWith('qb-') && line.startsWith('|'))) fail(`${where}:${i + 1}`, 'em dash');
  });

  if (name.endsWith('-solutions')) {
    let current = null;
    const check = () => {
      if (!current) return;
      if (!current.source) fail(where, `"${current.title}" has no **Source:** label`);
      if (!current.answer) fail(where, `"${current.title}" has no answer`);
    };
    for (const line of lines) {
      if (/^## /.test(line)) {
        check();
        current = null;
      } else if (/^### /.test(line)) {
        check();
        current = { title: line.slice(4).trim(), source: false, answer: false };
        solutions += 1;
      } else if (current) {
        if (/^\*\*Source:\*\*/.test(line)) current.source = true;
        else if (line.trim() && !/^\*\*(Suggestion|Review):\*\*/.test(line)) current.answer = true;
      }
    }
    check();
  }

  if (name.startsWith('qb-')) {
    if (/^### /m.test(md)) fail(where, 'question bank pages must not contain solution blocks');
    if (/\*\*(Source|Review):\*\*|^\*\*Answer|^Answer:/m.test(md)) fail(where, 'question bank pages hold questions only (found an answer label)');
    qbQuestions += lines.filter((l) => /^\| [a-z] \|/.test(l)).length;
  }
}

for (const name of figureNames) if (!used.has(name)) fail(`figures/${name}.webp`, 'not used on any page');

for (const p of paperRows) {
  if (!existsSync(new URL(p.file, PAPERS_DIR))) fail(`public/documents/biology-for-engineers/${p.file}`, 'missing original paper');
}

const stats = {
  pages: files.length,
  figures: figureNames.size,
  papers: paperRows.length,
  questions: qbQuestions,
  solutions,
};

console.log(
  `${stats.pages} pages, ${stats.figures} figures, ${stats.papers} papers (${stats.questions} questions), ${stats.solutions} solutions.`,
);

const next = `${JSON.stringify(stats, null, 2)}\n`;
if (writeStats) {
  if (failures.length) console.log('\nstats.json not written: fix the problems below first.');
  else {
    writeFileSync(STATS, next);
    console.log('stats.json written.');
  }
} else if (!existsSync(STATS) || readFileSync(STATS, 'utf8') !== next) {
  failures.push('stats.json is out of date: run with --write-stats');
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('All checks passed.');
