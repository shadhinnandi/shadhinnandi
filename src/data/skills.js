// Every item is backed by the resume or by code in a public repository.
// `evidence` is shown on the Skills page so a reader can verify each group.
export const skills = [
  {
    group: 'Languages',
    items: ['C', 'C++', 'Java', 'Python', 'JavaScript', 'PHP', 'SQL'],
    evidence: 'Resume; teaching in C, C++ and Java; Vortex Arena (Java), UIUFund (JavaScript), Shombhar (PHP), SICA (Python).',
  },
  {
    group: 'Frontend',
    items: ['HTML', 'CSS', 'React', 'React Router', 'Vite', 'HTML5 Canvas'],
    evidence: 'UIUFund (React, React Router, Vite), Beginner C Programming UI (Vite), Vortex Arena and Mini Car Racing (Canvas).',
  },
  {
    group: 'Backend',
    items: ['Spring Boot', 'Node.js', 'Express', 'FastAPI', 'REST APIs', 'JWT authentication'],
    evidence: 'Vortex Arena (Spring Boot), UIUFund (Express, JWT), Durjog Prohori (Node.js, Express), ELMS Extractor (FastAPI).',
  },
  {
    group: 'Databases',
    items: ['MySQL', 'MongoDB', 'Spring Data JPA'],
    evidence: 'Resume; Vortex Arena (MySQL via Spring Data JPA), UIUFund and Shombhar (MySQL), Durjog Prohori (MongoDB).',
  },
  {
    group: 'Machine learning & data',
    items: ['scikit-learn', 'pandas', 'NumPy', 'XGBoost', 'imbalanced-learn', 'Matplotlib', 'TensorFlow'],
    evidence: 'Credit Scoring, Disease Prediction and Speech Emotion Recognition repositories; CodeAlpha ML internship.',
  },
  {
    group: 'Testing & evaluation',
    items: ['Experimental evaluation', 'pytest', 'LaTeX'],
    evidence: 'SICA course project: seeded experiments across two datasets, 50 unit and regression tests, IEEE-format report.',
  },
  {
    group: 'Hardware',
    items: ['Microcontrollers', 'Sensors'],
    evidence: 'ARAM autonomous river monitoring prototype (CSE 4326).',
  },
  {
    group: 'Tools',
    items: ['Git', 'GitHub', 'Gradle', 'Godot', 'Jira', 'Figma', 'ClickUp', 'Cisco Packet Tracer'],
    evidence: 'Resume and previous portfolio; Vortex Arena (Gradle, Godot).',
  },
  {
    group: 'Operating systems',
    items: ['Linux', 'macOS', 'Windows'],
    evidence: 'Resume.',
  },
];

// Groups shown on the home page preview.
export const featuredSkillGroups = ['Languages', 'Backend', 'Databases', 'Machine learning & data'];
