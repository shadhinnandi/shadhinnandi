import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PAPERS, askedIn } from './content.js';
import Prose from '../computer-security/Prose.jsx';

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Split a topic into its title (the "# ..." line, shown as the page header)
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
  return { title, body: body.join('\n'), sections };
}

function jump(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** Where the topic appeared in the supplied papers, with links to each question. */
function ExamRecord({ topicId, basePath }) {
  const asked = askedIn(topicId);
  if (topicId === '00') return null;
  return (
    <aside className="csec-asked" aria-label="Asked in previous papers">
      <p className="csec-asked__label">Asked in previous finals</p>
      {asked.length === 0 ? (
        <p className="csec-asked__none">
          Not found in the supplied papers ({PAPERS[0].name} to {PAPERS[PAPERS.length - 1].name}).
        </p>
      ) : (
        <ul className="csec-asked__list">
          {PAPERS.map((p) => {
            const qs = asked.filter((q) => q.paper === p.id);
            if (qs.length === 0) return null;
            return (
              <li key={p.id}>
                <span className="csec-asked__paper">{p.name}</span>
                <span className="csec-asked__qs">
                  {qs.map((q) => (
                    <Link key={q.id} to={{ pathname: `${basePath}/paper/${p.id}`, hash: `#${q.id}` }}>
                      Q{q.number} <span className="csec-asked__marks">[{q.marks}]</span>
                    </Link>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

/** A topic page: header, exam record, contents list and the notes. */
export default function TopicView({ entry, data, basePath }) {
  const lesson = useMemo(() => splitLesson(data.lesson), [data.lesson]);
  const bodyRef = useRef(null);

  // Give the topic's section headings ids so "On this page" can jump to them.
  useEffect(() => {
    const hs = bodyRef.current?.querySelectorAll('.csec-prose > h2') ?? [];
    hs.forEach((h, i) => {
      if (lesson.sections[i]) h.id = lesson.sections[i].id;
    });
  }, [lesson]);

  return (
    <article className="csec-article">
      <header className="csec-article__head">
        <p className="csec-article__kicker">Topic {entry.id}</p>
        <h1>{lesson.title || entry.name}</h1>
      </header>

      <ExamRecord topicId={entry.id} basePath={basePath} />

      {lesson.sections.length > 1 && (
        <nav className="csec-toc" aria-label="On this page">
          <p className="csec-toc__label">On this page</p>
          <ol className={lesson.sections.length > 7 ? 'csec-toc__list csec-toc__list--cols' : 'csec-toc__list'}>
            {lesson.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)}>
                  {s.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div ref={bodyRef}>
        <Prose source={lesson.body} />
      </div>
    </article>
  );
}
