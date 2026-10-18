// Course outline for Data Structures and Algorithms I. No loaders and no
// browser APIs here, so the course card (src/data/courses.js) and
// scripts/check-dsa-course.mjs can both read it.
//
//   content/lessons/<id>.md     one lesson per topic (the "One topic = one page" rule)
//   content/problems/<id>.md    that topic's practice problems (canonical records)
//   content/problems/completion.md   completion-level challenges
//   content/pages/<slug>.md     lab preparation, interview preparation, coverage
//
// `syllabus` lists the official syllabus items the lesson covers; the coverage
// page and the check script use it. Items marked `extension` go beyond the
// official DSA I syllabus and are labelled as such on the pages.

export const MODULES = [
  {
    id: '00',
    slug: 'prerequisites',
    name: 'Programming and Mathematical Prerequisites',
    short: 'Prerequisites',
    summary: 'Functions, loops, arrays, references, recursion, logarithms, summations, induction, overflow and constraints',
  },
  {
    id: '01',
    slug: 'data-representation',
    name: 'Internal Data Representation',
    short: 'Data Representation',
    summary: 'Bits, bytes, types, addresses, contiguous vs linked storage, stack vs heap memory',
  },
  {
    id: '02',
    slug: 'abstract-data-types',
    name: 'Abstract Data Types',
    short: 'Abstract Data Types',
    summary: 'Interface vs implementation, invariants, List, Stack, Queue, Set, Map, Priority Queue',
  },
  {
    id: '03',
    slug: 'introduction-to-algorithms',
    name: 'Introduction to Algorithms',
    short: 'Introduction to Algorithms',
    summary: 'Properties, pseudocode, iteration vs recursion, brute force, divide and conquer, greedy, dry runs',
  },
  {
    id: '04',
    slug: 'asymptotic-analysis',
    name: 'Asymptotic Analysis',
    short: 'Asymptotic Analysis',
    summary: 'Best, average and worst case; Big O, Ω and Θ; growth rates; analysing loops and recursion',
  },
  {
    id: '05',
    slug: 'correctness-and-recurrences',
    name: 'Correctness Proofs and Analysis Techniques',
    short: 'Correctness and Recurrences',
    summary: 'Loop invariants, induction, contradiction, recurrences, substitution and recursion trees',
  },
  {
    id: '06',
    slug: 'master-theorem',
    name: 'Master Theorem',
    short: 'Master Theorem',
    summary: 'T(n) = aT(n/b) + f(n), the three cases, regularity, when the theorem does not apply',
  },
  {
    id: '07',
    slug: 'arrays',
    name: 'Arrays',
    short: 'Arrays',
    summary: '1D and 2D arrays, memory layout, static vs dynamic arrays, prefix sums, frequency arrays',
  },
  {
    id: '08',
    slug: 'linked-lists',
    name: 'Linked Lists',
    short: 'Linked Lists',
    summary: 'Singly, doubly and circular lists, sentinels, insertion, deletion, reversal, merging',
  },
  {
    id: '09',
    slug: 'stacks',
    name: 'Stacks',
    short: 'Stacks',
    summary: 'LIFO, array and list stacks, balanced brackets, infix/postfix/prefix, call stack, monotonic stack',
  },
  {
    id: '10',
    slug: 'queues',
    name: 'Queues',
    short: 'Queues',
    summary: 'FIFO, circular queues, deque, priority queue, overflow and underflow',
  },
  {
    id: '11',
    slug: 'trees',
    name: 'Trees and Tree Traversals',
    short: 'Trees and Traversals',
    summary: 'Terminology, full/complete/perfect, representations, four traversals, reconstruction',
  },
  {
    id: '12',
    slug: 'graphs',
    name: 'Graphs and Graph Representations',
    short: 'Graphs',
    summary: 'Directed, undirected, weighted, DAGs, adjacency matrix and list, edge list, sparse vs dense',
  },
  {
    id: '13',
    slug: 'bfs-dfs',
    name: 'Graph Traversals: BFS and DFS',
    short: 'BFS and DFS',
    summary: 'Queue-based BFS, recursive and iterative DFS, components, shortest hops, cycles, flood fill',
  },
  {
    id: '14',
    slug: 'heaps',
    name: 'Heaps',
    short: 'Heaps',
    summary: 'Min and max heaps, array indexing, sift up/down, build-heap in O(n), priority queues, top-k',
  },
  {
    id: '15',
    slug: 'binary-search-trees',
    name: 'Binary Search Trees',
    short: 'Binary Search Trees',
    summary: 'Ordering property, search, insert, delete (three cases), successor, degenerate trees',
  },
  {
    id: '16A',
    slug: 'heap-sort',
    name: 'Heap Sort',
    short: 'Heap Sort',
    summary: 'Build a max-heap, repeatedly extract, in-place, O(n log n), not stable',
  },
  {
    id: '16B',
    slug: 'merge-sort',
    name: 'Merge Sort',
    short: 'Merge Sort',
    summary: 'Divide and conquer, merging, T(n) = 2T(n/2) + n, stable, O(n) extra space',
  },
  {
    id: '16C',
    slug: 'quick-sort',
    name: 'Quick Sort',
    short: 'Quick Sort',
    summary: 'Lomuto and Hoare partitions, pivot choice, average vs worst case, randomisation',
  },
  {
    id: '16D',
    slug: 'linear-time-sorting',
    name: 'Linear-Time Sorting',
    short: 'Linear-Time Sorting',
    summary: 'Counting, radix and bucket sort, key-range assumptions, the comparison lower bound',
  },
  {
    id: '17',
    slug: 'set-operations-and-dsu',
    name: 'Data Structures for Set Operations',
    short: 'Sets and Union-Find',
    summary: 'Set ADT, union/intersection/difference, hashing vs trees, Disjoint Set Union',
  },
  {
    id: '18',
    slug: 'revision',
    name: 'Integrated Revision and Job Preparation',
    short: 'Integrated Revision',
    summary: 'Choosing a structure, cross-topic comparisons, timed mixed sets, revision checklists',
  },
];

/** Practice and preparation pages, read after the modules. */
export const PAGES = [
  { slug: 'question-bank', idx: 'QB', name: 'Question Bank', kind: 'question-bank' },
  { slug: 'challenges', idx: 'CC', name: 'Completion Challenges', kind: 'challenges' },
  { slug: 'lab-preparation', idx: 'LP', name: 'Lab and Exam Preparation', kind: 'page' },
  { slug: 'interview-preparation', idx: 'IP', name: 'Interview Preparation', kind: 'page' },
  { slug: 'coverage', idx: 'SC', name: 'Syllabus Coverage', kind: 'page' },
];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

/** Minimum practice per topic page: 5 Easy, 5 Medium, 5 Hard. */
export const MIN_PER_DIFFICULTY = 5;

/**
 * Topics whose practice is drawn from the rest of the bank instead of their
 * own problem file (documented exception: the revision module's practice is
 * timed mixed sets of existing problems plus the completion challenges).
 */
export const NO_OWN_PROBLEMS = new Set(['18']);

/** Everything the reader can show, in reading order. Problem pages are added dynamically. */
export const ENTRIES = [
  ...MODULES.map((m) => ({ ...m, idx: m.id, path: `topic/${m.slug}`, kind: 'topic' })),
  ...PAGES.map((p) => ({ ...p, path: p.slug })),
];

export const moduleById = (id) => MODULES.find((m) => m.id === id);
export const moduleBySlug = (slug) => MODULES.find((m) => m.slug === slug);

/** "DSA07-E03" → { module: '07', difficulty: 'Easy', n: 3 }; completion: "DSA-C05". */
export function parseProblemId(id) {
  const m = /^DSA(\d\d[A-D]?)-([EMH])(\d\d)$/.exec(id);
  if (m) return { module: m[1], difficulty: { E: 'Easy', M: 'Medium', H: 'Hard' }[m[2]], n: Number(m[3]) };
  const c = /^DSA-C(\d\d)$/.exec(id);
  if (c) return { module: 'completion', difficulty: 'Hard', n: Number(c[1]) };
  return null;
}
