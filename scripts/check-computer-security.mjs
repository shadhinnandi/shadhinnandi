// Checks the Computer Security course.
//
//   content/topics/<id>.md      one file per topic listed in content.js (00 to 16)
//   content/papers/<n>-<id>.md  previous final papers: every question has its
//                               marks, related topics, the question text and a
//                               solution (see papers.js for the format)
//
// Every ```calc block is checked step by step: each line that is pure
// arithmetic (numbers, + − × /, powers, mod) must be congruent to the line
// before it, modulo the "mod N" of the line. Lines with letters (formulas
// such as C = M^e mod n) are skipped. Also rejects em dashes in the content,
// and checks figures: every figures/<file> reference exists, every file in
// figures/ is used, every <img> has alt text and every <figure> a caption.
//
// Usage:
//   node scripts/check-computer-security.mjs                 check everything
//   node scripts/check-computer-security.mjs --write-stats   check, then write stats.json
//
// Not part of the site build.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { parsePaper } from '../src/components/academic/computer-security/papers.js';

const ROOT = new URL('../src/components/academic/computer-security/', import.meta.url);
const CONTENT = new URL('content/', ROOT);
const STATS = new URL('stats.json', ROOT);
const TOPIC_IDS = Array.from({ length: 17 }, (_, i) => String(i).padStart(2, '0'));
const FIGURES = new URL('figures/', ROOT);
const figureFiles = existsSync(FIGURES) ? readdirSync(FIGURES).filter((f) => !f.startsWith('.')) : [];
const usedFigures = new Set();

const writeStats = process.argv.includes('--write-stats');
const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);
const read = (rel) => readFileSync(new URL(rel, CONTENT), 'utf8').replace(/\r\n?/g, '\n');

// ---------- arithmetic in ```calc blocks ----------

const mod = (a, m) => ((a % m) + m) % m;

function inverse(a, m) {
  let [r0, r1] = [mod(a, m), m];
  let [s0, s1] = [1n, 0n];
  while (r1 !== 0n) {
    const q = r0 / r1;
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
  }
  if (r0 !== 1n) throw new Error(`${a} has no inverse mod ${m}`);
  return mod(s0, m);
}

function powMod(b, e, m) {
  if (m == null) return b ** e;
  let result = 1n;
  let base = mod(b, m);
  while (e > 0n) {
    if (e & 1n) result = (result * base) % m;
    base = (base * base) % m;
    e >>= 1n;
  }
  return result;
}

function tokenize(s) {
  const tokens = [];
  const re = /\s*(\d+|mod\b|[()+×*/^{}]|[−-])/y;
  let i = 0;
  s = s.trim();
  while (i < s.length) {
    re.lastIndex = i;
    const m = re.exec(s);
    if (!m) return null; // letters or other symbols: not pure arithmetic
    tokens.push(m[1] === '−' ? '-' : m[1] === '*' ? '×' : m[1]);
    i = re.lastIndex;
    while (s[i] === ' ') i += 1;
  }
  return tokens;
}

/** Evaluate an arithmetic expression; `m` is the modulus of its line (or null). */
function evaluate(src, m) {
  const t = tokenize(src);
  if (!t || t.length === 0) return null;
  let p = 0;
  const peek = () => t[p];
  const next = () => t[p++];
  const expect = (x) => {
    if (next() !== x) throw new Error(`expected ${x}`);
  };

  function expr() {
    let v = term();
    while (peek() === '+' || peek() === '-') v = next() === '+' ? v + term() : v - term();
    return v;
  }
  function term() {
    let v = unary();
    for (;;) {
      const op = peek();
      if (op === '×') {
        next();
        v *= unary();
      } else if (op === '/') {
        next();
        const d = unary();
        if (d !== 0n && v % d === 0n) v /= d;
        else if (m != null) v = mod(v * inverse(d, m), m);
        else throw new Error('division without a modulus');
      } else if (op === 'mod') {
        next();
        v = mod(v, unary());
      } else return v;
    }
  }
  function unary() {
    if (peek() === '-') {
      next();
      return -unary();
    }
    return power();
  }
  function power() {
    let base = atom();
    while (peek() === '^') {
      next();
      let e;
      if (peek() === '{') {
        next();
        e = expr();
        expect('}');
      } else e = atom();
      if (e < 0n) {
        if (m == null) throw new Error('negative power without a modulus');
        base = powMod(inverse(base, m), -e, m);
      } else base = powMod(base, e, m);
    }
    return base;
  }
  function atom() {
    const tok = next();
    if (tok === '(') {
      const v = expr();
      expect(')');
      return v;
    }
    if (/^\d+$/.test(tok || '')) return BigInt(tok);
    throw new Error(`unexpected "${tok}"`);
  }

  const v = expr();
  if (p !== t.length) throw new Error(`unexpected "${t[p]}"`);
  return v;
}

/** The modulus of a calc line: its single numeric "mod N", or null if it has none. */
function lineModulus(line) {
  const found = [...new Set([...line.matchAll(/mod\s+(\d+)/g)].map((x) => x[1]))];
  if (found.length > 1) return undefined; // mixed moduli: do not check this line
  return found.length ? BigInt(found[0]) : null;
}

let checkedSteps = 0;

function checkCalc(body, where) {
  let chain = null; // { value, m }
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('# ')) {
      chain = null;
      continue;
    }
    const main = line.replace(/\s*\[[^\]]+\]$/, '');
    const result = main.startsWith('∴');
    const parts = main.replace(/^∴\s*/, '').split('=');
    const lhsEmpty = parts[0].trim() === '';
    let m = lineModulus(main);
    if (m === undefined) {
      chain = null;
      continue;
    }
    const continues = lhsEmpty || result;
    if (m === null && continues && chain) m = chain.m;
    if (!continues || (chain && chain.m !== m && m !== null && chain.m !== null)) chain = null;

    for (const part of parts) {
      if (part.trim() === '') continue;
      let v;
      try {
        v = evaluate(part, m);
      } catch (e) {
        fail(where, `cannot evaluate "${part.trim()}" in "${line}": ${e.message}`);
        chain = null;
        continue;
      }
      if (v === null) continue; // a formula with letters
      if (chain) {
        checkedSteps += 1;
        const same = m != null ? mod(v - chain.value, m) === 0n : v === chain.value;
        if (!same) fail(where, `step "${line}" gives ${v}, previous step gives ${chain.value}${m != null ? ` (mod ${m})` : ''}`);
      }
      chain = { value: v, m };
    }
  }
}

function checkMarkdown(md, where) {
  let calcs = 0;
  for (const m of md.matchAll(/^```calc[^\n]*\n([\s\S]*?)^```[ \t]*$/gm)) {
    calcs += 1;
    const line = md.slice(0, m.index).split('\n').length;
    checkCalc(m[1], `${where}:${line}`);
  }
  // ```seq: every line after the first must name known parties.
  for (const m of md.matchAll(/^```seq[^\n]*\n([\s\S]*?)^```[ \t]*$/gm)) {
    const lines = m[1].split('\n').map((l) => l.trim()).filter(Boolean);
    const lanes = (lines.shift() || '').split('|').map((l) => l.trim());
    const line = md.slice(0, m.index).split('\n').length;
    for (const l of lines) {
      const msg = l.match(/^(.+?)\s*->\s*(.+?):/);
      const ok = msg ? lanes.includes(msg[1].trim()) && lanes.includes(msg[2].trim()) : lanes.includes(l.split(':')[0].trim());
      if (!ok) fail(`${where}:${line}`, `seq line "${l}" does not name parties from "${lanes.join(' | ')}"`);
    }
  }
  // Figures.
  for (const m of md.matchAll(/(?:src|href)="figures\/([^"]+)"/g)) {
    usedFigures.add(m[1]);
    if (!figureFiles.includes(m[1])) fail(where, `missing figure figures/${m[1]}`);
  }
  for (const m of md.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]+"/.test(m[0])) fail(where, `image without alt text: ${m[0].slice(0, 80)}`);
  }
  for (const m of md.matchAll(/<figure\b[\s\S]*?<\/figure>/g)) {
    if (!/<figcaption>[\s\S]+?<\/figcaption>/.test(m[0])) fail(where, 'figure without a caption');
  }
  md.split('\n').forEach((l, i) => {
    if (l.includes('—')) fail(`${where}:${i + 1}`, 'em dash');
  });
  return calcs;
}

// ---------- topics ----------

let calculations = 0;
const topicFiles = existsSync(new URL('topics/', CONTENT)) ? readdirSync(new URL('topics/', CONTENT)) : [];
for (const id of TOPIC_IDS) {
  if (!topicFiles.includes(`${id}.md`)) {
    fail(`topics/${id}.md`, 'missing');
    continue;
  }
  const md = read(`topics/${id}.md`);
  if (!/^# .+/m.test(md)) fail(`topics/${id}.md`, 'missing "# <title>"');
  calculations += checkMarkdown(md, `topics/${id}.md`);
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
  const id = file.match(/^\d+-(.+)\.md$/)?.[1];
  if (!id) {
    fail(`papers/${file}`, 'file name must be <n>-<id>.md');
    continue;
  }
  const name = id
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
  const md = read(`papers/${file}`);
  const paper = parsePaper(md, id);
  paper.errors.forEach((e) => fail(`papers/${file}`, e));
  if (paper.title !== name) fail(`papers/${file}`, `title "${paper.title}" should be "${name}"`);
  if (paper.questions.length === 0) fail(`papers/${file}`, 'no questions');
  calculations += checkMarkdown(md, `papers/${file}`);

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

for (const f of figureFiles) if (!usedFigures.has(f)) fail(`figures/${f}`, 'not used by any topic or paper');

// ---------- report ----------

const stats = {
  topics: TOPIC_IDS.length,
  papers: paperFiles.length,
  questions,
  marks,
  calculations,
  perPaper,
  asked: Object.fromEntries(Object.keys(asked).sort().map((k) => [k, asked[k]])),
};

console.log(
  `${stats.topics} topics, ${stats.papers} papers, ${questions} questions (${marks} marks), ` +
    `${calculations} calc blocks, ${checkedSteps} arithmetic steps checked.`,
);
for (const id of TOPIC_IDS) {
  const list = (asked[id] || []).map((q) => `${q.name} ${q.number}`).join(', ');
  console.log(`  ${id}  ${list || 'not in the supplied papers'}`);
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
  console.log(`\n${failures.length} problem(s):`);
  failures.forEach((f) => console.log(`  ${f}`));
  process.exit(1);
}
console.log('All checks passed.');
