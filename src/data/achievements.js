import { image } from '../lib/media';

// Sources: resume ACHIEVEMENTS, project-show certificates and photos,
// evidence/Evidence_0112230604_ShadhinNandi.pdf (Grameenphone Academy certificates).
export const awards = [
  {
    id: 'project-show-253',
    title: '3rd Runner-Up, CSE Project Show 253',
    date: 'Fall 2025',
    context: 'Among 93 teams · CSE 2118 Advanced Object-Oriented Programming Laboratory',
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
    title: '3rd Runner-Up, CSE Project Show 252',
    date: 'Summer 2025',
    context: 'Among 73 teams · CSE 4326 Microprocessors and Microcontrollers Laboratory',
    project: { name: 'ARAM', slug: 'aram' },
    issuer: 'Department of CSE, United International University',
    certificate: image('cert-projectshow-252', 'Certificate of achievement: 3rd Runner-Up in the Microprocessors and Micro-controllers Lab at the CSE Project Show Summer 2025, presented to Shadhin Nandi'),
    photos: [
      image('aram-stage', 'Award winners on stage at the CSE Project Show Summer 2025'),
      image('aram-trophy', 'Shadhin Nandi holding the CSE Project Show trophy in front of a brick wall'),
    ],
  },
  {
    id: 'merit-scholarships',
    title: 'Merit scholarships',
    date: 'B.Sc. at UIU',
    context: '8 × 100% and 2 × 25% merit scholarships for academic performance',
    issuer: 'United International University',
  },
];

export const gpAcademy = {
  issuer: 'Grameenphone Academy',
  summary:
    'Completed 11 professional development courses covering AI, communication, interview preparation, Excel, networking and career readiness.',
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

// Highlights shown on the home page.
export const featuredAwardIds = ['project-show-253', 'project-show-252', 'merit-scholarships'];
