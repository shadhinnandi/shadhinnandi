import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DIFFICULTIES, MODULES, PROBLEM_INDEX, moduleById } from './content.js';
import { useProgress } from './progress.js';
import { DifficultyTag, StatusMark } from './ProblemParts.jsx';

const DIFF_RANK = { Easy: 0, Medium: 1, Hard: 2 };
const TOPIC_RANK = Object.fromEntries([...MODULES.map((m, i) => [m.id, i]), ['completion', MODULES.length]]);

const SORTS = {
  course: { label: 'Course order', fn: (a, b) => a.rank - b.rank },
  id: { label: 'Problem ID', fn: (a, b) => a.id.localeCompare(b.id) },
  difficulty: { label: 'Difficulty', fn: (a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] || a.rank - b.rank },
  topic: { label: 'Topic', fn: (a, b) => TOPIC_RANK[a.topic] - TOPIC_RANK[b.topic] || a.rank - b.rank },
  title: { label: 'Title (A–Z)', fn: (a, b) => a.title.localeCompare(b.title) },
};

const RANKED = PROBLEM_INDEX.map((p, rank) => ({ ...p, rank, haystack: `${p.id} ${p.title} ${p.subtopic} ${p.tags.join(' ')}`.toLowerCase() }));

function Segmented({ label, options, value, onChange }) {
  return (
    <div className="oop-filter" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count != null && <span className="oop-filter__count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

function Meter({ value, total, label }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="dsa-meter">
      <div className="dsa-meter__head">
        <span>{label}</span>
        <span>
          {value} / {total}
        </span>
      </div>
      <div className="dsa-meter__bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * Every problem of the course from problem-index.json, with topic, difficulty
 * and status filters, search by ID, title, subtopic or tag, and sorting.
 * `completion` shows only the completion-level challenges.
 */
export default function QuestionBank({ basePath, completion = false }) {
  const progress = useProgress();
  const [params, setParams] = useSearchParams();
  const initialTopic = params.get('topic');
  const [topic, setTopic] = useState(MODULES.some((m) => m.id === initialTopic) ? initialTopic : 'all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('course');

  const pool = useMemo(() => RANKED.filter((p) => (completion ? p.topic === 'completion' : p.topic !== 'completion')), [completion]);
  const statusOf = (p) => progress.problems[p.id] || 'none';

  const changeTopic = (t) => {
    setTopic(t);
    const next = new URLSearchParams(params);
    if (t === 'all') next.delete('topic');
    else next.set('topic', t);
    setParams(next, { replace: true });
  };

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = pool
    .filter((p) => topic === 'all' || p.topic === topic)
    .filter((p) => difficulty === 'all' || p.difficulty === difficulty)
    .filter((p) => status === 'all' || statusOf(p) === status)
    .filter((p) => words.every((w) => p.haystack.includes(w)))
    .sort(SORTS[sort].fn);

  const solved = pool.filter((p) => statusOf(p) === 'solved');
  const topics = completion ? [] : MODULES.filter((m) => pool.some((p) => p.topic === m.id));
  const anyFilter = topic !== 'all' || difficulty !== 'all' || status !== 'all' || words.length > 0;

  return (
    <article className="oop-article dsa-article dsa-qb">
      <header className="oop-article__head">
        <p className="oop-article__kicker">Practice</p>
        <h1>{completion ? 'Completion Challenges' : 'Question Bank'}</h1>
      </header>
      <div className="oop-prose">
        {completion ? (
          <p>
            Original, scenario-based problems that combine several modules. Each one needs you to choose the right data structures and
            algorithms under realistic limits, and explains why a naive solution fails. Attempt them after finishing the course, or as a
            final test of a group of modules.
          </p>
        ) : (
          <p>
            Every practice problem from the topic pages in one place. Each problem has one record, shared by its lesson and this bank. Filter
            by topic, difficulty or status, search by ID, title, subtopic or tag, and track what you have solved. Progress is saved in this
            browser only.
          </p>
        )}
      </div>

      <div className="dsa-qb__summary">
        <Meter value={solved.length} total={pool.length} label={completion ? 'Challenges solved' : 'Problems solved'} />
        <div className="dsa-qb__by-diff">
          {DIFFICULTIES.map((d) => {
            const all = pool.filter((p) => p.difficulty === d);
            if (!all.length) return null;
            return <Meter key={d} value={all.filter((p) => statusOf(p) === 'solved').length} total={all.length} label={d} />;
          })}
        </div>
        {!completion && (
          <p className="dsa-qb__cc">
            Ready for more? <Link to={`${basePath}/challenges`}>Try the completion challenges</Link>.
          </p>
        )}
      </div>

      <div className="dsa-qb__controls">
        <label className="dsa-field dsa-field--search">
          <span>Search</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ID, title, subtopic or tag" />
        </label>
        {!completion && (
          <label className="dsa-field">
            <span>Topic</span>
            <select value={topic} onChange={(e) => changeTopic(e.target.value)}>
              <option value="all">All topics ({pool.length})</option>
              {topics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} · {m.short} ({pool.filter((p) => p.topic === m.id).length})
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="dsa-field">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([k, s]) => (
              <option key={k} value={k}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="oop-qb__filters">
        <Segmented
          label="Filter by difficulty"
          value={difficulty}
          onChange={setDifficulty}
          options={[{ value: 'all', label: 'All levels' }, ...DIFFICULTIES.map((d) => ({ value: d, label: d, count: pool.filter((p) => p.difficulty === d).length }))]}
        />
        <Segmented
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'Any status' },
            { value: 'none', label: 'Not solved' },
            { value: 'review', label: 'For review' },
            { value: 'solved', label: 'Solved' },
          ]}
        />
      </div>

      <p className="oop-problems__meta" aria-live="polite">
        Showing {shown.length} of {pool.length} {completion ? 'challenges' : 'problems'}
        {anyFilter && (
          <>
            {' · '}
            <button
              type="button"
              className="dsa-linkbtn"
              onClick={() => {
                changeTopic('all');
                setDifficulty('all');
                setStatus('all');
                setQuery('');
              }}
            >
              Clear filters
            </button>
          </>
        )}
      </p>

      {pool.length === 0 && <p className="dsa-empty">No problems have been added yet.</p>}
      {pool.length > 0 && shown.length === 0 && <p className="dsa-empty">No problems match these filters. Try a shorter search or clear the filters.</p>}

      <ol className="dsa-plist dsa-plist--bank">
        {shown.map((p) => {
          const mod = moduleById(p.topic);
          return (
            <li key={p.id}>
              <Link to={`${basePath}/problem/${p.id}`} className="dsa-plist__item">
                <StatusMark status={progress.problems[p.id]} />
                <span className="dsa-plist__id">{p.id}</span>
                <span className="dsa-plist__title">{p.title}</span>
                <span className="dsa-plist__sub">{mod ? `${mod.short} · ${p.subtopic}` : p.subtopic}</span>
                <DifficultyTag difficulty={p.difficulty} />
              </Link>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
