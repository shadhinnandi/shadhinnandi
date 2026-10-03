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
];

export const getCourse = (slug) => courses.find((c) => c.slug === slug);

/** Canonical URL of a course. */
export const coursePath = (c) => `/academic/${c.slug}`;
