import { useEffect, useState } from 'react';
import { copyText } from './copy.js';

/**
 * "Copy answer" button shown at the top right of a solution. `getText` is
 * called on click, so it can read the rendered answer at that moment.
 */
export default function CopyButton({ getText, label = 'Copy answer' }) {
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (state === 'idle') return undefined;
    const timer = setTimeout(() => setState('idle'), 1600);
    return () => clearTimeout(timer);
  }, [state]);

  const onClick = async () => setState((await copyText(getText())) ? 'done' : 'failed');

  return (
    <div className="copy-row">
      <button type="button" className={`copy-btn${state === 'done' ? ' is-done' : ''}`} onClick={onClick}>
        {state === 'done' ? 'Copied' : state === 'failed' ? 'Copy failed' : label}
      </button>
    </div>
  );
}
