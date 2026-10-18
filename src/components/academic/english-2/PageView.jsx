import { useEffect, useMemo, useRef, useState } from 'react';
import { publicUrl } from '../../../lib/media';
import Markdown from '../beginner-c/Markdown.jsx';
import CopyButton from '../CopyButton.jsx';
import { readText } from '../copy.js';
import { breakOptions, parseBlocks, proseLines, slugify } from './blocks.js';
import { SLIDES } from './content.js';
import VocabLevel from './VocabLevel.jsx';

const strip = (s) => s.replace(/[`*]/g, '');

function jump(e, id) {
  e.preventDefault();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

function Prose({ source }) {
  const md = useMemo(() => breakOptions(source), [source]);
  return <Markdown source={md} className="csec-prose" />;
}

/** "# Title" line and the rest of the page. */
function splitTitle(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const i = lines.findIndex((l) => /^# /.test(l));
  if (i < 0) return { title: '', body: md };
  return { title: lines[i].slice(2).trim(), body: [...lines.slice(0, i), ...lines.slice(i + 1)].join('\n') };
}

/** A model answer as plain paragraphs; letters keep every line break. */
function AnswerText({ text, keepLines }) {
  return text.split(/\n\s*\n/).map((para, i) =>
    keepLines ? (
      <p key={i}>
        {para.split('\n').map((line, j, all) => (
          <span key={j}>
            {line}
            {j < all.length - 1 && <br />}
          </span>
        ))}
      </p>
    ) : (
      <p key={i}>{para.replace(/\s*\n\s*/g, ' ')}</p>
    ),
  );
}

/** Model paragraph, essay, application or email: outline and answer kept apart, so Copy takes the answer only. */
function ModelBlock({ block }) {
  const answerRef = useRef(null);
  const id = `m-${slugify(`${block.kicker} ${block.title}`).slice(0, 60)}`;
  const label = block.answerLabel || 'Answer';
  return (
    <article className="eng-model" id={id} aria-labelledby={`${id}-title`}>
      <header className="eng-model__head">
        {block.kicker && <p className="eng-model__kicker">{block.kicker}</p>}
        <h3 id={`${id}-title`}>{strip(block.title)}</h3>
      </header>
      {block.lead && <Prose source={block.lead} />}
      {block.parts.outline && (
        <div className="eng-outline">
          <p className="csec-label">Outline</p>
          <Prose source={block.parts.outline} />
        </div>
      )}
      {block.parts.answer && (
        <div className={`eng-answer${block.type === 'letter' ? ' eng-answer--letter' : ''}`}>
          <CopyButton label={`Copy ${label.toLowerCase()}`} getText={() => readText(answerRef.current)} />
          <p className="csec-label">{label}</p>
          <div ref={answerRef} className="eng-answer__text">
            <AnswerText text={block.parts.answer} keepLines={block.type === 'letter'} />
          </div>
        </div>
      )}
      {block.parts.note && (
        <div className="eng-note">
          <p className="csec-label">Why it works</p>
          <Prose source={block.parts.note} />
        </div>
      )}
    </article>
  );
}

/** Practice exercise: the question, what it tests, then a hint and a model answer behind toggles. */
function PracticeBlock({ block }) {
  const [hint, setHint] = useState(false);
  const [answer, setAnswer] = useState(false);
  const answerRef = useRef(null);
  const id = `p-${slugify(`${block.kicker} ${block.title}`).slice(0, 60)}`;
  return (
    <article className="eng-practice" id={id} aria-labelledby={`${id}-title`}>
      <header className="eng-model__head">
        {block.kicker && <p className="eng-model__kicker">{block.kicker}</p>}
        <h3 id={`${id}-title`}>{strip(block.title)}</h3>
      </header>
      {block.lead && <Prose source={block.lead} />}
      {block.parts.skill && (
        <p className="eng-skill">
          <span>Skill tested</span> <Markdown source={block.parts.skill} inline />
        </p>
      )}
      <div className="eng-practice__actions">
        {block.parts.hint && (
          <button type="button" className="csec-question__toggle" aria-expanded={hint} aria-controls={`${id}-hint`} onClick={() => setHint((v) => !v)}>
            {hint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {block.parts.answer && (
          <button type="button" className="csec-question__toggle" aria-expanded={answer} aria-controls={`${id}-answer`} onClick={() => setAnswer((v) => !v)}>
            {answer ? 'Hide model answer' : 'Show model answer'}
          </button>
        )}
      </div>
      {block.parts.hint && (
        <div id={`${id}-hint`} className="eng-hint" hidden={!hint}>
          <p className="csec-label">Hint</p>
          <Prose source={block.parts.hint} />
        </div>
      )}
      {block.parts.answer && (
        <div id={`${id}-answer`} className="csec-solution" hidden={!answer}>
          <CopyButton getText={() => readText(answerRef.current)} />
          <p className="csec-label">Model answer</p>
          <div ref={answerRef}>
            <Prose source={block.parts.answer} />
          </div>
        </div>
      )}
    </article>
  );
}

/** Full solutions under a question paper, hidden until asked for. */
function SolutionsBlock({ block }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="eng-solutions" aria-labelledby="eng-solutions-title">
      <h2 id="eng-solutions-title" className="eng-solutions__title">
        Full solutions
      </h2>
      {block.title && <p className="eng-solutions__lead">{block.title}</p>}
      <button type="button" className="eng-solutions__btn" aria-expanded={open} aria-controls="eng-solutions-body" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide Full Solutions' : 'Show Full Solutions'}
      </button>
      <div id="eng-solutions-body" hidden={!open}>
        {open && <Prose source={block.lead} />}
      </div>
    </section>
  );
}

/** An original sample (application or email photo) shown in the lesson. */
function DocFigure({ block }) {
  const s = SLIDES[block.arg];
  const src = publicUrl(`documents/english-2/${s.file}`);
  return (
    <figure className="csec-figure csec-figure--image eng-doc">
      <a href={src} target="_blank" rel="noopener">
        <img src={src} alt={block.caption || s.title} width={s.width} height={s.height} loading="lazy" decoding="async" />
      </a>
      <figcaption>{block.caption || s.title}</figcaption>
    </figure>
  );
}

const BLOCKS = {
  model: ModelBlock,
  letter: ModelBlock,
  practice: PracticeBlock,
  solutions: SolutionsBlock,
  doc: DocFigure,
  vocab: ({ block }) => <VocabLevel level={block.arg} />,
};

/** Original slides for this page, at the bottom. */
function SlideLinks({ keys }) {
  if (!keys.length) return null;
  return (
    <section className="eng-slides" id="sec-lecture-slides" aria-labelledby="eng-slides-title">
      <h2 id="eng-slides-title">{keys.every((k) => k.startsWith('paper-')) ? 'Original question paper' : keys.every((k) => k.startsWith('sample-')) ? 'Original sample' : 'Original lecture slides'}</h2>
      <ul className="eng-slides__list">
        {keys.map((k) => {
          const s = SLIDES[k];
          const url = publicUrl(`documents/english-2/${s.file}`);
          const isPdf = s.file.endsWith('.pdf');
          return (
            <li key={k} className="eng-slides__item">
              <span className="eng-slides__name">{s.title}</span>
              <span className="eng-slides__links">
                <a href={url} target="_blank" rel="noopener" type={isPdf ? 'application/pdf' : 'image/jpeg'}>
                  {isPdf ? 'Open PDF' : 'Open image'}
                </a>
                <a href={url} download={s.file}>
                  Download
                </a>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** One course page: header, "On this page", the body with its blocks, and the slide downloads. */
export default function PageView({ entry, source }) {
  const { title, body } = useMemo(() => splitTitle(source), [source]);
  const segments = useMemo(() => parseBlocks(body), [body]);
  const bodyRef = useRef(null);
  const sections = useMemo(() => {
    const out = proseLines(body)
      .filter((l) => /^## /.test(l))
      .map((l) => ({ id: `sec-${slugify(l.slice(3))}`, text: strip(l.slice(3).trim()) }));
    if (segments.some((s) => s.type === 'solutions')) out.push({ id: 'eng-solutions-title', text: 'Full solutions' });
    if (entry.slides.length) out.push({ id: 'sec-lecture-slides', text: entry.group === 'qb' ? 'Original paper' : entry.slides.every((k) => k.startsWith('sample-')) ? 'Original sample' : 'Lecture slides' });
    return out;
  }, [body, segments, entry]);

  // Page sections get ids so "On this page" can jump to them.
  useEffect(() => {
    const hs = bodyRef.current?.querySelectorAll(':scope > .csec-prose > h2') ?? [];
    hs.forEach((h, i) => {
      if (sections[i]) h.id = sections[i].id;
    });
  }, [sections]);

  return (
    <article className={`csec-article eng-page eng-page--${entry.group}`}>
      <header className="csec-article__head">
        <p className="csec-article__kicker">{entry.kicker}</p>
        <h1>{title || entry.name}</h1>
      </header>

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

      <div ref={bodyRef}>
        {segments.map((s, i) => {
          if (s.type === 'md') return <Prose key={i} source={s.text} />;
          const Block = BLOCKS[s.type];
          return <Block key={i} block={s} />;
        })}
      </div>

      <SlideLinks keys={entry.slides} />
    </article>
  );
}
