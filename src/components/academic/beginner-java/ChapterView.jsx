import { useEffect, useMemo, useRef } from 'react';
import { Markdown } from './ProblemParts.jsx';
import PracticeProblems, { PRACTICE_SECTION_ID } from './PracticeProblems.jsx';
import ScenarioProblems, { SCENARIO_SECTION_ID } from './ScenarioProblems.jsx';

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Split a lesson into its title (the "# ..." line, shown as the page header)
 * and body, and list its "## ..." sections (outside code fences) for the
 * "On this page" list.
 */
function splitLesson(md) {
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
  // "Chapter 04: Classes and Objects" → kicker "Chapter 04", title "Classes and Objects"
  const m = title.match(/^((?:Chapter|Lab) [A-Z0-9]+):\s*(.+)$/);
  return { kicker: m ? m[1] : '', title: m ? m[2] : title, body: body.join('\n'), sections };
}

function jump(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** A chapter (lesson + practice + scenarios) or a lab (lesson only). */
export default function ChapterView({ entry, data }) {
  const lesson = useMemo(() => splitLesson(data.lesson), [data.lesson]);
  const bodyRef = useRef(null);

  // Give the lesson's section headings ids so "On this page" can jump to them.
  useEffect(() => {
    const hs = bodyRef.current?.querySelectorAll(':scope > div > h2') ?? [];
    hs.forEach((h, i) => {
      if (lesson.sections[i]) h.id = lesson.sections[i].id;
    });
  }, [lesson]);

  const toc = [...lesson.sections];
  if (data.practice) toc.push({ id: PRACTICE_SECTION_ID, text: '4. Practice Problems', count: data.practice.problems.length });
  if (data.scenarios) toc.push({ id: SCENARIO_SECTION_ID, text: '5. Scenario-Based Problems', count: data.scenarios.problems.length });

  return (
    <article className={`oop-article oop-article--${entry.kind}`}>
      <header className="oop-article__head">
        {lesson.kicker && <p className="oop-article__kicker">{lesson.kicker}</p>}
        <h1>{lesson.title || entry.name}</h1>
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
        <Markdown source={lesson.body} className="oop-prose" />
      </div>
      {data.practice && <PracticeProblems set={data.practice} />}
      {data.scenarios && <ScenarioProblems set={data.scenarios} />}
    </article>
  );
}
