import { Fragment, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Markdown } from '../beginner-java/ProblemParts.jsx';
import { DIFFICULTIES } from './content.js';
import { resolveLink } from './links.js';
import { setLessonDone, useProgress } from './progress.js';
import { DifficultyTag, StatusMark } from './ProblemParts.jsx';
import { VIZ } from './viz/index.jsx';

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const PRACTICE_ID = 'practice-problems';

/** Title ("# Module 07: Arrays" → kicker + title), body and "## " sections outside code fences. */
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
  const m = title.match(/^(Module [0-9A-D]+):\s*(.+)$/);
  return { kicker: m ? m[1] : '', title: m ? m[2] : title, body: body.join('\n'), sections };
}

/** Markdown split at "::viz <name> <args>" lines into text and visualisation segments. */
function segments(body) {
  const out = [];
  let text = [];
  let inFence = false;
  for (const line of body.split('\n')) {
    if (/^```/.test(line)) inFence = !inFence;
    const m = !inFence && line.match(/^::viz\s+([\w-]+)\s*(.*)$/);
    if (m && VIZ[m[1]]) {
      out.push({ type: 'md', text: text.join('\n') });
      out.push({ type: 'viz', name: m[1], args: m[2].trim() });
      text = [];
    } else text.push(line);
  }
  out.push({ type: 'md', text: text.join('\n') });
  return out.filter((s) => s.type === 'viz' || s.text.trim());
}

function jump(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** The topic's problems, grouped Easy → Medium → Hard, each linking to its own page. */
function PracticeList({ file, entry, basePath, progress }) {
  const solved = file.problems.filter((p) => progress.problems[p.id] === 'solved').length;
  return (
    <section className="oop-problems dsa-practice" id={PRACTICE_ID} aria-labelledby={`${PRACTICE_ID}-title`}>
      <h2 id={`${PRACTICE_ID}-title`}>Practice problems</h2>
      <p className="oop-problems__meta">
        {file.problems.length} problems · {DIFFICULTIES.map((d) => `${file.problems.filter((p) => p.difficulty === d).length} ${d.toLowerCase()}`).join(' · ')} ·{' '}
        {solved} solved
      </p>
      {file.intro && <Markdown source={file.intro} className="oop-prose" resolveLink={resolveLink} basePath={basePath} />}
      <p className="dsa-practice__bank">
        <Link to={`${basePath}/question-bank?topic=${entry.id}`}>Open these problems in the question bank</Link> to filter, search and track
        them with the rest of the course.
      </p>
      {DIFFICULTIES.map((d) => {
        const list = file.problems.filter((p) => p.difficulty === d);
        if (!list.length) return null;
        return (
          <section key={d} className="dsa-practice__level" aria-label={`${d} problems`}>
            <h3>
              <DifficultyTag difficulty={d} /> {list.length} problems
            </h3>
            <ol className="dsa-plist">
              {list.map((p) => (
                <li key={p.id}>
                  <Link to={`${basePath}/problem/${p.id}`} className="dsa-plist__item">
                    <StatusMark status={progress.problems[p.id]} />
                    <span className="dsa-plist__id">{p.id}</span>
                    <span className="dsa-plist__title">{p.title}</span>
                    <span className="dsa-plist__sub">{p.subtopic}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </section>
  );
}

/** A module (lesson, completion toggle, practice list) or a preparation page. */
export default function LessonView({ entry, data, basePath }) {
  const lesson = useMemo(() => splitLesson(data.lesson), [data.lesson]);
  const parts = useMemo(() => segments(lesson.body), [lesson.body]);
  const progress = useProgress();
  const bodyRef = useRef(null);
  const isTopic = entry.kind === 'topic';
  const done = isTopic && Boolean(progress.lessons[entry.id]);

  // Give the lesson's section headings ids so "On this page" can jump to them.
  useEffect(() => {
    const hs = bodyRef.current?.querySelectorAll(':scope > div > h2') ?? [];
    hs.forEach((h, i) => {
      if (lesson.sections[i]) h.id = lesson.sections[i].id;
    });
  }, [lesson]);

  const toc = [...lesson.sections];
  if (data.problems) toc.push({ id: PRACTICE_ID, text: 'Practice problems', count: data.problems.problems.length });

  return (
    <article className={`oop-article dsa-article dsa-article--${entry.kind}`}>
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
        {parts.map((s, i) => {
          if (s.type === 'md') return <Markdown key={i} source={s.text} className="oop-prose" resolveLink={resolveLink} basePath={basePath} />;
          const Viz = VIZ[s.name];
          return (
            <Fragment key={i}>
              <Viz args={s.args} />
            </Fragment>
          );
        })}
      </div>

      {isTopic && (
        <div className={`dsa-complete${done ? ' is-done' : ''}`}>
          <p>{done ? 'You marked this lesson complete.' : 'Finished the lesson and tried a few problems?'}</p>
          <button type="button" aria-pressed={done} onClick={() => setLessonDone(entry.id, !done)}>
            {done ? '✓ Lesson complete (undo)' : 'Mark lesson complete'}
          </button>
        </div>
      )}

      {data.problems && <PracticeList file={data.problems} entry={entry} basePath={basePath} progress={progress} />}
    </article>
  );
}
