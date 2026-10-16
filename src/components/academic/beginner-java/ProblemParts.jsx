import { useRef, useState } from 'react';
import Markdown from '../beginner-c/Markdown.jsx';
import CopyButton from '../CopyButton.jsx';
import { readText } from '../copy.js';
import { LEVEL_MARK } from './problems.js';

// Building blocks shared by practice problems, scenario problems and the
// question bank. Course Markdown is rendered with the Beginner C course's
// Markdown component (Marked + Highlight.js), so both courses share one
// renderer and one syntax-highlighting chunk.

export { Markdown };

export function LevelTag({ level }) {
  if (!level) return null;
  return <span className={`oop-level oop-level--${level.toLowerCase()}`}>{level}</span>;
}

/** The URL hash without '#', decoded; a malformed hash yields '' instead of throwing. */
export function hashTarget(hash) {
  try {
    return decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return '';
  }
}

export const levelHeading = (level) => `${LEVEL_MARK[level] || ''} ${level}`.trim();

/** Lines longer than this put the input and output boxes on top of each other. */
const WIDE_LINE = 40;

export function ioLayout(...ios) {
  let longest = 0;
  for (const io of ios) {
    for (const t of [io.stream || '', ...io.files.map((f) => f.content)]) {
      for (const line of t.split('\n')) longest = Math.max(longest, line.length);
    }
  }
  return longest > WIDE_LINE ? 'oop-io-pair oop-io-pair--stacked' : 'oop-io-pair';
}

/** Standard input/output (and any files) as labelled console blocks. */
export function IOBox({ title, io, fileSuffix = '' }) {
  const parts = [];
  if (io.stream != null) parts.push({ key: 'stream', label: null, text: io.stream });
  io.files.forEach((f) => parts.push({ key: `file-${f.name}`, label: `File ${f.name}${fileSuffix}`, text: f.content }));
  return (
    <div className="oop-io">
      <div className="oop-io__title">{title}</div>
      {parts.length === 0 && <p className="oop-io__empty">No input</p>}
      {parts.map((p) => (
        <div key={p.key} className="oop-io__part">
          {p.label && <div className="oop-io__file">{p.label}</div>}
          <pre className="oop-io__pre">
            <code>{p.text === '' ? ' ' : p.text}</code>
          </pre>
        </div>
      ))}
    </div>
  );
}

export function SampleIO({ input, output, inputTitle = 'Sample input', outputTitle = 'Sample output' }) {
  return (
    <div className={ioLayout(input, output)}>
      <IOBox title={inputTitle} io={input} />
      <IOBox title={outputTitle} io={output} fileSuffix=" (after running)" />
    </div>
  );
}

/**
 * A disclosure with a show/hide label. Content is only rendered once opened.
 * `copy` adds a "Copy answer" button at the top right of the opened content.
 */
export function Reveal({ show, hide, children, className = '', copy = false }) {
  const [seen, setSeen] = useState(false);
  const bodyRef = useRef(null);
  return (
    <details className={`oop-reveal ${className}`.trim()} onToggle={(e) => e.currentTarget.open && setSeen(true)}>
      <summary>
        <span className="oop-reveal__show">{show}</span>
        <span className="oop-reveal__hide">{hide}</span>
      </summary>
      <div className="oop-reveal__body" ref={bodyRef}>
        {seen && copy && <CopyButton getText={() => readText(bodyRef.current)} />}
        {seen && children}
      </div>
    </details>
  );
}

export function JavaCode({ source }) {
  return <Markdown source={`\`\`\`java\n${source}\n\`\`\``} className="oop-code" />;
}
