/*
  Course registry. The Academic page lists these in order, and each one is
  served at /academic/:slug by the view registered for it in
  src/components/academic/courseViews.js.

  To add a course: add an entry here, build its view under
  src/components/academic/<slug>/ and register it in courseViews.js.

  slug      URL segment under /academic/.
  title     Course name, as shown on the card and the course page.
  mark      Short monogram shown on the card cover.
  label     One-line context (courses it supports, level).
  summary   One or two sentences on what the course covers.
  facts     Short items shown as a quiet mono line on the card.
*/

import javaStats from '../components/academic/beginner-java/stats.json';
import securityStats from '../components/academic/computer-security/stats.json';
import webStats from '../components/academic/web-programming/stats.json';
import bioStats from '../components/academic/biology-for-engineers/stats.json';

/** Real counts of the Java course, written by scripts/check-java-course.mjs. */
function javaFacts() {
  return [
    `${javaStats.chapters} chapters`,
    `${javaStats.practice.total} practice problems`,
    `${javaStats.scenarios.total} scenarios`,
    'GUI, games, projects',
  ];
}

/** Real counts of the Computer Security course, written by scripts/check-computer-security.mjs. */
function securityFacts() {
  return [`${securityStats.topics} topics`, `${securityStats.papers} past papers`, `${securityStats.questions} solved questions`];
}

/** Real counts of the Web Programming course, written by scripts/check-web-programming.mjs. */
function webFacts() {
  return [`${webStats.topics} topics`, `${webStats.papers} past papers`, `${webStats.questions} solved questions`];
}

/** Real counts of the Biology for Engineers course, written by scripts/check-biology-course.mjs. */
function biologyFacts() {
  return [`${bioStats.solutions} solved suggestions`, `${bioStats.figures} slide figures`, `${bioStats.papers} past papers`];
}

export const courses = [
  {
    slug: 'beginner-c-programming',
    title: 'Beginner C Programming',
    mark: '{ C }',
    label: 'ICS · SPL · DSA Foundation',
    summary:
      'A comprehensive, structured educational system covering core syntax, program logic, and software foundations. Tailored for academic courses and technical assessments.',
    facts: ['15 chapters', 'Question bank', 'Worked solutions'],
  },
  {
    slug: 'beginner-java-programming',
    title: 'Object Oriented Programming',
    mark: '{ OOP }',
    label: 'OOP · Java · Object-Oriented Design',
    summary:
      'A complete Java and Object-Oriented Programming course from fundamentals to practical advanced concepts.',
    facts: javaFacts(),
  },
  {
    slug: 'computer-security',
    title: 'Computer Security',
    mark: '{ SEC }',
    label: 'CSE 4531 · Cryptography · Network and Web Security',
    summary:
      'Exam-focused notes on cryptography, network attacks, malware and web security, with past final exam papers solved step by step.',
    facts: securityFacts(),
  },
  {
    slug: 'web-programming',
    title: 'Web Programming',
    mark: '{ WEB }',
    label: 'CSE 4165 · JavaScript · PHP · MySQL',
    summary:
      'From the first script to a full database app: JavaScript on the page, PHP forms with POST, and MySQL with MySQLi, with every past final exam paper solved and tested.',
    facts: webFacts(),
  },
  {
    slug: 'biology-for-engineers',
    title: 'Biology for Engineers',
    mark: '{ BIO }',
    label: 'BIO 3105 · Cells · Genetics · Biotechnology · BCI',
    summary:
      'From the cell to brain-computer interfaces: midterm and final suggestions with checked solutions beside the original slide figures, and a question bank of previous papers.',
    facts: biologyFacts(),
  },
];

export const getCourse = (slug) => courses.find((c) => c.slug === slug);

/** Canonical URL of a course. */
export const coursePath = (c) => `/academic/${c.slug}`;
