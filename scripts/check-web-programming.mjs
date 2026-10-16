// Checks the Web Programming course.
//
//   content/topics/<id>.md        one file per topic listed in content.js (00 to 19)
//   content/papers/<code>-<id>.md final exam papers: every question has its marks,
//                                 related topics, the question text and an answer
//                                 (format: src/components/academic/computer-security/papers.js)
//
// Also checks:
//   - paper titles and total marks match the file name and the questions
//   - every topic id used by a question exists
//   - forms post their data: no $_GET, and every <form> in the content has method="POST"
//   - no em dashes (site style)
// and counts code blocks for the course page.
//
// Usage:
//   node scripts/check-web-programming.mjs                 check everything
//   node scripts/check-web-programming.mjs --write-stats   check, then write stats.json
//
// Not part of the site build.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { parsePaper } from '../src/components/academic/computer-security/papers.js';

const ROOT = new URL('../src/components/academic/web-programming/', import.meta.url);
const CONTENT = new URL('content/', ROOT);
const STATS = new URL('stats.json', ROOT);
const TOPIC_IDS = Array.from({ length: 20 }, (_, i) => String(i).padStart(2, '0'));
const SEASONS = { 1: 'Spring', 2: 'Summer', 3: 'Fall' };

const writeStats = process.argv.includes('--write-stats');
const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);
const read = (rel) => readFileSync(new URL(rel, CONTENT), 'utf8').replace(/\r\n?/g, '\n');

function checkMarkdown(md, where) {
  let blocks = 0;
  let open = null;
  md.split('\n').forEach((l, i) => {
    const fence = l.match(/^```(\S*)/);
    if (fence) {
      if (open === null) {
        open = i + 1;
        blocks += 1;
      } else open = null;
    }
    if (l.includes('—')) fail(`${where}:${i + 1}`, 'em dash');
    if (/\$_GET\b/.test(l)) fail(`${where}:${i + 1}`, 'uses $_GET (forms in this course post with POST)');
    if (/method\s*=\s*["']?get/i.test(l)) fail(`${where}:${i + 1}`, 'form uses method="GET"');
    if (/<form\b/i.test(l) && !/method\s*=\s*["']post["']/i.test(l)) fail(`${where}:${i + 1}`, '<form> without method="POST"');
  });
  if (open !== null) fail(where, `code fence opened at line ${open} is never closed`);
  return blocks;
}

let codeBlocks = 0;

// ---------- topics ----------

const topicFiles = existsSync(new URL('topics/', CONTENT)) ? readdirSync(new URL('topics/', CONTENT)) : [];
for (const id of TOPIC_IDS) {
  if (!topicFiles.includes(`${id}.md`)) {
    fail(`topics/${id}.md`, 'missing');
    continue;
  }
  const md = read(`topics/${id}.md`);
  if (!/^# .+/m.test(md)) fail(`topics/${id}.md`, 'missing "# <title>"');
  codeBlocks += checkMarkdown(md, `topics/${id}.md`);
}
for (const f of topicFiles) if (!TOPIC_IDS.includes(f.replace(/\.md$/, ''))) fail(`topics/${f}`, 'not listed in TOPICS');

// ---------- papers ----------

const paperFiles = readdirSync(new URL('papers/', CONTENT))
  .filter((f) => f.endsWith('.md'))
  .sort();
const asked = {};
const perPaper = {};
let questions = 0;
let marks = 0;

for (const file of paperFiles) {
  const m = file.match(/^(\d{3})-([a-z0-9-]+)\.md$/);
  if (!m) {
    fail(`papers/${file}`, 'name must be <trimester code>-<id>.md');
    continue;
  }
  const [, code, id] = m;
  const set = id.match(/set-([a-z])$/);
  const name = `${SEASONS[code[2]]} 20${code.slice(0, 2)}${set ? ` Set ${set[1].toUpperCase()}` : ''}`;
  const md = read(`papers/${file}`);
  const paper = parsePaper(md, id);
  for (const e of paper.errors) fail(`papers/${file}`, e);
  if (paper.title !== `${name} (${code})`) fail(`papers/${file}`, `title "${paper.title}" should be "${name} (${code})"`);
  if (paper.questions.length === 0) fail(`papers/${file}`, 'no questions');
  codeBlocks += checkMarkdown(md, `papers/${file}`);

  const total = paper.questions.reduce((n, q) => n + q.marks, 0);
  const stated = Number(paper.info.find((i) => i.label === 'Total marks')?.value.match(/\d+/)?.[0]);
  if (stated && stated !== total) fail(`papers/${file}`, `marks add up to ${total}, paper says ${stated}`);
  perPaper[id] = { questions: paper.questions.length, marks: total };
  questions += paper.questions.length;
  marks += total;

  for (const q of paper.questions) {
    for (const t of q.topics) {
      if (!TOPIC_IDS.includes(t)) fail(`papers/${file}`, `${q.number}: unknown topic "${t}"`);
      (asked[t] ||= []).push({ paper: id, name, number: q.number, marks: q.marks, id: q.id });
    }
  }
}

// ---------- report ----------

const stats = {
  topics: TOPIC_IDS.length,
  papers: paperFiles.length,
  questions,
  marks,
  codeBlocks,
  perPaper,
  asked: Object.fromEntries(Object.keys(asked).sort().map((k) => [k, asked[k]])),
};

console.log(`${stats.topics} topics, ${stats.papers} papers, ${questions} questions (${marks} marks), ${codeBlocks} code blocks.`);
for (const id of TOPIC_IDS) {
  const list = (asked[id] || []).map((q) => `${q.name} Q${q.number}`).join(', ');
  console.log(`  ${id}  ${list || 'not in the papers'}`);
}

const next = `${JSON.stringify(stats, null, 2)}\n`;
if (writeStats) {
  if (failures.length) console.log('\nstats.json not written: fix the problems below first.');
  else {
    writeFileSync(STATS, next);
    console.log('\nstats.json written.');
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
