// Every item is backed by the resume or by code in a public repository.
// `evidence` is shown on the Skills page so a reader can verify each group.
export const skills = [
  {
    group: 'Languages',
    items: [
      { name: 'Java', icon: 'java' },
      { name: 'Python', icon: 'python' },
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'C', icon: 'c' },
      { name: 'C++', icon: 'cplusplus' },
      { name: 'PHP', icon: 'php' },
      { name: 'SQL', icon: 'database' },
    ],
    evidence: 'Teaching in C, C++ and Java; Vortex Arena (Java), UIUFund (JavaScript), Shombhar (PHP), SICA and the ML repositories (Python).',
  },
  {
    group: 'Frontend',
    items: [
      { name: 'React', icon: 'react' },
      { name: 'React Router', icon: 'reactrouter' },
      { name: 'Vite', icon: 'vite' },
      { name: 'HTML', icon: 'html5' },
      { name: 'CSS', icon: 'css' },
      { name: 'HTML5 Canvas', icon: 'canvas' },
    ],
    evidence: 'UIUFund (React, React Router, Vite), Vortex Arena and Mini Car Racing (Canvas).',
  },
  {
    group: 'Backend',
    items: [
      { name: 'Spring Boot', icon: 'springboot' },
      { name: 'Node.js', icon: 'nodedotjs' },
      { name: 'Express', icon: 'express' },
      { name: 'FastAPI', icon: 'fastapi' },
      { name: 'REST APIs', icon: 'server' },
      { name: 'JWT auth', icon: 'shield' },
    ],
    evidence: 'Vortex Arena (Spring Boot), UIUFund (Express, JWT), Durjog Prohori (Node.js, Express), ELMS Extractor (FastAPI).',
  },
  {
    group: 'Databases',
    items: [
      { name: 'MySQL', icon: 'mysql' },
      { name: 'MongoDB', icon: 'mongodb' },
      { name: 'Spring Data JPA', icon: 'springboot' },
    ],
    evidence: 'Vortex Arena (MySQL via Spring Data JPA), UIUFund and Shombhar (MySQL), Durjog Prohori (MongoDB).',
  },
  {
    group: 'Machine learning',
    items: [
      { name: 'scikit-learn', icon: 'scikitlearn' },
      { name: 'pandas', icon: 'pandas' },
      { name: 'NumPy', icon: 'numpy' },
      { name: 'XGBoost', icon: 'data-science' },
      { name: 'imbalanced-learn', icon: 'data-science' },
      { name: 'TensorFlow', icon: 'tensorflow' },
      { name: 'Matplotlib', icon: 'chart' },
    ],
    evidence: 'Credit Scoring, Disease Prediction and Speech Emotion Recognition repositories; CodeAlpha ML internship.',
  },
  {
    group: 'Testing & evaluation',
    items: [
      { name: 'pytest', icon: 'pytest' },
      { name: 'Experimental evaluation', icon: 'flask' },
      { name: 'LaTeX', icon: 'latex' },
    ],
    evidence: 'SICA: seeded experiments across two datasets, 50 unit and regression tests, project report written in LaTeX.',
  },
  {
    group: 'Tools & platforms',
    items: [
      { name: 'Git', icon: 'git' },
      { name: 'GitHub Actions', icon: 'githubactions' },
      { name: 'Gradle', icon: 'gradle' },
      { name: 'Linux', icon: 'linux' },
      { name: 'Godot', icon: 'godot' },
      { name: 'Figma', icon: 'figma' },
      { name: 'Jira', icon: 'jira' },
      { name: 'ClickUp', icon: 'clickup' },
      { name: 'Cisco Packet Tracer', icon: 'network' },
    ],
    evidence: 'Resume and previous portfolio; Vortex Arena (Gradle, Godot). Also works on macOS and Windows.',
  },
  {
    group: 'Hardware',
    items: [
      { name: 'Microcontrollers', icon: 'chip' },
      { name: 'Arduino', icon: 'arduino' },
      { name: 'ESP', icon: 'espressif' },
      { name: 'Raspberry Pi', icon: 'raspberrypi' },
      { name: 'Sensors', icon: 'activity' },
    ],
    evidence: 'ARAM autonomous river-monitoring prototype (CSE 4326).',
  },
];

// Groups shown on the home page.
export const featuredSkillGroups = ['Languages', 'Backend', 'Frontend', 'Databases', 'Machine learning', 'Tools & platforms'];
