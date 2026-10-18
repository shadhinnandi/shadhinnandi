import { Link } from 'react-router-dom';
import { Markdown, Reveal, SampleIO } from '../beginner-java/ProblemParts.jsx';
import { moduleById } from './content.js';
import { resolveLink } from './links.js';
import { useProgress } from './progress.js';
import { CppCode, DifficultyTag, HintSteps, StatusButtons } from './ProblemParts.jsx';

const io = (stream) => ({ stream, files: [] });

function Section({ title, source, mdProps }) {
  if (!source) return null;
  return (
    <section className="dsa-psec">
      <h2 className="oop-label">{title}</h2>
      <Markdown source={source} className="oop-prose" {...mdProps} />
    </section>
  );
}

/** One problem: statement, formats, sample, targets, hints, then solution and tests behind disclosures. */
export default function ProblemView({ problem: p, basePath }) {
  const progress = useProgress();
  const status = progress.problems[p.id];
  const mod = p.topic === 'completion' ? null : moduleById(p.topic);
  const mdProps = { resolveLink, basePath };

  return (
    <article className="oop-article dsa-article dsa-problem" aria-labelledby="dsa-problem-title">
      <header className="oop-article__head dsa-problem__head">
        <p className="oop-article__kicker">
          {p.id} · {p.topic === 'completion' ? 'Completion challenge' : `Module ${p.topic}`}
        </p>
        <h1 id="dsa-problem-title">{p.title}</h1>
        <div className="dsa-problem__meta">
          <DifficultyTag difficulty={p.difficulty} />
          {mod ? (
            <Link to={`${basePath}/topic/${mod.slug}`} className="dsa-chip dsa-chip--link">
              {mod.short}
            </Link>
          ) : (
            p.modules.map((id) => {
              const m = moduleById(id);
              return m ? (
                <Link key={id} to={`${basePath}/topic/${m.slug}`} className="dsa-chip dsa-chip--link">
                  {m.short}
                </Link>
              ) : null;
            })
          )}
          <span className="dsa-chip">{p.subtopic}</span>
          <span className="dsa-chip dsa-chip--quiet">{p.source}</span>
        </div>
        <StatusButtons id={p.id} status={status} />
      </header>

      <Section title="Problem" source={p.statement} mdProps={mdProps} />
      <Section title="Input" source={p.input} mdProps={mdProps} />
      <Section title="Output" source={p.output} mdProps={mdProps} />
      <Section title="Constraints" source={p.constraints} mdProps={mdProps} />
      <SampleIO input={io(p.sampleInput)} output={io(p.sampleOutput)} />
      <Section title="Sample explanation" source={p.sampleExplanation} mdProps={mdProps} />
      <Section title="Target complexity" source={p.target} mdProps={mdProps} />

      <section className="dsa-psec">
        <h2 className="oop-label">Hints</h2>
        <HintSteps hints={p.hints} mdProps={mdProps} />
      </section>

      <div className="oop-problem__reveals">
        {p.naive && (
          <Reveal show="Why a naive solution fails" hide="Hide the naive-solution note" className="oop-reveal--hint">
            <Markdown source={p.naive} className="oop-prose" {...mdProps} />
          </Reveal>
        )}
        <Reveal show="Show solution" hide="Hide solution" copy>
          <h3 className="oop-label">Approach</h3>
          <Markdown source={p.approach} className="oop-prose" {...mdProps} />
          <h3 className="oop-label">Reference solution (C++17)</h3>
          <CppCode source={p.solution} />
          <h3 className="oop-label">Explanation</h3>
          <Markdown source={p.explanation} className="oop-prose" {...mdProps} />
          <h3 className="oop-label">Edge cases</h3>
          <Markdown source={p.edgeCases} className="oop-prose" {...mdProps} />
        </Reveal>
        {p.tests.length > 0 && (
          <Reveal show={`Additional test cases (${p.tests.length})`} hide="Hide test cases">
            {p.tests.map((t) => (
              <div key={t.title} className="dsa-test">
                <h3 className="oop-label">{t.title}</h3>
                <SampleIO input={io(t.input)} output={io(t.output)} inputTitle="Input" outputTitle="Expected output" />
              </div>
            ))}
          </Reveal>
        )}
      </div>

      <p className="dsa-problem__tags">
        <span>Tags:</span> {p.tags.join(' · ')}
      </p>
      <p className="dsa-problem__back">
        {mod && <Link to={`${basePath}/topic/${mod.slug}#practice-problems`}>← Back to the {mod.short} lesson</Link>}
        <Link to={`${basePath}/${p.topic === 'completion' ? 'challenges' : `question-bank?topic=${p.topic}`}`}>
          {p.topic === 'completion' ? 'All completion challenges' : 'This topic in the question bank'}
        </Link>
      </p>
    </article>
  );
}
