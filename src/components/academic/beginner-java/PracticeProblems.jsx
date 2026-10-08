import { groupByLevel } from './problems.js';
import { JavaCode, LevelTag, Markdown, Reveal, SampleIO, levelHeading } from './ProblemParts.jsx';

// Practice problems at the end of a chapter, grouped Basic → Intermediate →
// Advanced. The statement and sample run are shown; the solution stays
// behind a disclosure so learners attempt the problem first.

export const PRACTICE_SECTION_ID = 'practice-problems';

function PracticeCard({ problem: p }) {
  return (
    <article className="oop-problem" id={p.id} aria-labelledby={`${p.id}-title`}>
      <header className="oop-problem__head">
        <span className="oop-problem__num">{p.number}</span>
        <h4 id={`${p.id}-title`} className="oop-problem__title">
          {p.title}
        </h4>
        <LevelTag level={p.level} />
      </header>
      <Markdown source={p.statement} className="oop-prose oop-problem__body" />
      <SampleIO input={p.sampleInput} output={p.sampleOutput} />
      <Reveal show="Show solution" hide="Hide solution">
        <JavaCode source={p.solution} />
        <h5 className="oop-label">Explanation</h5>
        <Markdown source={p.explanation} className="oop-prose" />
      </Reveal>
    </article>
  );
}

export default function PracticeProblems({ set }) {
  const groups = groupByLevel(set.problems);
  return (
    <section className="oop-problems" id={PRACTICE_SECTION_ID} aria-labelledby={`${PRACTICE_SECTION_ID}-title`}>
      <h2 id={`${PRACTICE_SECTION_ID}-title`}>4. Practice Problems</h2>
      <p className="oop-problems__meta">
        {set.problems.length} problems · {groups.map((g) => `${g.problems.length} ${g.level.toLowerCase()}`).join(' · ')}
      </p>
      {set.intro && <Markdown source={set.intro} className="oop-prose" />}
      {groups.map((g) => (
        <section key={g.level} className="oop-problems__level" aria-label={`${g.level} problems`}>
          <h3>{levelHeading(g.level)}</h3>
          <div className="oop-problems__list">
            {g.problems.map((p) => (
              <PracticeCard key={p.id} problem={p} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
