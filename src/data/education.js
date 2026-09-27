import { image } from '../lib/media';

// Source: evidence/resume.pdf (EDUCATION, ACHIEVEMENTS); course codes from
// project-show certificates and repository READMEs.
export const degree = {
  title: 'B.Sc. in Computer Science & Engineering',
  institution: 'United International University (UIU)',
  location: 'Dhaka, Bangladesh',
  period: 'Oct 2022 – Jan 2027 (expected)',
  facts: [
    { label: 'CGPA', value: '3.93 / 4.00' },
    { label: 'Credits completed', value: '119' },
    { label: 'Merit scholarships', value: '8 × 100%, 2 × 25%' },
  ],
  photo: image(
    'uiu-campus',
    'United International University campus towers seen across the playing field, with a UIU envelope held in the foreground',
  ),
};

export const schooling = [
  {
    title: 'Higher Secondary Certificate (HSC), Science',
    institution: 'Monipur High School and College',
    period: 'Jul 2019 – Dec 2021',
    result: 'GPA 4.83 / 5.00',
  },
  {
    title: 'Secondary School Certificate (SSC), Science',
    institution: 'Banophool Adibashi Green Heart College',
    period: 'Jan 2017 – Apr 2019',
    result: 'GPA 4.28 / 5.00',
  },
];

export const scholarships = {
  title: 'Merit scholarships',
  detail: 'Recipient of 8 × 100% and 2 × 25% merit scholarships at UIU for academic performance.',
};
