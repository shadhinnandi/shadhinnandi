// Checks the Data Structures and Algorithms I course.
//
//   content/lessons/<id>.md    one lesson per module: required sections, valid
//                              topic:/problem:/page: links; every complete C++
//                              program (a ```cpp block with main) is compiled,
//                              and run when **Input:** / **Output:** blocks follow it
//   content/problems/<id>.md   at least 5 Easy, 5 Medium and 5 Hard problems per
//                              topic, every required section, ids that match the
//                              module and difficulty
//   content/problems/completion.md   20 to 30 completion challenges
//   content/pages/*.md         lab, interview and coverage pages (links checked)
//
// Every solution is compiled with
//     clang++ -std=c++17 -Wall -Wextra -Wshadow -Werror -fsanitize=address,undefined
// then run on its sample and every test; standard output must match exactly,
// except for trailing spaces and trailing blank lines. Results are cached by
// source and cases (in the system temp folder), so reruns are fast.
//
// Usage:
//   node scripts/check-dsa-course.mjs                 everything
//   node scripts/check-dsa-course.mjs 07 16A          only these modules' programs
//                                                     (structure is always checked)
//   node scripts/check-dsa-course.mjs --write-index   full check, then write problem-index.json
//   --allow-pending                                  accept missing files while the course is being written
//
// Needs clang++ (or g++) with C++17. Not part of the site build.

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus, tmpdir } from 'node:os';
import { join } from 'node:path';
import { DIFFICULTIES, MIN_PER_DIFFICULTY, MODULES, NO_OWN_PROBLEMS, PAGES, parseProblemId } from '../src/components/academic/dsa-1/outline.js';
import { REQUIRED_SECTIONS, blocks, parseProblemFile } from '../src/components/academic/dsa-1/problems.js';

const ROOT = new URL('../src/components/academic/dsa-1/', import.meta.url);
const CONTENT = new URL('content/', ROOT);
const INDEX = new URL('problem-index.json', ROOT);

const CXX = process.env.CXX || 'clang++';
const FLAGS = ['-std=c++17', '-O1', '-g', '-Wall', '-Wextra', '-Wshadow', '-Werror', '-fsanitize=address,undefined', '-fno-sanitize-recover=all'];
const POOL = Number(process.env.DSA_CHECK_JOBS) || Math.max(2, Math.min(8, cpus().length - 1));
const RUN_TIMEOUT = 20000;
const CACHE = join(tmpdir(), 'dsa-check-cache');
mkdirSync(CACHE, { recursive: true });

const args = process.argv.slice(2);
const writeIndex = args.includes('--write-index');
const targets = args.filter((a) => !a.startsWith('--'));
const full = targets.length === 0;
const wantRun = (topic) => full || targets.includes(topic);

const failures = [];
const pending = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);
const missing = (where) => pending.push(where);
const allowPending = args.includes('--allow-pending');
const read = (rel) => {
  const url = new URL(rel, CONTENT);
  return existsSync(url) ? readFileSync(url, 'utf8').replace(/\r\n?/g, '\n') : null;
};

const norm = (s) =>
  (s ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');

function diff(expected, actual) {
  const e = expected.split('\n');
  const a = actual.split('\n');
  for (let i = 0; i < Math.max(e.length, a.length); i += 1) {
    if (e[i] !== a[i]) return `line ${i + 1}: expected ${JSON.stringify(e[i])}, got ${JSON.stringify(a[i])}`;
  }
  return '';
}

// ---------------------------------------------------------------------------
// Compile and run

const programs = []; // { where, source, cases: [{ label, input, output }] }

function sh(cmd, argv, opts = {}) {
  return new Promise((resolve) => {
    const child = execFile(cmd, argv, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, ...opts }, (error, stdout, stderr) =>
      resolve({ error, stdout, stderr, code: error ? (error.code ?? 1) : 0, killed: error?.killed }),
    );
    if (opts.input != null) {
      child.stdin.on('error', () => {});
      child.stdin.end(opts.input);
    }
  });
}

async function runProgram(p) {
  const key = createHash('sha256').update(JSON.stringify([FLAGS, p.source, p.cases])).digest('hex').slice(0, 24);
  const ok = join(CACHE, `${key}.ok`);
  if (existsSync(ok)) return [];
  const errs = [];
  const dir = join(CACHE, key);
  mkdirSync(dir, { recursive: true });
  const src = join(dir, 'main.cpp');
  const bin = join(dir, 'main');
  writeFileSync(src, `${p.source}\n`);
  const c = await sh(CXX, [...FLAGS, src, '-o', bin]);
  if (c.code !== 0) return [`compile failed:\n${(c.stderr || c.stdout).trim().split('\n').slice(0, 14).join('\n')}`];
  for (const k of p.cases) {
    const r = await sh(bin, [], {
      cwd: dir,
      input: k.input == null ? '' : `${k.input}\n`,
      timeout: RUN_TIMEOUT,
      env: { ...process.env, ASAN_OPTIONS: 'detect_leaks=0' },
    });
    if (r.killed) {
      errs.push(`${k.label}: timed out after ${RUN_TIMEOUT / 1000}s`);
      continue;
    }
    if (r.code !== 0) errs.push(`${k.label}: exit status ${r.code}${r.stderr ? `\n${r.stderr.trim().split('\n').slice(0, 8).join('\n')}` : ''}`);
    else if (r.stderr && r.stderr.trim()) errs.push(`${k.label}: wrote to standard error: ${r.stderr.trim().split('\n')[0]}`);
    if (k.output != null && norm(r.stdout) !== norm(k.output)) errs.push(`${k.label}: output differs (${diff(norm(k.output), norm(r.stdout))})`);
  }
  if (!errs.length) writeFileSync(ok, '');
  return errs;
}

// ---------------------------------------------------------------------------
// Links in lessons and pages: [text](topic:slug), [text](problem:ID), [text](page:slug)

const problemIds = new Set();
function checkLinks(md, where) {
  for (const m of md.matchAll(/\]\((topic|problem|page):([^)\s]+)\)/g)) {
    const [, kind, target] = m;
    if (kind === 'topic' && !MODULES.some((x) => x.slug === target)) fail(where, `link to unknown topic "${target}"`);
    if (kind === 'page' && !PAGES.some((x) => x.slug === target)) fail(where, `link to unknown page "${target}"`);
    if (kind === 'problem' && !problemIds.has(target)) fail(where, `link to unknown problem "${target}"`);
  }
}

const LABEL = /^\*\*(Input|Output):\*\*\s*$/;

/** Complete programs in a lesson: ```cpp blocks with main (```cpp nocompile skipped). */
function lessonPrograms(md, where, run) {
  const bs = blocks(md.split('\n'));
  let heading = '';
  let n = 0;
  for (let i = 0; i < bs.length; i += 1) {
    const b = bs[i];
    if (b.type === 'text') {
      for (const l of b.lines) {
        const m = l.match(/^#{2,4} (.+)$/);
        if (m) heading = m[1].trim();
      }
      continue;
    }
    if (b.unclosed) fail(where, `unclosed code fence near "${heading}"`);
    if (b.lang !== 'cpp' || !/\bint\s+main\s*\(/.test(b.body)) continue;
    n += 1;
    let input = null;
    let output = null;
    let j = i + 1;
    while (j + 1 < bs.length && bs[j].type === 'text' && bs[j + 1].type === 'fence') {
      const ls = bs[j].lines.filter((l) => l.trim());
      if (ls.length !== 1) break;
      const m = ls[0].match(LABEL);
      if (!m) break;
      if (m[1] === 'Input') input = bs[j + 1].body;
      else output = bs[j + 1].body;
      j += 2;
    }
    if (run) programs.push({ where: `${where} › program ${n} (${heading})`, source: b.body, cases: [{ label: 'run', input, output }] });
  }
  return n;
}

// ---------------------------------------------------------------------------
// Structure

const LESSON_SECTIONS = ['learning objectives', 'prerequisites', 'complexity', 'common mistakes', 'key takeaways'];
const index = [];
const counts = {};
let lessonProgramCount = 0;

function checkProblems(file, topic, where, run) {
  for (const e of file.errors) fail(where, e);
  for (const p of file.problems) {
    const at = `${where} › ${p.id}`;
    if (problemIds.has(p.id)) fail(at, 'duplicate problem id');
    problemIds.add(p.id);
    const parsed = parseProblemId(p.id);
    if (!parsed) fail(at, 'malformed id');
    else if (topic !== 'completion' && (parsed.module !== topic || parsed.difficulty !== p.difficulty))
      fail(at, `id does not match module ${topic} / difficulty ${p.difficulty}`);
    else if (topic === 'completion' && parsed.module !== 'completion') fail(at, 'completion ids look like DSA-C01');
    if (!DIFFICULTIES.includes(p.difficulty)) fail(at, `difficulty must be one of ${DIFFICULTIES.join(', ')}`);
    if (!p.subtopic) fail(at, 'missing **Subtopic:**');
    if (p.tags.length < 2) fail(at, 'needs at least two tags');
    if (!p.source) fail(at, 'missing **Source:**');
    const missing = REQUIRED_SECTIONS.filter((s) => !p.sectionOrder.includes(s));
    if (missing.length) fail(at, `missing sections: ${missing.join(', ')}`);
    if (p.hints.length < 2) fail(at, 'needs at least two progressive hints');
    if (p.sampleInput == null || p.sampleOutput == null) fail(at, 'sample input/output must be fenced blocks');
    if (p.solutionLang !== 'cpp' || !/\bint\s+main\s*\(/.test(p.solution)) fail(at, 'solution must be one complete ```cpp program');
    if (/\bbits\/stdc\+\+\.h\b/.test(p.solution)) fail(at, 'use standard headers, not <bits/stdc++.h>');
    if (topic === 'completion') {
      if (!p.naive) fail(at, 'completion problems need a Naive Pitfall section');
      if (p.modules.length < 2) fail(at, 'completion problems combine at least two modules (**Modules:**)');
      for (const m of p.modules) if (!MODULES.some((x) => x.id === m)) fail(at, `unknown module "${m}"`);
    }
    for (const t of p.tests) if (t.input == null || t.output == null) fail(at, `test "${t.title}" needs an input and an output block`);
    counts[topic] ??= { Easy: 0, Medium: 0, Hard: 0 };
    counts[topic][p.difficulty] = (counts[topic][p.difficulty] ?? 0) + 1;
    index.push({ id: p.id, title: p.title, topic, subtopic: p.subtopic, difficulty: p.difficulty, tags: p.tags });
    if (run && p.solution)
      programs.push({
        where: at,
        source: p.solution,
        cases: [
          { label: 'sample', input: p.sampleInput, output: p.sampleOutput },
          ...p.tests.map((t) => ({ label: `test "${t.title}"`, input: t.input, output: t.output })),
        ],
      });
  }
}

// Problems first (lesson links refer to them).
for (const m of MODULES) {
  const md = read(`problems/${m.id}.md`);
  if (NO_OWN_PROBLEMS.has(m.id)) {
    if (md != null) fail(`problems/${m.id}.md`, 'this module draws its practice from the rest of the bank');
    continue;
  }
  if (md == null) {
    missing(`problems/${m.id}.md`);
    continue;
  }
  if (md.includes('—')) fail(`problems/${m.id}.md`, 'em dash');
  checkProblems(parseProblemFile(md, m.id), m.id, `problems/${m.id}.md`, wantRun(m.id));
  const c = counts[m.id] ?? {};
  if (md != null) for (const d of DIFFICULTIES) if ((c[d] ?? 0) < MIN_PER_DIFFICULTY) fail(`problems/${m.id}.md`, `${c[d] ?? 0} ${d} problems, needs ${MIN_PER_DIFFICULTY}`);
}
const completion = read('problems/completion.md');
if (completion == null) missing('problems/completion.md');
else {
  const file = parseProblemFile(completion, 'completion');
  checkProblems(file, 'completion', 'problems/completion.md', wantRun('completion'));
  if (file.problems.length < 20 || file.problems.length > 30) fail('problems/completion.md', `${file.problems.length} problems, needs 20 to 30`);
}
const known = new Set([...MODULES.map((m) => `${m.id}.md`), 'completion.md']);
for (const f of readdirSync(new URL('problems/', CONTENT))) if (!known.has(f)) fail(`problems/${f}`, 'not a module of outline.js');

for (const m of MODULES) {
  const where = `lessons/${m.id}.md`;
  const md = read(`lessons/${m.id}.md`);
  if (md == null) {
    missing(where);
    continue;
  }
  if (!/^# .+/m.test(md)) fail(where, 'missing "# <title>"');
  const heads = [...md.matchAll(/^## (.+)$/gm)].map((x) => x[1].toLowerCase());
  for (const s of LESSON_SECTIONS) if (!heads.some((h) => h.includes(s))) fail(where, `missing a "## …${s}…" section`);
  if (md.includes('—')) fail(where, 'em dash');
  checkLinks(md, where);
  lessonProgramCount += lessonPrograms(md, where, wantRun(m.id));
}
for (const p of PAGES.filter((x) => x.kind === 'page')) {
  const md = read(`pages/${p.slug}.md`);
  if (md == null) missing(`pages/${p.slug}.md`);
  else {
    checkLinks(md, `pages/${p.slug}.md`);
    lessonProgramCount += lessonPrograms(md, `pages/${p.slug}.md`, wantRun('pages'));
  }
}

// ---------------------------------------------------------------------------
// Run every program in a small pool

let next = 0;
let done = 0;
async function worker() {
  while (next < programs.length) {
    const p = programs[next];
    next += 1;
    const errs = await runProgram(p);
    for (const e of errs) fail(p.where, e);
    done += 1;
    if (process.stdout.isTTY) process.stdout.write(`\rcompiled and ran ${done}/${programs.length}`);
  }
}
await Promise.all(Array.from({ length: POOL }, worker));
if (process.stdout.isTTY && programs.length) process.stdout.write('\n');

// ---------------------------------------------------------------------------
// Report and index

const total = index.length;
console.log(`${MODULES.length} modules, ${total} problems, ${lessonProgramCount} lesson programs, ${programs.length} programs run.`);
for (const [topic, c] of Object.entries(counts)) console.log(`  ${topic.padEnd(10)} ${DIFFICULTIES.map((d) => `${d[0]}${c[d] ?? 0}`).join(' ')}`);

const nextIndex = `${JSON.stringify(index, null, 1)}\n`;
if (writeIndex) {
  if (failures.length || !full) console.log('\nproblem-index.json not written: run the full check without failures first.');
  else {
    writeFileSync(INDEX, nextIndex);
    console.log('problem-index.json written.');
  }
} else if (!existsSync(INDEX) || readFileSync(INDEX, 'utf8') !== nextIndex) {
  failures.push('problem-index.json is out of date: run with --write-index');
}

if (pending.length) {
  console.log(`\n${pending.length} file(s) not written yet:`);
  for (const f of pending) console.log(`  - ${f}`);
}
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
if (pending.length && !allowPending) {
  console.error('\nIncomplete: the files above are still missing (pass --allow-pending to accept this while building).');
  process.exit(1);
}
console.log(pending.length ? 'All written content passed (course incomplete).' : 'All checks passed.');
