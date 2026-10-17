import { useEffect, useMemo, useRef, useState } from 'react';
import { publicUrl } from '../../../lib/media';
import Markdown from '../beginner-c/Markdown.jsx';
import CopyButton from '../CopyButton.jsx';
import { readText } from '../copy.js';
import { expandFigures } from './figures.js';

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const strip = (s) => s.replace(/[`*]/g, '');

function jump(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** Course Markdown with the course's ::fig lines turned into captioned figures. */
function Prose({ source, className = 'csec-prose' }) {
  const html = useMemo(() => expandFigures(source), [source]);
  return <Markdown source={html} className={className} />;
}

/** "# Title" line (outside code) and the rest of the page. */
function splitTitle(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const i = lines.findIndex((l) => /^# /.test(l));
  if (i < 0) return { title: '', body: md };
  return { title: lines[i].slice(2).trim(), body: [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n') };
}

const META = /^\*\*(Suggestion|Source|Slides?|Review|Note)s?:\*\*\s*(.+)$/;

/**
 * A solutions page: "## Group" headings, and under each, "### Question"
 * blocks. Lines right after a question that start with **Suggestion:**,
 * **Source:**, **Slides:** or **Review:** are shown as its labels; the rest
 * is the answer, shown behind a toggle.
 */
export function parseQA(body) {
  const lines = body.split('\n');
  const intro = [];
  const groups = [];
  let group = null;
  let q = null;
  let inAnswer = false;
  for (const line of lines) {
    let m;
    if ((m = line.match(/^## (.+)$/))) {
      group = { id: `sec-${slugify(m[1])}`, title: m[1].trim(), intro: [], questions: [] };
      groups.push(group);
      q = null;
      continue;
    }
    if ((m = line.match(/^### (.+)$/)) && group) {
      q = { id: `q-${slugify(m[1]).slice(0, 60)}`, title: m[1].trim(), meta: [], answer: [] };
      group.questions.push(q);
      inAnswer = false;
      continue;
    }
    if (q) {
      if (!inAnswer && (m = line.match(META))) {
        q.meta.push({ label: m[1], text: m[2].trim() });
        continue;
      }
      if (!inAnswer && line.trim() === '') continue;
      inAnswer = true;
      q.answer.push(line);
    } else if (group) group.intro.push(line);
    else intro.push(line);
  }
  const text = (a) => a.join('\n').trim();
  return {
    intro: text(intro),
    groups: groups.map((g) => ({
      ...g,
      intro: text(g.intro),
      questions: g.questions.map((x) => ({ ...x, answer: text(x.answer) })),
    })),
  };
}

function QuestionCard({ q, open, onToggle }) {
  const answerRef = useRef(null);
  const answerId = `${q.id}-answer`;
  return (
    <article className="csec-question bio-qa" id={q.id} aria-labelledby={`${q.id}-title`}>
      <header className="csec-question__head">
        <h3 id={`${q.id}-title`} className="bio-qa__q">
          {strip(q.title)}
        </h3>
      </header>
      {q.meta.length > 0 && (
        <ul className="bio-qa__meta">
          {q.meta.map((m) => (
            <li key={m.label + m.text} className={`bio-qa__tag bio-qa__tag--${m.label.toLowerCase()}`}>
              <span>{m.label}</span> <Markdown source={m.text} inline />
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="csec-question__toggle" aria-expanded={open} aria-controls={answerId} onClick={onToggle}>
        {open ? 'Hide answer' : 'Show answer'}
      </button>
      <div id={answerId} className="csec-solution" hidden={!open}>
        {open && (
          <>
            <CopyButton getText={() => readText(answerRef.current)} />
            <p className="csec-label">Answer</p>
            <div ref={answerRef}>
              <Prose source={q.answer} />
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function QAPage({ body }) {
  const qa = useMemo(() => parseQA(body), [body]);
  const all = qa.groups.flatMap((g) => g.questions.map((q) => q.id));
  const [open, setOpen] = useState(() => new Set());
  const allOpen = all.length > 0 && all.every((id) => open.has(id));
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      {qa.intro && <Prose source={qa.intro} />}
      <div className="csec-paper__bar">
        <p className="csec-paper__meta">
          {all.length} questions · {qa.groups.length} topics
        </p>
        <button type="button" className="csec-paper__all" onClick={() => setOpen(allOpen ? new Set() : new Set(all))}>
          {allOpen ? 'Hide all answers' : 'Show all answers'}
        </button>
      </div>
      {qa.groups.map((g) => (
        <section key={g.id} className="bio-qa-group" aria-labelledby={g.id}>
          <h2 id={g.id} className="bio-qa-group__title">
            {strip(g.title)}
          </h2>
          {g.intro && <Prose source={g.intro} />}
          <div className="csec-paper__list">
            {g.questions.map((q) => (
              <QuestionCard key={q.id} q={q} open={open.has(q.id)} onToggle={() => toggle(q.id)} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

/** One course page: header, original-paper link (question bank), contents list and body. */
export default function PageView({ entry, source }) {
  const { title, body } = useMemo(() => splitTitle(source), [source]);
  const bodyRef = useRef(null);
  const sections = useMemo(() => {
    let inFence = false;
    const out = [];
    for (const line of body.split('\n')) {
      if (/^```/.test(line)) inFence = !inFence;
      if (!inFence && /^## /.test(line)) out.push({ id: `sec-${slugify(line.slice(3))}`, text: strip(line.slice(3).trim()) });
    }
    return out;
  }, [body]);

  // Page sections get ids so "On this page" can jump to them (solution groups set their own).
  useEffect(() => {
    if (entry.layout === 'qa') return;
    const hs = bodyRef.current?.querySelectorAll('.csec-prose > h2') ?? [];
    hs.forEach((h, i) => {
      if (sections[i]) h.id = sections[i].id;
    });
  }, [sections, entry.layout]);

  const paperUrl = entry.paper ? publicUrl(`documents/biology-for-engineers/${entry.paper.file}`) : null;

  return (
    <article className={`csec-article bio-page bio-page--${entry.group}`}>
      <header className="csec-article__head">
        <p className="csec-article__kicker">{entry.kicker}</p>
        <h1>{title || entry.name}</h1>
      </header>

      {paperUrl && (
        <p className="bio-original">
          <span>Original question paper</span>
          <a href={paperUrl} target="_blank" rel="noopener">
            {entry.paper.file.endsWith('.pdf') ? 'Open the PDF' : 'Open the photo'}
          </a>
        </p>
      )}

      {sections.length > 1 && (
        <nav className="csec-toc" aria-label="On this page">
          <p className="csec-toc__label">On this page</p>
          <ol className={sections.length > 7 ? 'csec-toc__list csec-toc__list--cols' : 'csec-toc__list'}>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)}>
                  {s.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div ref={bodyRef}>{entry.layout === 'qa' ? <QAPage body={body} /> : <Prose source={body} />}</div>
    </article>
  );
}
