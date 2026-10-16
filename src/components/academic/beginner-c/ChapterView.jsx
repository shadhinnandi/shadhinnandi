import { useEffect, useMemo, useRef } from 'react';
import Markdown from './Markdown.jsx';
import { resolveCourseLink } from './content.js';
import ScenarioProblems, { SCENARIO_SECTION_ID } from './ScenarioProblems.jsx';

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Split a chapter into its title (the "# ..." line, shown as the page header)
 * and body, and list its "## ..." sections (outside code fences) for the
 * "On this page" list.
 */
function splitChapter(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  let inFence = false;
  const sections = [];
  const body = [];
  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence && !title && /^# /.test(line)) {
      title = line.slice(2).trim();
      continue;
    }
    if (!inFence && /^## /.test(line)) {
      const text = line.slice(3).trim();
      sections.push({ id: `sec-${slugify(text)}`, text: text.replace(/[`*]/g, '') });
    }
    body.push(line);
  }
  // "Chapter 05: Conditional Statements" -> "Conditional Statements"
  const m = title.match(/^Chapter [0-9]+:\s*(.+)$/);
  return { title: m ? m[1] : title, body: body.join('\n'), sections };
}

function jump(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** A chapter: its lesson, then its scenario-based problems if it has any. */
export default function ChapterView({ entry, data, basePath }) {
  const chapter = useMemo(() => splitChapter(data.markdown), [data.markdown]);
  const bodyRef = useRef(null);

  // Give the chapter's section headings ids so "On this page" can jump to them.
  useEffect(() => {
    const hs = bodyRef.current?.querySelectorAll(':scope > div > h2') ?? [];
    hs.forEach((h, i) => {
      if (chapter.sections[i]) h.id = chapter.sections[i].id;
    });
  }, [chapter]);

  const toc = [...chapter.sections];
  if (data.scenarios) {
    toc.push({ id: SCENARIO_SECTION_ID, text: 'Scenario-Based Problems', count: data.scenarios.problems.length });
  }

  return (
    <article className="oop-article oop-article--chapter">
      <header className="oop-article__head">
        <p className="oop-article__kicker">Chapter {entry.id}</p>
        <h1>{chapter.title || entry.name}</h1>
      </header>

      {toc.length > 1 && (
        <nav className="oop-toc" aria-label="On this page">
          <p className="oop-toc__label">On this page</p>
          <ol className={toc.length > 8 ? 'oop-toc__list oop-toc__list--cols' : 'oop-toc__list'}>
            {toc.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)}>
                  {s.text}
                  {s.count != null && <span className="oop-toc__count">{s.count}</span>}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div ref={bodyRef}>
        <Markdown source={chapter.body} className="oop-prose" resolveLink={resolveCourseLink} basePath={basePath} />
      </div>
      {data.scenarios && <ScenarioProblems set={data.scenarios} />}
    </article>
  );
}
