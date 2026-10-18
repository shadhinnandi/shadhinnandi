// Course outline for English II (ENG 1013). No loaders here, so the course
// card (src/data/courses.js) can read the counts without the pages. Pages are
// read in this order: the general introduction, the midterm section, the
// final section, then the question bank and the two full question papers.
// The topic list comes from the lecture slides and the Spring 2026 papers.

export const GROUPS = [
  { id: 'start', label: 'Start here' },
  { id: 'mid', label: 'Midterm preparation' },
  { id: 'final', label: 'Final preparation' },
  { id: 'qb', label: 'Question bank' },
];

/** Original lecture slides and papers in public/documents/english-2, keyed for the `slides` lists below. */
export const SLIDES = {
  'mid-1': { file: 'mid-1-reading-comprehension-part-1.pdf', title: 'Reading Comprehension, part 1 (Price Hike in Bangladesh)' },
  'mid-2': { file: 'mid-2-reading-comprehension-part-2.pdf', title: 'Reading Comprehension, part 2 (Humayun Ahmed)' },
  'mid-3': { file: 'mid-3-paragraph-writing-part-1.pdf', title: 'Paragraph Writing, part 1 (structure and transitions)' },
  'mid-4': { file: 'mid-4-paragraph-writing-part-2.pdf', title: 'Paragraph Writing, part 2 (descriptive, narrative, process)' },
  'mid-5': { file: 'mid-5-editing-and-paragraph-types.pdf', title: 'Editing & Proofreading, with classification and cause-effect paragraphs' },
  'final-0': { file: 'final-0-essay-outline-descriptive.pdf', title: 'Essay Outline (Descriptive Essay)' },
  'final-1': { file: 'final-1-descriptive-essay-a-rainy-day.pdf', title: 'Descriptive Essay: A Rainy Day' },
  'final-2': { file: 'final-2-cause-and-effect-essay-natural-disasters.pdf', title: 'Cause and Effect Essay: Natural Disasters' },
  'final-2-1': { file: 'final-2-1-cause-essay-natural-disasters.pdf', title: 'Cause Essay: Natural Disasters' },
  'final-2-2': { file: 'final-2-2-effect-essay-natural-disasters.pdf', title: 'Effect Essay: Natural Disasters' },
  'final-3-1': { file: 'final-3-1-argumentative-essay-for-attendance.pdf', title: 'Argumentative Essay: attendance should be mandatory' },
  'final-3-2': { file: 'final-3-2-argumentative-essay-against-attendance.pdf', title: 'Argumentative Essay: attendance should not be mandatory' },
  'final-4': { file: 'final-4-compare-and-contrast-essay-online-offline.pdf', title: 'Compare and Contrast Essay: online and offline classes' },
  'final-4-1': { file: 'final-4-1-similarities-online-offline-classes.pdf', title: 'Comparison Essay: similarities between online and offline classes' },
  'final-4-2': { file: 'final-4-2-differences-offline-online-classes.pdf', title: 'Contrast Essay: offline vs. online classes' },
  'sample-application': { file: 'sample-application-redacted.jpg', width: 1172, height: 1600, title: 'Sample application from the final materials (student ID covered)' },
  'sample-email': { file: 'sample-email.jpg', width: 1190, height: 1600, title: 'Sample email from the final materials' },
  'paper-mid': { file: 'mid-spring-2026-makeup-question.pdf', title: 'Make-Up Midterm question paper, Spring 2026 (with answer key)' },
  'paper-final': { file: 'final-spring-2026-question.pdf', title: 'Final question paper, Spring 2026' },
};

const page = (group, idx, slug, name, kicker, slides = [], extra = {}) => ({
  group,
  idx,
  name,
  short: extra.short || name,
  file: `${group}-${slug}`,
  path: group === 'start' ? slug : `${group === 'qb' ? 'questions' : group}/${slug}`,
  kicker,
  slides,
  ...extra,
});

const MID = 'Midterm';
const FINAL = 'Final';

/** Everything the reader can show, in reading order. */
export const ENTRIES = [
  page('start', '00', 'introduction', 'General Introduction', 'Course'),

  page('mid', 'M1', 'introduction', 'Midterm Introduction', MID, [], { short: 'Introduction' }),
  page('mid', 'M2', 'structure', 'Midterm Course Structure', MID, [], { short: 'Course Structure' }),
  page('mid', 'M3', 'reading', 'Reading Comprehension', MID, ['mid-1', 'mid-2']),
  page('mid', 'M4', 'summary', 'Summary Writing', MID, ['mid-1', 'mid-2']),
  page('mid', 'M5', 'paragraph', 'Paragraph Structure', MID, ['mid-3']),
  page('mid', 'M6', 'descriptive-paragraph', 'Descriptive Paragraph', MID, ['mid-4']),
  page('mid', 'M7', 'narrative-paragraph', 'Narrative Paragraph', MID, ['mid-4']),
  page('mid', 'M8', 'process-paragraph', 'Process Paragraph', MID, ['mid-4']),
  page('mid', 'M9', 'classification-paragraph', 'Classification Paragraph', MID, ['mid-5']),
  page('mid', 'M10', 'cause-effect-paragraph', 'Cause and Effect Paragraph', MID, ['mid-5']),
  page('mid', 'M11', 'editing', 'Editing and Proofreading', MID, ['mid-5']),

  page('final', 'F1', 'introduction', 'Final Introduction', FINAL, [], { short: 'Introduction' }),
  page('final', 'F2', 'structure', 'Final Course Structure', FINAL, [], { short: 'Course Structure' }),
  page('final', 'F3', 'reading', 'Reading: True/False/Not Given and Sentence Making', FINAL, ['mid-1', 'mid-2'], { short: 'Reading Tasks' }),
  page('final', 'F4', 'essay-structure', 'Essay Structure and Outline', FINAL, ['final-0', 'final-1'], { short: 'Essay Structure' }),
  page('final', 'F5', 'thesis-writing', 'Thesis Statement Writing', FINAL, ['final-0', 'final-2', 'final-3-1', 'final-4']),
  page('final', 'F6', 'thesis-editing', 'Thesis Statement Editing', FINAL, ['final-0', 'final-2-1', 'final-4-2']),
  page('final', 'F7', 'descriptive-essay', 'Descriptive Essay', FINAL, ['final-0', 'final-1']),
  page('final', 'F8', 'cause-effect-essay', 'Cause and Effect Essay', FINAL, ['final-2', 'final-2-1', 'final-2-2']),
  page('final', 'F9', 'argumentative-essay', 'Argumentative Essay', FINAL, ['final-3-1', 'final-3-2']),
  page('final', 'F10', 'compare-contrast-essay', 'Compare and Contrast Essay', FINAL, ['final-4', 'final-4-1', 'final-4-2']),
  page('final', 'F11', 'editing', 'Editing: Eight Errors', FINAL, ['mid-5'], { short: 'Editing' }),
  page('final', 'F12', 'application', 'Application Writing', FINAL, ['sample-application']),
  page('final', 'F13', 'email', 'Email Writing', FINAL, ['sample-email']),
  page('final', 'F14', 'vocabulary', 'Vocabulary and Word-to-Sentence Practice', FINAL, [], { short: 'Vocabulary (150 words)' }),

  page('qb', 'QB', 'overview', 'Question Bank', 'Question bank', [], { short: 'Overview', path: 'questions' }),
  page('qb', 'QM', 'mid-spring-2026', 'Midterm Question Paper', 'Make-Up Midterm · Spring 2026', ['paper-mid'], { short: 'Midterm Paper' }),
  page('qb', 'QF', 'final-spring-2026', 'Final Question Paper', 'Final · Spring 2026', ['paper-final'], { short: 'Final Paper' }),
];
