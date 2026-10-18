import { Link } from 'react-router-dom';
import { ENTRIES, GROUPS, SLIDES } from './content.js';

// Course overview for English II, laid out like the other academic courses:
// what the course covers, the reading order of every lesson, the question
// papers and study notes. The lesson lists come straight from content.js.

const SECTION_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'syllabus', label: 'Lessons' },
  { id: 'notes', label: 'Notes' },
];

const AREAS = [
  {
    title: 'Midterm: reading and paragraphs',
    text: 'Reading strategies, word meanings, short answers and summary writing; the three-part paragraph and five paragraph types; editing fourteen kinds of error.',
    path: 'mid/introduction',
  },
  {
    title: 'Final: essays and formal writing',
    text: 'Essay outlines and thesis statements; descriptive, cause and effect, argumentative and compare and contrast essays; applications, emails, editing and vocabulary.',
    path: 'final/introduction',
  },
];

function scrollToSection(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function Landing({ basePath }) {
  const to = (path) => `${basePath}/${path}`;
  const anchor = (id) => ({ href: `#${id}`, onClick: (e) => scrollToSection(e, id) });
  const lessons = ENTRIES.filter((e) => e.group === 'mid' || e.group === 'final').length;
  const groups = GROUPS.filter((g) => ENTRIES.some((e) => e.group === g.id));
  const has = (path) => ENTRIES.some((e) => e.path === path);

  return (
    <div className="csec-landing">
      <header className="csec-bar">
        <div className="container csec-bar__inner">
          <Link to="/academic" className="csec-bar__back">
            <span aria-hidden="true">←</span> Academic
          </Link>
          <a {...anchor('top')} className="csec-bar__brand">
            <span className="csec-mark" aria-hidden="true">
              {'{ ENG }'}
            </span>
            <span className="csec-bar__title">English II</span>
          </a>
          <nav className="csec-bar__links" aria-label="Course sections">
            {SECTION_LINKS.map((s) => (
              <a key={s.id} {...anchor(s.id)}>
                {s.label}
              </a>
            ))}
          </nav>
          <Link to={to('introduction')} className="csec-bar__cta">
            Start learning
          </Link>
        </div>
      </header>

      <section className="csec-hero" id="top">
        <div className="container">
          <p className="label">ENG 1013 · Reading · Paragraphs · Essays · Applications · Emails</p>
          <h1 className="csec-hero__title">English II, from a clear paragraph to a complete exam essay.</h1>
          <p className="lead">
            Lessons built from the course slides and the Spring 2026 papers. Each topic teaches the structure step by step,
            shows worked models you can copy and study, and ends with new practice in the exam's own format.
          </p>
          <div className="csec-hero__actions">
            <Link to={to('introduction')} className="btn btn--primary">
              Start with the Introduction
            </Link>
            <Link to={to('mid/introduction')} className="btn btn--ghost">
              Midterm
            </Link>
            {has('final/introduction') && (
              <Link to={to('final/introduction')} className="btn btn--ghost">
                Final
              </Link>
            )}
          </div>
          <dl className="csec-stats">
            <div className="csec-stats__item">
              <dt>Lessons</dt>
              <dd>{lessons}</dd>
            </div>
            <div className="csec-stats__item">
              <dt>Original slide decks</dt>
              <dd>{Object.keys(SLIDES).filter((k) => /^(mid|final)-/.test(k)).length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="csec-author">
        <div className="container csec-author__inner">
          <span className="csec-author__avatar" aria-hidden="true">
            SN
          </span>
          <p className="csec-author__text">
            <span className="csec-author__label">Authored by</span>
            <span className="csec-author__name">Shadhin Nandi</span>
          </p>
          <Link to="/about" className="csec-author__link">
            About the author →
          </Link>
        </div>
      </section>

      <section className="csec-section" id="about" aria-labelledby="about-title">
        <div className="container">
          <div className="csec-section__head">
            <p className="label">About the course</p>
            <h2 id="about-title">Two exams, one skill: clear, structured writing.</h2>
            <p className="lead">
              The midterm tests reading and the paragraph. The final builds the paragraph into the essay and adds formal
              writing. Both papers also test editing, so the same error types appear in both halves.
            </p>
          </div>
          <div className="csec-areas">
            {AREAS.filter((a) => has(a.path)).map((a) => (
              <article key={a.title} className="csec-area">
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <ul className="csec-area__links">
                  <li>
                    <Link to={to(a.path)}>Open the introduction</Link>
                  </li>
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="csec-section csec-section--alt" id="syllabus" aria-labelledby="syllabus-title">
        <div className="container">
          <div className="csec-section__head">
            <p className="label">Reading order</p>
            <h2 id="syllabus-title">Lessons</h2>
            <p className="lead">
              Read from the top. Every lesson explains the skill, shows the method and worked models, and ends with
              practice and the original slides.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.id} className="bio-landing-group">
              <h3 className="csec-syllabus__group">{g.label}</h3>
              <ol className="csec-syllabus">
                {ENTRIES.filter((e) => e.group === g.id).map((e) => (
                  <li key={e.path}>
                    <Link to={to(e.path)} className="csec-syllabus__item">
                      <span className="csec-syllabus__idx">{e.idx}</span>
                      <span className="csec-syllabus__text">
                        <span className="csec-syllabus__name">{e.name}</span>
                      </span>
                      <span className="csec-syllabus__arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="csec-section" id="notes" aria-labelledby="notes-title">
        <div className="container">
          <div className="csec-section__head">
            <p className="label">Guidelines</p>
            <h2 id="notes-title">How to use this course</h2>
          </div>
          <dl className="csec-notes">
            <div>
              <dt>Learn the pattern, not the answer</dt>
              <dd>Exam topics change every term; the structure does not. Practise the outline until it is automatic.</dd>
            </div>
            <div>
              <dt>Write before you reveal</dt>
              <dd>Attempt each practice task on paper first, then open the hint or the model answer and compare.</dd>
            </div>
            <div>
              <dt>Models are examples</dt>
              <dd>
                Model paragraphs and essays were written for this course to show the structure. Study how they are built
                instead of memorising them word for word.
              </dd>
            </div>
            <div>
              <dt>Labels you can trust</dt>
              <dd>
                Practice tasks are new questions in the exam's format. Real past questions appear only on the question
                paper pages, never as practice.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="csec-footer">
        <div className="container csec-footer__inner">
          <span className="csec-footer__brand">
            <span className="csec-mark" aria-hidden="true">
              {'{ ENG }'}
            </span>
            English II
          </span>
          <nav className="csec-footer__links" aria-label="Course links">
            <Link to={to('introduction')}>Introduction</Link>
            <Link to="/academic">All courses</Link>
            <a {...anchor('top')}>Back to top</a>
          </nav>
          <p className="csec-footer__credit">
            Written by <strong>Shadhin Nandi</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
