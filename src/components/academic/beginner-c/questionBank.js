/*
  Question bank model, built from the course's Markdown sources:

    content/14.md                      chapter 14, whose "Problem Index" lists
                                       every problem by topic and difficulty
    content/question-bank/questions.md statements and hints
    content/question-bank/solutions.md worked solutions and explanations

  Problem text is never rewritten: each problem keeps its original Markdown
  body, which is rendered like the chapters. Problems are matched across the
  three files by topic, difficulty and number. A problem listed in the index
  without a statement, or a statement without a solution, is kept and shown
  as such rather than dropped.
*/

const LEVELS = ['Easy', 'Medium', 'Hard'];

const levelOf = (heading) => LEVELS.find((l) => heading.includes(l)) || null;

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const keyOf = (topic, level, number) => `${topic}|${level}|${number}`;

/**
 * Split questions.md or solutions.md into problems.
 * Structure: "## <topic>", "### <emoji> <level>", "**<n>. <title>**", body.
 */
export function parseProblemFile(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const problems = [];
  let title = '';
  const intro = [];
  let topic = null;
  let level = null;
  let current = null;
  let inFence = false;

  const flush = () => {
    if (current) {
      current.body = current.body.join('\n').trim();
      problems.push(current);
      current = null;
    }
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence) {
      let m;
      if ((m = line.match(/^# (.+)$/))) {
        flush();
        title = m[1].trim();
        continue;
      }
      if ((m = line.match(/^## (.+)$/))) {
        flush();
        topic = m[1].trim();
        level = null;
        continue;
      }
      if ((m = line.match(/^### (.+)$/))) {
        flush();
        level = levelOf(m[1]);
        continue;
      }
      if ((m = line.match(/^\*\*(\d+)\.\s+(.+?)\*\*\s*$/))) {
        flush();
        current = { topic, level, number: Number(m[1]), title: m[2].trim(), body: [] };
        continue;
      }
      if (/^---\s*$/.test(line)) {
        flush();
        continue;
      }
    }
    if (current) current.body.push(line);
    else if (!topic) intro.push(line);
  }
  flush();
  return { title, intro: intro.join('\n').trim(), problems };
}

/** The "Problem Index" section of chapter 14: topic → level → numbered titles. */
export function parseProblemIndex(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const start = lines.findIndex((l) => /^## .*Problem Index/.test(l));
  if (start < 0) return [];
  const entries = [];
  let topic = null;
  let level = null;
  for (const line of lines.slice(start + 1)) {
    if (/^---\s*$/.test(line) || /^## /.test(line)) break;
    let m;
    if ((m = line.match(/^### (.+)$/))) {
      topic = m[1].trim();
      level = null;
    } else if ((m = line.match(/^\*\s+\*\*(Easy|Medium|Hard)\*\*/))) {
      level = m[1];
    } else if ((m = line.match(/^\s+(\d+)\.\s+(.+?)\s*$/)) && topic && level) {
      entries.push({ topic, level, number: Number(m[1]), title: m[2] });
    }
  }
  return entries;
}

/**
 * Combine index, questions and solutions into topics → levels → problems.
 * Order follows the index; problems that only appear in questions.md are
 * appended in file order.
 */
export function buildQuestionBank({ chapter, questions, solutions }) {
  const index = parseProblemIndex(chapter);
  const q = parseProblemFile(questions);
  const s = parseProblemFile(solutions);

  const statements = new Map(q.problems.map((p) => [keyOf(p.topic, p.level, p.number), p]));
  const answers = new Map(s.problems.map((p) => [keyOf(p.topic, p.level, p.number), p]));

  const seen = new Set();
  const ordered = [];
  const add = (topic, level, number, title) => {
    const key = keyOf(topic, level, number);
    if (seen.has(key)) return;
    seen.add(key);
    const statement = statements.get(key);
    const solution = answers.get(key);
    ordered.push({
      id: `${slugify(topic)}-${level.toLowerCase()}-${number}`,
      topic,
      level,
      number,
      title: statement?.title || title,
      statement: statement?.body || null,
      solution: solution && solution.title === (statement?.title || title) ? solution.body || null : null,
    });
  };
  for (const e of index) add(e.topic, e.level, e.number, e.title);
  for (const p of q.problems) if (p.topic && p.level) add(p.topic, p.level, p.number, p.title);

  const topics = [];
  for (const p of ordered) {
    let t = topics.find((x) => x.name === p.topic);
    if (!t) {
      const [chapterLabel, ...rest] = p.topic.split(':');
      t = {
        id: slugify(p.topic),
        name: p.topic,
        chapter: rest.length ? chapterLabel.trim() : null,
        label: rest.length ? rest.join(':').trim() : p.topic,
        levels: [],
      };
      topics.push(t);
    }
    let l = t.levels.find((x) => x.level === p.level);
    if (!l) {
      l = { level: p.level, problems: [] };
      t.levels.push(l);
    }
    l.problems.push(p);
  }
  for (const t of topics) t.levels.sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));

  return { title: q.title, topics, problems: ordered };
}

export const LEVEL_NAMES = LEVELS;
