import { useState } from 'react';
import { Markdown } from '../beginner-java/ProblemParts.jsx';
import { setProblemStatus } from './progress.js';

// Small pieces shared by the problem page, the lesson practice lists and the
// question bank.

export function DifficultyTag({ difficulty }) {
  if (!difficulty) return null;
  return <span className={`oop-level oop-level--${difficulty.toLowerCase()}`}>{difficulty}</span>;
}

const STATUS_LABEL = { solved: 'Solved', review: 'Marked for review' };

/** A small mark for a problem's status: ✓ solved, ↻ review, ○ not started. */
export function StatusMark({ status }) {
  return (
    <span className={`dsa-status dsa-status--${status || 'none'}`} aria-label={STATUS_LABEL[status] || 'Not solved yet'} title={STATUS_LABEL[status] || 'Not solved yet'}>
      {status === 'solved' ? '✓' : status === 'review' ? '↻' : '○'}
    </span>
  );
}

/** Buttons to mark a problem solved or for review (each toggles). */
export function StatusButtons({ id, status }) {
  return (
    <div className="dsa-status-btns" role="group" aria-label="Problem status">
      <button type="button" aria-pressed={status === 'solved'} onClick={() => setProblemStatus(id, status === 'solved' ? null : 'solved')}>
        {status === 'solved' ? '✓ Solved' : 'Mark solved'}
      </button>
      <button type="button" aria-pressed={status === 'review'} onClick={() => setProblemStatus(id, status === 'review' ? null : 'review')}>
        {status === 'review' ? '↻ For review' : 'Mark for review'}
      </button>
    </div>
  );
}

/** Hints revealed one at a time. */
export function HintSteps({ hints, mdProps }) {
  const [shown, setShown] = useState(0);
  if (!hints.length) return null;
  return (
    <div className="dsa-hints">
      {hints.slice(0, shown).map((h, i) => (
        <div key={i} className="dsa-hint">
          <span className="dsa-hint__n">Hint {i + 1}</span>
          <Markdown source={h} className="oop-prose" {...mdProps} />
        </div>
      ))}
      <div className="dsa-hints__actions">
        {shown < hints.length && (
          <button type="button" className="dsa-btn" onClick={() => setShown((n) => n + 1)}>
            {shown === 0 ? `Show hint 1 of ${hints.length}` : `Show hint ${shown + 1} of ${hints.length}`}
          </button>
        )}
        {shown > 0 && (
          <button type="button" className="dsa-btn dsa-btn--quiet" onClick={() => setShown(0)}>
            Hide hints
          </button>
        )}
      </div>
    </div>
  );
}

export function CppCode({ source }) {
  return <Markdown source={`\`\`\`cpp\n${source}\n\`\`\``} className="oop-code" />;
}
