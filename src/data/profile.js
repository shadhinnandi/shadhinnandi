import { image, publicUrl } from '../lib/media';

// Identity, positioning and contact channels. Facts trace to the resume, the
// previous portfolio and the GitHub profile (see CONTENT_INVENTORY.md).
export const profile = {
  name: 'Shadhin Nandi',
  role: 'Computer Science',
  location: 'Dhaka, Bangladesh',
  university: 'United International University',
  universityShort: 'UIU',
  portrait: image('portrait', 'Portrait of Shadhin Nandi in a navy blazer and white shirt'),

  // Hero: one statement.
  headline: 'Final-year Computer Science & Engineering student with a strong interest in teaching and hands-on technical work.',
  // Home "About" section: a short introduction; the About page has the full version.
  profile: [
    'I am a final-year Computer Science & Engineering student at United International University in Dhaka, expected to graduate in January 2027. Since March 2025 I have worked as an Undergraduate Teaching Assistant in the CSE department, guiding lab sessions in Object-Oriented Programming, Introduction to Computer Systems, Data Structures & Algorithms I and II, Electronics and Microprocessors & Microcontrollers.',
  ],

  // About page.
  about: [
    'I am a final-year Computer Science & Engineering student at United International University in Dhaka, expected to graduate in January 2027. Since March 2025 I have worked as an Undergraduate Teaching Assistant in the CSE department, guiding lab sessions in Object-Oriented Programming, Introduction to Computer Systems, Data Structures & Algorithms I and II, and Electronics.',
    'Most of my project work is full-stack. I have built a Spring Boot and MySQL backend for a multiplayer arena shooter, a React, Express and MySQL platform for student crowdfunding and peer loans, a PHP and MySQL marketplace for farmers, and a MERN-stack disaster-response platform. Two course projects, Vortex Arena and the ARAM river-monitoring prototype, placed 3rd Runner-Up at UIU’s CSE Project Show.',
    'For my Computer Security course, two teammates and I built SICA, a rule-based detector for mid-session HTTP session hijacking that works from web server access logs alone, evaluated on two public log datasets under the supervision of Dr. Muhammad Nomani Kabir. In 2026 I completed a one-month machine learning internship with CodeAlpha.',
    'My research work is in AI and computational biology. I am currently working on enhancer–promoter interaction prediction from genomic sequences, and on YOLO-based object detection for trash and waste. I am also interested in bioinformatics, protein representation learning and human-centered AI.',
  ],
  interests: 'Outside computing: films, and cooking and trying different cuisines.',

  // Contact
  availability: 'Open to teaching and academic roles, as well as research and software positions.',
  email: 'shadhin332@gmail.com',
  resume: publicUrl('resume/Shadhin_Nandi_Resume.pdf'),

  // Primary channels appear in the hero and contact panel; secondary ones only
  // on the Contact page.
  links: {
    linkedin: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shadhin-nandi/', handle: 'in/shadhin-nandi' },
    github: { label: 'GitHub', href: 'https://github.com/shadhinnandi', handle: 'shadhinnandi' },
    codeforces: { label: 'Codeforces', href: 'https://codeforces.com/profile/Shadh', handle: 'Shadh' },
    instagram: { label: 'Instagram', href: 'https://www.instagram.com/shadhinnandii/', handle: 'shadhinnandii' },
  },

};

export const primaryLinks = [profile.links.github, profile.links.linkedin];
export const secondaryLinks = [profile.links.codeforces, profile.links.instagram];

// Primary navigation. Education and skills are reachable from the home page
// and the About page, which keeps the bar short.
export const navItems = [
  { to: '/projects', label: 'Work' },
  { to: '/research', label: 'Research' },
  { to: '/experience', label: 'Experience' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/academic', label: 'Academic' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
