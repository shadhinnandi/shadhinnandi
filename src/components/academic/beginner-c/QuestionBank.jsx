import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LevelTag, Reveal } from '../beginner-java/ProblemParts.jsx';
import Markdown from './Markdown.jsx';
import { CHAPTERS, SCENARIO_CHAPTERS } from './content.js';
import { SCENARIO_SECTION_ID } from './ScenarioProblems.jsx';
import { LEVEL_NAMES } from './questionBank.js';

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

function Problem({ problem: p }) {
  return (
    <article className="oop-problem" id={p.id} aria-labelledby={`${p.id}-title`}>
      <header className="oop-problem__head">
        <span className="oop-problem__num">{p.number}</span>
        <h4 id={`${p.id}-title`} className="oop-problem__title">
          {p.title}
        </h4>
        <LevelTag level={p.level} />
      </header>

      {p.statement ? (
        <Markdown source={p.statement} className="oop-prose oop-problem__body" />
      ) : (
        <p className="oop-problems__meta">The problem statement for this question is not available yet.</p>
      )}

      {p.solution ? (
        <div className="oop-problem__reveals">
          <Reveal show="Show solution" hide="Hide solution" copy>
            <Markdown source={p.solution} className="oop-prose" />
          </Reveal>
        </div>
      ) : (
        p.statement && <p className="oop-problems__meta">A worked solution for this problem is not available yet.</p>
      )}
    </article>
  );
}

/**
 * Practice question bank: every problem from the course's question and
 * solution files, grouped by chapter and difficulty, with each solution
 * behind a disclosure so learners attempt the problem first.
 */
export default function QuestionBank({ bank, basePath }) {
  const [topic, setTopic] = useState('all');
  const [level, setLevel] = useState('all');

  const topicOptions = [
    { value: 'all', label: 'All topics', count: bank.problems.length },
    ...bank.topics.map((t) => ({
      value: t.id,
      label: t.label,
      count: t.levels.reduce((n, l) => n + l.problems.length, 0),
    })),
  ];
  const inTopic =
    topic === 'all' ? bank.problems : bank.problems.filter((p) => p.topic === bank.topics.find((t) => t.id === topic)?.name);
  const levelOptions = [
    { value: 'all', label: 'All levels', count: inTopic.length },
    ...LEVEL_NAMES.map((l) => ({ value: l, label: l, count: inTopic.filter((p) => p.level === l).length })),
  ];

  const shown = useMemo(
    () =>
      bank.topics
        .filter((t) => topic === 'all' || t.id === topic)
        .map((t) => ({ ...t, levels: t.levels.filter((l) => level === 'all' || l.level === level) }))
        .filter((t) => t.levels.length > 0),
    [bank, topic, level],
  );
  const shownCount = shown.reduce((n, t) => n + t.levels.reduce((m, l) => m + l.problems.length, 0), 0);
  const solved = bank.problems.filter((p) => p.solution).length;

  return (
    <article className="oop-article oop-qb">
      <header className="oop-article__head">
        <p className="oop-article__kicker">Practice</p>
        <h1>Question Bank</h1>
      </header>
      <div className="oop-prose">
        <p>
          Problem statements and hints, grouped by chapter and difficulty. Try your best to solve each problem before
          looking at its solution.
        </p>
      </div>
      <p className="oop-problems__meta">
        {bank.problems.length} problems · {bank.topics.length} topics · {solved} worked solutions
      </p>

      {SCENARIO_CHAPTERS.length > 0 && (
        <aside className="oop-qb__scenarios" aria-labelledby="c-qb-scenarios-title">
          <h2 id="c-qb-scenarios-title">Scenario-based problems by chapter</h2>
          <p>
            Every chapter also ends with exam-style scenario problems, each with sample input and output, a complete
            solution, an explanation and extra test cases.
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
        <Filter label="Filter by difficulty" options={levelOptions} value={level} onChange={setLevel} />
      </div>
      <p className="visually-hidden" aria-live="polite">
        Showing {shownCount} {shownCount === 1 ? 'problem' : 'problems'}.
      </p>

      {shown.length === 0 && <p className="oop-problems__meta">No problems match this filter.</p>}

      {shown.map((t) => (
        <section key={t.id} className="oop-qb__topic" aria-labelledby={`${t.id}-heading`}>
          <h2 id={`${t.id}-heading`}>{t.name}</h2>
          {t.levels.map((l) => (
            <section key={l.level} className="c-qb__level" aria-label={`${t.label}: ${l.level}`}>
              <h3 className="c-qb__level-head">
                <LevelTag level={l.level} />
              </h3>
              <div className="oop-problems__list">
                {l.problems.map((p) => (
                  <Problem key={p.id} problem={p} />
                ))}
              </div>
            </section>
          ))}
        </section>
      ))}
    </article>
  );
}
