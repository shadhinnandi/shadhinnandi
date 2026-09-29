import { image, publicUrl } from '../lib/media';

// Sources: resume ACHIEVEMENTS, project-show certificates and photos,
// evidence/Evidence_0112230604_ShadhinNandi.pdf (Grameenphone Academy certificates).
export const awards = [
  {
    id: 'project-show-253',
    title: '3rd Runner-Up, CSE Project Show',
    result: '3rd Runner-Up',
    event: 'UIU CSE Project Show 253',
    teams: 93,
    category: 'Advanced Object-Oriented Programming Laboratory (CSE 2118)',
    date: 'Fall 2025',
    context: 'Among 93 teams · Advanced Object-Oriented Programming Laboratory (CSE 2118)',
    project: { name: 'Vortex Arena', slug: 'vortex-arena' },
    issuer: 'Department of CSE, United International University',
    certificate: image('cert-projectshow-253', 'Certificate of achievement: 3rd Runner-Up in the Advanced Object Oriented Programming Laboratory at the CSE Project Show Fall 2025, presented to Shadhin Nandi'),
    photos: [
      image('vortex-stage', 'Vortex Arena team receiving the 3rd Runner-Up award on stage at the CSE Project Show'),
      image('vortex-team', 'Shadhin Nandi and two teammates holding their CSE Project Show trophies'),
    ],
  },
  {
    id: 'project-show-252',
    title: '3rd Runner-Up, CSE Project Show',
    result: '3rd Runner-Up',
    event: 'UIU CSE Project Show 252',
    teams: 73,
    category: 'Microprocessors and Microcontrollers Laboratory (CSE 4326)',
    date: 'Summer 2025',
    context: 'Among 73 teams · Microprocessors and Microcontrollers Laboratory (CSE 4326)',
    project: { name: 'ARAM', slug: 'aram' },
    issuer: 'Department of CSE, United International University',
    certificate: image('cert-projectshow-252', 'Certificate of achievement: 3rd Runner-Up in the Microprocessors and Micro-controllers Lab at the CSE Project Show Summer 2025, presented to Shadhin Nandi'),
    photos: [
      image('aram-stage', 'Award winners on stage at the CSE Project Show Summer 2025'),
      image('aram-trophy', 'Shadhin Nandi holding the CSE Project Show trophy in front of a brick wall'),
    ],
  },
];

export const gpAcademy = {
  issuer: 'Grameenphone Academy',
  summary: '11 professional development courses covering AI, communication, interview preparation, Excel, networking and career readiness.',
  period: 'Mar – May 2026',
  courses: [
    { title: 'Art of Communication', date: '2026-03-24', file: 'gp-art-of-communication' },
    { title: 'LinkedIn 101', date: '2026-03-24', file: 'gp-linkedin-101' },
    { title: 'Smart CV', date: '2026-03-24', file: 'gp-smart-cv' },
    { title: 'Acing Aptitude Tests', date: '2026-03-25', file: 'gp-acing-aptitude-tests' },
    { title: 'Career with AI', date: '2026-03-25', file: 'gp-career-with-ai' },
    { title: 'Corporate Presentation Skills', date: '2026-03-25', file: 'gp-corporate-presentation-skills' },
    { title: 'Online Safety', date: '2026-03-25', file: 'gp-online-safety' },
    { title: 'Project-Based Excel', date: '2026-03-25', file: 'gp-project-based-excel' },
    { title: 'Sharpen Your Interview Skills', date: '2026-03-25', file: 'gp-sharpen-your-interview-skills' },
    { title: 'AI-Powered Communication', date: '2026-05-27', file: 'gp-ai-powered-communication' },
    { title: 'Network Smarter with AI', date: '2026-05-27', file: 'gp-network-smarter-with-ai' },
  ].map((c) => ({
    ...c,
    certificate: image(c.file, `Grameenphone Academy Certificate of Excellence for completing ${c.title}, issued to Shadhin Nandi`),
  })),
};

// Resume: "8 × 100% and 2 × 25% merit scholarships" at UIU.
export const scholarships = {
  title: 'Merit scholarships',
  description:
    'Received merit-based tuition scholarships from United International University for academic performance during undergraduate study, including full and partial awards.',
  awards: [
    { count: 8, label: 'full-tuition (100%) awards' },
    { count: 2, label: 'partial (25%) awards' },
  ],
  context: 'B.Sc. in CSE · United International University',
};

// Completed programmes with certificates. Shown on the home page and in full
// on the Achievements page.
export const certifications = [
  {
    id: 'codealpha-ml',
    title: 'Machine Learning Virtual Internship',
    issuer: 'CodeAlpha',
    date: 'Aug – Sep 2026',
    detail: 'One-month programme, completed with a letter of recommendation.',
    links: [
      { label: 'Certificate', href: publicUrl('documents/codealpha-ml-internship-certificate.pdf'), kind: 'pdf' },
      { label: 'Recommendation letter', href: publicUrl('documents/codealpha-recommendation-letter.pdf'), kind: 'pdf' },
    ],
  },
  {
    id: 'gp-academy',
    title: 'Professional development courses',
    issuer: 'Grameenphone Academy',
    date: 'Mar – May 2026',
    detail: '11 courses covering AI, communication, interview preparation, Excel, networking and career readiness.',
    links: [{ label: 'All 11 certificates', to: '/achievements#certifications' }],
  },
];
