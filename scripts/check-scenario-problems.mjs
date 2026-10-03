// Checks the Beginner C scenario-based problems.
//
// For every problem in src/components/academic/beginner-c/content/scenarios/:
//   1. checks that every required section is present;
//   2. compiles the solution with
//        gcc -std=c11 -Wall -Wextra -pedantic -Werror
//      and again with AddressSanitizer/UBSan;
//   3. runs both builds on the sample input and on every test case and
//      compares standard output (and any expected output files) with the
//      text in the Markdown.
//
// Outputs are compared exactly, except that trailing spaces at the end of
// a line and trailing blank lines are ignored (they are invisible on the page).
//
// Usage: node scripts/check-scenario-problems.mjs [chapter ...]
// Needs gcc on the PATH. Not part of the site build.

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LEVELS, parseScenarioFile } from '../src/components/academic/beginner-c/scenarioProblems.js';

const DIR = new URL('../src/components/academic/beginner-c/content/scenarios/', import.meta.url);
const only = process.argv.slice(2);
const files = readdirSync(DIR)
  .filter((f) => /^\d\d\.md$/.test(f))
  .filter((f) => !only.length || only.includes(f.slice(0, 2)))
  .sort();

const norm = (s) =>
  (s ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');

const work = mkdtempSync(join(tmpdir(), 'bc-check-'));
const STRICT = ['-std=c11', '-Wall', '-Wextra', '-pedantic', '-Werror'];
const SANITIZE = ['-std=c11', '-g', '-fsanitize=address,undefined', '-fno-sanitize-recover=all'];

let problemsTotal = 0;
let compiled = 0;
let runsPassed = 0;
let runsTotal = 0;
const failures = [];
const perChapter = [];

function diff(expected, actual) {
  const e = expected.split('\n');
  const a = actual.split('\n');
  for (let i = 0; i < Math.max(e.length, a.length); i += 1) {
    if (e[i] !== a[i]) return `line ${i + 1}: expected ${JSON.stringify(e[i])}, got ${JSON.stringify(a[i])}`;
  }
  return '';
}

function run(binary, input, expected, label) {
  const dir = mkdtempSync(join(work, 'run-'));
  for (const f of input.files) writeFileSync(join(dir, f.name), f.content.length ? `${f.content}\n` : '');
  const stdin = input.stream == null ? '' : `${input.stream}\n`;
  const res = spawnSync(binary, [], { cwd: dir, input: stdin, encoding: 'utf8', timeout: 5000 });
  const problems = [];
  if (res.error) problems.push(`${label}: ${res.error.message}`);
  if (res.status !== 0 && res.status !== 1) problems.push(`${label}: exit status ${res.status}`);
  if (res.stderr && /Sanitizer|runtime error/.test(res.stderr)) problems.push(`${label}: ${res.stderr.split('\n')[0]}`);
  if (expected.stream != null && norm(res.stdout) !== norm(expected.stream)) {
    problems.push(`${label}: stdout differs (${diff(norm(expected.stream), norm(res.stdout))})`);
  }
  for (const f of expected.files) {
    const p = join(dir, f.name);
    if (!existsSync(p)) problems.push(`${label}: file ${f.name} was not created`);
    else if (norm(readFileSync(p, 'utf8')) !== norm(f.content)) {
      problems.push(`${label}: file ${f.name} differs (${diff(norm(f.content), norm(readFileSync(p, 'utf8')))})`);
    }
  }
  return problems;
}

for (const file of files) {
  const chapter = file.slice(0, 2);
  const set = parseScenarioFile(readFileSync(new URL(file, DIR), 'utf8'), chapter);
  perChapter.push({ chapter, count: set.problems.length, tests: 0 });
  if (set.problems.length < 5) failures.push(`${chapter}: only ${set.problems.length} problems (minimum 5)`);

  set.problems.forEach((p, i) => {
    problemsTotal += 1;
    const tag = `${chapter} #${p.number} ${p.title}`;
    const errs = [];
    if (p.number !== i + 1) errs.push(`numbering: expected ${i + 1}`);
    if (!LEVELS.includes(p.level)) errs.push(`missing or unknown level "${p.level}"`);
    if (p.missing.length) errs.push(`missing sections: ${p.missing.join(', ')}`);
    if (p.solutionLang !== 'c') errs.push('solution is not a ```c block');
    if (!p.concepts.length) errs.push('no concepts listed');
    if (!p.tests.length) errs.push('no test cases');
    if (p.sampleOutput.stream == null && !p.sampleOutput.files.length) errs.push('no sample output');
    if (p.sampleInput.stream == null && !p.sampleInput.none && !p.sampleInput.files.length) errs.push('no sample input');
    if (p.extra.length) errs.push(`stray text before the first section: ${p.extra[0]}`);

    const src = join(work, `${chapter}-${p.number}.c`);
    writeFileSync(src, `${p.solution}\n`);
    const strictBin = join(work, `${chapter}-${p.number}`);
    const sanBin = `${strictBin}-san`;
    let ok = true;
    for (const [flags, bin] of [
      [STRICT, strictBin],
      [SANITIZE, sanBin],
    ]) {
      try {
        execFileSync('gcc', [...flags, src, '-o', bin, '-lm'], { stdio: 'pipe' });
      } catch (e) {
        ok = false;
        errs.push(`compile (${flags.includes('-Werror') ? 'strict' : 'sanitize'}) failed:\n${e.stderr.toString().trim()}`);
        break;
      }
    }
    if (ok) {
      compiled += 1;
      const cases = [{ label: 'sample', input: p.sampleInput, output: p.sampleOutput }].concat(
        p.tests.map((t, k) => ({ label: `test ${k + 1} (${t.title})`, input: t.input, output: t.output, changes: t.changes })),
      );
      perChapter[perChapter.length - 1].tests += p.tests.length;
      for (const c of cases) {
        if (c.output.stream == null && !c.output.files.length) {
          errs.push(`${c.label}: no expected output`);
          continue;
        }
        runsTotal += 1;
        let [sb, zb] = [strictBin, sanBin];
        if (c.changes?.length) {
          // Variant of the solution: apply each **Change** (must match exactly once).
          let variant = p.solution;
          let bad = false;
          for (const ch of c.changes) {
            if (variant.split(ch.from).length !== 2) {
              errs.push(`${c.label}: change \`${ch.from}\` does not match exactly once`);
              bad = true;
            } else variant = variant.replace(ch.from, ch.to);
          }
          if (bad) continue;
          const vsrc = join(work, `${chapter}-${p.number}-v${runsTotal}.c`);
          writeFileSync(vsrc, `${variant}\n`);
          sb = `${vsrc}.bin`;
          zb = `${vsrc}.san`;
          try {
            execFileSync('gcc', [...STRICT, vsrc, '-o', sb, '-lm'], { stdio: 'pipe' });
            execFileSync('gcc', [...SANITIZE, vsrc, '-o', zb, '-lm'], { stdio: 'pipe' });
          } catch (e) {
            errs.push(`${c.label}: variant does not compile:\n${e.stderr.toString().trim()}`);
            continue;
          }
        }
        const probs = [...run(sb, c.input, c.output, `${c.label} [strict]`), ...run(zb, c.input, c.output, `${c.label} [sanitized]`)];
        if (probs.length) errs.push(...probs);
        else runsPassed += 1;
      }
    }
    if (errs.length) failures.push(`${tag}\n    ${errs.join('\n    ')}`);
  });
}

rmSync(work, { recursive: true, force: true });

for (const c of perChapter) console.log(`chapter ${c.chapter}: ${c.count} problems, ${c.tests} extra test cases`);
console.log(`\n${problemsTotal} problems, ${compiled} compiled cleanly, ${runsPassed}/${runsTotal} runs matched (sample + tests)`);
if (failures.length) {
  console.log(`\n${failures.length} problem(s) need attention:\n`);
  for (const f of failures) console.log(`- ${f}\n`);
  process.exit(1);
}
