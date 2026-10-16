import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TOPICS } from './content.js';
import Prose from '../computer-security/Prose.jsx';
import CopyButton from '../CopyButton.jsx';
import { readText } from '../copy.js';

const topicName = Object.fromEntries(TOPICS.map((t) => [t.id, t.name]));

/** The URL hash without '#', decoded; a malformed hash yields '' instead of throwing. */
export function hashTarget(hash) {
  try {
    return decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return '';
  }
}

function Question({ q, open, onToggle, basePath }) {
  const solutionId = `${q.id}-solution`;
  const answerRef = useRef(null);
  return (
    <article className="csec-question" id={q.id} aria-labelledby={`${q.id}-title`}>
      <header className="csec-question__head">
        <h2 id={`${q.id}-title`} className="csec-question__num">
          Q{q.number}
        </h2>
        <span className="csec-question__marks">
          {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
        </span>
      </header>
      <Prose source={q.question} className="csec-prose csec-question__text" />
      <ul className="csec-question__topics" aria-label="Related topics">
        {q.topics.map((id) => (
          <li key={id}>
            <Link to={`${basePath}/topic/${id}`}>{topicName[id] || `Topic ${id}`}</Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="csec-question__toggle"
        aria-expanded={open}
        aria-controls={solutionId}
        onClick={onToggle}
      >
        {open ? 'Hide answer' : 'Show answer'}
      </button>
      <div id={solutionId} className="csec-solution" hidden={!open}>
        {open && (
          <>
            <CopyButton getText={() => readText(answerRef.current)} />
            <p className="csec-label">Answer</p>
            <div ref={answerRef}>
              <Prose source={q.solution} />
            </div>
          </>
        )}
      </div>
    </article>
  );
}

/**
 * One previous final exam: every question as printed in the paper, its
 * marks, the related topics and an exam-ready solution behind a toggle.
 */
export default function PaperView({ paper, basePath }) {
  const { hash } = useLocation();
  // A question linked from a topic page (#<question id>) opens with its solution.
  const [open, setOpen] = useState(() => new Set([hashTarget(hash)].filter(Boolean)));
  const allOpen = paper.questions.every((q) => open.has(q.id));
  const marks = paper.questions.reduce((n, q) => n + q.marks, 0);

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <article className="csec-article csec-paper">
      <header className="csec-article__head">
        <p className="csec-article__kicker">Question paper · Final exam</p>
        <h1>{paper.title}</h1>
      </header>
      <dl className="csec-paper__info">
        {paper.info.map((i) => (
          <div key={i.label}>
            <dt>{i.label}</dt>
            <dd>{i.value}</dd>
          </div>
        ))}
      </dl>
      <div className="csec-paper__bar">
        <p className="csec-paper__meta">
          {paper.questions.length} questions · {marks} marks · all answered
        </p>
        <button
          type="button"
          className="csec-paper__all"
          onClick={() => setOpen(allOpen ? new Set() : new Set(paper.questions.map((q) => q.id)))}
        >
          {allOpen ? 'Hide all answers' : 'Show all answers'}
        </button>
      </div>
      <p className="csec-paper__how">
        Write each program yourself first, then open the answer and compare. Every answer is complete on its own; the
        topic links lead to the notes that teach the pattern behind it.
      </p>
      <div className="csec-paper__list">
        {paper.questions.map((q) => (
          <Question key={q.id} q={q} open={open.has(q.id)} onToggle={() => toggle(q.id)} basePath={basePath} />
        ))}
      </div>
    </article>
  );
}
