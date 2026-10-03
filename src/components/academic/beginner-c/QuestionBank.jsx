import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Markdown from './Markdown.jsx';
import { CHAPTERS, SCENARIO_CHAPTERS } from './content.js';
import { SCENARIO_SECTION_ID } from './ScenarioProblems.jsx';
import { LEVEL_NAMES } from './questionBank.js';

const LEVEL_TAG = { Easy: 'bc-tag--easy', Medium: 'bc-tag--med', Hard: 'bc-tag--hard' };

function Filter({ label, options, value, onChange }) {
  return (
    <div className="bc-qb__filter" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
          <span className="bc-qb__count">{o.count}</span>
        </button>
      ))}
    </div>
  );
}

function Problem({ problem }) {
  return (
    <article className="bc-qcard" id={problem.id} aria-labelledby={`${problem.id}-title`}>
      <header className="bc-qcard__head">
        <span className="bc-qcard__num">{problem.number}</span>
        <h4 id={`${problem.id}-title`} className="bc-qcard__title">
          {problem.title}
        </h4>
        <span className={`bc-tag ${LEVEL_TAG[problem.level]}`}>{problem.level}</span>
      </header>

      {problem.statement ? (
        <Markdown source={problem.statement} className="bc-qcard__body" />
      ) : (
        <p className="bc-qcard__missing">The problem statement for this question is not available yet.</p>
      )}

      {problem.solution ? (
        <details className="bc-qcard__solution">
          <summary>
            <span className="bc-qcard__show">Show solution</span>
            <span className="bc-qcard__hide">Hide solution</span>
          </summary>
          <Markdown source={problem.solution} className="bc-qcard__answer" />
        </details>
      ) : (
        problem.statement && <p className="bc-qcard__missing">A worked solution for this problem is not available yet.</p>
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
  const inTopic = topic === 'all' ? bank.problems : bank.problems.filter((p) => p.topic === bank.topics.find((t) => t.id === topic)?.name);
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
    <article className="bc-reader__article bc-qb">
      <h1>{bank.title}</h1>
      <p>
        Problem statements and hints, grouped by chapter and difficulty. Try your best to solve each problem before
        looking at its solution.
      </p>
      <p className="bc-qb__summary">
        {bank.problems.length} problems · {bank.topics.length} topics · {solved} worked solutions
      </p>

      {SCENARIO_CHAPTERS.length > 0 && (
        <aside className="bc-qb__scenarios" aria-labelledby="bc-qb-scenarios-title">
          <h2 id="bc-qb-scenarios-title">Scenario-based problems by chapter</h2>
          <p>
            Every chapter also ends with exam-style scenario problems, each with sample input and output, a complete
            solution, an explanation and extra test cases.
          </p>
          <ul className="bc-qb__chapter-links">
            {CHAPTERS.filter((c) => SCENARIO_CHAPTERS.includes(c.id)).map((c) => (
              <li key={c.id}>
                <Link to={{ pathname: `${basePath}/chapter/${c.id}`, hash: `#${SCENARIO_SECTION_ID}` }}>
                  <span className="bc-reader__nav-idx">{c.id}</span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className="bc-qb__filters">
        <Filter label="Filter by topic" options={topicOptions} value={topic} onChange={setTopic} />
        <Filter label="Filter by difficulty" options={levelOptions} value={level} onChange={setLevel} />
      </div>
      <p className="visually-hidden" aria-live="polite">
        Showing {shownCount} {shownCount === 1 ? 'problem' : 'problems'}.
      </p>

      {shown.length === 0 && <p className="bc-qcard__missing">No problems match this filter.</p>}

      {shown.map((t) => (
        <section key={t.id} className="bc-qb__topic" aria-labelledby={`${t.id}-heading`}>
          <h2 id={`${t.id}-heading`}>{t.name}</h2>
          {t.levels.map((l) => (
            <section key={l.level} className="bc-qb__level" aria-label={`${t.label}: ${l.level}`}>
              <h3>
                <span className={`bc-tag ${LEVEL_TAG[l.level]}`}>{l.level}</span>
              </h3>
              <div className="bc-qb__list">
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
