/*
  Previous question papers of the Computer Security course, parsed into
  questions with their solutions.

  Shared by the course pages (rendering) and by
  scripts/check-computer-security.mjs (checks that every question has a
  solution and writes stats.json), so keep it free of browser and Vite APIs.

  File format (content/papers/<n>-<trimester>.md)
  -----------------------------------------------
    # <trimester>                       e.g. "Spring 2025"
    **Exam:** ...                       one line each, shown in the paper header
    **Total marks:** ...
    **Time:** ...

    ## <number> [<marks>]               e.g. "## 1(a) [3]"
    **Topics:** 04, 02                  ids of the related topic pages

    ### Question
    <question text as printed in the paper>

    ### Solution
    <exam-ready answer>
*/

const SECTION_KEYS = { question: 'question', solution: 'solution' };

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const text = (lines) => (lines || []).join('\n').trim();

/**
 * Parse one paper. `id` is the paper's route id (e.g. "spring-2025").
 * Format problems are collected in `errors` (reported by the checker,
 * ignored by the pages) instead of being thrown.
 */
export function parsePaper(md, id) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  const info = [];
  const raw = [];
  const errors = [];
  let question = null;
  let section = null;
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence) {
      let m;
      if (!title && !question && (m = line.match(/^# (.+)$/))) {
        title = m[1].trim();
        continue;
      }
      if ((m = line.match(/^## (\S+)\s+\[(\d+)\]\s*$/))) {
        question = { number: m[1], marks: Number(m[2]), topics: [], sections: {} };
        raw.push(question);
        section = null;
        continue;
      }
      if (/^## /.test(line)) {
        errors.push(`unexpected heading "${line}" (questions start with "## <number> [<marks>]")`);
        continue;
      }
      if (question && (m = line.match(/^### (.+)$/))) {
        const key = SECTION_KEYS[m[1].trim().toLowerCase()];
        if (key) {
          section = key;
          question.sections[key] = [];
          continue;
        }
      }
      if (question && !section && (m = line.match(/^\*\*Topics:\*\*\s*(.+)$/))) {
        question.topics = m[1].split(',').map((t) => t.trim()).filter(Boolean);
        continue;
      }
      if (!question && (m = line.match(/^\*\*(.+?):\*\*\s*(.+)$/))) {
        info.push({ label: m[1].trim(), value: m[2].trim() });
        continue;
      }
    }
    if (question && section) question.sections[section].push(line);
  }

  const questions = raw.map((q) => ({
    id: `${id}-q${slugify(q.number)}`,
    paper: id,
    number: q.number,
    marks: q.marks,
    topics: q.topics,
    question: text(q.sections.question),
    solution: text(q.sections.solution),
  }));

  questions.forEach((q) => {
    if (!q.question) errors.push(`${q.number}: missing "### Question"`);
    if (!q.solution) errors.push(`${q.number}: missing "### Solution"`);
    if (q.topics.length === 0) errors.push(`${q.number}: missing "**Topics:**"`);
  });

  return { id, title, info, questions, errors };
}
