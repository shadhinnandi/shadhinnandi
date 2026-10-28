import GrowthChart from './GrowthChart.jsx';
import StepViz from './StepViz.jsx';

// Interactive visualisations a lesson can embed with a line "::viz <name> <args>".
// Each one draws states produced by running the real algorithm or function.
const step = (kind) =>
  function Step({ args }) {
    return <StepViz kind={kind} args={args} />;
  };

export const VIZ = {
  growth: GrowthChart,
  sort: step('sort'),
  heap: step('heap'),
  traversal: step('traversal'),
  graph: step('graph'),
  stack: step('stack'),
  linkedlist: step('linkedlist'),
};
