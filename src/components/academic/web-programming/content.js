import { parsePaper } from '../computer-security/papers.js';
import stats from './stats.json';

// Course outline and content loaders for Web Programming (CSE 4165).
// Same layout as the Computer Security course, whose Markdown renderer,
// paper parser and styles this course shares:
//
//   content/topics/<id>.md              learning topics
//   content/papers/<code>-<id>.md       a final exam paper with answers;
//                                       <code> is the UIU trimester code
//                                       (233 = Fall 2023 ... 261 = Spring 2026)
//
// Which papers asked about each topic comes from the "**Topics:**" line of
// every question, collected into stats.json by scripts/check-web-programming.mjs.

export const TOPICS = [
  { id: '00', name: 'Introduction', topics: 'How the course and the final exam are organised, and how to use these notes' },
  { id: '01', name: 'HTML Basics', topics: 'Page structure, forms, inputs, radio, select, id vs name, tables' },
  { id: '02', name: 'CSS Basics', topics: 'Inline, internal and external CSS, selectors, simple form and table styling' },
  { id: '03', name: 'JavaScript Fundamentals', topics: 'Script tags, let and const, types, operators, Math, number conversion' },
  { id: '04', name: 'JavaScript and the Page (DOM)', topics: 'getElementById, value, innerHTML, onclick, script.js, alert and prompt' },
  { id: '05', name: 'JavaScript Conditions', topics: 'if, else if, ranges, switch, ternary, feedback messages' },
  { id: '06', name: 'JavaScript Loops', topics: 'for, while, do...while, break, continue, tables and patterns' },
  { id: '07', name: 'JavaScript Arrays and Sorting', topics: 'push, length, sum, average, max, min, numeric sort, includes, join' },
  { id: '08', name: 'JavaScript Strings and Patterns', topics: 'Length, case, reverse, palindrome, checking for digits and symbols' },
  { id: '09', name: 'JavaScript State, Validation and Exam Patterns', topics: 'Running totals, attempt counters, random numbers, validation, rounding' },
  { id: '10', name: 'PHP Fundamentals', topics: 'PHP tags, $variables, echo, types, operators, concatenation, math functions' },
  { id: '11', name: 'PHP Conditions, Loops and Functions', topics: 'if/elseif, switch, for, while, foreach, functions and return values' },
  { id: '12', name: 'PHP Arrays and Strings', topics: 'Indexed and associative arrays, sort, implode, strlen, strrev, preg_match' },
  { id: '13', name: 'PHP Forms with POST', topics: 'One-file form + PHP, $_POST, isset, validation, htmlspecialchars, tables' },
  { id: '14', name: 'XAMPP and Database Setup', topics: 'Apache, MySQL, phpMyAdmin, htdocs, CREATE DATABASE and CREATE TABLE' },
  { id: '15', name: 'SQL Fundamentals', topics: 'SELECT, WHERE, ORDER BY, LIMIT, LIKE, IN, BETWEEN, INSERT, UPDATE, DELETE' },
  { id: '16', name: 'SQL Aggregation, Grouping and Joins', topics: 'COUNT, SUM, AVG, GROUP BY, HAVING, CASE, subqueries, JOIN' },
  { id: '17', name: 'PHP and MySQLi', topics: 'Connecting, query, fetch_assoc, prepared statements, errors, HTML tables' },
  { id: '18', name: 'PHP CRUD and the Full Workflow', topics: 'One-file insert, list, search, update and delete with POST' },
  { id: '19', name: 'Database Exam Practice', topics: 'Turning questions into SQL, troubleshooting, revision tables' },
];

const paperFiles = import.meta.glob('./content/papers/*.md', { query: '?raw', import: 'default' });
const topicFiles = import.meta.glob('./content/topics/*.md', { query: '?raw', import: 'default' });

const SEASONS = { 1: 'Spring', 2: 'Summer', 3: 'Fall' };

/** Papers in trimester order, e.g. { id: 'spring-2026-set-a', code: '261', idx: '261A', name: 'Spring 2026 Set A' }. */
export const PAPERS = Object.keys(paperFiles)
  .sort()
  .map((file) => {
    const [, code, id] = file.match(/(\d+)-([^/]+)\.md$/);
    const set = id.match(/set-([a-z])$/);
    const name = `${SEASONS[code[2]]} 20${code.slice(0, 2)}${set ? ` Set ${set[1].toUpperCase()}` : ''}`;
    return { id, code, idx: `${code}${set ? set[1].toUpperCase() : ''}`, name, file };
  });

/** Everything the reader can show, in reading order. */
export const ENTRIES = [
  ...TOPICS.map((t) => ({ ...t, idx: t.id, path: `topic/${t.id}`, kind: 'topic' })),
  ...PAPERS.map((p) => ({ ...p, path: `paper/${p.id}`, kind: 'paper' })),
];

/** Questions from the papers on a topic: [{ paper, name, number, marks, id }]. */
export const askedIn = (topicId) => stats.asked[topicId] || [];

/** Paper names in which a topic was asked, in paper order. */
export function askedTrimesters(topicId) {
  const seen = askedIn(topicId).map((q) => q.name);
  return PAPERS.map((p) => p.name).filter((n) => seen.includes(n));
}

export async function loadTopic(id) {
  const load = topicFiles[`./content/topics/${id}.md`];
  if (!load) throw new Error(`Unknown topic ${id}`);
  return { lesson: await load() };
}

export async function loadPaper(id) {
  const paper = PAPERS.find((p) => p.id === id);
  if (!paper) throw new Error(`Unknown paper ${id}`);
  return parsePaper(await paperFiles[paper.file](), paper.id);
}

export { stats };
