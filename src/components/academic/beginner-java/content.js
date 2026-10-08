import { parseProblemFile } from './problems.js';

// Course outline and content loaders. Every Markdown file is loaded on
// demand as its own small chunk, so the course page itself stays light.
//
//   content/chapters/<id>.md        lesson: concepts, syntax, worked examples
//   content/practice/<id>.md        practice problems of the chapter
//   content/scenarios/<id>.md       scenario-based problems of the chapter
//   content/labs/<id>.md            practical labs (GUI, games, projects)
//   content/question-bank/*.md      question bank, one file per topic

// `topics` is the one-line summary shown in the syllabus on the overview page.
export const CHAPTERS = [
  { id: '00', name: 'Introduction to Java and OOP', topics: 'JDK, JRE, JVM, bytecode, program structure, why OOP' },
  { id: '01', name: 'Java Fundamentals', topics: 'Types, variables, operators, casting, Scanner, printf' },
  { id: '02', name: 'Conditionals and Loops', topics: 'if, switch, for, while, do-while, break, continue' },
  { id: '03', name: 'Methods and Problem Solving', topics: 'Parameters, overloading, recursion, pass-by-value' },
  { id: '04', name: 'Classes and Objects', topics: 'Fields, methods, new, this, designing a class' },
  { id: '05', name: 'Encapsulation and Access Control', topics: 'Access modifiers, getters, validation, immutability' },
  { id: '06', name: 'Constructors and Object Lifecycle', topics: 'Chaining, copy constructors, garbage collection' },
  { id: '07', name: 'Static and Instance Members', topics: 'Class variables, static methods, constants, enums' },
  { id: '08', name: 'Arrays, References and Collections', topics: 'Arrays of objects, references, null, ArrayList' },
  { id: '09', name: 'Inheritance', topics: 'extends, super, overriding, single inheritance, interfaces' },
  { id: '10', name: 'Polymorphism and Interfaces', topics: 'Dynamic dispatch, abstract classes, interfaces' },
  { id: '11', name: 'Exception Handling', topics: 'try, catch, finally, throw, checked vs unchecked' },
  { id: '12', name: 'Object-Oriented I/O', topics: 'Streams, readers, writers, buffering, serialization' },
  { id: '13', name: 'Generic Programming', topics: 'Generic classes and methods, bounds, wildcards' },
  { id: '14', name: 'Multithreaded Programming', topics: 'Threads, Runnable, join, synchronization, executors' },
];

/** Practical labs, read after the chapters. */
export const LABS = [
  { id: 'gui', idx: 'L1', name: 'GUI Programming with Swing', topics: 'Frames, panels, layouts, events, small desktop apps' },
  { id: 'games', idx: 'L2', name: 'Games', topics: 'Console and Swing games built from cooperating classes' },
  { id: 'projects', idx: 'L3', name: 'Projects', topics: 'Complete systems built step by step, plus project ideas' },
];

export const QUESTION_BANK = { id: 'question-bank', idx: 'QB', name: 'Question Bank' };

/** Everything the reader can show, in reading order. */
export const ENTRIES = [
  ...CHAPTERS.map((c) => ({ ...c, idx: c.id, path: `chapter/${c.id}`, kind: 'chapter' })),
  ...LABS.map((l) => ({ ...l, path: `lab/${l.id}`, kind: 'lab' })),
  { ...QUESTION_BANK, path: QUESTION_BANK.id, kind: 'question-bank' },
];

const lessonFiles = import.meta.glob('./content/chapters/*.md', { query: '?raw', import: 'default' });
const practiceFiles = import.meta.glob('./content/practice/*.md', { query: '?raw', import: 'default' });
const scenarioFiles = import.meta.glob('./content/scenarios/*.md', { query: '?raw', import: 'default' });
const labFiles = import.meta.glob('./content/labs/*.md', { query: '?raw', import: 'default' });
const bankFiles = import.meta.glob('./content/question-bank/*.md', { query: '?raw', import: 'default' });

const loadFile = (files, path) => {
  const load = files[path];
  return load ? load() : Promise.resolve(null);
};

/** A chapter: lesson Markdown plus its practice and scenario problems (null if none). */
export async function loadChapter(id) {
  const [lesson, practice, scenarios] = await Promise.all([
    loadFile(lessonFiles, `./content/chapters/${id}.md`),
    loadFile(practiceFiles, `./content/practice/${id}.md`),
    loadFile(scenarioFiles, `./content/scenarios/${id}.md`),
  ]);
  if (lesson == null) throw new Error(`Unknown chapter ${id}`);
  return {
    lesson,
    practice: practice == null ? null : parseProblemFile(practice, 'practice', `pp-${id}-`),
    scenarios: scenarios == null ? null : parseProblemFile(scenarios, 'scenario', `sp-${id}-`),
  };
}

export async function loadLab(id) {
  const lesson = await loadFile(labFiles, `./content/labs/${id}.md`);
  if (lesson == null) throw new Error(`Unknown lab ${id}`);
  return { lesson };
}

/** IDs of the chapters that have scenario-based problems. */
export const SCENARIO_CHAPTERS = Object.keys(scenarioFiles)
  .map((path) => path.match(/(\d\d)\.md$/)[1])
  .sort();

/**
 * The question bank: one topic per file, in file-name order. Problems are
 * numbered across the whole bank (Q1, Q2, ...) for display.
 */
export async function loadQuestionBank() {
  const paths = Object.keys(bankFiles).sort();
  const sources = await Promise.all(paths.map((p) => bankFiles[p]()));
  const topics = [];
  let n = 0;
  sources.forEach((md, i) => {
    const slug = paths[i].match(/([^/]+)\.md$/)[1].replace(/^\d+-/, '');
    const file = parseProblemFile(md, 'question', `qb-${slug}-`);
    topics.push({
      id: slug,
      name: file.title,
      intro: file.intro,
      problems: file.problems.map((p) => {
        n += 1;
        return { ...p, topic: slug, qn: n };
      }),
    });
  });
  return { topics, problems: topics.flatMap((t) => t.problems) };
}
