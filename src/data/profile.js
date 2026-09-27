import { image, publicUrl } from '../lib/media';

// Sources: evidence/resume.pdf (links, location), the previous portfolio at
// shadhinnandi.github.io/shadhinnandi (email, Instagram), GitHub profile.
export const profile = {
  name: 'Shadhin Nandi',
  roles: ['Software Engineer', 'Undergraduate Teaching Assistant'],
  discipline: 'Computer Science & Engineering',
  focus: ['AI/ML', 'Software Development', 'Research'],
  location: 'Dhaka, Bangladesh',
  university: 'United International University',
  portrait: image('portrait', 'Portrait of Shadhin Nandi in a navy blazer and white shirt'),

  // Short introduction used on the home page (2–3 lines).
  intro:
    'I study Computer Science & Engineering at United International University and work as an Undergraduate Teaching Assistant in its CSE department. I build full-stack web applications, games and machine learning pipelines, and I am interested in research across AI/ML, bioinformatics, computer vision and HCI.',

  // Longer About page copy. Every statement maps to the resume, repositories or evidence files.
  about: [
    'I am a final-year Computer Science & Engineering student at United International University (UIU) in Dhaka, expected to graduate in January 2027 with a current CGPA of 3.93 out of 4.00. Since March 2025 I have worked as an Undergraduate Teaching Assistant, supporting lab sessions in Object-Oriented Programming, Introduction to Computer Systems, Data Structures & Algorithms I and II, and Electronics.',
    'Most of my project work is full-stack. I have built a Spring Boot and MySQL backend for a multiplayer arena shooter, a React, Express and MySQL platform for student crowdfunding and peer loans, a PHP and MySQL marketplace for farmers, and a MERN-stack disaster response platform. Two of my course projects, Vortex Arena and the ARAM river-monitoring prototype, placed 3rd Runner-Up at UIU’s CSE Project Show.',
    'For my Computer Security course, two teammates and I built SICA, a rule-based detector for mid-session HTTP session hijacking that works from web server access logs alone, evaluated on two public datasets and written up as an IEEE-format report under the supervision of Dr. Muhammad Nomani Kabir. I completed a one-month machine learning internship with CodeAlpha in 2026. The research areas I want to pursue are machine learning, bioinformatics, computer vision and human-computer interaction.',
  ],

  interests: 'Outside of computing: films, and cooking and trying out different cuisines.',

  email: 'shadhin332@gmail.com',
  resume: publicUrl('resume/Shadhin_Nandi_Resume.pdf'),

  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shadhin-nandi/', handle: 'in/shadhin-nandi' },
    { label: 'GitHub', href: 'https://github.com/shadhinnandi', handle: 'shadhinnandi' },
    { label: 'Codeforces', href: 'https://codeforces.com/profile/Shadh', handle: 'Shadh' },
    { label: 'Instagram', href: 'https://www.instagram.com/shadhinnandii/', handle: 'shadhinnandii' },
  ],
};

export const githubUrl = 'https://github.com/shadhinnandi';
