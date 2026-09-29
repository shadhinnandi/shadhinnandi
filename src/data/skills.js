// Every item is backed by the resume or by code in a public repository.
// `evidence` is shown on the Skills page so a reader can verify each group.
export const skills = [
  {
    group: 'Languages',
    items: ['Java', 'Python', 'JavaScript', 'C', 'C++', 'PHP', 'SQL'],
    evidence: 'Teaching in C, C++ and Java; Vortex Arena (Java), UIUFund (JavaScript), Shombhar (PHP), SICA and the ML repositories (Python).',
  },
  {
    group: 'Backend',
    items: ['Spring Boot', 'Node.js', 'Express', 'FastAPI', 'REST APIs', 'JWT auth'],
    evidence: 'Vortex Arena (Spring Boot), UIUFund (Express, JWT), Durjog Prohori (Node.js, Express), ELMS Extractor (FastAPI).',
  },
  {
    group: 'Frontend',
    items: ['React', 'React Router', 'Vite', 'HTML', 'CSS', 'HTML5 Canvas'],
    evidence: 'UIUFund (React, React Router, Vite), Beginner C Programming (Vite), Vortex Arena and Mini Car Racing (Canvas).',
  },
  {
    group: 'Databases',
    items: ['MySQL', 'MongoDB', 'Spring Data JPA'],
    evidence: 'Vortex Arena (MySQL via Spring Data JPA), UIUFund and Shombhar (MySQL), Durjog Prohori (MongoDB).',
  },
  {
    group: 'Machine learning',
    items: ['scikit-learn', 'pandas', 'NumPy', 'XGBoost', 'imbalanced-learn', 'TensorFlow', 'Matplotlib'],
    evidence: 'Credit Scoring, Disease Prediction and Speech Emotion Recognition repositories; CodeAlpha ML internship.',
  },
  {
    group: 'Testing & evaluation',
    items: ['pytest', 'Experimental evaluation', 'LaTeX'],
    evidence: 'SICA: seeded experiments across two datasets, 50 unit and regression tests, project report written in LaTeX.',
  },
  {
    group: 'Tools & platforms',
    items: ['Git', 'GitHub Actions', 'Gradle', 'Linux', 'Godot', 'Figma', 'Jira', 'ClickUp', 'Cisco Packet Tracer'],
    evidence: 'Resume and previous portfolio; Vortex Arena (Gradle, Godot); Beginner C Programming (GitHub Actions). Also works on macOS and Windows.',
  },
  {
    group: 'Hardware',
    items: ['Microcontrollers', 'Sensors'],
    evidence: 'ARAM autonomous river-monitoring prototype (CSE 4326).',
  },
];

// Groups shown on the home page.
export const featuredSkillGroups = ['Languages', 'Backend', 'Frontend', 'Databases', 'Machine learning', 'Tools & platforms'];
