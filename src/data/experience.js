import { image, publicUrl } from '../lib/media';

// Sources: evidence/resume.pdf (UGA role), evidence/Certificate_Shadhin Nandi.pdf
// and evidence/LOR_Shadhin Nandi.pdf (CodeAlpha internship).
export const experience = [
  {
    id: 'uga-uiu',
    role: 'Undergraduate Teaching Assistant',
    organization: 'Department of CSE, United International University',
    location: 'Dhaka',
    start: 'Mar 2025',
    end: 'Present',
    type: 'Part-time · On-site',
    summary: 'Lab and teaching support for five undergraduate courses in programming, data structures and electronics.',
    courses: [
      'Object-Oriented Programming (Java)',
      'Introduction to Computer Systems (C)',
      'Data Structures & Algorithms I (C++)',
      'Data Structures & Algorithms II (C++)',
      'Electronics',
    ],
    points: [
      'Guide lab sessions and project-based coursework across the five courses above.',
      'Mentor students and provide academic counselling, including help working through technical problems in their code.',
    ],
  },
  {
    id: 'codealpha-ml',
    role: 'Machine Learning Intern',
    organization: 'CodeAlpha',
    location: 'Remote',
    start: 'Aug 2026',
    end: 'Sep 2026',
    type: 'Virtual internship',
    summary: 'One-month virtual internship programme in machine learning, completed with a letter of recommendation.',
    points: [
      'Completed the Machine Learning virtual internship programme, 20 August – 20 September 2026.',
      'Received a letter of recommendation from CodeAlpha on completion.',
    ],
    quote: {
      text: '…excellent analytical skills and … quickly acquired new skills and adeptly adapted to emerging technologies, demonstrating a high level of productivity.',
      source: 'CodeAlpha letter of recommendation, 20 September 2026',
    },
    documents: [
      {
        label: 'Certificate',
        kind: 'image',
        image: image('cert-codealpha-ml', 'CodeAlpha certificate of completion for the Machine Learning virtual internship, 20 August to 20 September 2026'),
        href: publicUrl('documents/codealpha-ml-internship-certificate.pdf'),
      },
      { label: 'Letter of recommendation', kind: 'pdf', href: publicUrl('documents/codealpha-recommendation-letter.pdf') },
    ],
  },
];
