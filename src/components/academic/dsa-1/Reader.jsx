import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { hashTarget } from '../beginner-java/ProblemParts.jsx';
import { ENTRIES, PROBLEM_INDEX, loadPage, loadProblem, loadTopic } from './content.js';
import LessonView from './LessonView.jsx';
import ProblemView from './ProblemView.jsx';
import QuestionBank from './QuestionBank.jsx';
import { useProgress } from './progress.js';

const CLOSE_MS = 250; // matches the fade-out in java-course.css

/** Sidebar groups: modules by part of the course, then the practice pages. */
export const GROUPS = [
  { label: 'Foundations', ids: ['00', '01', '02', '03', '04', '05', '06'] },
  { label: 'Linear structures', ids: ['07', '08', '09', '10'] },
  { label: 'Trees, graphs and heaps', ids: ['11', '12', '13', '14', '15'] },
  { label: 'Sorting', ids: ['16A', '16B', '16C', '16D'] },
  { label: 'Sets and revision', ids: ['17', '18'] },
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadEntry(entry) {
  if (entry.kind === 'topic') return loadTopic(entry.id);
  if (entry.kind === 'problem') return loadProblem(entry.id);
  if (entry.kind === 'question-bank' || entry.kind === 'challenges') return Promise.resolve({});
  return loadPage(entry.slug);
}

/** Entries before and after: modules and pages in reading order; problems in bank order. */
function neighbours(entry) {
  if (entry.kind === 'problem') {
    const i = PROBLEM_INDEX.findIndex((p) => p.id === entry.id);
    const at = (j) => {
      const p = PROBLEM_INDEX[j];
      return p ? { path: `problem/${p.id}`, name: `${p.id} · ${p.title}` } : null;
    };
    return { prev: at(i - 1), next: at(i + 1), position: `${i + 1} / ${PROBLEM_INDEX.length}` };
  }
  const i = ENTRIES.findIndex((e) => e.path === entry.path);
  const label = (e) => (e ? { path: e.path, name: e.kind === 'topic' ? `${e.id} · ${e.name}` : e.name } : null);
  return { prev: label(ENTRIES[i - 1]), next: label(ENTRIES[i + 1]), position: `${i + 1} / ${ENTRIES.length}` };
}

function kicker(entry) {
  if (entry.kind === 'topic') return `Module ${entry.id}`;
  if (entry.kind === 'problem') return entry.problem.topic === 'completion' ? 'Completion challenge' : `Problem · Module ${entry.problem.topic}`;
  return 'Practice and preparation';
}

/**
 * Full-screen reader: grouped contents with progress marks, previous/next,
 * reading progress and the current module, page or problem. Driven by the
 * URL, so every entry can be linked to and survives a refresh.
 * Keyboard: ← / → change entry, Esc closes.
 */
export default function Reader({ entry, basePath }) {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const progress = useProgress();
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [state, setState] = useState({ status: 'loading' });
  const contentRef = useRef(null);
  const progressRef = useRef(null);
  const closing = useRef(false);
  const { prev, next, position } = neighbours(entry);
  const activeTopic = entry.kind === 'problem' ? entry.problem.topic : entry.id;

  const goTo = useCallback((path) => navigate(`${basePath}/${path}`), [navigate, basePath]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setOpen(false);
    window.setTimeout(() => navigate(`${basePath}#syllabus`), reducedMotion() ? 0 : CLOSE_MS);
  }, [navigate, basePath]);

  // Open: fade in, lock page scroll and make the page behind inert.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    const app = document.getElementById('root');
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (app) app.inert = true;
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = overflow;
      if (app) app.inert = false;
    };
  }, []);

  // Load the current entry; start at its top.
  useEffect(() => {
    let alive = true;
    setSidebarOpen(false);
    setState({ status: 'loading' });
    if (contentRef.current) contentRef.current.scrollTop = 0;
    loadEntry(entry)
      .then((data) => alive && setState({ status: 'ready', data, path: entry.path }))
      .catch(() => alive && setState({ status: 'error', path: entry.path }));
    contentRef.current?.focus({ preventScroll: true });
    return () => {
      alive = false;
    };
  }, [entry]);

  const status = state.path === entry.path ? state.status : 'loading';

  // Once loaded, jump to a #target in the URL (e.g. a lesson section).
  useEffect(() => {
    if (status !== 'ready' || !hash) return;
    const id = hashTarget(hash);
    const target = id ? document.getElementById(id) : null;
    if (target && contentRef.current?.contains(target)) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }, [status, hash]);

  // Reading progress of the current entry.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? el.scrollTop / max : 0})`;
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [status]);

  // Keyboard navigation (not while typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'Escape') {
        if (sidebarOpen) setSidebarOpen(false);
        else close();
      } else if (e.key === 'ArrowLeft' && prev) goTo(prev.path);
      else if (e.key === 'ArrowRight' && next) goTo(next.path);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [prev, next, goTo, close, sidebarOpen]);

  let body;
  if (status === 'loading') body = <div className="oop-reader__status">Loading…</div>;
  else if (status === 'error')
    body = <div className="oop-reader__status oop-reader__status--error">This page could not be loaded. Check your connection and try again.</div>;
  else if (entry.kind === 'question-bank') body = <QuestionBank basePath={basePath} />;
  else if (entry.kind === 'challenges') body = <QuestionBank basePath={basePath} completion />;
  else if (entry.kind === 'problem') body = <ProblemView key={entry.id} problem={state.data.problem} basePath={basePath} />;
  else body = <LessonView key={entry.path} entry={entry} data={state.data} basePath={basePath} />;

  const navItem = (e) => {
    const active = e.path === entry.path || (entry.kind === 'problem' && e.id === activeTopic);
    const done = e.kind === 'topic' && progress.lessons[e.id];
    return (
      <li key={e.path}>
        <Link
          to={`${basePath}/${e.path}`}
          className={`oop-reader__nav-item${active ? ' is-active' : ''}`}
          aria-current={e.path === entry.path ? 'page' : undefined}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="oop-reader__nav-idx">{e.idx}</span>
          <span className="oop-reader__nav-name">{e.short || e.name}</span>
          {done && (
            <span className="dsa-nav-done" aria-label="lesson complete">
              ✓
            </span>
          )}
        </Link>
      </li>
    );
  };

  return createPortal(
    <div className="oop dsa">
      <div className={`oop-reader${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label={`Data Structures and Algorithms I: ${entry.name}`}>
        <div className="oop-reader__panel">
          <aside className={`oop-reader__sidebar${sidebarOpen ? ' is-open' : ''}`} id="oop-reader-sidebar" aria-label="Course contents">
            <div className="oop-reader__sidebar-head">
              <span className="oop-mark" aria-hidden="true">
                {'{ DSA }'}
              </span>
              <span className="oop-reader__sidebar-title">Data Structures and Algorithms I</span>
            </div>
            <nav className="oop-reader__nav">
              {GROUPS.map((g) => (
                <div key={g.label} className="oop-reader__group">
                  <p className="oop-reader__group-label">{g.label}</p>
                  <ul>{ENTRIES.filter((e) => e.kind === 'topic' && g.ids.includes(e.id)).map(navItem)}</ul>
                </div>
              ))}
              <div className="oop-reader__group">
                <p className="oop-reader__group-label">Practice and preparation</p>
                <ul>{ENTRIES.filter((e) => e.kind !== 'topic').map(navItem)}</ul>
              </div>
            </nav>
          </aside>
          {sidebarOpen && <div className="oop-reader__scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

          <div className="oop-reader__main">
            <header className="oop-reader__bar">
              <button
                type="button"
                className="oop-reader__icon-btn oop-reader__toggle"
                aria-label="Show course contents"
                aria-expanded={sidebarOpen}
                aria-controls="oop-reader-sidebar"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="oop-reader__heading">
                <span className="oop-reader__kicker">{kicker(entry)}</span>
                <span className="oop-reader__title">{entry.name}</span>
              </div>
              <div className="oop-reader__pager">
                <button type="button" className="oop-reader__btn" disabled={!prev} onClick={() => goTo(prev.path)} aria-label={prev ? `Previous: ${prev.name}` : 'Previous'}>
                  <span aria-hidden="true">←</span>
                  <span className="oop-reader__btn-text">Prev</span>
                </button>
                <span className="oop-reader__counter" aria-live="polite">
                  {position}
                </span>
                <button type="button" className="oop-reader__btn" disabled={!next} onClick={() => goTo(next.path)} aria-label={next ? `Next: ${next.name}` : 'Next'}>
                  <span className="oop-reader__btn-text">Next</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <button type="button" className="oop-reader__icon-btn" aria-label="Close reader" onClick={close}>
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="oop-reader__progress" aria-hidden="true">
                <span ref={progressRef} />
              </div>
            </header>
            <div className="oop-reader__content" ref={contentRef} tabIndex={-1}>
              {body}
              {status === 'ready' && (
                <nav className="oop-reader__footer-nav" aria-label="Previous and next">
                  {prev ? (
                    <Link to={`${basePath}/${prev.path}`} className="oop-pager-link">
                      <span className="oop-pager-link__dir">← Previous</span>
                      <span className="oop-pager-link__name">{prev.name}</span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next && (
                    <Link to={`${basePath}/${next.path}`} className="oop-pager-link oop-pager-link--next">
                      <span className="oop-pager-link__dir">Next →</span>
                      <span className="oop-pager-link__name">{next.name}</span>
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
