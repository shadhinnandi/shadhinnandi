import { Link } from 'react-router-dom';
import { ENTRIES, PAPERS } from './content.js';
import stats from './stats.json';

// Course overview for Biology for Engineers, laid out like the other academic
// courses: what the course covers, the midterm and final sections in their
// reading order, the question bank and study notes. Counts come from
// stats.json, which scripts/check-biology-course.mjs writes after checking the content.

const SECTION_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'syllabus', label: 'Sections' },
  { id: 'papers', label: 'Question bank' },
  { id: 'notes', label: 'Notes' },
];

const AREAS = [
  {
    title: 'Midterm: the cell and its genes',
    text: 'Why engineers study biology, cell structure and the fluid mosaic membrane, organelles, the cell cycle, mitosis and meiosis, genetics and structural biology.',
    path: 'mid/introduction',
  },
  {
    title: 'Final: biology as technology',
    text: 'PCR, gel electrophoresis and recombinant DNA, the immune system and vaccines, neurons and brain-computer interfaces, biological databases, systems and synthetic biology.',
    path: 'final/introduction',
  },
];

// Counts from stats.json, written by scripts/check-biology-course.mjs.
const STATS = [
  { num: stats.solutions, label: 'Solved suggestions' },
  { num: stats.figures, label: 'Original figures' },
  { num: stats.papers, label: 'Past papers' },
  { num: stats.questions, label: 'Bank questions' },
];

function scrollToSection(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function Landing({ basePath }) {
  const to = (path) => `${basePath}/${path}`;
  const anchor = (id) => ({ href: `#${id}`, onClick: (e) => scrollToSection(e, id) });
  const group = (g) => ENTRIES.filter((e) => e.group === g);

  return (
    <div className="csec-landing">
      <header className="csec-bar">
        <div className="container csec-bar__inner">
          <Link to="/academic" className="csec-bar__back">
            <span aria-hidden="true">←</span> Academic
          </Link>
          <a {...anchor('top')} className="csec-bar__brand">
            <span className="csec-mark" aria-hidden="true">
              {'{ BIO }'}
            </span>
            <span className="csec-bar__title">Biology for Engineers</span>
          </a>
          <nav className="csec-bar__links" aria-label="Course sections">
            {SECTION_LINKS.map((s) => (
              <a key={s.id} {...anchor(s.id)}>
                {s.label}
              </a>
            ))}
          </nav>
          <Link to={to('questions')} className="csec-bar__cta">
            Question Bank
          </Link>
        </div>
      </header>

      <section className="csec-hero" id="top">
        <div className="container">
          <p className="label">BIO 3105 · Cells · Genetics · Biotechnology · Immunity · BCI</p>
          <h1 className="csec-hero__title">Biology for Engineers, from the cell to brain-computer interfaces.</h1>
          <p className="lead">
            Exam-focused notes built from the lecture slides, the midterm and final suggestions with their solutions, the
            original slide figures beside every answer, and a question bank of nine previous papers.
          </p>
          <div className="csec-hero__actions">
            <Link to={to('introduction')} className="btn btn--primary">
              Start with the Introduction
            </Link>
            <Link to={to('mid/solutions')} className="btn btn--ghost">
              Midterm Solutions
            </Link>
            <Link to={to('final/solutions')} className="btn btn--ghost">
              Final Solutions
            </Link>
          </div>
          <dl className="csec-stats">
            {STATS.map((s) => (
              <div key={s.label} className="csec-stats__item">
                <dt>{s.label}</dt>
                <dd>{s.num}</dd>
              </div>
            ))}
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
            <h2 id="about-title">Two exams, two halves of biology.</h2>
            <p className="lead">
              The midterm covers how a cell is built, divides and stores its genetic information. The final covers how
              engineers use that biology: DNA technology, immunity, the nervous system and computing on biological data.
              Each half starts with an introduction and ends with the suggested questions and their solutions.
            </p>
          </div>
          <div className="csec-areas">
            {AREAS.map((a) => (
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
            <h2 id="syllabus-title">Sections</h2>
            <p className="lead">
              Read from the top. Each exam section goes from its scope and slides to the main topics, the original slide
              figures, the suggestions and finally the solutions.
            </p>
          </div>
          {['start', 'mid', 'final'].map((g) => (
            <div key={g} className="bio-landing-group">
              <h3 className="csec-syllabus__group">{{ start: 'Start here', mid: 'Midterm preparation', final: 'Final preparation' }[g]}</h3>
              <ol className="csec-syllabus">
                {group(g).map((e) => (
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

      <section className="csec-section" id="papers" aria-labelledby="papers-title">
        <div className="container">
          <div className="csec-section__head">
            <p className="label">Question bank</p>
            <h2 id="papers-title">Previous papers</h2>
            <p className="lead">
              Every question in its original wording, with marks and course outcomes, plus a link to the original paper.
              Questions only: use them to test yourself after the suggestions and solutions.
            </p>
          </div>
          <ol className="csec-papers">
            {PAPERS.map((p, i) => (
              <li key={p.id}>
                <Link to={to(`questions/${p.id}`)} className="csec-papers__item">
                  <span className="csec-papers__idx">Q{i + 1}</span>
                  <span className="csec-papers__name">
                    {p.exam} · {p.term}
                  </span>
                  <span className="csec-papers__meta">{p.exam === 'Final' ? '40 marks' : '30 marks'}</span>
                  <span className="csec-syllabus__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="csec-section csec-section--alt" id="notes" aria-labelledby="notes-title">
        <div className="container">
          <div className="csec-section__head">
            <p className="label">Guidelines</p>
            <h2 id="notes-title">How to use this course</h2>
          </div>
          <dl className="csec-notes">
            <div>
              <dt>Suggestions first</dt>
              <dd>The suggestion lists name what the teacher expects. Learn every listed item, then check its solution.</dd>
            </div>
            <div>
              <dt>Draw the diagrams</dt>
              <dd>
                Many questions ask for a labelled diagram. Each solution shows the original slide figure: practise drawing
                it with every label.
              </dd>
            </div>
            <div>
              <dt>Test yourself with past papers</dt>
              <dd>Answer a full paper from the question bank in the exam time, then compare with the solutions.</dd>
            </div>
            <div>
              <dt>Mind the labels</dt>
              <dd>
                Answers marked "prepared from the slides" were not in the supplied solutions; answers marked "corrected"
                fix a mistake in the supplied text. Both say exactly what changed.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="csec-footer">
        <div className="container csec-footer__inner">
          <span className="csec-footer__brand">
            <span className="csec-mark" aria-hidden="true">
              {'{ BIO }'}
            </span>
            Biology for Engineers
          </span>
          <nav className="csec-footer__links" aria-label="Course links">
            <Link to={to('introduction')}>Introduction</Link>
            <Link to={to('questions')}>Question Bank</Link>
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
