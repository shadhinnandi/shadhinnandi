/*
  Problem files of Data Structures and Algorithms I, parsed into canonical
  problem records. Shared by the course pages and by
  scripts/check-dsa-course.mjs (which compiles every solution with clang++
  -std=c++17 and checks it against the sample and every test), so keep this
  file free of browser and Vite APIs.

  File format (content/problems/<module id>.md, or completion.md)
  ----------------------------------------------------------------
    # <file title>
    <intro Markdown>                      optional

    ## DSA07-E01 · <title>
    **Difficulty:** Easy · **Subtopic:** <subtopic> · **Tags:** a, b, c · **Source:** Original
    **Modules:** 07, 13                   completion problems only: the modules combined

    ### Statement                         Markdown (scenario + task)
    ### Input                             input format
    ### Output                            output format
    ### Constraints
    ### Sample Input                      one fenced block
    ### Sample Output                     one fenced block
    ### Sample Explanation
    ### Target                            time and space targets, shown with the problem
    ### Hints                             numbered list, revealed one at a time
    ### Approach                          expected approach (shown with the solution)
    ### Naive Pitfall                     completion problems: why a naive solution fails
    ### Solution                          one ```cpp block, a complete program
    ### Explanation
    ### Edge Cases                        bullet list
    ### Tests                             optional extra cases:
    #### <title>
    ```text   input   ```
    ```text   expected output   ```
*/

export const SECTION_KEYS = {
  statement: 'statement',
  input: 'input',
  output: 'output',
  constraints: 'constraints',
  'sample input': 'sampleInput',
  'sample output': 'sampleOutput',
  'sample explanation': 'sampleExplanation',
  target: 'target',
  hints: 'hints',
  approach: 'approach',
  'naive pitfall': 'naive',
  solution: 'solution',
  explanation: 'explanation',
  'edge cases': 'edgeCases',
  tests: 'tests',
};

/** Sections every problem must have, in this order (Naive Pitfall and Tests are optional here). */
export const REQUIRED_SECTIONS = [
  'statement',
  'input',
  'output',
  'constraints',
  'sampleInput',
  'sampleOutput',
  'sampleExplanation',
  'target',
  'hints',
  'approach',
  'solution',
  'explanation',
  'edgeCases',
];

/** Split lines into { type: 'text', lines } and { type: 'fence', lang, body } blocks. */
export function blocks(lines) {
  const out = [];
  let text = [];
  let fence = null;
  for (const line of lines) {
    if (fence) {
      if (/^```\s*$/.test(line)) {
        out.push({ type: 'fence', lang: fence.lang, body: fence.body.join('\n') });
        fence = null;
      } else fence.body.push(line);
      continue;
    }
    const m = line.match(/^```(\S*).*$/);
    if (m) {
      if (text.length) out.push({ type: 'text', lines: text });
      text = [];
      fence = { lang: m[1], body: [] };
    } else text.push(line);
  }
  if (fence) out.push({ type: 'fence', lang: fence.lang, body: fence.body.join('\n'), unclosed: true });
  if (text.length) out.push({ type: 'text', lines: text });
  return out;
}

const text = (l) => (l || []).join('\n').trim();
const firstFence = (l) => (l ? blocks(l).find((b) => b.type === 'fence') : null);

function parseTests(lines) {
  const tests = [];
  let current = null;
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    const m = !inFence && line.match(/^#### (.+)$/);
    if (m) {
      current = { title: m[1].trim(), lines: [] };
      tests.push(current);
    } else if (current) current.lines.push(line);
  }
  return tests.map((t) => {
    const fences = blocks(t.lines).filter((b) => b.type === 'fence');
    return { title: t.title, input: fences[0]?.body ?? null, output: fences[1]?.body ?? null };
  });
}

function parseMeta(lines) {
  const meta = {};
  for (const line of lines) {
    for (const part of line.split(/\s+·\s+/)) {
      const m = part.match(/^\*\*([A-Za-z ]+):\*\*\s*(.+)$/);
      if (m) meta[m[1].trim().toLowerCase()] = m[2].trim();
    }
  }
  return meta;
}

const list = (s) =>
  (s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * Parse one problem file. `topic` is the module id ('07', '16A') or
 * 'completion'. Format problems are collected in `errors` (shown by the
 * checker, ignored by the pages) instead of being thrown.
 */
export function parseProblemFile(md, topic) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  const intro = [];
  const raw = [];
  const errors = [];
  let problem = null;
  let section = null;
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence) {
      let m;
      if (!problem && !title && (m = line.match(/^# (.+)$/))) {
        title = m[1].trim();
        continue;
      }
      if ((m = line.match(/^## (DSA[\w-]+)\s+·\s+(.+)$/))) {
        problem = { id: m[1], title: m[2].trim(), meta: [], sections: {}, order: [] };
        raw.push(problem);
        section = null;
        continue;
      }
      if (/^## /.test(line)) {
        errors.push(`unexpected heading "${line}" (problems start with "## DSA<id> · <title>")`);
        continue;
      }
      if (problem && (m = line.match(/^### (.+)$/))) {
        const key = SECTION_KEYS[m[1].trim().toLowerCase()];
        if (!key) {
          errors.push(`${problem.id}: unknown section "${m[1]}"`);
          section = null;
          continue;
        }
        section = key;
        problem.sections[key] = [];
        problem.order.push(key);
        continue;
      }
    }
    if (!problem) intro.push(line);
    else if (section) problem.sections[section].push(line);
    else if (line.trim()) problem.meta.push(line);
  }

  const problems = raw.map((p, i) => {
    const s = p.sections;
    const meta = parseMeta(p.meta);
    const code = firstFence(s.solution);
    return {
      id: p.id,
      title: p.title,
      topic,
      order: i,
      difficulty: meta.difficulty || '',
      subtopic: meta.subtopic || '',
      tags: list(meta.tags),
      source: meta.source || '',
      modules: list(meta.modules),
      statement: text(s.statement),
      input: text(s.input),
      output: text(s.output),
      constraints: text(s.constraints),
      sampleInput: firstFence(s.sampleInput)?.body ?? null,
      sampleOutput: firstFence(s.sampleOutput)?.body ?? null,
      sampleExplanation: text(s.sampleExplanation),
      target: text(s.target),
      hints: (s.hints || [])
        .join('\n')
        .split(/\n(?=\d+\.\s)/)
        .map((h) => h.replace(/^\d+\.\s+/, '').trim())
        .filter(Boolean),
      approach: text(s.approach),
      naive: text(s.naive),
      solution: code ? code.body : '',
      solutionLang: code ? code.lang : '',
      explanation: text(s.explanation),
      edgeCases: text(s.edgeCases),
      tests: s.tests ? parseTests(s.tests) : [],
      sectionOrder: p.order,
    };
  });

  return { title, intro: text(intro), problems, errors };
}
