import { useEffect, useMemo, useRef } from 'react';
import Markdown from '../beginner-c/Markdown.jsx';
import { resolveFigures } from './figures.js';
import { placeSeqDiagrams, renderNotation } from './notation.js';

// Course Markdown, rendered with the Beginner C course's Markdown component
// (shared by all courses) after the course's calc and seq blocks are turned
// into HTML and figure paths are resolved to their published URLs.
export default function Prose({ source, className = 'csec-prose' }) {
  const ref = useRef(null);
  const html = useMemo(() => resolveFigures(renderNotation(source)), [source]);

  useEffect(() => {
    if (ref.current) placeSeqDiagrams(ref.current);
  }, [html]);

  return (
    <div ref={ref} className="csec-prose-root">
      <Markdown source={html} className={className} />
    </div>
  );
}
