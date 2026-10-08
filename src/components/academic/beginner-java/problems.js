/*
  Problem files of the Object Oriented Programming (Java) course, parsed
  into structured problems. One parser serves three kinds of file:

    content/practice/<chapter>.md      chapter practice problems
    content/scenarios/<chapter>.md     scenario-based problems
    content/question-bank/<topic>.md   question bank, one file per topic

  Shared by the course pages (rendering) and by
  scripts/check-java-course.mjs (compiles every solution with javac and
  checks the sample and test outputs), so keep it free of browser and Vite
  APIs.

  File format
  -----------
    # <file title>                     chapter or topic title
    <intro Markdown>                   optional, shown above the problems

    ## Problem <n>: <title>
    **Level:** Basic | Intermediate | Advanced

    ### Scenario                       scenario files only
    ### Problem Statement
    ### Hint                           question bank only
    ### Sample Input                   fenced block(s); "No input." if none
    ### Sample Output                  fenced block(s)
    ### Solution                       one ```java block
    ### Explanation
    ### Concepts Practiced             scenario files only: bullet list
    ### Test Cases                     scenario files only
    #### <test title>
    **Input**                          fenced block (or "No input.")
    **Expected Output**                fenced block

  A fenced block preceded by a line **File `name`** is a file instead of
  standard input/output: in Sample Input / **Input file `name`** it is
  created before the program runs; in Sample Output / **Expected file
  `name`** it must exist with that content afterwards.
*/

export const LEVELS = ['Basic', 'Intermediate', 'Advanced'];
export const LEVEL_MARK = { Basic: '🟢', Intermediate: '🟡', Advanced: '🔴' };

const SECTION_KEYS = {
  scenario: 'scenario',
  'problem statement': 'statement',
  hint: 'hint',
  'sample input': 'sampleInput',
  'sample output': 'sampleOutput',
  solution: 'solution',
  explanation: 'explanation',
  'concepts practiced': 'concepts',
  'test cases': 'tests',
};

/** Sections each kind of file must have, in this order. */
export const KIND_SECTIONS = {
  practice: ['statement', 'sampleInput', 'sampleOutput', 'solution', 'explanation'],
  scenario: ['scenario', 'statement', 'sampleInput', 'sampleOutput', 'solution', 'explanation', 'concepts', 'tests'],
  question: ['statement', 'hint', 'sampleInput', 'sampleOutput', 'solution', 'explanation'],
};

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

/**
 * Read input/output blocks: { stream, files: [{ name, content }], none }.
 * `stream` is stdin (inputs) or stdout (outputs); null when not given.
 */
function parseIO(lines) {
  const io = { stream: null, files: [], none: false };
  let pendingFile = null;
  for (const b of blocks(lines)) {
    if (b.type === 'text') {
      for (const l of b.lines) {
        const f = l.match(/^\*\*(?:Input |Expected )?[Ff]ile `([^`]+)`/);
        if (f) pendingFile = f[1];
        else if (/^\s*No input\.?\s*$/i.test(l)) io.none = true;
      }
    } else if (pendingFile) {
      io.files.push({ name: pendingFile, content: b.body });
      pendingFile = null;
    } else {
      io.stream = b.body;
    }
  }
  return io;
}

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
    // The input part runs up to the first **Expected ...** label.
    const idx = t.lines.findIndex((l) => /^\*\*Expected /.test(l));
    const inputLines = idx < 0 ? t.lines : t.lines.slice(0, idx);
    const outputLines = idx < 0 ? [] : t.lines.slice(idx);
    // Any other text before the blocks is a short remark about the test.
    const note = blocks(inputLines)
      .filter((b) => b.type === 'text')
      .flatMap((b) => b.lines)
      .filter((l) => l.trim() && !/^\*\*(Input|File)/.test(l) && !/^\s*No input\.?\s*$/i.test(l))
      .join('\n')
      .trim();
    return { title: t.title, note, input: parseIO(inputLines), output: parseIO(outputLines) };
  });
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const text = (l) => (l || []).join('\n').replace(/^\s*---\s*$/gm, '').trim();

/**
 * Parse one problem file. `kind` is 'practice', 'scenario' or 'question';
 * `prefix` makes the problem ids unique on a page.
 * Format problems are collected in `errors` (shown by the checker, ignored
 * by the pages) instead of being thrown.
 */
export function parseProblemFile(md, kind, prefix = '') {
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
      if ((m = line.match(/^## Problem (\d+):\s*(.+)$/))) {
        problem = { number: Number(m[1]), title: m[2].trim(), level: null, sections: {}, order: [], extra: [] };
        raw.push(problem);
        section = null;
        continue;
      }
      if (/^## /.test(line)) {
        errors.push(`unexpected heading "${line}" (problems start with "## Problem <n>: <title>")`);
        continue;
      }
      if (problem && (m = line.match(/^### (.+)$/))) {
        const key = SECTION_KEYS[m[1].trim().toLowerCase()];
        if (!key) {
          errors.push(`Problem ${problem.number}: unknown section "${m[1]}"`);
          section = null;
          continue;
        }
        section = key;
        problem.sections[key] = [];
        problem.order.push(key);
        continue;
      }
      if (problem && !section && (m = line.match(/^\*\*Level:\*\*\s*(\w+)/))) {
        problem.level = m[1];
        continue;
      }
    }
    if (!problem) intro.push(line);
    else if (section) problem.sections[section].push(line);
    else if (line.trim()) problem.extra.push(line);
  }

  const problems = raw.map((p) => {
    const s = p.sections;
    const code = (s.solution ? blocks(s.solution) : []).find((b) => b.type === 'fence');
    return {
      id: `${prefix}${p.number}`,
      number: p.number,
      title: p.title,
      slug: slugify(p.title),
      level: p.level,
      scenario: text(s.scenario),
      statement: text(s.statement),
      hint: text(s.hint),
      sampleInput: parseIO(s.sampleInput || []),
      sampleOutput: parseIO(s.sampleOutput || []),
      solution: code ? code.body : '',
      solutionLang: code ? code.lang : '',
      explanation: text(s.explanation),
      concepts: (s.concepts || [])
        .map((l) => l.match(/^\s*[-*]\s+(.+)$/))
        .filter(Boolean)
        .map((m) => m[1].trim()),
      tests: s.tests ? parseTests(s.tests) : [],
      sectionOrder: p.order,
      extra: p.extra,
    };
  });

  return { title, intro: text(intro), problems, errors };
}

/** Problems grouped by level, in level order: [{ level, problems }]. */
export function groupByLevel(problems) {
  return LEVELS.map((level) => ({ level, problems: problems.filter((p) => p.level === level) })).filter(
    (g) => g.problems.length > 0,
  );
}
