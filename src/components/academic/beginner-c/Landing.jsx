import { Link } from 'react-router-dom';
import { CHAPTERS, QUESTION_BANK } from './content.js';

// Course overview: purpose, curriculum, alignment, chapter index, outcomes,
// guidelines and licence. The text is the course's original copy; the layout
// and styles are shared with the other academic courses (java-course.css).

const SECTION_LINKS = [
  { id: 'purpose', label: 'Purpose' },
  { id: 'syllabus', label: 'Chapters' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'notes', label: 'Notes' },
];

const PURPOSE = [
  {
    title: 'Accessible foundations',
    text: 'No prior programming experience is required. Start with fundamental building blocks and progressively build complexity.',
  },
  {
    title: 'Academic alignment',
    text: 'Optimized for academic curricula, specifically Introductory Computer Systems (ICS) and Structured Programming (SPL) courses.',
  },
  {
    title: 'Algorithmic logic',
    text: 'Focuses heavily on developing programmatic thinking and problem-solving methodologies rather than rote syntax memorization.',
  },
  {
    title: 'Preparation for DSA',
    text: 'Provides a seamless progression toward Data Structures, Algorithms, and technical interviews.',
  },
];

const ALIGNMENT = [
  { title: 'Introduction to Computer Systems', text: 'Essential concepts in computer systems and primary programming techniques.' },
  { title: 'Structural Programming Language', text: 'Procedural programming paradigms, memory layout, and logic synthesis.' },
  { title: 'Data Structures Preparation', text: 'A rigorous foundation for transitioning to advanced algorithms and complex data models.' },
];

const OUTCOMES = [
  'Analyze and decompose complex computational challenges systematically.',
  'Author standard-compliant, efficient, and secure C source code.',
  'Articulate core paradigms of procedural programming and memory architecture.',
  'Successfully approach academic examinations and professional technical interviews.',
  'Transition seamlessly into advanced study of data structures and algorithms.',
];

const PEDAGOGY = [
  'Introduces concepts through progressive instruction to manage cognitive load.',
  'Prioritizes computational logic and analysis over basic syntax memorization.',
  'Integrates hands-on coding exercises into every learning module.',
];

const FLOW = ['Concept', 'Example', 'Practice', 'Mastery'];

const NOTES = [
  ['Syllabus continuity', 'Follow the chapters sequentially. The curriculum is constructed incrementally.'],
  ['Active learning', 'Practical coding is required. Theoretical reading is insufficient without writing and debugging code.'],
  ['Chapter exercises', 'Do not bypass the problem sets; they are critical to validating conceptual understanding.'],
  ['Conceptual depth', 'Focus on understanding underlying mechanisms rather than memorizing solution templates.'],
];

const STATS = [
  { num: '15', label: 'Chapters' },
  { num: '300+', label: 'Problems' },
  { num: '3', label: 'Courses' },
  { num: 'MIT', label: 'License' },
];

function scrollToSection(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function Landing({ basePath }) {
  const chapterPath = (id) => `${basePath}/chapter/${id}`;
  const bankPath = `${basePath}/${QUESTION_BANK.id}`;
  const anchor = (id) => ({ href: `#${id}`, onClick: (e) => scrollToSection(e, id) });

  return (
    <div className="oop-landing">
      <header className="oop-bar">
        <div className="container oop-bar__inner">
          <Link to="/academic" className="oop-bar__back">
            <span aria-hidden="true">←</span> Academic
          </Link>
          <a {...anchor('top')} className="oop-bar__brand">
            <span className="oop-mark" aria-hidden="true">
              {'{ C }'}
            </span>
            <span className="oop-bar__title">Beginner C Programming</span>
          </a>
          <nav className="oop-bar__links" aria-label="Course sections">
            {SECTION_LINKS.map((s) => (
              <a key={s.id} {...anchor(s.id)}>
                {s.label}
              </a>
            ))}
          </nav>
          <Link to={bankPath} className="oop-bar__cta">
            {QUESTION_BANK.name}
          </Link>
        </div>
      </header>

      <section className="oop-hero" id="top">
        <div className="container">
          <p className="label">ICS · SPL · DSA Foundation</p>
          <h1 className="oop-hero__title">Master C Programming and problem solving.</h1>
          <p className="lead">
            A comprehensive, structured educational system covering core syntax, program logic, and software foundations.
            Tailored for academic courses and technical assessments.
          </p>
          <div className="oop-hero__actions">
            <Link to={chapterPath('00')} className="btn btn--primary">
              Start with Chapter 00
            </Link>
            <Link to={bankPath} className="btn btn--ghost">
              {QUESTION_BANK.name}
            </Link>
          </div>
          <dl className="oop-stats">
            {STATS.map((s) => (
              <div key={s.label} className="oop-stats__item">
                <dt>{s.label}</dt>
                <dd>{s.num}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="oop-author">
        <div className="container oop-author__inner">
          <span className="oop-author__avatar" aria-hidden="true">
            SN
          </span>
          <p className="oop-author__text">
            <span className="oop-author__label">Authored by</span>
            <span className="oop-author__name">Shadhin Nandi</span>
          </p>
          <Link to="/about" className="oop-author__link">
            About the author →
          </Link>
        </div>
      </section>

      <section className="oop-section" id="purpose" aria-labelledby="purpose-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Purpose</p>
            <h2 id="purpose-title">An all-in-one learning pathway.</h2>
            <p className="lead">
              This project serves as a comprehensive, self-contained curriculum. It offers a structured trajectory
              designed to guide learners from fundamental concepts to proficient, independent problem-solving.
            </p>
          </div>
          <ol className="oop-purpose">
            {PURPOSE.map((p, i) => (
              <li key={p.title}>
                <span className="oop-purpose__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="oop-section oop-section--alt" id="curriculum" aria-labelledby="curriculum-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Curriculum</p>
            <h2 id="curriculum-title">The core pillars of the system.</h2>
          </div>
          <div className="oop-pillars">
            <article className="oop-pillar">
              <p className="oop-pillar__range">
                <span>Part 1</span>
              </p>
              <h3>Comprehensive C Learning Path</h3>
              <p>A structured, sequential syllabus covering fundamental and advanced programming concepts in C.</p>
              <ul className="oop-chips">
                <li>Programming Foundations &amp; Logical Analysis</li>
                <li>Variables, Data Representation &amp; Operators</li>
                <li>Standard I/O Operations</li>
                <li>
                  Control Flow <code>if</code> <code>else</code> <code>switch</code>
                </li>
                <li>
                  Iterative Structures <code>for</code> <code>while</code> <code>do-while</code>
                </li>
                <li>Modular Programming &amp; Recursion</li>
                <li>Data Structures: Arrays &amp; Strings</li>
                <li>File Systems &amp; I/O Handling</li>
              </ul>
            </article>
            <article className="oop-pillar">
              <p className="oop-pillar__range">
                <span>Part 2</span>
              </p>
              <h3>Analytical Skill Development</h3>
              <p>
                A progression of conceptual frameworks designed to transition learners from syntax rules to robust
                programmatic logic and design.
              </p>
            </article>
            <article className="oop-pillar">
              <p className="oop-pillar__range">
                <span>Part 3</span>
              </p>
              <h3>Extensive Practical Application</h3>
              <p>
                <strong>Over 250 curated problems</strong> complete with detailed solutions, categorized by complexity (
                <span className="oop-level oop-level--easy">Easy</span>,{' '}
                <span className="oop-level oop-level--medium">Medium</span>,{' '}
                <span className="oop-level oop-level--hard">Hard</span>) to systematically cultivate problem-solving
                competencies.
              </p>
            </article>
            <article className="oop-pillar">
              <p className="oop-pillar__range">
                <span>Part 4</span>
              </p>
              <h3>Advanced Challenge Suite</h3>
              <p>An interview-oriented selection of challenges curated from prominent platforms and academic examinations:</p>
              <ul className="oop-chips">
                <li>Codeforces · Rating 800–1500</li>
                <li>LeetCode · Easy &amp; Medium</li>
                <li>Academic Exams · University Standards</li>
              </ul>
              <p>
                Includes reference questions with guided hints alongside comprehensive, step-by-step verified solutions.{' '}
                <Link to={bankPath}>Open the {QUESTION_BANK.name.toLowerCase()} →</Link>
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="oop-section" id="alignment" aria-labelledby="alignment-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Curriculum alignment</p>
            <h2 id="alignment-title">Structured for academic courses.</h2>
          </div>
          <dl className="oop-align">
            {ALIGNMENT.map((a) => (
              <div key={a.title}>
                <dt>{a.title}</dt>
                <dd>{a.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="oop-section oop-section--alt" id="syllabus" aria-labelledby="syllabus-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Syllabus</p>
            <h2 id="syllabus-title">Sequential Chapter Index</h2>
            <p className="lead">
              Fourteen core chapters and a comprehensive problem bank. It is highly recommended to follow the sequence in
              chronological order.
            </p>
          </div>
          <ol className="oop-syllabus">
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <Link to={chapterPath(c.id)} className="oop-syllabus__item">
                  <span className="oop-syllabus__idx">{c.id}</span>
                  <span className="oop-syllabus__text">
                    <span className="oop-syllabus__name">{c.name}</span>
                  </span>
                  <span className="oop-syllabus__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link to={bankPath} className="oop-syllabus__item">
                <span className="oop-syllabus__idx">{QUESTION_BANK.idx}</span>
                <span className="oop-syllabus__text">
                  <span className="oop-syllabus__name">{QUESTION_BANK.name}</span>
                </span>
                <span className="oop-syllabus__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          </ol>
        </div>
      </section>

      <section className="oop-section" id="outcomes" aria-labelledby="outcomes-title">
        <div className="container oop-split">
          <div>
            <p className="label">Learning outcomes</p>
            <h2 id="outcomes-title">Target competencies.</h2>
            <ul className="oop-checks">
              {OUTCOMES.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Pedagogy</p>
            <h2>Theory, application, and mastery.</h2>
            <ol className="oop-flow" aria-label="Learning sequence">
              {FLOW.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ol>
            <ul className="oop-checks">
              {PEDAGOGY.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="oop-section oop-section--alt" id="notes" aria-labelledby="notes-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Guidelines</p>
            <h2 id="notes-title">Pre-requisite advice.</h2>
          </div>
          <div className="oop-notes">
            <dl className="oop-notes__list">
              {NOTES.map(([title, text]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
            <aside className="oop-notes__side">
              <div className="oop-panel">
                <h3>A final word</h3>
                <p>Programming is not about memorizing syntax. It is about building your thinking ability, step by step.</p>
                <p className="oop-panel__note">Begin the curriculum with Chapter 00 and proceed sequentially.</p>
              </div>
              <div className="oop-panel" id="license">
                <h3>MIT License with attribution</h3>
                <p>
                  <strong>Permitted use:</strong> study and use the material for personal and academic growth, modify and
                  adapt it, and share the course link for educational purposes.
                </p>
                <p>
                  <strong>Required attribution:</strong> give clear credit to the original author when referencing this
                  project. Author: <Link to="/about">Shadhin Nandi</Link>.
                </p>
                <p className="oop-panel__note">
                  The curricular structures, progressive learning schema, and problem bank designs are part of the
                  educational framework authored by Shadhin Nandi. The instructional architecture is the intellectual
                  property of the author.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer className="oop-footer">
        <div className="container oop-footer__inner">
          <span className="oop-footer__brand">
            <span className="oop-mark" aria-hidden="true">
              {'{ C }'}
            </span>
            Beginner C Programming
          </span>
          <nav className="oop-footer__links" aria-label="Course links">
            <Link to={chapterPath('00')}>Chapter 00</Link>
            <Link to={bankPath}>{QUESTION_BANK.name}</Link>
            <Link to="/academic">All courses</Link>
            <a {...anchor('top')}>Back to top</a>
          </nav>
          <p className="oop-footer__credit">
            Designed &amp; authored by <strong>Shadhin Nandi</strong> · MIT License
          </p>
        </div>
      </footer>
    </div>
  );
}
