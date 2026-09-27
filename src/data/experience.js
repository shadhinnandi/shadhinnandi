import { image, publicUrl } from '../lib/media';

// Sources: evidence/resume.pdf (UGA role), evidence/Certificate_Shadhin Nandi.pdf
// and evidence/LOR_Shadhin Nandi.pdf (CodeAlpha internship).
export const experience = [
  {
    id: 'uga-uiu',
    role: 'Undergraduate Teaching Assistant',
    organization: 'Department of CSE, United International University',
    location: 'Dhaka, Bangladesh',
    start: 'Mar 2025',
    end: 'Present',
    type: 'Part-time · On-site',
    summary: 'Teaching support for undergraduate programming, data structures and electronics courses.',
    courses: [
      'Object-Oriented Programming (Java)',
      'Introduction to Computer Systems (C)',
      'Data Structures & Algorithms I (C++)',
      'Data Structures & Algorithms II (C++)',
      'Electronics',
    ],
    points: [
      'Assist in OOP (Java), Introduction to Computer Systems (C), DSA I and DSA II (C++), and Electronics.',
      'Guide lab sessions and project-based learning.',
      'Mentor students, provide academic counselling, and help solve technical problems.',
    ],
  },
  {
    id: 'codealpha-ml',
    role: 'Machine Learning Intern',
    organization: 'CodeAlpha',
    location: 'Remote',
    start: 'Aug 2026',
    end: 'Sep 2026',
    type: 'Virtual internship · 20 Aug – 20 Sep 2026',
    summary: 'Completed CodeAlpha’s one-month Virtual Internship Program in Machine Learning.',
    points: [
      'Completed the one-month Virtual Internship Program in Machine Learning (20 August – 20 September 2026).',
      'Received a letter of recommendation from CodeAlpha on completion.',
    ],
    quote: {
      text: '…excellent analytical skills and … quickly acquired new skills and adeptly adapted to emerging technologies, demonstrating a high level of productivity.',
      source: 'CodeAlpha letter of recommendation, 20 September 2026',
    },
    documents: [
      { label: 'Certificate', kind: 'image', image: image('cert-codealpha-ml', 'CodeAlpha certificate of completion for the Machine Learning virtual internship, 20 August to 20 September 2026'), href: publicUrl('documents/codealpha-ml-internship-certificate.pdf') },
      { label: 'Letter of recommendation', kind: 'pdf', href: publicUrl('documents/codealpha-recommendation-letter.pdf') },
    ],
  },
];
