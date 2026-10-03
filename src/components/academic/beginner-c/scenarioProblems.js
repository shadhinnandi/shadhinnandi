/*
  Scenario-based problems: one Markdown file per chapter in
  content/scenarios/<chapter>.md, parsed into structured problems.

  Shared by the course reader (rendering) and by
  scripts/check-scenario-problems.mjs (compiles every solution with GCC and
  checks the sample and test outputs), so keep it free of browser and Vite
  APIs.

  File format
  -----------
    # <set title>                      optional
    <intro Markdown>                   optional, shown above the problems

    ## Problem <n>: <title>
    **Level:** Moderate | Intermediate | Challenging

    ### Scenario
    ### Problem Statement
    ### Sample Input                   fenced block(s); "No input." if none
    ### Sample Output                  fenced block(s)
    ### Solution                       one ```c block
    ### Explanation
    ### Concepts Practiced             bullet list
    ### Test Cases
    #### <test title>
    **Change** `old` → `new`           optional: run a variant of the solution
    **Input**                          fenced block (or "No input.")
    **Expected Output**                fenced block

  A fenced block preceded by a line **File `name`** is a file instead of
  standard input/output: in Sample Input / **Input file `name`** it is
  created before the program runs; in Sample Output / **Expected file
  `name`** it must exist with that content afterwards.
*/

export const LEVELS = ['Moderate', 'Intermediate', 'Challenging'];

const SECTION_KEYS = {
  scenario: 'scenario',
  'problem statement': 'statement',
  'sample input': 'sampleInput',
  'sample output': 'sampleOutput',
  solution: 'solution',
  explanation: 'explanation',
  'concepts practiced': 'concepts',
  'test cases': 'tests',
};

export const REQUIRED_SECTIONS = Object.values(SECTION_KEYS);

/** Split lines into a list of { type: 'text', lines } and { type: 'fence', lang, body } blocks. */
function blocks(lines) {
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
    const m = line.match(/^```(\S*)\s*$/);
    if (m) {
      if (text.length) out.push({ type: 'text', lines: text });
      text = [];
      fence = { lang: m[1], body: [] };
    } else text.push(line);
  }
  if (fence) throw new Error('Unclosed code fence');
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
    // **Change** `old code` → `new code`: a variant of the solution to run
    // for this test (used where a program has no input).
    const changes = inputLines
      .map((l) => l.match(/^\*\*Change\*\*\s+`(.+?)`\s*(?:→|->)\s*`(.+?)`\s*$/))
      .filter(Boolean)
      .map((m) => ({ from: m[1], to: m[2] }));
    return { title: t.title, note, changes, input: parseIO(inputLines), output: parseIO(outputLines) };
  });
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Parse one chapter's scenario-problem file. `chapterId` is used for anchors. */
export function parseScenarioFile(md, chapterId = '') {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  const intro = [];
  const problems = [];
  let problem = null;
  let section = null;
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence) {
      let m;
      if (!problem && (m = line.match(/^# (.+)$/))) {
        title = m[1].trim();
        continue;
      }
      if ((m = line.match(/^## Problem (\d+):\s*(.+)$/))) {
        problem = { number: Number(m[1]), title: m[2].trim(), level: null, sections: {}, extra: [] };
        problems.push(problem);
        section = null;
        continue;
      }
      if (problem && (m = line.match(/^### (.+)$/))) {
        const key = SECTION_KEYS[m[1].trim().toLowerCase()];
        if (!key) throw new Error(`Problem ${problem.number}: unknown section "${m[1]}"`);
        section = key;
        problem.sections[key] = [];
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

  const text = (l) => (l || []).join('\n').replace(/^\s*---\s*$/gm, '').trim();

  return {
    title,
    intro: text(intro),
    problems: problems.map((p) => {
      const s = p.sections;
      const code = (s.solution ? blocks(s.solution) : []).find((b) => b.type === 'fence');
      return {
        id: `sp-${chapterId}-${p.number}`,
        number: p.number,
        title: p.title,
        level: p.level,
        scenario: text(s.scenario),
        statement: text(s.statement),
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
        missing: REQUIRED_SECTIONS.filter((k) => !s[k]),
        extra: p.extra,
        slug: slug(p.title),
      };
    }),
  };
}
