import { Link } from 'react-router-dom';
import { CHAPTERS, LABS, QUESTION_BANK } from './content.js';
import stats from './stats.json';

// Course overview: purpose, curriculum, alignment, syllabus, outcomes,
// pedagogy and guidelines. Every number shown here comes from stats.json,
// which scripts/check-java-course.mjs writes after verifying the content.

const SECTION_LINKS = [
  { id: 'purpose', label: 'Purpose' },
  { id: 'syllabus', label: 'Chapters' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'notes', label: 'Notes' },
];

const PURPOSE = [
  {
    title: 'Java foundations',
    text: 'Start from zero: how a Java program is compiled and run, its types, control flow and methods. No Java experience is needed.',
  },
  {
    title: 'Object-oriented thinking',
    text: 'See a problem as objects that work together, and decide what should be a class, what it should know and what it should do.',
  },
  {
    title: 'Problem solving',
    text: 'Every concept becomes a program: worked examples, graded practice problems and lab-exam style scenarios with test cases.',
  },
  {
    title: 'Software design',
    text: 'Encapsulation, inheritance, polymorphism, exceptions, generics and threads, used the way real Java code uses them.',
  },
];

const PILLARS = [
  {
    title: 'Java Fundamentals',
    range: 'Chapters 00–03',
    text: 'How Java works, the core language, decisions, loops and methods, and a method for solving problems before writing code.',
    ids: ['00', '01', '02', '03'],
  },
  {
    title: 'Object-Oriented Programming',
    range: 'Chapters 04–10',
    text: 'Classes and objects, encapsulation, constructors, static members, references, inheritance and polymorphism.',
    ids: ['04', '05', '06', '07', '08', '09', '10'],
  },
  {
    title: 'Advanced Java',
    range: 'Chapters 11–14',
    text: 'Exceptions, streams and files, generic types and multithreading: the tools of larger, more reliable programs.',
    ids: ['11', '12', '13', '14'],
  },
  {
    title: 'Practical Development',
    range: 'Labs L1–L3',
    text: 'Desktop programs with Swing, games built from cooperating classes, and complete projects planned from requirements.',
    labs: true,
  },
];

const ALIGNMENT = [
  { title: 'Object-Oriented Programming', text: 'Covers the usual university OOP syllabus, taught in Java.' },
  { title: 'Java Programming', text: 'Core Java with the standard library, compatible with JDK 17 and later.' },
  { title: 'Problem Solving', text: 'Graded problems and scenarios that train analysis, planning and testing.' },
  { title: 'Software Development', text: 'Class design, error handling, files, GUIs and projects as a base for later courses.' },
];

const OUTCOMES = [
  'Write, compile and run Java programs confidently.',
  'Design classes and objects for a problem described in words.',
  'Apply encapsulation, inheritance and polymorphism correctly.',
  'Handle errors with exceptions and work with files.',
  'Use generics and write basic multithreaded programs.',
  'Build simple GUI applications with Swing.',
  'Plan and build object-oriented projects.',
  'Solve programming problems independently.',
];

const FLOW = ['Concept', 'Example', 'Practice', 'Scenario', 'Project', 'Mastery'];

const COMPARISON = [
  ['Pointer', 'Reference (no pointer arithmetic)'],
  ['Destructor', 'Garbage collector, try-with-resources'],
  ['Copy constructor', 'Written by hand when needed'],
  ['Multiple class inheritance', 'One superclass, many interfaces'],
  ['virtual function', 'Dynamic dispatch by default'],
  ['Template', 'Generics'],
];

function scrollToSection(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

const fmt = (n) => n.toLocaleString('en-US');

export default function Landing({ basePath }) {
  const chapterPath = (id) => `${basePath}/chapter/${id}`;
  const labPath = (id) => `${basePath}/lab/${id}`;
  const bankPath = `${basePath}/${QUESTION_BANK.id}`;
  const anchor = (id) => ({ href: `#${id}`, onClick: (e) => scrollToSection(e, id) });
  const chapterName = Object.fromEntries(CHAPTERS.map((c) => [c.id, c.name]));

  const heroStats = [
    { num: stats.chapters, label: 'Chapters' },
    { num: stats.practice.total, label: 'Practice problems' },
    { num: stats.scenarios.total, label: 'Scenario problems' },
    { num: stats.questionBank.total, label: 'Bank questions' },
  ];
  const labCount = { gui: `${stats.gui} apps`, games: `${stats.games.total} games`, projects: `${stats.projects} projects` };

  return (
    <div className="oop-landing">
      <header className="oop-bar">
        <div className="container oop-bar__inner">
          <Link to="/academic" className="oop-bar__back">
            <span aria-hidden="true">←</span> Academic
          </Link>
          <a {...anchor('top')} className="oop-bar__brand">
            <span className="oop-mark" aria-hidden="true">
              {'{ OOP }'}
            </span>
            <span className="oop-bar__title">Object Oriented Programming</span>
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
          <p className="label">OOP · Java · Object-Oriented Design</p>
          <h1 className="oop-hero__title">Master Java and Object-Oriented Programming.</h1>
          <p className="lead">
            A complete Java and Object-Oriented Programming course from fundamentals to practical advanced concepts.
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
            {heroStats.map((s) => (
              <div key={s.label} className="oop-stats__item">
                <dt>{s.label}</dt>
                <dd>{fmt(s.num)}</dd>
              </div>
            ))}
          </dl>
          <p className="oop-hero__more">
            Plus {stats.workedExamples} worked examples, {stats.gui} GUI applications, {stats.games.total} games and{' '}
            {stats.projects} complete projects with {stats.projectIdeas} further project ideas.
          </p>
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
            <h2 id="purpose-title">Learn Java as a way of thinking.</h2>
            <p className="lead">
              Java is easiest to learn as a way of organising programs, not as a list of keywords. The course builds that
              way of thinking one chapter at a time, from a first program to multithreaded and graphical applications.
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
            <h2 id="curriculum-title">Four parts, one progression.</h2>
          </div>
          <div className="oop-pillars">
            {PILLARS.map((p, i) => (
              <article key={p.title} className="oop-pillar">
                <p className="oop-pillar__range">
                  <span>Part {i + 1}</span> · {p.range}
                </p>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <ul className="oop-pillar__links">
                  {p.labs
                    ? LABS.map((l) => (
                        <li key={l.id}>
                          <Link to={labPath(l.id)}>{l.name}</Link>
                        </li>
                      ))
                    : p.ids.map((id) => (
                        <li key={id}>
                          <Link to={chapterPath(id)}>{chapterName[id]}</Link>
                        </li>
                      ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="oop-section" id="alignment" aria-labelledby="alignment-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Curriculum alignment</p>
            <h2 id="alignment-title">Built for university courses.</h2>
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
            <h2 id="syllabus-title">Chapters</h2>
            <p className="lead">
              Fifteen chapters, three practical labs and a question bank. Follow the chapters in order: each one uses
              only what came before it.
            </p>
          </div>
          <ol className="oop-syllabus">
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <Link to={chapterPath(c.id)} className="oop-syllabus__item">
                  <span className="oop-syllabus__idx">{c.id}</span>
                  <span className="oop-syllabus__text">
                    <span className="oop-syllabus__name">{c.name}</span>
                    <span className="oop-syllabus__topics">{c.topics}</span>
                  </span>
                  <span className="oop-syllabus__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <h3 className="oop-syllabus__group">Practical labs</h3>
          <ol className="oop-syllabus">
            {LABS.map((l) => (
              <li key={l.id}>
                <Link to={labPath(l.id)} className="oop-syllabus__item">
                  <span className="oop-syllabus__idx">{l.idx}</span>
                  <span className="oop-syllabus__text">
                    <span className="oop-syllabus__name">{l.name}</span>
                    <span className="oop-syllabus__topics">
                      {l.topics} · {labCount[l.id]}
                    </span>
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
                  <span className="oop-syllabus__topics">
                    {stats.questionBank.total} exam-style questions in {stats.questionBank.topics} topics, with hints
                    and solutions
                  </span>
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
            <h2 id="outcomes-title">After the course you can</h2>
            <ul className="oop-checks">
              {OUTCOMES.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Pedagogy</p>
            <h2>How each topic is taught</h2>
            <ol className="oop-flow" aria-label="Learning sequence">
              {FLOW.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ol>
            <ul className="oop-checks">
              <li>Each chapter explains a concept, shows its syntax and works through at least three complete examples.</li>
              <li>Practice problems rise from Basic to Intermediate to Advanced.</li>
              <li>Scenario problems read like lab-exam questions, with test cases for the edge cases.</li>
              <li>The labs combine everything into GUI programs, games and projects.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="oop-section oop-section--alt" id="notes" aria-labelledby="notes-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Guidelines</p>
            <h2 id="notes-title">How to use this course</h2>
          </div>
          <div className="oop-notes">
            <dl className="oop-notes__list">
              <div>
                <dt>Follow the order</dt>
                <dd>Chapters build on each other. Problems in a chapter use only the ideas taught so far.</dd>
              </div>
              <div>
                <dt>Type the code yourself</dt>
                <dd>Compile and run every example, then change it and predict what will happen before you run it again.</dd>
              </div>
              <div>
                <dt>Attempt before you reveal</dt>
                <dd>Hints and solutions are hidden on purpose. Open them after a real attempt, not before.</dd>
              </div>
              <div>
                <dt>Treat scenarios as lab exams</dt>
                <dd>Read the input format carefully, match the output exactly and test the edge cases.</dd>
              </div>
              <div>
                <dt>Ask “should this be a class?”</dt>
                <dd>From Chapter 04 on, design before you code: name the objects, their data and their behaviour.</dd>
              </div>
            </dl>
            <aside className="oop-notes__side">
              <div className="oop-panel">
                <h3>Running the programs</h3>
                <ol>
                  <li>Install a JDK, version 17 or later.</li>
                  <li>
                    Save the program in a file named after its public class, for example <code>BankDemo.java</code>.
                  </li>
                  <li>
                    Compile with <code>javac BankDemo.java</code> and run with <code>java BankDemo</code>.
                  </li>
                </ol>
                <p className="oop-panel__note">
                  All {fmt(stats.programs)} programs in the course compile on JDK 17 with warnings treated as errors, and
                  every sample and test output shown has been checked against a real run.
                </p>
              </div>
              <div className="oop-panel">
                <h3>Coming from C or C++?</h3>
                <table className="oop-compare">
                  <thead>
                    <tr>
                      <th scope="col">C / C++</th>
                      <th scope="col">Java</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map(([a, b]) => (
                      <tr key={a}>
                        <td>{a}</td>
                        <td>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer className="oop-footer">
        <div className="container oop-footer__inner">
          <span className="oop-footer__brand">
            <span className="oop-mark" aria-hidden="true">
              {'{ OOP }'}
            </span>
            Object Oriented Programming
          </span>
          <nav className="oop-footer__links" aria-label="Course links">
            <Link to={chapterPath('00')}>Chapter 00</Link>
            <Link to={bankPath}>{QUESTION_BANK.name}</Link>
            <Link to="/academic">All courses</Link>
            <a {...anchor('top')}>Back to top</a>
          </nav>
          <p className="oop-footer__credit">
            Written by <strong>Shadhin Nandi</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
