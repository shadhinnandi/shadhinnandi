import { parseProblemFile } from './problems.js';
import INDEX from './problem-index.json';

// Content loaders. Every Markdown file is its own small chunk, loaded on
// demand. problem-index.json (written by scripts/check-dsa-course.mjs
// --write-index) lists every problem's id, title, topic, difficulty and tags,
// so the question bank can filter and search without loading every file.

export { ENTRIES, MODULES, PAGES, DIFFICULTIES, moduleById, moduleBySlug } from './outline.js';

/** [{ id, title, topic, subtopic, difficulty, tags }] in course order. */
export const PROBLEM_INDEX = INDEX;
export const problemById = (id) => INDEX.find((p) => p.id === id);

const lessonFiles = import.meta.glob('./content/lessons/*.md', { query: '?raw', import: 'default' });
const problemFiles = import.meta.glob('./content/problems/*.md', { query: '?raw', import: 'default' });
const pageFiles = import.meta.glob('./content/pages/*.md', { query: '?raw', import: 'default' });

const load = (files, path) => {
  const fn = files[path];
  return fn ? fn() : Promise.resolve(null);
};

const parsed = new Map();

/** The parsed problem file of a topic ('07', '16A' or 'completion'), cached; null if none. */
export async function loadProblems(topic) {
  if (parsed.has(topic)) return parsed.get(topic);
  const md = await load(problemFiles, `./content/problems/${topic}.md`);
  const file = md == null ? null : parseProblemFile(md, topic);
  parsed.set(topic, file);
  return file;
}

/** A topic page: its lesson and its problems. */
export async function loadTopic(id) {
  const [lesson, problems] = await Promise.all([load(lessonFiles, `./content/lessons/${id}.md`), loadProblems(id)]);
  if (lesson == null) throw new Error(`Unknown topic ${id}`);
  return { lesson, problems };
}

export async function loadPage(slug) {
  const md = await load(pageFiles, `./content/pages/${slug}.md`);
  if (md == null) throw new Error(`Unknown page ${slug}`);
  return { lesson: md };
}

/** One problem with its full record. */
export async function loadProblem(id) {
  const entry = problemById(id);
  if (!entry) throw new Error(`Unknown problem ${id}`);
  const file = await loadProblems(entry.topic);
  const problem = file?.problems.find((p) => p.id === id);
  if (!problem) throw new Error(`Problem ${id} not found in its file`);
  return { problem };
}
