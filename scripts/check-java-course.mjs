// Checks the Object Oriented Programming (Java) course.
//
//   content/chapters/<id>.md   lesson structure (concepts, syntax, at least
//                              three worked examples); every complete program
//                              is compiled, and run when an **Output:** block
//                              follows it.
//   content/practice/<id>.md   practice problems
//   content/scenarios/<id>.md  scenario-based problems (at least 4 per chapter,
//                              every level represented)
//   content/question-bank/*.md question bank
//   content/labs/*.md          GUI examples, games and projects
//
// Every solution is compiled with
//     javac --release 17 -Xlint:all,-serial -Werror
// in a temporary directory, then run on its sample input and on every test
// case; standard output (and any expected output files) must match the text
// in the Markdown exactly, except for trailing spaces and trailing blank lines.
//
// Usage:
//   node scripts/check-java-course.mjs                 everything
//   node scripts/check-java-course.mjs 04              lesson, practice and scenarios of chapter 04
//   node scripts/check-java-course.mjs practice/04 scenarios/04 lesson/04 lab/gui qb qb/03-encapsulation
//   node scripts/check-java-course.mjs --write-stats   full check, then write stats.json
//
// Needs a JDK (17 or later) on the PATH. Not part of the site build.

import { execFile } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { cpus, tmpdir } from 'node:os';
import { join } from 'node:path';
import { KIND_SECTIONS, LEVELS, blocks, parseProblemFile } from '../src/components/academic/beginner-java/problems.js';

const ROOT = new URL('../src/components/academic/beginner-java/', import.meta.url);
const CONTENT = new URL('content/', ROOT);
const STATS = new URL('stats.json', ROOT);

const CHAPTER_IDS = Array.from({ length: 15 }, (_, i) => String(i).padStart(2, '0'));
const LAB_IDS = ['gui', 'games', 'projects'];
const JAVAC = ['--release', '17', '-encoding', 'UTF-8', '-Xlint:all,-serial', '-Werror'];
// Parallel javac/java processes; OOP_CHECK_JOBS overrides the default.
const POOL = Number(process.env.OOP_CHECK_JOBS) || Math.max(2, Math.min(8, cpus().length - 1));
const RUN_TIMEOUT = 15000;

const args = process.argv.slice(2);
const writeStats = args.includes('--write-stats');
const targets = args.filter((a) => !a.startsWith('--'));
const full = targets.length === 0;

const want = (kind, id) =>
  full || targets.some((t) => t === id || t === `${kind}/${id}` || t === kind || (kind === 'qb' && t === `qb/${id}`));

const failures = [];
const warnings = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);

const read = (rel) => {
  const url = new URL(rel, CONTENT);
  return existsSync(url) ? readFileSync(url, 'utf8').replace(/\r\n?/g, '\n') : null;
};
const list = (dir) => {
  const url = new URL(`${dir}/`, CONTENT);
  return existsSync(url) ? readdirSync(url).filter((f) => f.endsWith('.md')).sort() : [];
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

const work = mkdtempSync(join(tmpdir(), 'oop-check-'));
let jobSeq = 0;
const programs = []; // { where, source, cases: [{ label, input, output }] }

/** Queue a Java program: compiled once, then run on every case. */
function addProgram(where, source, cases = []) {
  programs.push({ where, source, cases });
}

function sh(cmd, argv, opts = {}) {
  return new Promise((resolve) => {
    const child = execFile(cmd, argv, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...opts }, (error, stdout, stderr) =>
      resolve({ error, stdout, stderr, code: error ? (error.code ?? 1) : 0, killed: error?.killed }),
    );
    if (opts.input != null) {
      child.stdin.on('error', () => {});
      child.stdin.end(opts.input);
    }
  });
}

function mainClass(source) {
  const publics = [...source.matchAll(/^public\s+(?:final\s+|abstract\s+)*(?:class|record|enum|interface)\s+(\w+)/gm)].map((m) => m[1]);
  return publics;
}

async function runProgram(p) {
  const errs = [];
  if (/^\s*package\s+[\w.]+\s*;/m.test(p.source)) errs.push('remove the package declaration (single-file programs)');
  const publics = mainClass(p.source);
  if (publics.length !== 1) {
    errs.push(`needs exactly one top-level public class (the one with main), found ${publics.length ? publics.join(', ') : 'none'}`);
    return errs;
  }
  if (!/static\s+void\s+main\s*\(/.test(p.source)) errs.push('no main method');
  const name = publics[0];
  jobSeq += 1;
  const dir = join(work, `p${jobSeq}`);
  const out = join(dir, 'classes');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(dir, `${name}.java`), `${p.source}\n`);
  const c = await sh('javac', [...JAVAC, '-d', out, join(dir, `${name}.java`)]);
  if (c.code !== 0) {
    errs.push(`javac failed:\n${(c.stderr || c.stdout).trim().split('\n').slice(0, 12).join('\n')}`);
    return errs;
  }
  for (const k of p.cases) {
    const runDir = join(dir, `run-${k.label.replace(/[^a-z0-9]+/gi, '-')}`);
    mkdirSync(runDir, { recursive: true });
    for (const f of k.input.files) writeFileSync(join(runDir, f.name), f.content.length ? `${f.content}\n` : '');
    const stdin = k.input.stream == null ? '' : `${k.input.stream}\n`;
    const r = await sh('java', ['-Djava.awt.headless=true', '-Xshare:auto', '-cp', out, name], {
      cwd: runDir,
      input: stdin,
      timeout: RUN_TIMEOUT,
    });
    if (r.killed) {
      errs.push(`${k.label}: timed out after ${RUN_TIMEOUT / 1000}s`);
      continue;
    }
    if (r.code !== 0) errs.push(`${k.label}: exit status ${r.code}${r.stderr ? `\n${r.stderr.trim().split('\n').slice(0, 6).join('\n')}` : ''}`);
    else if (r.stderr && r.stderr.trim()) errs.push(`${k.label}: wrote to standard error: ${r.stderr.trim().split('\n')[0]}`);
    if (k.output.stream != null && norm(r.stdout) !== norm(k.output.stream)) {
      errs.push(`${k.label}: output differs (${diff(norm(k.output.stream), norm(r.stdout))})`);
    }
    for (const f of k.output.files) {
      const fp = join(runDir, f.name);
      if (!existsSync(fp)) errs.push(`${k.label}: file ${f.name} was not created`);
      else if (norm(readFileSync(fp, 'utf8')) !== norm(f.content)) {
        errs.push(`${k.label}: file ${f.name} differs (${diff(norm(f.content), norm(readFileSync(fp, 'utf8')))})`);
      }
    }
  }
  return errs;
}

// ---------------------------------------------------------------------------
// Lessons and labs: complete programs inside the Markdown

const LABEL = /^\*\*(Input|Output)(?: file `([^`]+)`)?:\*\*\s*$/;

/**
 * Complete programs in a lesson: every ```java block with a main method
 * (blocks tagged ```java nocompile are skipped). Input/Output blocks that
 * directly follow a program become its run case.
 */
function lessonPrograms(md, where) {
  const bs = blocks(md.split('\n'));
  const found = [];
  let heading = '';
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
    if (b.lang !== 'java') continue;
    if (!/static\s+void\s+main\s*\(/.test(b.body)) continue;
    const input = { stream: null, files: [] };
    const output = { stream: null, files: [] };
    let j = i + 1;
    let hasOutput = false;
    while (j + 1 < bs.length && bs[j].type === 'text' && bs[j + 1].type === 'fence') {
      const ls = bs[j].lines.filter((l) => l.trim());
      if (ls.length !== 1) break;
      const m = ls[0].match(LABEL);
      if (!m) break;
      const target = m[1] === 'Input' ? input : output;
      if (m[2]) target.files.push({ name: m[2], content: bs[j + 1].body });
      else target.stream = bs[j + 1].body;
      if (m[1] === 'Output') hasOutput = true;
      j += 2;
    }
    found.push({ heading, source: b.body, runs: hasOutput, input, output });
  }
  for (const [k, f] of found.entries()) {
    addProgram(`${where} · ${f.heading || `program ${k + 1}`}`, f.source, f.runs ? [{ label: 'example run', input: f.input, output: f.output }] : []);
  }
  return found;
}

/**
 * blocks() reads the language from the first word of the info string, so
 * "```java nocompile" fences are rewritten to a distinct language that is
 * not compiled (the page still highlights them as Java).
 */
function markNocompile(md) {
  return md.replace(/^```java[ \t]+nocompile[ \t]*$/gm, '```java-nocompile');
}

function headingsOutsideFences(md) {
  const out = [];
  let inFence = false;
  md.split('\n').forEach((line, i) => {
    if (/^```/.test(line)) inFence = !inFence;
    else if (!inFence) {
      const m = line.match(/^(#{1,4}) (.+)$/);
      if (m) out.push({ level: m[1].length, text: m[2].trim(), line: i + 1 });
    }
  });
  return out;
}

const BANNED = /\b(TODO|FIXME|TBD|lorem ipsum|placeholder text)\b/i;

function checkProse(md, where) {
  md.split('\n').forEach((l, i) => {
    if (BANNED.test(l)) fail(where, `line ${i + 1}: unfinished marker "${l.trim().slice(0, 60)}"`);
  });
}

const stats = {
  chapters: 0,
  workedExamples: 0,
  practice: { total: 0, Basic: 0, Intermediate: 0, Advanced: 0 },
  scenarios: { total: 0, Basic: 0, Intermediate: 0, Advanced: 0, tests: 0 },
  questionBank: { total: 0, topics: 0, Basic: 0, Intermediate: 0, Advanced: 0 },
  gui: 0,
  games: { total: 0, Basic: 0, Intermediate: 0, Advanced: 0 },
  projects: 0,
  projectIdeas: 0,
  programs: 0,
};

function checkLesson(id) {
  const where = `chapters/${id}.md`;
  const raw = read(`chapters/${id}.md`);
  if (raw == null) return fail(where, 'missing');
  stats.chapters += 1;
  checkProse(raw, where);
  const md = markNocompile(raw);
  const hs = headingsOutsideFences(md);
  const h1 = hs.filter((h) => h.level === 1);
  if (h1.length !== 1 || !new RegExp(`^Chapter ${id}: .+`).test(h1[0].text)) fail(where, `needs one title "# Chapter ${id}: <title>"`);
  const h2 = hs.filter((h) => h.level === 2).map((h) => h.text);
  const required = ['1. Concept Explanation', '2. Syntax', '3. Worked Examples'];
  const idx = required.map((r) => h2.indexOf(r));
  if (idx.some((x) => x < 0)) fail(where, `missing section(s): ${required.filter((_, k) => idx[k] < 0).join(', ')}`);
  else if (!(idx[0] < idx[1] && idx[1] < idx[2])) fail(where, 'sections 1-3 are out of order');
  for (const t of h2) if (/^\d+\./.test(t) && !required.includes(t)) fail(where, `numbered section "${t}" is not allowed (sections 4 and 5 are added by the page)`);
  if (h2.some((t) => /practice|scenario/i.test(t))) fail(where, 'practice and scenario problems belong in their own files');

  // Worked examples: "### Example <n>: <title>" inside section 3, numbered 1..n.
  const start = hs.find((h) => h.level === 2 && h.text === '3. Worked Examples');
  const after = start ? hs.find((h) => h.level === 2 && h.line > start.line) : null;
  const examples = hs.filter((h) => h.level === 3 && start && h.line > start.line && (!after || h.line < after.line) && /^Example \d+:/.test(h.text));
  examples.forEach((e, k) => {
    if (!new RegExp(`^Example ${k + 1}: .+`).test(e.text)) fail(where, `"${e.text}": expected Example ${k + 1}`);
  });
  if (examples.length < 3) fail(where, `only ${examples.length} worked examples (minimum 3)`);
  stats.workedExamples += examples.length;

  const progs = lessonPrograms(md, where);
  const lines = md.split('\n');
  for (const e of examples) {
    const end = examples.find((x) => x.line > e.line)?.line ?? after?.line ?? lines.length + 1;
    const body = lines.slice(e.line, end - 1).join('\n');
    const sub = blocks(body.split('\n'));
    const hasMain = sub.some((b) => b.type === 'fence' && b.lang === 'java' && /static\s+void\s+main\s*\(/.test(b.body));
    const hasOut = /^\*\*Output(?: file `[^`]+`)?:\*\*\s*$/m.test(body);
    if (!hasMain) fail(where, `${e.text}: needs a complete program (a \`\`\`java block with main)`);
    if (!hasOut) fail(where, `${e.text}: needs an **Output:** block after the program`);
    if (!/\*\*Problem:\*\*/.test(body)) fail(where, `${e.text}: needs a **Problem:** paragraph`);
    if (!/\*\*Why it works:\*\*/.test(body)) fail(where, `${e.text}: needs a **Why it works:** paragraph`);
  }
  stats.programs += progs.length;
}

function checkProblemFile(rel, kind, where, opts = {}) {
  const md = read(rel);
  if (md == null) {
    fail(where, 'missing');
    return null;
  }
  checkProse(md, where);
  const file = parseProblemFile(md, kind);
  for (const e of file.errors) fail(where, e);
  if (!file.title) fail(where, 'needs a "# <title>" line');
  const order = KIND_SECTIONS[kind];
  let lastLevel = 0;
  file.problems.forEach((p, i) => {
    const tag = `${where} #${p.number} ${p.title}`;
    if (p.number !== i + 1) fail(tag, `numbering: expected Problem ${i + 1}`);
    const lv = LEVELS.indexOf(p.level);
    if (lv < 0) fail(tag, `level must be one of ${LEVELS.join(', ')} (got "${p.level}")`);
    else if (lv < lastLevel) fail(tag, `level ${p.level} comes after a harder level; order problems Basic → Intermediate → Advanced`);
    else lastLevel = lv;
    const missing = order.filter((k) => !p.sectionOrder.includes(k));
    if (missing.length) fail(tag, `missing sections: ${missing.join(', ')}`);
    const extraSections = p.sectionOrder.filter((k) => !order.includes(k));
    if (extraSections.length) fail(tag, `sections not used in ${kind} files: ${extraSections.join(', ')}`);
    if (!missing.length && order.join() !== p.sectionOrder.filter((k) => order.includes(k)).join()) {
      fail(tag, `sections out of order (expected ${order.join(' → ')})`);
    }
    if (p.extra.length) fail(tag, `stray text before the first section: ${p.extra[0]}`);
    if (p.solutionLang !== 'java') fail(tag, 'solution must be one ```java block');
    if (kind === 'scenario' && !p.concepts.length) fail(tag, 'no concepts listed');
    if (kind === 'scenario' && p.tests.length < 2) fail(tag, `needs at least 2 test cases (has ${p.tests.length})`);
    if (p.sampleOutput.stream == null && !p.sampleOutput.files.length) fail(tag, 'no sample output');
    if (p.sampleInput.stream == null && !p.sampleInput.none && !p.sampleInput.files.length) fail(tag, 'no sample input (write "No input." if the program reads none)');
    for (const t of p.tests) {
      if (t.output.stream == null && !t.output.files.length) fail(tag, `test "${t.title}": no expected output`);
      if (t.input.stream == null && !t.input.none && !t.input.files.length) fail(tag, `test "${t.title}": no input (write "No input." if none)`);
    }
    if (p.solution) {
      const cases = [{ label: 'sample', input: p.sampleInput, output: p.sampleOutput }].concat(
        p.tests.map((t, k) => ({ label: `test ${k + 1} (${t.title})`, input: t.input, output: t.output })),
      );
      addProgram(tag, p.solution, cases);
      stats.programs += 1;
    }
  });
  if (opts.min && file.problems.length < opts.min) fail(where, `only ${file.problems.length} problems (minimum ${opts.min})`);
  return file;
}

function checkPractice(id) {
  const where = `practice/${id}.md`;
  const file = checkProblemFile(`practice/${id}.md`, 'practice', where, { min: 10 });
  if (!file) return;
  for (const l of LEVELS) {
    const n = file.problems.filter((p) => p.level === l).length;
    if (n < 3) fail(where, `only ${n} ${l} problems (minimum 3)`);
    stats.practice[l] += n;
  }
  stats.practice.total += file.problems.length;
}

function checkScenarios(id) {
  const where = `scenarios/${id}.md`;
  const file = checkProblemFile(`scenarios/${id}.md`, 'scenario', where);
  if (!file) return;
  if (file.problems.length < 4) fail(where, `only ${file.problems.length} problems (minimum 4)`);
  for (const l of LEVELS) {
    const n = file.problems.filter((p) => p.level === l).length;
    if (n < 1) fail(where, `no ${l} problem (each level needs at least one)`);
    stats.scenarios[l] += n;
  }
  stats.scenarios.total += file.problems.length;
  stats.scenarios.tests += file.problems.reduce((n, p) => n + p.tests.length, 0);
}

function checkBank(file) {
  const where = `question-bank/${file}`;
  if (!/^\d\d-[a-z0-9-]+\.md$/.test(file)) fail(where, 'file name must be "<nn>-<topic-slug>.md"');
  const parsed = checkProblemFile(`question-bank/${file}`, 'question', where);
  if (!parsed) return;
  stats.questionBank.topics += 1;
  stats.questionBank.total += parsed.problems.length;
  for (const l of LEVELS) stats.questionBank[l] += parsed.problems.filter((p) => p.level === l).length;
}

function checkLab(id) {
  const where = `labs/${id}.md`;
  const raw = read(`labs/${id}.md`);
  if (raw == null) return fail(where, 'missing');
  checkProse(raw, where);
  const md = markNocompile(raw);
  const hs = headingsOutsideFences(md);
  const lines = md.split('\n');
  const h1 = hs.filter((h) => h.level === 1);
  const titles = { gui: 'Lab L1: ', games: 'Lab L2: ', projects: 'Lab L3: ' };
  if (h1.length !== 1 || !h1[0].text.startsWith(titles[id])) fail(where, `needs one title "# ${titles[id]}<title>"`);
  const sectionBody = (h) => {
    const next = hs.find((x) => x.line > h.line && x.level <= h.level);
    return lines.slice(h.line, next ? next.line - 1 : lines.length).join('\n');
  };
  const numbered = (re, label) => {
    const items = hs.filter((h) => re.test(h.text));
    items.forEach((h, k) => {
      const n = Number(h.text.match(/(\d+):/)?.[1]);
      if (n !== k + 1) fail(where, `"${h.text}": expected ${label} ${k + 1}`);
    });
    return items;
  };
  const progs = lessonPrograms(md, where);
  stats.programs += progs.length;
  const needsProgram = (h) => {
    if (!/static\s+void\s+main\s*\(/.test(sectionBody(h))) fail(where, `${h.text}: needs a complete program`);
  };
  if (id === 'gui') {
    const items = numbered(/^GUI Example \d+:/, 'GUI Example');
    items.forEach(needsProgram);
    stats.gui = items.length;
  } else if (id === 'games') {
    const items = numbered(/^Game \d+:/, 'Game');
    let last = 0;
    for (const h of items) {
      needsProgram(h);
      const lv = sectionBody(h).match(/^\*\*Level:\*\*\s*(\w+)/m)?.[1];
      const k = LEVELS.indexOf(lv);
      if (k < 0) fail(where, `${h.text}: needs **Level:** Basic | Intermediate | Advanced`);
      else {
        if (k < last) fail(where, `${h.text}: order games Basic → Intermediate → Advanced`);
        last = Math.max(last, k);
        stats.games[lv] += 1;
      }
    }
    stats.games.total = items.length;
  } else {
    const items = numbered(/^Project \d+:/, 'Project');
    items.forEach(needsProgram);
    stats.projects = items.length;
    const ideas = numbered(/^Idea \d+:/, 'Idea');
    for (const h of ideas) {
      const body = sectionBody(h);
      for (const label of ['Description', 'Concepts Used', 'Suggested Classes', 'Main Features', 'Implementation Plan']) {
        if (!body.includes(`**${label}:**`)) fail(where, `${h.text}: missing **${label}:**`);
      }
    }
    stats.projectIdeas = ideas.length;
  }
}

// ---------------------------------------------------------------------------

for (const id of CHAPTER_IDS) {
  if (want('lesson', id)) checkLesson(id);
  if (want('practice', id)) checkPractice(id);
  if (want('scenarios', id)) checkScenarios(id);
}
for (const id of LAB_IDS) if (want('lab', id)) checkLab(id);
for (const f of list('question-bank')) if (want('qb', f.replace(/\.md$/, ''))) checkBank(f);
if (full) {
  if (stats.questionBank.total === 0) fail('question-bank', 'no topic files');
  for (const dir of ['chapters', 'practice', 'scenarios']) {
    for (const f of list(dir)) if (!CHAPTER_IDS.includes(f.replace(/\.md$/, ''))) fail(`${dir}/${f}`, 'unexpected file');
  }
}

// Run all programs on a small worker pool.
const started = Date.now();
let done = 0;
let passed = 0;
let runs = 0;
const queue = programs.slice();
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    const errs = await runProgram(p);
    runs += p.cases.length;
    done += 1;
    if (errs.length) failures.push(`${p.where}\n    ${errs.join('\n    ').replace(/\n/g, '\n    ')}`);
    else passed += 1;
    if (process.stdout.isTTY) process.stdout.write(`\r${done}/${programs.length} programs checked`);
  }
}
await Promise.all(Array.from({ length: POOL }, worker));
if (process.stdout.isTTY) process.stdout.write('\n');
rmSync(work, { recursive: true, force: true });

console.log(`${programs.length} programs: ${passed} compiled and matched their runs (${runs} runs) in ${((Date.now() - started) / 1000).toFixed(0)}s`);
if (full) {
  console.log(JSON.stringify(stats, null, 2));
  const current = existsSync(STATS) ? readFileSync(STATS, 'utf8') : '';
  const next = `${JSON.stringify(stats, null, 2)}\n`;
  if (writeStats) {
    if (failures.length) console.log('\nstats.json not written: fix the problems below first.');
    else {
      writeFileSync(STATS, next);
      console.log('\nstats.json written.');
    }
  } else if (current !== next) {
    failures.push('stats.json is out of date: run with --write-stats');
  }
}
for (const w of warnings) console.log(`warning: ${w}`);
if (failures.length) {
  console.log(`\n${failures.length} problem(s) need attention:\n`);
  for (const f of failures) console.log(`- ${f}\n`);
  process.exit(1);
}
console.log('All checks passed.');
