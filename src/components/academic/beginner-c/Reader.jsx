import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { hashTarget } from '../beginner-java/ProblemParts.jsx';
import ChapterView from './ChapterView.jsx';
import { ENTRIES, loadChapter, loadQuestionBank, loadScenarios } from './content.js';
import QuestionBank from './QuestionBank.jsx';

const CLOSE_MS = 250; // matches the fade-out in java-course.css

const GROUPS = [
  { kind: 'chapter', label: 'Chapters' },
  { kind: 'question-bank', label: 'Practice' },
];

const entryLabel = (entry) => (entry.kind === 'chapter' ? `Chapter ${entry.id}` : entry.name);

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Full-screen reader: grouped contents list, previous/next, position counter,
 * reading progress and the current chapter or question bank. Driven by the
 * URL (/chapter/:id, /question-bank), so every page can be linked to and
 * survives a refresh. Same layout and styles as the Java course reader.
 * Keyboard: ← / → change page, Esc closes.
 */
export default function Reader({ entryIndex, basePath }) {
  const entry = ENTRIES[entryIndex];
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [state, setState] = useState({ status: 'loading' });
  const contentRef = useRef(null);
  const progressRef = useRef(null);
  const closing = useRef(false);

  const go = useCallback((i) => navigate(`${basePath}/${ENTRIES[i].path}`), [navigate, basePath]);

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
    const load =
      entry.kind === 'chapter'
        ? Promise.all([loadChapter(entry.id), loadScenarios(entry.id)]).then(([markdown, scenarios]) => ({ markdown, scenarios }))
        : loadQuestionBank();
    load
      .then((data) => alive && setState({ status: 'ready', data, id: entry.id }))
      .catch(() => alive && setState({ status: 'error', id: entry.id }));
    contentRef.current?.focus({ preventScroll: true });
    return () => {
      alive = false;
    };
  }, [entry]);

  // Until the current entry has loaded, show the loader (never the previous entry's data).
  const status = state.id === entry.id ? state.status : 'loading';

  // Once loaded, jump to a #target in the URL (e.g. a chapter's scenario problems).
  useEffect(() => {
    if (status !== 'ready' || !hash) return;
    const id = hashTarget(hash);
    const target = id ? document.getElementById(id) : null;
    if (target && contentRef.current?.contains(target)) {
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
  }, [status, hash]);

  // Reading progress of the current entry.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${pct / 100})`;
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
      } else if (e.key === 'ArrowLeft' && entryIndex > 0) go(entryIndex - 1);
      else if (e.key === 'ArrowRight' && entryIndex < ENTRIES.length - 1) go(entryIndex + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [entryIndex, go, close, sidebarOpen]);

  const prev = ENTRIES[entryIndex - 1];
  const next = ENTRIES[entryIndex + 1];

  let body;
  if (status === 'loading') body = <div className="oop-reader__status">Loading…</div>;
  else if (status === 'error')
    body = (
      <div className="oop-reader__status oop-reader__status--error">
        This page could not be loaded. Check your connection and try again.
      </div>
    );
  else if (entry.kind === 'question-bank') body = <QuestionBank bank={state.data} basePath={basePath} />;
  else body = <ChapterView entry={entry} data={state.data} basePath={basePath} />;

  return createPortal(
    <div className="oop">
      <div
        className={`oop-reader${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Beginner C Programming: ${entry.name}`}
      >
        <div className="oop-reader__panel">
          <aside
            className={`oop-reader__sidebar${sidebarOpen ? ' is-open' : ''}`}
            id="c-reader-sidebar"
            aria-label="Course contents"
          >
            <div className="oop-reader__sidebar-head">
              <span className="oop-mark" aria-hidden="true">
                {'{ C }'}
              </span>
              <span className="oop-reader__sidebar-title">Beginner C Programming</span>
            </div>
            <nav className="oop-reader__nav">
              {GROUPS.map((g) => (
                <div key={g.kind} className="oop-reader__group">
                  <p className="oop-reader__group-label">{g.label}</p>
                  <ul>
                    {ENTRIES.map((e, i) =>
                      e.kind === g.kind ? (
                        <li key={e.path}>
                          <Link
                            to={`${basePath}/${e.path}`}
                            className={`oop-reader__nav-item${i === entryIndex ? ' is-active' : ''}`}
                            aria-current={i === entryIndex ? 'page' : undefined}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <span className="oop-reader__nav-idx">{e.idx}</span>
                            <span className="oop-reader__nav-name">{e.name}</span>
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </div>
              ))}
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
                aria-controls="c-reader-sidebar"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="oop-reader__heading">
                <span className="oop-reader__kicker">{entryLabel(entry)}</span>
                <span className="oop-reader__title">{entry.name}</span>
              </div>
              <div className="oop-reader__pager">
                <button
                  type="button"
                  className="oop-reader__btn"
                  disabled={!prev}
                  onClick={() => go(entryIndex - 1)}
                  aria-label={prev ? `Previous: ${prev.name}` : 'Previous'}
                >
                  <span aria-hidden="true">←</span>
                  <span className="oop-reader__btn-text">Prev</span>
                </button>
                <span className="oop-reader__counter" aria-live="polite">
                  {entryIndex + 1} / {ENTRIES.length}
                </span>
                <button
                  type="button"
                  className="oop-reader__btn"
                  disabled={!next}
                  onClick={() => go(entryIndex + 1)}
                  aria-label={next ? `Next: ${next.name}` : 'Next'}
                >
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
                      <span className="oop-pager-link__name">
                        {prev.kind === 'chapter' ? `${prev.id} · ` : ''}
                        {prev.name}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next && (
                    <Link to={`${basePath}/${next.path}`} className="oop-pager-link oop-pager-link--next">
                      <span className="oop-pager-link__dir">Next →</span>
                      <span className="oop-pager-link__name">
                        {next.kind === 'chapter' ? `${next.id} · ` : ''}
                        {next.name}
                      </span>
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
