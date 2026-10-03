import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAPTERS, QUESTION_BANK } from './content.js';

// Course overview: purpose, curriculum, alignment, chapter index, outcomes,
// guidelines and licence. Content and structure follow the original course
// page; the chapter index opens the reader at /chapter/:id.

const SECTION_LINKS = [
  { id: 'purpose', label: 'Purpose' },
  { id: 'structure', label: 'Chapters' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'notes', label: 'Notes' },
];

/** Smooth-scroll to an in-page section, clearing the sticky bars above it. */
function scrollToSection(id, navEl) {
  const target = document.getElementById(id);
  if (!target) return;
  let offset = document.querySelector('.site-header')?.offsetHeight || 0;
  if (navEl && getComputedStyle(navEl).position === 'sticky') {
    offset = parseFloat(getComputedStyle(navEl).top) + navEl.offsetHeight;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset - 8, behavior: reduce ? 'auto' : 'smooth' });
}

/** Fade sections in as they scroll into view (only under html.motion-ok). */
function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !document.documentElement.classList.contains('motion-ok')) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', '');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

const CheckList = ({ items }) => (
  <ul className="bc-check-list">
    {items.map((item, i) => (
      <li key={i} data-reveal="">
        {item}
      </li>
    ))}
  </ul>
);

export default function Landing({ basePath }) {
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  useRevealOnScroll(rootRef);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const anchor = (id) => ({
    href: `#${id}`,
    onClick: (e) => {
      e.preventDefault();
      scrollToSection(id, navRef.current);
    },
  });

  const chapterPath = (id) => `${basePath}/chapter/${id}`;
  const bankPath = `${basePath}/${QUESTION_BANK.id}`;

  return (
    <div ref={rootRef}>
      {/* Course navigation */}
      <header ref={navRef} className={`bc-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="bc-nav__inner">
          <Link to="/academic" className="bc-nav__back">
            <span aria-hidden="true">←</span> Academic
          </Link>
          <a {...anchor('top')} className="bc-nav__brand">
            <span className="bc-logo" aria-hidden="true">
              {'{ C }'}
            </span>
            <span className="bc-nav__title">Beginner C</span>
          </a>
          <nav className="bc-nav__links" aria-label="Course sections">
            {SECTION_LINKS.map((s) => (
              <a key={s.id} {...anchor(s.id)}>
                {s.label}
              </a>
            ))}
          </nav>
          <Link to={bankPath} className="bc-nav__cta">
            {QUESTION_BANK.name}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bc-hero" id="top">
        <div className="bc-hero__bg" aria-hidden="true" />
        <div className="bc-hero__content">
          <span className="bc-hero__badge">ICS · SPL · DSA Foundation</span>
          <h1 className="bc-hero__title">
            Master C Programming
            <br />
            and <span className="bc-grad">problem solving</span>.
          </h1>
          <p className="bc-hero__subtitle">
            A comprehensive, structured educational system covering core syntax, program logic, and software
            foundations. Tailored for academic courses and technical assessments.
          </p>
          <div className="bc-hero__actions">
            <a {...anchor('structure')} className="bc-btn bc-btn--primary">
              Start learning
            </a>
            <Link to={bankPath} className="bc-btn bc-btn--ghost">
              {QUESTION_BANK.name}
            </Link>
          </div>
          <div className="bc-hero__stats">
            <div className="bc-stat">
              <span className="bc-stat__num">15</span>
              <span className="bc-stat__label">Chapters</span>
            </div>
            <div className="bc-stat">
              <span className="bc-stat__num">300+</span>
              <span className="bc-stat__label">Problems</span>
            </div>
            <div className="bc-stat">
              <span className="bc-stat__num">3</span>
              <span className="bc-stat__label">Courses</span>
            </div>
            <div className="bc-stat">
              <span className="bc-stat__num">MIT</span>
              <span className="bc-stat__label">License</span>
            </div>
          </div>
        </div>
        <a {...anchor('purpose')} className="bc-hero__scroll" aria-label="Scroll down">
          <span />
        </a>
      </section>

      {/* Author strip */}
      <section className="bc-author">
        <div className="bc-container bc-author__inner">
          <div className="bc-author__avatar" aria-hidden="true">
            SN
          </div>
          <div className="bc-author__text">
            <p className="bc-author__label">Authored by</p>
            <p className="bc-author__name">Shadhin Nandi</p>
          </div>
          <Link to="/about" className="bc-author__link">
            About the author →
          </Link>
        </div>
      </section>

      {/* Purpose */}
      <section className="bc-section" id="purpose">
        <div className="bc-container">
          <div className="bc-section__head" data-reveal="">
            <span className="bc-section__tag">Purpose</span>
            <h2 className="bc-section__title">An all-in-one learning pathway.</h2>
            <p className="bc-section__lead">
              This project serves as a comprehensive, self-contained curriculum. It offers a structured trajectory
              designed to guide learners from fundamental concepts to proficient, independent problem-solving.
            </p>
          </div>
          <div className="bc-grid bc-grid--3">
            <div className="bc-card" data-reveal="">
              <div className="bc-card__icon">01</div>
              <h3>Accessible foundations</h3>
              <p>
                No prior programming experience is required. Start with fundamental building blocks and progressively
                build complexity.
              </p>
            </div>
            <div className="bc-card" data-reveal="">
              <div className="bc-card__icon">02</div>
              <h3>Academic alignment</h3>
              <p>
                Optimized for academic curricula, specifically Introductory Computer Systems (ICS) and Structured
                Programming (SPL) courses.
              </p>
            </div>
            <div className="bc-card" data-reveal="">
              <div className="bc-card__icon">03</div>
              <h3>Algorithmic logic</h3>
              <p>
                Focuses heavily on developing programmatic thinking and problem-solving methodologies rather than rote
                syntax memorization.
              </p>
            </div>
            <div className="bc-card" data-reveal="">
              <div className="bc-card__icon">04</div>
              <h3>Preparation for DSA</h3>
              <p>Provides a seamless progression toward Data Structures, Algorithms, and technical interviews.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contents */}
      <section className="bc-section bc-section--alt" id="contents">
        <div className="bc-container">
          <div className="bc-section__head" data-reveal="">
            <span className="bc-section__tag">Curriculum</span>
            <h2 className="bc-section__title">The core pillars of the system.</h2>
          </div>

          <div className="bc-pillar" data-reveal="">
            <div className="bc-pillar__num">1</div>
            <div className="bc-pillar__body">
              <h3>Comprehensive C Learning Path</h3>
              <p>A structured, sequential syllabus covering fundamental and advanced programming concepts in C.</p>
              <ul className="bc-chips">
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
            </div>
          </div>

          <div className="bc-pillar" data-reveal="">
            <div className="bc-pillar__num">2</div>
            <div className="bc-pillar__body">
              <h3>Analytical Skill Development</h3>
              <p>
                A progression of conceptual frameworks designed to transition learners from syntax rules to robust
                programmatic logic and design.
              </p>
            </div>
          </div>

          <div className="bc-pillar" data-reveal="">
            <div className="bc-pillar__num">3</div>
            <div className="bc-pillar__body">
              <h3>Extensive Practical Application</h3>
              <p>
                <strong>Over 250 curated problems</strong> complete with detailed solutions, categorized by complexity
                (<span className="bc-tag bc-tag--easy">Easy</span>, <span className="bc-tag bc-tag--med">Medium</span>,{' '}
                <span className="bc-tag bc-tag--hard">Hard</span>) to systematically cultivate problem-solving
                competencies.
              </p>
            </div>
          </div>

          <div className="bc-pillar" data-reveal="">
            <div className="bc-pillar__num">4</div>
            <div className="bc-pillar__body">
              <h3>Advanced Challenge Suite</h3>
              <p>
                An interview-oriented selection of challenges curated from prominent platforms and academic
                examinations:
              </p>
              <div className="bc-grid bc-grid--3 bc-source-grid">
                <div className="bc-source" data-reveal="">
                  <span className="bc-source__name">Codeforces</span>
                  <span className="bc-source__meta">Rating 800–1500</span>
                </div>
                <div className="bc-source" data-reveal="">
                  <span className="bc-source__name">LeetCode</span>
                  <span className="bc-source__meta">Easy &amp; Medium</span>
                </div>
                <div className="bc-source" data-reveal="">
                  <span className="bc-source__name">Academic Exams</span>
                  <span className="bc-source__meta">University Standards</span>
                </div>
              </div>
              <p className="bc-pillar__note">
                Includes reference questions with guided hints alongside comprehensive, step-by-step verified solutions.{' '}
                <Link to={bankPath} className="bc-inline-link">
                  Open the {QUESTION_BANK.name.toLowerCase()} →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="bc-section" id="courses">
        <div className="bc-container">
          <div className="bc-section__head" data-reveal="">
            <span className="bc-section__tag">Curriculum Alignment</span>
            <h2 className="bc-section__title">Structured for academic courses.</h2>
          </div>
          <div className="bc-grid bc-grid--3">
            <div className="bc-course-card" data-reveal="">
              <h3>Introduction to Computer Systems</h3>
              <p>Essential concepts in computer systems and primary programming techniques.</p>
            </div>
            <div className="bc-course-card" data-reveal="">
              <h3>Structural Programming Language</h3>
              <p>Procedural programming paradigms, memory layout, and logic synthesis.</p>
            </div>
            <div className="bc-course-card" data-reveal="">
              <h3>Data Structures Preparation</h3>
              <p>A rigorous foundation for transitioning to advanced algorithms and complex data models.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Structure */}
      <section className="bc-section bc-section--alt" id="structure">
        <div className="bc-container">
          <div className="bc-section__head" data-reveal="">
            <span className="bc-section__tag">Syllabus</span>
            <h2 className="bc-section__title">Sequential Chapter Index</h2>
            <p className="bc-section__lead">
              Fourteen core chapters and a comprehensive problem bank. It is highly recommended to follow the sequence
              in chronological order.
            </p>
          </div>
          <ol className="bc-timeline">
            {CHAPTERS.map((ch) => (
              <li key={ch.id} className="bc-timeline__entry" data-reveal="">
                <Link to={chapterPath(ch.id)} className="bc-timeline__item">
                  <span className="bc-timeline__idx">{ch.id}</span>
                  <span className="bc-timeline__name">{ch.name}</span>
                  <span className="bc-timeline__arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li className="bc-timeline__entry" data-reveal="">
              <Link to={bankPath} className="bc-timeline__item bc-timeline__item--bank">
                <span className="bc-timeline__idx">{QUESTION_BANK.idx}</span>
                <span className="bc-timeline__name">{QUESTION_BANK.name}</span>
                <span className="bc-timeline__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          </ol>
        </div>
      </section>

      {/* Outcomes + learning style */}
      <section className="bc-section" id="outcomes">
        <div className="bc-container">
          <div className="bc-split">
            <div className="bc-split__col">
              <span className="bc-section__tag">Learning Outcomes</span>
              <h2 className="bc-section__title">Target competencies.</h2>
              <CheckList
                items={[
                  'Analyze and decompose complex computational challenges systematically.',
                  'Author standard-compliant, efficient, and secure C source code.',
                  'Articulate core paradigms of procedural programming and memory architecture.',
                  'Successfully approach academic examinations and professional technical interviews.',
                  'Transition seamlessly into advanced study of data structures and algorithms.',
                ]}
              />
            </div>
            <div className="bc-split__col">
              <span className="bc-section__tag">Pedagogy</span>
              <h2 className="bc-section__title">Theory, application, and mastery.</h2>
              <CheckList
                items={[
                  'Introduces concepts through progressive instruction to manage cognitive load.',
                  'Prioritizes computational logic and analysis over basic syntax memorization.',
                  'Integrates hands-on coding exercises into every learning module.',
                ]}
              />
              <div className="bc-flow" data-reveal="">
                <span>Concept</span>
                <span className="bc-flow__arrow">→</span>
                <span>Example</span>
                <span className="bc-flow__arrow">→</span>
                <span>Practice</span>
                <span className="bc-flow__arrow">→</span>
                <span className="bc-flow__end">Mastery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="bc-section bc-section--alt" id="notes">
        <div className="bc-container">
          <div className="bc-section__head" data-reveal="">
            <span className="bc-section__tag">Guidelines</span>
            <h2 className="bc-section__title">Pre-requisite advice.</h2>
          </div>
          <div className="bc-notes">
            <div className="bc-note" data-reveal="">
              <span className="bc-note__icon">!</span>
              <p>
                <strong>Syllabus Continuity:</strong> Follow the chapters sequentially. The curriculum is constructed
                incrementally.
              </p>
            </div>
            <div className="bc-note" data-reveal="">
              <span className="bc-note__icon">!</span>
              <p>
                <strong>Active Learning:</strong> Practical coding is required. Theoretical reading is insufficient
                without writing and debugging code.
              </p>
            </div>
            <div className="bc-note" data-reveal="">
              <span className="bc-note__icon">!</span>
              <p>
                <strong>Chapter Exercises:</strong> Do not bypass the problem sets; they are critical to validating
                conceptual understanding.
              </p>
            </div>
            <div className="bc-note" data-reveal="">
              <span className="bc-note__icon">!</span>
              <p>
                <strong>Conceptual Depth:</strong> Focus on understanding underlying mechanisms rather than memorizing
                solution templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final message */}
      <section className="bc-quote">
        <div className="bc-container">
          <blockquote data-reveal="">
            <p>Programming is not about memorizing syntax. It is about building your thinking ability, step by step.</p>
            <footer>Begin the curriculum with Chapter 00 and proceed sequentially.</footer>
          </blockquote>
        </div>
      </section>

      {/* License */}
      <section className="bc-section" id="license">
        <div className="bc-container">
          <div className="bc-section__head" data-reveal="">
            <span className="bc-section__tag">License</span>
            <h2 className="bc-section__title">MIT License with attribution.</h2>
          </div>
          <div className="bc-license-grid">
            <div className="bc-license-col">
              <h3>Permitted Use</h3>
              <CheckList
                items={[
                  'Study and utilize the material for personal and academic growth.',
                  'Modify and adapt the codebase for custom implementations.',
                  'Distribute and share the course link for educational purposes.',
                ]}
              />
            </div>
            <div className="bc-license-col">
              <h3>Required Attribution</h3>
              <CheckList
                items={[
                  'Provide clear credit to the original author when referencing this project.',
                  <>
                    Author: <Link to="/about">Shadhin Nandi</Link>
                  </>,
                ]}
              />
              <p className="bc-license-note">
                The curricular structures, progressive learning schema, and problem bank designs are part of the
                educational framework authored by Shadhin Nandi. The instructional architecture is the intellectual
                property of the author.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course footer */}
      <footer className="bc-footer">
        <div className="bc-container bc-footer__inner">
          <div className="bc-footer__brand">
            <span className="bc-logo" aria-hidden="true">
              {'{ C }'}
            </span>
            <span>Beginner C Programming Learning System</span>
          </div>
          <div className="bc-footer__links">
            <Link to={bankPath}>{QUESTION_BANK.name}</Link>
            <Link to="/academic">All courses</Link>
            <a {...anchor('top')}>Back to top</a>
          </div>
          <p className="bc-footer__credit">
            Designed &amp; authored by <strong>Shadhin Nandi</strong> · MIT License
          </p>
        </div>
      </footer>
    </div>
  );
}
