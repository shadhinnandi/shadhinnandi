import { useEffect, useMemo, useRef } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';

// Renders course Markdown exactly as the original reader did: Marked (GFM,
// no soft line breaks), then Highlight.js on every code block. Fenced blocks
// without a language are auto-detected, as before.
//
// `inline` renders a single line (no paragraph) inside a <span>.
//
// `resolveLink(href)` maps a link in the Markdown to an in-app path; such
// links navigate inside the site instead of loading a file.
export default function Markdown({ source, className, resolveLink, basePath = '', inline = false }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const root = useHref('/').replace(/\/$/, '');
  const html = useMemo(
    () => (inline ? marked.parseInline(source, { gfm: true }) : marked.parse(source, { breaks: false, gfm: true })),
    [source, inline],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll('pre code').forEach((block) => {
      if (block.dataset.highlighted) return;
      try {
        hljs.highlightElement(block);
      } catch {
        /* leave the block as plain text */
      }
    });
    if (resolveLink) {
      el.querySelectorAll('a[href]').forEach((a) => {
        const target = resolveLink(a.getAttribute('href'));
        if (!target) return;
        const to = `${basePath}/${target}`;
        a.dataset.to = to;
        a.setAttribute('href', `${root}${to}`);
      });
    }
  }, [html, resolveLink, basePath, root]);

  const onClick = (e) => {
    const a = e.target.closest('a[data-to]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(a.dataset.to);
  };

  const Tag = inline ? 'span' : 'div';
  // The HTML comes from the course's own Markdown files in this repository.
  // eslint-disable-next-line react/no-danger
  return <Tag ref={ref} className={className} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
