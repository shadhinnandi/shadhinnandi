import { useState } from 'react';
import { LEVELS, VOCAB } from './vocab.js';

/** One ten-word group: words and meanings always visible, sentences behind "Show Sentences". */
function Group({ number, words }) {
  const [open, setOpen] = useState(false);
  const id = `vocab-group-${number}`;
  return (
    <section className="eng-vocab" aria-labelledby={`${id}-title`}>
      <header className="eng-vocab__head">
        <h3 id={`${id}-title`}>Group {number}</h3>
        <button type="button" className="csec-question__toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide Sentences' : 'Show Sentences'}
        </button>
      </header>
      <ol className="eng-vocab__list" id={id}>
        {words.map(([word, bn, sentence, note]) => (
          <li key={word} className="eng-vocab__item">
            <span className="eng-vocab__word">{word}</span>
            <span className="eng-vocab__bn" lang="bn">
              {bn}
            </span>
            {open && (
              <span className="eng-vocab__sentence">
                {sentence}
                {note && <span className="eng-vocab__note">{note}</span>}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** All five groups of one level (easy, medium or advanced). */
export default function VocabLevel({ level }) {
  const { first } = LEVELS.find((l) => l.id === level);
  const words = VOCAB[level];
  const groups = [];
  for (let i = 0; i < words.length; i += 10) groups.push(words.slice(i, i + 10));
  return (
    <div className="eng-vocab-level">
      {groups.map((g, i) => (
        <Group key={first + i} number={first + i} words={g} />
      ))}
    </div>
  );
}
