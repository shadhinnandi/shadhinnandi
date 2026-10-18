import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MODULES, PAGES, PROBLEM_INDEX } from './content.js';
import { GROUPS } from './Reader.jsx';
import { resetProgress, useProgress } from './progress.js';

// Course overview: purpose, progress, the module list in reading order, the
// practice and preparation pages, and study notes. Counts come from
// problem-index.json, which scripts/check-dsa-course.mjs writes after
// compiling and testing every solution.

const SECTION_LINKS = [
  { id: 'progress', label: 'Progress' },
  { id: 'syllabus', label: 'Modules' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'notes', label: 'Notes' },
];

const OUTCOMES = [
  'Explain how data is stored in memory and why that decides the cost of every operation.',
  'Analyse time and space with Big O, Ω and Θ, solve recurrences and apply the Master Theorem.',
  'Prove simple algorithms correct with loop invariants and induction.',
  'Implement arrays, linked lists, stacks, queues, trees, heaps, BSTs, graphs and Union-Find from scratch in C++17.',
  'Use BFS, DFS, and heap, merge, quick and linear-time sorts, and say when each one fits.',
  'Choose a data structure under real constraints and defend the choice in a lab viva or an interview.',
];

const FLOW = [
  'Intuition and a picture of the idea',
  'Definitions and a step-by-step walkthrough',
  'Pseudocode, then complete C++17 code',
  'Dry run, complexity and correctness',
  'Mistakes, applications and comparisons',
  '15+ problems from Easy to Hard',
];

function scrollToSection(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

const topicProblems = (id) => PROBLEM_INDEX.filter((p) => p.topic === id);

export default function Landing({ basePath }) {
  const progress = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const to = (path) => `${basePath}/${path}`;
  const anchor = (id) => ({ href: `#${id}`, onClick: (e) => scrollToSection(e, id) });

  const practice = PROBLEM_INDEX.filter((p) => p.topic !== 'completion');
  const challenges = PROBLEM_INDEX.filter((p) => p.topic === 'completion');
  const solved = PROBLEM_INDEX.filter((p) => progress.problems[p.id] === 'solved').length;
  const review = PROBLEM_INDEX.filter((p) => progress.problems[p.id] === 'review');
  const lessonsDone = MODULES.filter((m) => progress.lessons[m.id]).length;
  // Overall progress weighs lessons and problems equally.
  const overall = Math.round(((lessonsDone / MODULES.length) * 0.5 + (PROBLEM_INDEX.length ? solved / PROBLEM_INDEX.length : 0) * 0.5) * 100);
  const nextModule = MODULES.find((m) => !progress.lessons[m.id]);
  const nextProblem = nextModule && topicProblems(nextModule.id).find((p) => progress.problems[p.id] !== 'solved');
  const started = lessonsDone > 0 || solved > 0 || review.length > 0;

  const stats = [
    { num: MODULES.length, label: 'Modules' },
    { num: practice.length, label: 'Practice problems' },
    { num: challenges.length, label: 'Completion challenges' },
    { num: 'C++17', label: 'Language' },
  ];

  return (
    <div className="oop-landing">
      <header className="oop-bar">
        <div className="container oop-bar__inner">
          <Link to="/academic" className="oop-bar__back">
            <span aria-hidden="true">←</span> Academic
          </Link>
          <a {...anchor('top')} className="oop-bar__brand">
            <span className="oop-mark" aria-hidden="true">
              {'{ DSA }'}
            </span>
            <span className="oop-bar__title">Data Structures and Algorithms I</span>
          </a>
          <nav className="oop-bar__links" aria-label="Course sections">
            {SECTION_LINKS.map((s) => (
              <a key={s.id} {...anchor(s.id)}>
                {s.label}
              </a>
            ))}
          </nav>
          <Link to={to('question-bank')} className="oop-bar__cta">
            Question Bank
          </Link>
        </div>
      </header>

      <section className="oop-hero" id="top">
        <div className="container">
          <p className="label">DSA I · C++17 · Analysis · Data structures · Sorting · Graphs</p>
          <h1 className="oop-hero__title">Data Structures and Algorithms, from first principles to interview-ready.</h1>
          <p className="lead">
            Every topic of the DSA I syllabus on its own page: intuition, definitions, pseudocode, complete C++17 code, dry runs, proofs and
            complexity, then at least fifteen problems from Easy to Hard with tested reference solutions.
          </p>
          <div className="oop-hero__actions">
            <Link to={to(`topic/${(nextModule || MODULES[0]).slug}`)} className="btn btn--primary">
              {started && nextModule ? `Continue: ${nextModule.id} · ${nextModule.short}` : 'Start with Module 00'}
            </Link>
            <Link to={to('question-bank')} className="btn btn--ghost">
              Question Bank
            </Link>
          </div>
          <dl className="oop-stats">
            {stats.map((s) => (
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

      <section className="oop-section" id="progress" aria-labelledby="progress-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Your progress</p>
            <h2 id="progress-title">{started ? `${overall}% of the course` : 'Track your progress as you learn'}</h2>
            <p className="lead">
              Mark lessons complete and problems solved (or for review) as you go. Progress is saved in this browser only; nothing is sent
              anywhere.
            </p>
          </div>
          <div className="dsa-progress">
            <div className="dsa-progress__bars">
              <div className="dsa-meter">
                <div className="dsa-meter__head">
                  <span>Lessons complete</span>
                  <span>
                    {lessonsDone} / {MODULES.length}
                  </span>
                </div>
                <div className="dsa-meter__bar" role="progressbar" aria-label="Lessons complete" aria-valuemin={0} aria-valuemax={MODULES.length} aria-valuenow={lessonsDone}>
                  <span style={{ width: `${(lessonsDone / MODULES.length) * 100}%` }} />
                </div>
              </div>
              <div className="dsa-meter">
                <div className="dsa-meter__head">
                  <span>Problems solved</span>
                  <span>
                    {solved} / {PROBLEM_INDEX.length}
                  </span>
                </div>
                <div className="dsa-meter__bar" role="progressbar" aria-label="Problems solved" aria-valuemin={0} aria-valuemax={PROBLEM_INDEX.length} aria-valuenow={solved}>
                  <span style={{ width: `${PROBLEM_INDEX.length ? (solved / PROBLEM_INDEX.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
            <div className="dsa-progress__next">
              <p className="dsa-progress__label">Recommended next</p>
              {nextModule ? (
                <ul>
                  <li>
                    Lesson: <Link to={to(`topic/${nextModule.slug}`)}>{`${nextModule.id} · ${nextModule.name}`}</Link>
                  </li>
                  {nextProblem && (
                    <li>
                      Practice: <Link to={to(`problem/${nextProblem.id}`)}>{`${nextProblem.id} · ${nextProblem.title}`}</Link>
                    </li>
                  )}
                </ul>
              ) : (
                <p>
                  All lessons are complete. Work through the <Link to={to('challenges')}>completion challenges</Link> and the{' '}
                  <Link to={to('interview-preparation')}>interview preparation</Link>.
                </p>
              )}
              {review.length > 0 && (
                <p className="dsa-progress__review">
                  {review.length} problem{review.length === 1 ? '' : 's'} marked for review:{' '}
                  {review.slice(0, 4).map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && ', '}
                      <Link to={to(`problem/${p.id}`)}>{p.id}</Link>
                    </span>
                  ))}
                  {review.length > 4 && ' …'}
                </p>
              )}
              {started &&
                (confirmReset ? (
                  <p className="dsa-progress__reset">
                    Clear all saved progress?{' '}
                    <button
                      type="button"
                      className="dsa-linkbtn"
                      onClick={() => {
                        resetProgress();
                        setConfirmReset(false);
                      }}
                    >
                      Yes, clear it
                    </button>{' '}
                    ·{' '}
                    <button type="button" className="dsa-linkbtn" onClick={() => setConfirmReset(false)}>
                      Cancel
                    </button>
                  </p>
                ) : (
                  <p className="dsa-progress__reset">
                    <button type="button" className="dsa-linkbtn" onClick={() => setConfirmReset(true)}>
                      Reset progress
                    </button>
                  </p>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="oop-section oop-section--alt" id="syllabus" aria-labelledby="syllabus-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Reading order</p>
            <h2 id="syllabus-title">Modules</h2>
            <p className="lead">
              Read from the top: each module builds on the ones before it. The marks show completed lessons and solved problems.
            </p>
          </div>
          {GROUPS.map((g) => (
            <div key={g.label}>
              <h3 className="oop-syllabus__group">{g.label}</h3>
              <ol className="oop-syllabus">
                {MODULES.filter((m) => g.ids.includes(m.id)).map((m) => {
                  const list = topicProblems(m.id);
                  const s = list.filter((p) => progress.problems[p.id] === 'solved').length;
                  return (
                    <li key={m.id}>
                      <Link to={to(`topic/${m.slug}`)} className="oop-syllabus__item">
                        <span className="oop-syllabus__idx">{m.id}</span>
                        <span className="oop-syllabus__text">
                          <span className="oop-syllabus__name">
                            {m.name}
                            {progress.lessons[m.id] && (
                              <span className="dsa-done-mark" aria-label="lesson complete">
                                {' '}
                                ✓
                              </span>
                            )}
                          </span>
                          <span className="oop-syllabus__topics">{m.summary}</span>
                        </span>
                        {list.length > 0 && (
                          <span className="dsa-syllabus__count" aria-label={`${s} of ${list.length} problems solved`}>
                            {s}/{list.length}
                          </span>
                        )}
                        <span className="oop-syllabus__arrow" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="oop-section" id="prepare" aria-labelledby="prepare-title">
        <div className="container">
          <div className="oop-section__head">
            <p className="label">Practice and preparation</p>
            <h2 id="prepare-title">Question bank, challenges, lab and interviews</h2>
          </div>
          <ol className="oop-syllabus">
            {PAGES.map((p) => (
              <li key={p.slug}>
                <Link to={to(p.slug)} className="oop-syllabus__item">
                  <span className="oop-syllabus__idx">{p.idx}</span>
                  <span className="oop-syllabus__text">
                    <span className="oop-syllabus__name">{p.name}</span>
                    <span className="oop-syllabus__topics">
                      {
                        {
                          'question-bank': `All ${practice.length} topic problems with filters, search, sorting and progress`,
                          challenges: `${challenges.length} original scenario problems that combine several modules`,
                          'lab-preparation': 'Implementation drills, tracing, debugging, viva questions and timed lab simulations',
                          'interview-preparation': 'A three-level roadmap, model reasoning, follow-ups and mock interview sets',
                          coverage: 'Every official syllabus item mapped to its lesson and practice problems',
                        }[p.slug]
                      }
                    </span>
                  </span>
                  <span className="oop-syllabus__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="oop-section oop-section--alt" id="notes" aria-labelledby="notes-title">
        <div className="container oop-split">
          <div>
            <p className="label">Learning outcomes</p>
            <h2 id="notes-title">After the course you can</h2>
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
              <li>All code is C++17 and compiles as shown; every reference solution is tested against its sample and extra cases.</li>
              <li>Problems are original unless their source is named. Hints come one at a time before the solution.</li>
              <li>Topics beyond the official DSA I syllabus are marked as extensions.</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="oop-footer">
        <div className="container oop-footer__inner">
          <span className="oop-footer__brand">
            <span className="oop-mark" aria-hidden="true">
              {'{ DSA }'}
            </span>
            Data Structures and Algorithms I
          </span>
          <nav className="oop-footer__links" aria-label="Course links">
            <Link to={to(`topic/${MODULES[0].slug}`)}>Module 00</Link>
            <Link to={to('question-bank')}>Question Bank</Link>
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
