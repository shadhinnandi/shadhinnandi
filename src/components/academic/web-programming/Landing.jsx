import { Link } from 'react-router-dom';
import { publicUrl } from '../../../lib/media';
import { PAPERS, TOPICS, askedIn, askedTrimesters, stats } from './content.js';

// Course overview for Web Programming, laid out like the Computer Security
// course: what the course is, the topic list with the papers each topic
// appeared in, an exam map, the question papers and study notes. Every number
// shown here comes from stats.json, which scripts/check-web-programming.mjs
// writes after checking the content.

const SECTION_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'syllabus', label: 'Topics' },
  { id: 'exam-map', label: 'Exam map' },
  { id: 'papers', label: 'Past papers' },
];

const AREAS = [
  {
    title: 'JavaScript in the browser',
    text: 'Read inputs with getElementById, keep running totals across clicks, decide with if / else if, and write results with innerHTML. Question 1 of almost every paper.',
    ids: ['03', '04', '05', '07', '09'],
  },
  {
    title: 'PHP and forms',
    text: 'One .php file holding the form and the code: read $_POST, calculate with ceil, round and number_format, classify with if / elseif and print the result.',
    ids: ['10', '11', '12', '13'],
  },
  {
    title: 'SQL and MySQL',
    text: 'Create a database in phpMyAdmin, then SELECT, UPDATE, GROUP BY and HAVING your way through the four-part database question.',
    ids: ['14', '15', '16', '19'],
  },
  {
    title: 'PHP + MySQLi',
    text: 'Connect from PHP, run queries safely with prepared statements, and print rows in an HTML table: the full code the last question asks for.',
    ids: ['17', '18'],
  },
];

const short = (name) => name.replace(/^(\w{2})\w*\s+20(\d\d)(?: Set (\w))?$/, (m, a, b, c) => `${a}${b}${c || ''}`);

function scrollToSection(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function Landing({ basePath }) {
  const topicPath = (id) => `${basePath}/topic/${id}`;
  const paperPath = (id) => `${basePath}/paper/${id}`;
  const anchor = (id) => ({ href: `#${id}`, onClick: (e) => scrollToSection(e, id) });
  const topicName = Object.fromEntries(TOPICS.map((t) => [t.id, t.name]));
  const firstPaper = PAPERS[0];
  const lastPaper = PAPERS[PAPERS.length - 1];
  const mapped = TOPICS.filter((t) => t.id !== '00');

  const heroStats = [
    { num: stats.topics, label: 'Topics' },
    { num: stats.papers, label: 'Past papers' },
    { num: stats.questions, label: 'Solved questions' },
    { num: stats.codeBlocks, label: 'Code examples' },
  ];

  return (
    <div className="csec-landing">
      <header className="csec-bar">
        <div className="container csec-bar__inner">
          <Link to="/academic" className="csec-bar__back">
            <span aria-hidden="true">←</span> Academic
          </Link>
          <a {...anchor('top')} className="csec-bar__brand">
            <span className="csec-mark" aria-hidden="true">
              {'{ WEB }'}
            </span>
            <span className="csec-bar__title">Web Programming</span>
          </a>
          <nav className="csec-bar__links" aria-label="Course sections">
            {SECTION_LINKS.map((s) => (
              <a key={s.id} {...anchor(s.id)}>
                {s.label}
              </a>
            ))}
          </nav>
          <Link to={paperPath(firstPaper.id)} className="csec-bar__cta">
            Question Papers
          </Link>
        </div>
      </header>

      <section className="csec-hero" id="top">
        <div className="container">
          <p className="label">CSE 4165 · JavaScript · PHP · MySQL</p>
          <h1 className="csec-hero__title">Web Programming, from first script to full database app.</h1>
          <p className="lead">
            Beginner-friendly notes on JavaScript, PHP, SQL and PHP with MySQL, built from the real final exams, followed
            by all {stats.papers} final exam papers with complete answers you can reproduce in the lab.
          </p>
          <div className="csec-hero__actions">
            <Link to={topicPath('00')} className="btn btn--primary">
              Start with the Introduction
            </Link>
            <Link to={paperPath(lastPaper.id)} className="btn btn--ghost">
              Latest Question Paper
            </Link>
            <a
              href={publicUrl('documents/web-programming/web-programming-reference.pdf')}
              className="btn btn--ghost csec-sheet-btn"
              target="_blank"
              rel="noopener"
              type="application/pdf"
              aria-label="Cheat Sheet Final"
            >
              Cheat Sheet Final
            </a>
          </div>
          <dl className="csec-stats">
            {heroStats.map((s) => (
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
            <h2 id="about-title">Three questions, three skills.</h2>
            <p className="lead">
              Every final exam of CSE 4165 has the same shape: a JavaScript page that reacts to button clicks, a PHP page
              that processes a form, and a PHP + MySQL program that runs four or five queries on a given table. These
              notes teach exactly those three skills, from the first line of code.
            </p>
          </div>
          <div className="csec-areas">
            {AREAS.map((a) => (
              <article key={a.title} className="csec-area">
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <ul className="csec-area__links">
                  {a.ids.map((id) => (
                    <li key={id}>
                      <Link to={topicPath(id)}>{topicName[id]}</Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="csec-section csec-section--alt" id="syllabus" aria-labelledby="syllabus-title">
        <div className="container">
          <div className="csec-section__head">
            <p className="label">Syllabus</p>
            <h2 id="syllabus-title">Topics</h2>
            <p className="lead">
              {stats.topics} topics, in the order they build on each other. The tags show the final exams in which each
              topic was asked.
            </p>
          </div>
          <ol className="csec-syllabus">
            {TOPICS.map((t) => {
              const when = askedTrimesters(t.id);
              return (
                <li key={t.id}>
                  <Link to={topicPath(t.id)} className="csec-syllabus__item">
                    <span className="csec-syllabus__idx">{t.id}</span>
                    <span className="csec-syllabus__text">
                      <span className="csec-syllabus__name">{t.name}</span>
                      <span className="csec-syllabus__topics">{t.topics}</span>
                    </span>
                    {t.id !== '00' && (
                      <span className="csec-syllabus__tags">
                        {when.length === 0 ? (
                          <span className="csec-tag csec-tag--none">Not in papers</span>
                        ) : (
                          when.map((w) => (
                            <span key={w} className="csec-tag" title={w}>
                              {short(w)}
                            </span>
                          ))
                        )}
                      </span>
                    )}
                    <span className="csec-syllabus__arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="csec-section" id="exam-map" aria-labelledby="exam-map-title">
        <div className="container">
          <div className="csec-section__head">
            <p className="label">Exam map</p>
            <h2 id="exam-map-title">What was asked, and when.</h2>
            <p className="lead">
              Each cell lists the questions on that topic in that paper. Topics asked in every paper are the safest to
              prepare first.
            </p>
          </div>
          <div className="csec-map-wrap">
            <table className="csec-map">
              <thead>
                <tr>
                  <th scope="col">Topic</th>
                  {PAPERS.map((p) => (
                    <th key={p.id} scope="col">
                      <Link to={paperPath(p.id)} title={p.name}>
                        {p.idx}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mapped.map((t) => (
                  <tr key={t.id}>
                    <th scope="row">
                      <Link to={topicPath(t.id)}>{t.name}</Link>
                    </th>
                    {PAPERS.map((p) => {
                      const qs = askedIn(t.id).filter((q) => q.paper === p.id);
                      return (
                        <td key={p.id}>
                          {qs.length === 0 ? (
                            <>
                              <span className="csec-map__empty" aria-hidden="true">
                                ·
                              </span>
                              <span className="visually-hidden">Not asked</span>
                            </>
                          ) : (
                            qs.map((q) => (
                              <Link key={q.id} to={{ pathname: paperPath(p.id), hash: `#${q.id}` }}>
                                {q.number}
                              </Link>
                            ))
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="csec-section csec-section--alt" id="papers" aria-labelledby="papers-title">
        <div className="container">
          <div className="csec-section__head">
            <p className="label">Question bank</p>
            <h2 id="papers-title">Final exam papers</h2>
            <p className="lead">
              Every question from each paper, in the original order and wording, with its marks and a complete answer
              behind a Show answer button. The number is the UIU trimester code (261 = Spring 2026).
            </p>
          </div>
          <ol className="csec-papers">
            {PAPERS.map((p) => {
              const info = stats.perPaper[p.id];
              const meta = info ? ` · ${info.questions} questions · ${info.marks} marks` : '';
              return (
                <li key={p.id}>
                  <Link to={paperPath(p.id)} className="csec-papers__item">
                    <span className="csec-papers__idx">{p.idx}</span>
                    <span className="csec-papers__name">{p.name}</span>
                    <span className="csec-papers__meta">
                      Final exam {p.code}
                      {meta}
                    </span>
                    <span className="csec-syllabus__arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
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
              <dt>Type the code, do not just read it</dt>
              <dd>Every example is complete. Paste it into a file, run it, then change one thing and run it again.</dd>
            </div>
            <div>
              <dt>Practise in XAMPP</dt>
              <dd>
                PHP and MySQL only run through a server. Start Apache and MySQL, keep files in htdocs and open them through
                http://localhost (topic 14).
              </dd>
            </div>
            <div>
              <dt>Revise with the papers</dt>
              <dd>Solve a full paper in two hours, then open each answer and compare it with yours line by line.</dd>
            </div>
            <div>
              <dt>Learn the patterns once</dt>
              <dd>
                Running totals, ranges with else if, ceil for whole units and GROUP BY with HAVING come back in almost
                every paper with new numbers.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="csec-footer">
        <div className="container csec-footer__inner">
          <span className="csec-footer__brand">
            <span className="csec-mark" aria-hidden="true">
              {'{ WEB }'}
            </span>
            Web Programming
          </span>
          <nav className="csec-footer__links" aria-label="Course links">
            <Link to={topicPath('00')}>Introduction</Link>
            <Link to={paperPath(lastPaper.id)}>Question Papers</Link>
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
