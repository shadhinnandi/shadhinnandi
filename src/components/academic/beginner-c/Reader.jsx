import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ENTRIES, loadChapter, loadQuestionBank, loadScenarios, resolveCourseLink } from './content.js';
import Markdown from './Markdown.jsx';
import QuestionBank from './QuestionBank.jsx';
import ScenarioProblems, { SCENARIO_SECTION_ID } from './ScenarioProblems.jsx';

const CLOSE_MS = 300; // matches the fade-out in beginner-c.css

/**
 * Full-screen chapter reader: chapter list, previous/next, counter and the
 * rendered chapter. Driven by the URL (/chapter/:id, /question-bank), so
 * every chapter can be linked to and survives a refresh.
 * Keyboard: ← / → change chapter, Esc closes.
 */
export default function Reader({ entryIndex, basePath }) {
  const entry = ENTRIES[entryIndex];
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [state, setState] = useState({ status: 'loading' });
  const contentRef = useRef(null);
  const closing = useRef(false);

  const go = useCallback((i) => navigate(`${basePath}/${ENTRIES[i].path}`), [navigate, basePath]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setOpen(false);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => navigate(`${basePath}#structure`), reduce ? 0 : CLOSE_MS);
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

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'Escape') {
        if (sidebarOpen) setSidebarOpen(false);
        else close();
      } else if (e.key === 'ArrowLeft' && entryIndex > 0) go(entryIndex - 1);
      else if (e.key === 'ArrowRight' && entryIndex < ENTRIES.length - 1) go(entryIndex + 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [entryIndex, go, close, sidebarOpen]);

  // Until the current entry has loaded, show the loader (never the previous
  // entry's data).
  const status = state.id === entry.id ? state.status : 'loading';
  const jumpTo = (id) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  let body;
  if (status === 'loading') body = <div className="bc-reader__loading">Loading chapter</div>;
  else if (status === 'error')
    body = <div className="bc-reader__loading bc-reader__loading--error">Failed to load chapter. Please try again.</div>;
  else if (entry.kind === 'chapter')
    body = (
      <article className="bc-reader__article">
        {state.data.scenarios && (
          <p className="bc-sp-jump">
            <button type="button" onClick={() => jumpTo(SCENARIO_SECTION_ID)}>
              {state.data.scenarios.problems.length} scenario-based problems with solutions at the end of this chapter ↓
            </button>
          </p>
        )}
        <Markdown source={state.data.markdown} resolveLink={resolveCourseLink} basePath={basePath} />
        {state.data.scenarios && <ScenarioProblems set={state.data.scenarios} />}
      </article>
    );
  else body = <QuestionBank bank={state.data} basePath={basePath} />;

  return createPortal(
    <div className="bc">
      <div
        className={`bc-reader${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Beginner C Programming: ${entry.name}`}
      >
        <div className="bc-reader__backdrop" onClick={close} />
        <div className="bc-reader__panel">
          <aside className={`bc-reader__sidebar${sidebarOpen ? ' is-open' : ''}`} id="bc-reader-sidebar">
            <div className="bc-reader__sidebar-head">
              <span className="bc-logo" aria-hidden="true">
                {'{ C }'}
              </span>
              <span className="bc-reader__sidebar-title">Chapters</span>
            </div>
            <nav className="bc-reader__nav" aria-label="Chapters">
              {ENTRIES.map((e, i) => (
                <Link
                  key={e.id}
                  to={`${basePath}/${e.path}`}
                  className={`bc-reader__nav-item${i === entryIndex ? ' is-active' : ''}${e.kind !== 'chapter' ? ' bc-reader__nav-item--bank' : ''}`}
                  aria-current={i === entryIndex ? 'page' : undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="bc-reader__nav-idx">{e.idx}</span>
                  <span className="bc-reader__nav-name">{e.name}</span>
                </Link>
              ))}
            </nav>
          </aside>

          <div className="bc-reader__main">
            <header className="bc-reader__header">
              <button type="button" className="bc-reader__close" aria-label="Close" onClick={close}>
                ✕
              </button>
              <button
                type="button"
                className="bc-reader__sidebar-toggle"
                aria-label="Toggle sidebar"
                aria-expanded={sidebarOpen}
                aria-controls="bc-reader-sidebar"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                ☰
              </button>
              <div className="bc-reader__nav-btns">
                <button type="button" className="bc-reader__btn" disabled={entryIndex === 0} onClick={() => go(entryIndex - 1)}>
                  ← Prev
                </button>
                <span className="bc-reader__counter" aria-live="polite">
                  {entryIndex + 1} / {ENTRIES.length}
                </span>
                <button
                  type="button"
                  className="bc-reader__btn"
                  disabled={entryIndex === ENTRIES.length - 1}
                  onClick={() => go(entryIndex + 1)}
                >
                  Next →
                </button>
              </div>
            </header>
            <div className="bc-reader__content" ref={contentRef} tabIndex={-1}>
              {body}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
