import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ENTRIES, loadPaper, loadTopic } from './content.js';
import TopicView from './TopicView.jsx';
import PaperView, { hashTarget } from './PaperView.jsx';

const CLOSE_MS = 250; // matches the fade-out in computer-security.css (shared styles)

const GROUPS = [
  { kind: 'topic', label: 'Topics' },
  { kind: 'paper', label: 'Question papers' },
];

/** Heading shown in the reader bar for an entry. */
export function entryLabel(entry) {
  return entry.kind === 'topic' ? `Topic ${entry.id}` : 'Final exam';
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Full-screen reader: grouped contents list, previous/next, position counter,
 * reading progress and the current topic or previous paper. Driven by the
 * URL, so every entry can be linked to and survives a refresh.
 * Keyboard: ← / → change entry, Esc closes.
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
    const load = entry.kind === 'topic' ? loadTopic(entry.id) : loadPaper(entry.id);
    load
      .then((data) => alive && setState({ status: 'ready', data, id: entry.id }))
      .catch(() => alive && setState({ status: 'error', id: entry.id }));
    contentRef.current?.focus({ preventScroll: true });
    return () => {
      alive = false;
    };
  }, [entry]);

  const status = state.id === entry.id ? state.status : 'loading';

  // Once loaded, jump to a #target in the URL (e.g. one question of a paper).
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
  if (status === 'loading') body = <div className="csec-reader__status">Loading…</div>;
  else if (status === 'error')
    body = (
      <div className="csec-reader__status csec-reader__status--error">
        This page could not be loaded. Check your connection and try again.
      </div>
    );
  else if (entry.kind === 'paper') body = <PaperView key={entry.id} paper={state.data} basePath={basePath} />;
  else body = <TopicView entry={entry} data={state.data} basePath={basePath} />;

  return createPortal(
    <div className="csec csec--web">
      <div
        className={`csec-reader${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Web Programming: ${entry.name}`}
      >
        <div className="csec-reader__panel">
          <aside
            className={`csec-reader__sidebar${sidebarOpen ? ' is-open' : ''}`}
            id="csec-reader-sidebar"
            aria-label="Course contents"
          >
            <div className="csec-reader__sidebar-head">
              <span className="csec-mark" aria-hidden="true">
                {'{ WEB }'}
              </span>
              <span className="csec-reader__sidebar-title">Web Programming</span>
            </div>
            <nav className="csec-reader__nav">
              {GROUPS.map((g) => (
                <div key={g.kind} className="csec-reader__group">
                  <p className="csec-reader__group-label">{g.label}</p>
                  <ul>
                    {ENTRIES.map((e, i) =>
                      e.kind === g.kind ? (
                        <li key={e.path}>
                          <Link
                            to={`${basePath}/${e.path}`}
                            className={`csec-reader__nav-item${i === entryIndex ? ' is-active' : ''}`}
                            aria-current={i === entryIndex ? 'page' : undefined}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <span className="csec-reader__nav-idx">{e.idx}</span>
                            <span className="csec-reader__nav-name">{e.name}</span>
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>
          {sidebarOpen && <div className="csec-reader__scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

          <div className="csec-reader__main">
            <header className="csec-reader__bar">
              <button
                type="button"
                className="csec-reader__icon-btn csec-reader__toggle"
                aria-label="Show course contents"
                aria-expanded={sidebarOpen}
                aria-controls="csec-reader-sidebar"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="csec-reader__heading">
                <span className="csec-reader__kicker">{entryLabel(entry)}</span>
                <span className="csec-reader__title">{entry.name}</span>
              </div>
              <div className="csec-reader__pager">
                <button
                  type="button"
                  className="csec-reader__btn"
                  disabled={!prev}
                  onClick={() => go(entryIndex - 1)}
                  aria-label={prev ? `Previous: ${prev.name}` : 'Previous'}
                >
                  <span aria-hidden="true">←</span>
                  <span className="csec-reader__btn-text">Prev</span>
                </button>
                <span className="csec-reader__counter" aria-live="polite">
                  {entryIndex + 1} / {ENTRIES.length}
                </span>
                <button
                  type="button"
                  className="csec-reader__btn"
                  disabled={!next}
                  onClick={() => go(entryIndex + 1)}
                  aria-label={next ? `Next: ${next.name}` : 'Next'}
                >
                  <span className="csec-reader__btn-text">Next</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <button type="button" className="csec-reader__icon-btn" aria-label="Close reader" onClick={close}>
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="csec-reader__progress" aria-hidden="true">
                <span ref={progressRef} />
              </div>
            </header>
            <div className="csec-reader__content" ref={contentRef} tabIndex={-1}>
              {body}
              {status === 'ready' && (
                <nav className="csec-reader__footer-nav" aria-label="Previous and next">
                  {prev ? (
                    <Link to={`${basePath}/${prev.path}`} className="csec-pager-link">
                      <span className="csec-pager-link__dir">← Previous</span>
                      <span className="csec-pager-link__name">
                        {prev.kind === 'topic' ? `${prev.id} · ` : 'Final exam '}
                        {prev.name}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next && (
                    <Link to={`${basePath}/${next.path}`} className="csec-pager-link csec-pager-link--next">
                      <span className="csec-pager-link__dir">Next →</span>
                      <span className="csec-pager-link__name">
                        {next.kind === 'topic' ? `${next.id} · ` : 'Final exam '}
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
