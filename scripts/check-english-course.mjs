// Checks the English II course.
//
//   src/components/academic/english-2/outline.js     entries and original files
//   src/components/academic/english-2/content/*.md   one file per reader entry
//   src/components/academic/english-2/vocab.js       150 vocabulary entries
//   public/documents/english-2/*                     original slides, samples and papers
//
// Checks that:
//   - every entry has its Markdown file with a "# " title, and no file is unlisted
//   - every :::block is closed and every model answer has an outline and an answer
//   - each lesson has its required number of models (paragraphs 4+, essays per type,
//     applications 3, emails 3) and every model paragraph is 150 to 200 words
//   - every midterm and final lesson ends with practice (except the overview pages)
//   - every slide key exists and every original file is present
//   - the past-paper topics appear only on the question bank pages
//   - vocabulary: 50 words per level, 150 distinct words, each with Bengali and a sentence
//   - no em dashes in course text
//
// Usage: node scripts/check-english-course.mjs

import { existsSync, readFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('../src/components/academic/english-2/', import.meta.url);
const CONTENT = new URL('content/', ROOT);
const DOCS = new URL('../public/documents/english-2/', import.meta.url);

const { ENTRIES, SLIDES } = await import(new URL('outline.js', ROOT));
const { VOCAB, LEVELS } = await import(new URL('vocab.js', ROOT));

const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);

// Model answers each lesson must have.
const MODELS = {
  'mid-descriptive-paragraph': 4,
  'mid-narrative-paragraph': 4,
  'mid-process-paragraph': 4,
  'mid-classification-paragraph': 4,
  'mid-cause-effect-paragraph': 4,
  'final-descriptive-essay': 3,
  'final-cause-effect-essay': 2,
  'final-argumentative-essay': 2,
  'final-compare-contrast-essay': 2,
  'final-application': 3,
  'final-email': 3,
};
const NO_PRACTICE = new Set(['mid-introduction', 'mid-structure', 'final-introduction', 'final-structure']);
// Past-paper topics: questions for the paper pages only, never lesson practice.
const PAST_TOPICS = [
  /a place where I feel peaceful/i,
  /organizing a successful event/i,
  /an experience that changed my perspective/i,
  /daily life communications? methods/i,
  /procrastination among university students/i,
  /part-time job vs\.? focusing on academics/i,
  /should animals be used for scientific research/i,
  /seminar on mental health awareness/i,
  /extension for returning borrowed books/i,
];

const files = ENTRIES.map((e) => e.file);
const onDisk = readdirSync(CONTENT).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
for (const f of onDisk) if (!files.includes(f)) fail(`content/${f}.md`, 'not listed in outline.js');
if (new Set(ENTRIES.map((e) => e.path)).size !== ENTRIES.length) fail('outline.js', 'duplicate paths');

let models = 0;
let practice = 0;
for (const entry of ENTRIES) {
  const where = `content/${entry.file}.md`;
  if (!existsSync(new URL(`${entry.file}.md`, CONTENT))) {
    fail(where, 'missing');
    continue;
  }
  const md = readFileSync(new URL(`${entry.file}.md`, CONTENT), 'utf8').replace(/\r\n?/g, '\n');
  if (!/^# .+/m.test(md)) fail(where, 'missing "# <title>"');
  if (md.includes('—')) fail(where, 'em dash');

  // Blocks
  const blocks = [];
  let open = null;
  md.split('\n').forEach((line, i) => {
    const m = line.match(/^:::(model|letter|practice|solutions)\b\s*(.*)$/);
    if (m) {
      if (open) fail(`${where}:${i + 1}`, `block opened inside "${open.title}"`);
      open = { type: m[1], title: m[2], parts: new Set(), words: 0, inAnswer: false };
    } else if (/^:::\s*$/.test(line)) {
      if (!open) fail(`${where}:${i + 1}`, 'stray :::');
      else blocks.push(open);
      open = null;
    } else if (open) {
      const p = line.match(/^--- (\w+)/);
      if (p) {
        open.parts.add(p[1]);
        open.inAnswer = p[1] === 'answer';
      } else if (open.inAnswer) open.words += line.split(/\s+/).filter(Boolean).length;
    }
  });
  if (open) fail(where, `unclosed block "${open.title}"`);

  const modelBlocks = blocks.filter((b) => b.type === 'model' || b.type === 'letter');
  models += modelBlocks.length;
  for (const b of modelBlocks) {
    if (!b.parts.has('outline') || !b.parts.has('answer')) fail(where, `model "${b.title}" needs an outline and an answer`);
    if (entry.file.endsWith('-paragraph') && (b.words < 150 || b.words > 200)) fail(where, `"${b.title}" is ${b.words} words (150 to 200)`);
    if (entry.file.endsWith('-essay') && b.words < 350) fail(where, `essay "${b.title}" is only ${b.words} words`);
  }
  if (MODELS[entry.file] !== undefined && modelBlocks.length < MODELS[entry.file])
    fail(where, `${modelBlocks.length} models, needs ${MODELS[entry.file]}`);

  const practiceBlocks = blocks.filter((b) => b.type === 'practice');
  practice += practiceBlocks.length;
  if ((entry.group === 'mid' || entry.group === 'final') && !NO_PRACTICE.has(entry.file) && !practiceBlocks.length)
    fail(where, 'no practice at the end of the lesson');

  if (entry.group === 'qb' && entry.file !== 'qb-overview' && !blocks.some((b) => b.type === 'solutions'))
    fail(where, 'question paper page needs a :::solutions block');
  if (entry.file === 'qb-overview' && blocks.length) fail(where, 'the question bank overview holds questions only');

  if (entry.group !== 'qb') for (const re of PAST_TOPICS) if (re.test(md)) fail(where, `past-paper topic in a lesson: ${re}`);

  for (const k of entry.slides) if (!SLIDES[k]) fail(where, `unknown slide key "${k}"`);
  for (const m of md.matchAll(/^::doc\s+([\w-]+)/gm)) if (!SLIDES[m[1]]) fail(where, `unknown ::doc key "${m[1]}"`);
}

for (const [k, s] of Object.entries(SLIDES)) if (!existsSync(new URL(s.file, DOCS))) fail(`public/documents/english-2/${s.file}`, `missing (${k})`);
const usedSlides = new Set(ENTRIES.flatMap((e) => e.slides));
for (const k of Object.keys(SLIDES)) if (!usedSlides.has(k)) fail('outline.js', `slide "${k}" is not linked from any page`);

// Vocabulary
const all = [];
for (const { id } of LEVELS) {
  const words = VOCAB[id] ?? [];
  if (words.length !== 50) fail(`vocab.js ${id}`, `${words.length} words, needs 50`);
  for (const [w, bn, sentence] of words) {
    all.push(w.toLowerCase());
    if (!/[ঀ-৿]/.test(bn ?? '')) fail(`vocab.js ${w}`, 'Bengali meaning missing');
    if (!sentence || !/[.?!]$/.test(sentence)) fail(`vocab.js ${w}`, 'example sentence missing or unfinished');
    else if (!sentence.toLowerCase().includes(w.toLowerCase().slice(0, Math.min(w.length, 5)))) fail(`vocab.js ${w}`, 'sentence does not use the word');
  }
}
const dupes = all.filter((w, i) => all.indexOf(w) !== i);
if (dupes.length) fail('vocab.js', `duplicates: ${dupes.join(', ')}`);

console.log(
  `${ENTRIES.length} pages, ${models} model answers, ${practice} practice tasks, ${all.length} vocabulary words (${new Set(all).size} distinct), ${Object.keys(SLIDES).length} original files.`,
);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('All checks passed.');
