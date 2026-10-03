import { buildQuestionBank } from './questionBank.js';
import { parseScenarioFile } from './scenarioProblems.js';

// Course outline and content loaders. Chapter files are the course's original
// Markdown; each is loaded on demand as its own small chunk.

export const CHAPTERS = [
  { id: '00', name: 'Introduction' },
  { id: '01', name: 'Basics' },
  { id: '02', name: 'Variables & Data Types' },
  { id: '03', name: 'Input & Output' },
  { id: '04', name: 'Operators' },
  { id: '05', name: 'Conditional Statements' },
  { id: '06', name: 'Loops' },
  { id: '07', name: 'Pattern Problems' },
  { id: '08', name: 'Functions' },
  { id: '09', name: 'Arrays' },
  { id: '10', name: 'Strings' },
  { id: '11', name: 'Basic Projects' },
  { id: '12', name: 'File Handling' },
  { id: '13', name: 'Mindset & Problem Solving' },
  { id: '14', name: 'Practice Problem Bank' },
];

/** The question bank sits after the last chapter in the reader. */
export const QUESTION_BANK = { id: 'question-bank', idx: 'QB', name: 'Question Bank' };

/** Everything the reader can show, in reading order. */
export const ENTRIES = [
  ...CHAPTERS.map((c) => ({ ...c, idx: c.id, path: `chapter/${c.id}`, kind: 'chapter' })),
  { ...QUESTION_BANK, path: QUESTION_BANK.id, kind: 'question-bank' },
];

const chapterFiles = import.meta.glob('./content/*.md', { query: '?raw', import: 'default' });

export function loadChapter(id) {
  const load = chapterFiles[`./content/${id}.md`];
  return load ? load() : Promise.reject(new Error(`Unknown chapter ${id}`));
}

const scenarioFiles = import.meta.glob('./content/scenarios/*.md', { query: '?raw', import: 'default' });

/** A chapter's scenario-based problems, or null if it has none. */
export async function loadScenarios(id) {
  const load = scenarioFiles[`./content/scenarios/${id}.md`];
  return load ? parseScenarioFile(await load(), id) : null;
}

/** IDs of the chapters that have scenario-based problems. */
export const SCENARIO_CHAPTERS = Object.keys(scenarioFiles)
  .map((path) => path.match(/(\d\d)\.md$/)[1])
  .sort();

export async function loadQuestionBank() {
  const [chapter, questions, solutions] = await Promise.all([
    loadChapter('14'),
    import('./content/question-bank/questions.md?raw').then((m) => m.default),
    import('./content/question-bank/solutions.md?raw').then((m) => m.default),
  ]);
  return buildQuestionBank({ chapter, questions, solutions });
}

/**
 * Links inside the Markdown that point at other course files, mapped to
 * course routes (relative to the course root).
 */
export function resolveCourseLink(href) {
  if (/^(?:\.\/)?(questions|solutions)\.md$/.test(href)) return QUESTION_BANK.id;
  return null;
}
