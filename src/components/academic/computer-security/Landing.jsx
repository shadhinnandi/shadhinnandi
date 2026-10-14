import { Link } from 'react-router-dom';
import { PAPERS, TOPICS, askedIn, askedTrimesters, stats } from './content.js';

// Course overview: what the course is, the topic list with the papers each
// topic appeared in, an exam map, the previous papers and study notes. Every
// number shown here comes from stats.json, which
// scripts/check-computer-security.mjs writes after checking the content.

const SECTION_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'syllabus', label: 'Topics' },
  { id: 'exam-map', label: 'Exam map' },
  { id: 'papers', label: 'Past papers' },
];

const AREAS = [
  {
    title: 'Cryptography',
    text: 'Modular arithmetic, RSA, Diffie-Hellman, digital signatures and certificates, with every calculation shown step by step.',
    ids: ['02', '03', '04', '05', '06'],
  },
  {
    title: 'Network attacks',
    text: 'How attackers abuse ARP, switches and TCP: spoofing, man-in-the-middle, session hijacking, SYN flooding, Smurf and DDoS.',
    ids: ['07', '08', '09', '10', '11'],
  },
  {
    title: 'Malware and software attacks',
    text: 'Viruses, worms, rootkits, trojans and ransomware, how anti-virus tools detect them, and how buffer overflows work.',
    ids: ['12', '13', '14'],
  },
  {
    title: 'Web security and firewalls',
    text: 'SQL injection, cross-site scripting, CSRF and click-jacking, and how firewalls filter traffic.',
    ids: ['15', '16'],
  },
];

const short = (name) => name.replace(/^(\w{2})\w*\s+20(\d\d)$/, '$1$2');

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
  const mapped = TOPICS.filter((t) => t.id !== '00');

  const heroStats = [
    { num: stats.topics, label: 'Topics' },
    { num: stats.papers, label: 'Past papers' },
    { num: stats.questions, label: 'Solved questions' },
    { num: stats.calculations, label: 'Step-by-step calculations' },
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
              {'{ SEC }'}
            </span>
            <span className="csec-bar__title">Computer Security</span>
          </a>
          <nav className="csec-bar__links" aria-label="Course sections">
            {SECTION_LINKS.map((s) => (
              <a key={s.id} {...anchor(s.id)}>
                {s.label}
              </a>
            ))}
          </nav>
          <Link to={paperPath(firstPaper.id)} className="csec-bar__cta">
            Previous Questions
          </Link>
        </div>
      </header>

      <section className="csec-hero" id="top">
        <div className="container">
          <p className="label">CSE 4531 · Cryptography · Network and Web Security</p>
          <h1 className="csec-hero__title">Computer Security, topic by topic.</h1>
          <p className="lead">
            Short, clear notes on every examinable topic of the course, followed by the last {stats.papers} final exam
            papers with complete, exam-ready solutions.
          </p>
          <div className="csec-hero__actions">
            <Link to={topicPath('00')} className="btn btn--primary">
              Start with the Introduction
            </Link>
            <Link to={paperPath(firstPaper.id)} className="btn btn--ghost">
              Previous Questions
            </Link>
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
            <h2 id="about-title">Know the attack, then the defence.</h2>
            <p className="lead">
              Computer security is the protection of computers, networks and data from people who want to read, change
              or stop them without permission. This course explains how common attacks work and how each one is
              prevented, and it trains the calculations that cryptography questions ask for.
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
                      <Link to={paperPath(p.id)}>{p.name}</Link>
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
            <h2 id="papers-title">Previous final exams</h2>
            <p className="lead">
              Every question from each paper, in the original order and wording, with its marks and a solution you can
              write in the exam.
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
                      Final exam{meta}
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
              <dt>Read the topic first</dt>
              <dd>Each topic starts with a definition, explains how it works in steps, and ends with ready answers.</dd>
            </div>
            <div>
              <dt>Practise the maths by hand</dt>
              <dd>
                RSA, Diffie-Hellman and modular arithmetic come up in almost every paper. Redo each worked example on
                paper without looking.
              </dd>
            </div>
            <div>
              <dt>Revise with past papers</dt>
              <dd>Answer a full paper in two hours, then open the solutions and compare point by point.</dd>
            </div>
            <div>
              <dt>Match the marks</dt>
              <dd>A 3 mark answer needs about three clear points; a 5 mark answer needs a definition, steps and an example.</dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="csec-footer">
        <div className="container csec-footer__inner">
          <span className="csec-footer__brand">
            <span className="csec-mark" aria-hidden="true">
              {'{ SEC }'}
            </span>
            Computer Security
          </span>
          <nav className="csec-footer__links" aria-label="Course links">
            <Link to={topicPath('00')}>Introduction</Link>
            <Link to={paperPath(firstPaper.id)}>Previous Questions</Link>
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
