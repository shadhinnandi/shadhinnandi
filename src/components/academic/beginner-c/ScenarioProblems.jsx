import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Markdown from './Markdown.jsx';

// Scenario-based problems at the end of a chapter. Each problem is a
// collapsible card: scenario, statement and sample input/output first; the
// solution and the test cases stay behind their own disclosures so learners
// attempt the problem before reading the answer.

const LEVEL_TAG = { Moderate: 'bc-tag--easy', Intermediate: 'bc-tag--med', Challenging: 'bc-tag--hard' };

export const SCENARIO_SECTION_ID = 'scenario-problems';

/** Longest line in an input/output pair; long lines get a stacked layout. */
const WIDE_LINE = 36;
function ioLayout(...ios) {
  let longest = 0;
  for (const io of ios) {
    const texts = [io.stream || '', ...io.files.map((f) => f.content)];
    for (const t of texts) for (const line of t.split('\n')) longest = Math.max(longest, line.length);
  }
  return longest > WIDE_LINE ? 'bc-sp-io bc-sp-io--stacked' : 'bc-sp-io';
}

/** Standard input/output (and any files) as labelled terminal-style blocks. */
function IOBox({ title, io, kind, fileSuffix = '' }) {
  const parts = [];
  if (io.stream != null) parts.push({ key: 'stream', label: null, text: io.stream });
  io.files.forEach((f) => parts.push({ key: f.name, label: `File ${f.name}${fileSuffix}`, text: f.content }));
  return (
    <div className={`bc-io bc-io--${kind}`}>
      <div className="bc-io__title">{title}</div>
      {parts.length === 0 && <p className="bc-io__empty">No input</p>}
      {parts.map((p) => (
        <div key={p.key} className="bc-io__part">
          {p.label && <div className="bc-io__file">{p.label}</div>}
          <pre className="bc-io__pre">
            <code>{p.text === '' ? ' ' : p.text}</code>
          </pre>
        </div>
      ))}
    </div>
  );
}

function ScenarioCard({ problem: p, initiallyOpen }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [seen, setSeen] = useState(initiallyOpen);

  const onToggle = (e) => {
    const isOpen = e.currentTarget.open;
    setOpen(isOpen);
    if (isOpen) setSeen(true);
  };

  return (
    <details className="bc-sp-card" id={p.id} open={open} onToggle={onToggle}>
      <summary className="bc-sp-card__summary">
        <span className="bc-qcard__num">{p.number}</span>
        <h3 className="bc-sp-card__title">{p.title}</h3>
        <span className={`bc-tag ${LEVEL_TAG[p.level] || ''}`}>{p.level}</span>
        <span className="bc-sp-card__chevron" aria-hidden="true">
          ▸
        </span>
      </summary>

      {seen && (
        <div className="bc-sp-card__body">
          <section className="bc-sp-block">
            <h4 className="bc-sp-label">Scenario</h4>
            <Markdown source={p.scenario} />
          </section>
          <section className="bc-sp-block">
            <h4 className="bc-sp-label">Problem statement</h4>
            <Markdown source={p.statement} />
          </section>

          <div className={ioLayout(p.sampleInput, p.sampleOutput)}>
            <IOBox title="Sample input" io={p.sampleInput} kind="input" />
            <IOBox title="Sample output" io={p.sampleOutput} kind="output" fileSuffix=" (after running)" />
          </div>

          <details className="bc-qcard__solution bc-sp-reveal">
            <summary>
              <span className="bc-qcard__show">Show solution</span>
              <span className="bc-qcard__hide">Hide solution</span>
            </summary>
            <div className="bc-sp-reveal__body">
              <Markdown source={`\`\`\`c\n${p.solution}\n\`\`\``} className="bc-sp-code" />
              <h4 className="bc-sp-label">Explanation</h4>
              <Markdown source={p.explanation} />
              <h4 className="bc-sp-label">Concepts practiced</h4>
              <ul className="bc-chips bc-sp-concepts">
                {p.concepts.map((c) => (
                  <li key={c}>
                    <Markdown source={c} inline />
                  </li>
                ))}
              </ul>
            </div>
          </details>

          {p.tests.length > 0 && (
            <details className="bc-qcard__solution bc-sp-reveal">
              <summary>
                <span className="bc-qcard__show">Show test cases ({p.tests.length})</span>
                <span className="bc-qcard__hide">Hide test cases</span>
              </summary>
              <div className="bc-sp-reveal__body">
                {p.tests.map((t, i) => (
                  <section key={t.title} className="bc-sp-test">
                    <h4 className="bc-sp-test__title">
                      <span className="bc-sp-test__num">Test {i + 1}</span> {t.title}
                    </h4>
                    {t.note && <Markdown source={t.note} className="bc-sp-test__note" />}
                    <div className={ioLayout(t.input, t.output)}>
                      <IOBox title="Input" io={t.input} kind="input" />
                      <IOBox title="Expected output" io={t.output} kind="output" fileSuffix=" (after running)" />
                    </div>
                  </section>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </details>
  );
}

export default function ScenarioProblems({ set }) {
  const { hash } = useLocation();
  const target = decodeURIComponent(hash.replace(/^#/, ''));
  const counts = set.problems.reduce((acc, p) => ({ ...acc, [p.level]: (acc[p.level] || 0) + 1 }), {});

  return (
    <section className="bc-sp" id={SCENARIO_SECTION_ID} aria-labelledby={`${SCENARIO_SECTION_ID}-title`}>
      <h2 id={`${SCENARIO_SECTION_ID}-title`}>Scenario-Based Problems</h2>
      <p className="bc-sp__meta">
        {set.problems.length} problems ·{' '}
        {['Moderate', 'Intermediate', 'Challenging']
          .filter((l) => counts[l])
          .map((l) => `${counts[l]} ${l.toLowerCase()}`)
          .join(' · ')}
      </p>
      {set.intro && <Markdown source={set.intro} className="bc-sp__intro" />}
      <p className="bc-sp__how">
        Open a problem, plan your algorithm and write the program. Run it with the sample input and compare your output
        line by line with the sample output. Then check your answer against the solution and the extra test cases.
      </p>
      <ol className="bc-sp__list">
        {set.problems.map((p) => (
          <li key={p.id}>
            <ScenarioCard problem={p} initiallyOpen={target === p.id} />
          </li>
        ))}
      </ol>
    </section>
  );
}
