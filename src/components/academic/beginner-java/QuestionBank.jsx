import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CHAPTERS, SCENARIO_CHAPTERS } from './content.js';
import { LEVELS } from './problems.js';
import { JavaCode, LevelTag, Markdown, Reveal, SampleIO } from './ProblemParts.jsx';
import { SCENARIO_SECTION_ID } from './ScenarioProblems.jsx';

function Filter({ label, options, value, onChange }) {
  return (
    <div className="oop-filter" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
          <span className="oop-filter__count">{o.count}</span>
        </button>
      ))}
    </div>
  );
}

function Question({ problem: p }) {
  return (
    <article className="oop-problem" id={p.id} aria-labelledby={`${p.id}-title`}>
      <header className="oop-problem__head">
        <span className="oop-problem__num oop-problem__num--wide">Q{p.qn}</span>
        <h4 id={`${p.id}-title`} className="oop-problem__title">
          {p.title}
        </h4>
        <LevelTag level={p.level} />
      </header>
      <Markdown source={p.statement} className="oop-prose oop-problem__body" />
      <SampleIO input={p.sampleInput} output={p.sampleOutput} />
      <div className="oop-problem__reveals">
        {p.hint && (
          <Reveal show="Show hint" hide="Hide hint" className="oop-reveal--hint">
            <Markdown source={p.hint} className="oop-prose" />
          </Reveal>
        )}
        <Reveal show="Show solution" hide="Hide solution">
          <JavaCode source={p.solution} />
          <h5 className="oop-label">Explanation</h5>
          <Markdown source={p.explanation} className="oop-prose" />
        </Reveal>
      </div>
    </article>
  );
}

/**
 * Question bank: exam- and interview-style problems by topic and level. Each
 * has a hint and a worked solution behind disclosures.
 */
export default function QuestionBank({ bank, basePath }) {
  const [topic, setTopic] = useState('all');
  const [level, setLevel] = useState('all');

  const inTopic = topic === 'all' ? bank.problems : bank.problems.filter((p) => p.topic === topic);
  const topicOptions = [
    { value: 'all', label: 'All topics', count: bank.problems.length },
    ...bank.topics.map((t) => ({ value: t.id, label: t.name, count: t.problems.length })),
  ];
  const levelOptions = [
    { value: 'all', label: 'All levels', count: inTopic.length },
    ...LEVELS.map((l) => ({ value: l, label: l, count: inTopic.filter((p) => p.level === l).length })),
  ];

  const shown = useMemo(
    () =>
      bank.topics
        .filter((t) => topic === 'all' || t.id === topic)
        .map((t) => ({ ...t, problems: t.problems.filter((p) => level === 'all' || p.level === level) }))
        .filter((t) => t.problems.length > 0),
    [bank, topic, level],
  );
  const shownCount = shown.reduce((n, t) => n + t.problems.length, 0);
  const solved = bank.problems.filter((p) => p.solution).length;

  return (
    <article className="oop-article oop-qb">
      <header className="oop-article__head">
        <p className="oop-article__kicker">Practice</p>
        <h1>Question Bank</h1>
      </header>
      <div className="oop-prose">
        <p>
          Exam- and interview-style problems, one step above the chapter exercises. Each topic draws on its chapter and
          everything before it. Try every problem on your own first; open the hint only when you are stuck, and the
          solution only after you have a working attempt.
        </p>
      </div>
      <p className="oop-problems__meta">
        {bank.problems.length} questions · {bank.topics.length} topics · {solved} worked solutions
      </p>

      {SCENARIO_CHAPTERS.length > 0 && (
        <aside className="oop-qb__scenarios" aria-labelledby="oop-qb-scenarios-title">
          <h2 id="oop-qb-scenarios-title">Scenario-based problems by chapter</h2>
          <p>
            Every chapter also ends with lab-exam style scenario problems, each with sample input and output, a
            complete solution, an explanation and extra test cases.
          </p>
          <ul className="oop-qb__chapter-links">
            {CHAPTERS.filter((c) => SCENARIO_CHAPTERS.includes(c.id)).map((c) => (
              <li key={c.id}>
                <Link to={{ pathname: `${basePath}/chapter/${c.id}`, hash: `#${SCENARIO_SECTION_ID}` }}>
                  <span className="oop-reader__nav-idx">{c.id}</span>
                  <span>{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="oop-qb__filters">
        <Filter label="Filter by topic" options={topicOptions} value={topic} onChange={setTopic} />
        <Filter label="Filter by level" options={levelOptions} value={level} onChange={setLevel} />
      </div>
      <p className="visually-hidden" aria-live="polite">
        Showing {shownCount} {shownCount === 1 ? 'question' : 'questions'}.
      </p>

      {shown.length === 0 && <p className="oop-problems__meta">No questions match this filter.</p>}

      {shown.map((t) => (
        <section key={t.id} className="oop-qb__topic" aria-labelledby={`qb-${t.id}-heading`}>
          <h2 id={`qb-${t.id}-heading`}>{t.name}</h2>
          {t.intro && <Markdown source={t.intro} className="oop-prose" />}
          <div className="oop-problems__list">
            {t.problems.map((p) => (
              <Question key={p.id} problem={p} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
