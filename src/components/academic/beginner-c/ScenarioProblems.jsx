import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LevelTag, Reveal, SampleIO, hashTarget } from '../beginner-java/ProblemParts.jsx';
import Markdown from './Markdown.jsx';

// Scenario-based problems at the end of a chapter. Each problem is a
// collapsible card: scenario, statement and sample run first; the solution
// and the test cases stay behind their own disclosures so learners attempt
// the problem before reading the answer. Same layout as the Java course.

export const SCENARIO_SECTION_ID = 'scenario-problems';

const LEVEL_ORDER = ['Moderate', 'Intermediate', 'Challenging'];

const CCode = ({ source }) => <Markdown source={`\`\`\`c\n${source}\n\`\`\``} className="oop-code" />;

function ScenarioCard({ problem: p, initiallyOpen }) {
  const [seen, setSeen] = useState(initiallyOpen);
  return (
    <details
      className="oop-scenario"
      id={p.id}
      open={initiallyOpen || undefined}
      onToggle={(e) => e.currentTarget.open && setSeen(true)}
    >
      <summary className="oop-scenario__summary">
        <span className="oop-problem__num">{p.number}</span>
        <span className="oop-scenario__title">{p.title}</span>
        <LevelTag level={p.level} />
        <span className="oop-scenario__chevron" aria-hidden="true" />
      </summary>
      {seen && (
        <div className="oop-scenario__body">
          <h4 className="oop-label">Scenario</h4>
          <Markdown source={p.scenario} className="oop-prose" />
          <h4 className="oop-label">Problem statement</h4>
          <Markdown source={p.statement} className="oop-prose" />
          <SampleIO input={p.sampleInput} output={p.sampleOutput} />

          <Reveal show="Show solution" hide="Hide solution" copy>
            <CCode source={p.solution} />
            <h5 className="oop-label">Explanation</h5>
            <Markdown source={p.explanation} className="oop-prose" />
            <h5 className="oop-label">Concepts practiced</h5>
            <ul className="oop-chips">
              {p.concepts.map((c) => (
                <li key={c}>
                  <Markdown source={c} inline />
                </li>
              ))}
            </ul>
          </Reveal>

          {p.tests.length > 0 && (
            <Reveal show={`Show test cases (${p.tests.length})`} hide="Hide test cases">
              {p.tests.map((t, i) => (
                <section key={`${i}-${t.title}`} className="oop-test">
                  <h5 className="oop-test__title">
                    <span className="oop-test__num">Test {i + 1}</span> {t.title}
                  </h5>
                  {t.note && <Markdown source={t.note} className="oop-prose oop-test__note" />}
                  <SampleIO input={t.input} output={t.output} inputTitle="Input" outputTitle="Expected output" />
                </section>
              ))}
            </Reveal>
          )}
        </div>
      )}
    </details>
  );
}

export default function ScenarioProblems({ set }) {
  const { hash } = useLocation();
  const target = hashTarget(hash);
  const counts = LEVEL_ORDER.map((l) => [l, set.problems.filter((p) => p.level === l).length])
    .filter(([, n]) => n > 0)
    .map(([l, n]) => `${n} ${l.toLowerCase()}`);

  return (
    <section className="oop-problems oop-problems--scenarios" id={SCENARIO_SECTION_ID} aria-labelledby={`${SCENARIO_SECTION_ID}-title`}>
      <h2 id={`${SCENARIO_SECTION_ID}-title`}>Scenario-Based Problems</h2>
      <p className="oop-problems__meta">
        {set.problems.length} problems · {counts.join(' · ')}
      </p>
      {set.intro && <Markdown source={set.intro} className="oop-prose" />}
      <p className="oop-problems__how">
        Open a problem, plan your algorithm and write the program. Run it with the sample input and compare your output
        line by line with the sample output. Then check your answer against the solution and the extra test cases.
      </p>
      <ol className="oop-scenario-list">
        {set.problems.map((p) => (
          <li key={p.id}>
            <ScenarioCard problem={p} initiallyOpen={target === p.id} />
          </li>
        ))}
      </ol>
    </section>
  );
}
