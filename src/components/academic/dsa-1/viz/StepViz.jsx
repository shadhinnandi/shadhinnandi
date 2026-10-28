import { useEffect, useMemo, useState } from 'react';

// Step-through visualisations. Each generator runs the real algorithm on a
// small fixed input and records a snapshot after every meaningful step; the
// player only displays those snapshots, so what you see is what the code does.

/* ---------- generators ---------- */

function heapSortSteps(input) {
  const a = [...input];
  const steps = [{ a: [...a], hl: [], done: 0, caption: `Start: [${a.join(', ')}]` }];
  const n = a.length;
  const sift = (i, size, phase) => {
    for (;;) {
      let b = i;
      const l = 2 * i + 1;
      const r = l + 1;
      if (l < size && a[l] > a[b]) b = l;
      if (r < size && a[r] > a[b]) b = r;
      if (b === i) return;
      [a[i], a[b]] = [a[b], a[i]];
      steps.push({ a: [...a], hl: [i, b], done: n - size, caption: `${phase}: swap ${a[b]} down below ${a[i]}` });
      i = b;
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) sift(i, n, 'Build heap');
  steps.push({ a: [...a], hl: [0], done: 0, caption: `Max-heap built; the maximum ${a[0]} is at the root` });
  for (let end = n - 1; end > 0; end -= 1) {
    [a[0], a[end]] = [a[end], a[0]];
    steps.push({ a: [...a], hl: [0, end], done: n - end, caption: `Move the maximum ${a[end]} to position ${end}` });
    sift(0, end, 'Restore heap');
  }
  steps.push({ a: [...a], hl: [], done: n, caption: 'Sorted' });
  return steps;
}

function mergeSortSteps(input) {
  const a = [...input];
  const steps = [{ a: [...a], hl: [], caption: `Start: [${a.join(', ')}]` }];
  const rec = (lo, hi) => {
    if (hi - lo < 2) return;
    const mid = Math.floor((lo + hi) / 2);
    rec(lo, mid);
    rec(mid, hi);
    const merged = [];
    let i = lo;
    let j = mid;
    while (i < mid && j < hi) merged.push(a[j] < a[i] ? a[j++] : a[i++]);
    while (i < mid) merged.push(a[i++]);
    while (j < hi) merged.push(a[j++]);
    for (let k = lo; k < hi; k += 1) a[k] = merged[k - lo];
    const range = Array.from({ length: hi - lo }, (_, k) => lo + k);
    steps.push({ a: [...a], hl: range, caption: `Merge positions ${lo}–${hi - 1} into [${merged.join(', ')}]` });
  };
  rec(0, a.length);
  steps.push({ a: [...a], hl: [], caption: 'Sorted' });
  return steps;
}

function quickSortSteps(input) {
  const a = [...input];
  const steps = [{ a: [...a], hl: [], caption: `Start: [${a.join(', ')}]` }];
  const rec = (lo, hi) => {
    if (lo >= hi) return;
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j += 1) {
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        steps.push({ a: [...a], hl: [i, j], pivot: hi, caption: `Pivot ${pivot}: ${a[i]} < ${pivot}, move it into the "smaller" region` });
        i += 1;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    steps.push({ a: [...a], hl: [i], pivot: i, caption: `Place pivot ${pivot} at its final index ${i}` });
    rec(lo, i - 1);
    rec(i + 1, hi);
  };
  rec(0, a.length - 1);
  steps.push({ a: [...a], hl: [], caption: 'Sorted' });
  return steps;
}

function buildHeapSteps(input) {
  const a = [...input];
  const steps = [{ a: [...a], hl: [], caption: 'Start: an arbitrary complete tree' }];
  const n = a.length;
  for (let s = Math.floor(n / 2) - 1; s >= 0; s -= 1) {
    let i = s;
    steps.push({ a: [...a], hl: [i], caption: `Sift down index ${i} (value ${a[i]})` });
    for (;;) {
      let b = i;
      const l = 2 * i + 1;
      const r = l + 1;
      if (l < n && a[l] > a[b]) b = l;
      if (r < n && a[r] > a[b]) b = r;
      if (b === i) break;
      [a[i], a[b]] = [a[b], a[i]];
      steps.push({ a: [...a], hl: [i, b], caption: `Swap ${a[b]} with its larger child ${a[i]}` });
      i = b;
    }
  }
  steps.push({ a: [...a], hl: [0], caption: 'Every parent is now at least its children: a max-heap' });
  return steps;
}

function traversalSteps(order) {
  const tree = [1, 2, 3, 4, 5, 6, 7];
  const out = [];
  const walk = (i) => {
    if (i >= tree.length) return;
    if (order === 'pre') out.push(i);
    walk(2 * i + 1);
    if (order === 'in') out.push(i);
    walk(2 * i + 2);
    if (order === 'post') out.push(i);
  };
  walk(0);
  const steps = [{ a: tree, hl: [], visited: [], caption: `${{ pre: 'Preorder', in: 'Inorder', post: 'Postorder' }[order]} traversal` }];
  out.forEach((i, k) => {
    const visited = out.slice(0, k + 1);
    steps.push({ a: tree, hl: [i], visited, caption: `Visit ${tree[i]}: ${visited.map((v) => tree[v]).join(' ')}` });
  });
  return steps;
}

const GRAPH = {
  nodes: [
    { id: 1, x: 60, y: 70 },
    { id: 2, x: 170, y: 30 },
    { id: 3, x: 170, y: 120 },
    { id: 4, x: 290, y: 70 },
    { id: 5, x: 400, y: 30 },
    { id: 6, x: 400, y: 120 },
  ],
  edges: [
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [4, 5],
    [4, 6],
  ],
};

function graphSteps(kind) {
  const adj = new Map(GRAPH.nodes.map((n) => [n.id, []]));
  for (const [u, v] of GRAPH.edges) {
    adj.get(u).push(v);
    adj.get(v).push(u);
  }
  for (const l of adj.values()) l.sort((x, y) => x - y);
  const steps = [];
  const seen = new Set([1]);
  const order = [];
  const box = [1];
  steps.push({ current: null, visited: [], frontier: [...box], caption: `${kind === 'bfs' ? 'BFS: queue' : 'DFS: stack'} starts with vertex 1` });
  while (box.length) {
    const u = kind === 'bfs' ? box.shift() : box.pop();
    order.push(u);
    const found = [];
    const nbrs = kind === 'bfs' ? adj.get(u) : [...adj.get(u)].reverse();
    for (const v of nbrs) {
      if (!seen.has(v)) {
        seen.add(v);
        box.push(v);
        found.push(v);
      }
    }
    steps.push({
      current: u,
      visited: [...order],
      frontier: [...box],
      caption: `Take ${u}${found.length ? `, discover ${found.join(', ')}` : ''}; ${kind === 'bfs' ? 'queue' : 'stack'}: [${box.join(', ')}]`,
    });
  }
  steps.push({ current: null, visited: [...order], frontier: [], caption: `Visit order: ${order.join(' ')}` });
  return steps;
}

function stackSteps() {
  const s = '{[()]}';
  const st = [];
  const steps = [{ stack: [], caption: `Check "${s}"`, pos: -1 }];
  const match = { ')': '(', ']': '[', '}': '{' };
  [...s].forEach((c, i) => {
    if ('([{'.includes(c)) {
      st.push(c);
      steps.push({ stack: [...st], pos: i, caption: `"${c}" opens: push` });
    } else {
      const ok = st[st.length - 1] === match[c];
      st.pop();
      steps.push({ stack: [...st], pos: i, caption: `"${c}" ${ok ? 'matches the top: pop' : 'does not match'}` });
    }
  });
  steps.push({ stack: [...st], pos: s.length, caption: st.length ? 'Unmatched openers remain: not balanced' : 'Stack empty: balanced' });
  return { text: s, steps };
}

function listSteps() {
  const values = [1, 2, 3, 4];
  const next = [1, 2, 3, -1];
  const steps = [{ next: [...next], prev: -1, cur: 0, caption: 'prev = null, cur = 1' }];
  let prev = -1;
  let cur = 0;
  while (cur !== -1) {
    const nx = next[cur];
    next[cur] = prev;
    prev = cur;
    cur = nx;
    steps.push({
      next: [...next],
      prev,
      cur,
      caption: `Point ${values[prev]} back at ${next[prev] === -1 ? 'null' : values[next[prev]]}; prev = ${values[prev]}, cur = ${cur === -1 ? 'null' : values[cur]}`,
    });
  }
  steps.push({ next: [...next], prev, cur: -1, caption: `Reversed: head is now ${values[prev]}` });
  return { values, steps };
}

/* ---------- drawing ---------- */

function Bars({ s }) {
  const max = Math.max(...s.a);
  const w = 46;
  return (
    <svg viewBox={`0 0 ${s.a.length * w + 10} 150`} role="img" aria-label={s.caption}>
      {s.a.map((v, i) => {
        const h = 20 + (v / max) * 100;
        const cls = s.pivot === i ? 'is-pivot' : s.hl.includes(i) ? 'is-hl' : s.done && i >= s.a.length - s.done ? 'is-done' : '';
        return (
          <g key={i}>
            <rect className={`dsa-viz__bar ${cls}`} x={5 + i * w} y={128 - h} width={w - 8} height={h} rx="4" />
            <text className="dsa-viz__val" x={5 + i * w + (w - 8) / 2} y={145} textAnchor="middle">
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Tree({ s }) {
  const n = s.a.length;
  const levels = Math.floor(Math.log2(n)) + 1;
  const width = 420;
  const pos = (i) => {
    const d = Math.floor(Math.log2(i + 1));
    const k = i + 1 - 2 ** d;
    return { x: ((k + 0.5) / 2 ** d) * width, y: 28 + d * 56 };
  };
  return (
    <svg viewBox={`0 0 ${width} ${levels * 56 + 10}`} role="img" aria-label={s.caption}>
      {s.a.map((_, i) => {
        if (i === 0) return null;
        const p = pos(i);
        const q = pos(Math.floor((i - 1) / 2));
        return <line key={`e${i}`} className="dsa-viz__edge" x1={q.x} y1={q.y} x2={p.x} y2={p.y} />;
      })}
      {s.a.map((v, i) => {
        const p = pos(i);
        const cls = s.hl.includes(i) ? 'is-hl' : s.visited?.includes(i) ? 'is-done' : '';
        return (
          <g key={i}>
            <circle className={`dsa-viz__node ${cls}`} cx={p.x} cy={p.y} r="17" />
            <text className="dsa-viz__val" x={p.x} y={p.y + 5} textAnchor="middle">
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Graph({ s }) {
  const at = Object.fromEntries(GRAPH.nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 460 150" role="img" aria-label={s.caption}>
      {GRAPH.edges.map(([u, v]) => (
        <line key={`${u}-${v}`} className="dsa-viz__edge" x1={at[u].x} y1={at[u].y} x2={at[v].x} y2={at[v].y} />
      ))}
      {GRAPH.nodes.map((nd) => {
        const cls = s.current === nd.id ? 'is-hl' : s.visited.includes(nd.id) ? 'is-done' : s.frontier.includes(nd.id) ? 'is-frontier' : '';
        return (
          <g key={nd.id}>
            <circle className={`dsa-viz__node ${cls}`} cx={nd.x} cy={nd.y} r="18" />
            <text className="dsa-viz__val" x={nd.x} y={nd.y + 5} textAnchor="middle">
              {nd.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StackView({ s, text }) {
  return (
    <svg viewBox="0 0 360 170" role="img" aria-label={s.caption}>
      {[...text].map((c, i) => (
        <text key={i} className={`dsa-viz__char${i === s.pos ? ' is-hl' : ''}`} x={20 + i * 26} y={30}>
          {c}
        </text>
      ))}
      <path className="dsa-viz__edge" d="M220 50V160H300V50" fill="none" />
      {s.stack.map((c, i) => (
        <g key={i}>
          <rect className={`dsa-viz__bar${i === s.stack.length - 1 ? ' is-hl' : ''}`} x="226" y={130 - i * 30} width="68" height="26" rx="4" />
          <text className="dsa-viz__val" x="260" y={148 - i * 30} textAnchor="middle">
            {c}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ListView({ s, values }) {
  return (
    <svg viewBox="0 0 470 110" role="img" aria-label={s.caption}>
      <defs>
        <marker id="dsa-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="dsa-viz__arrowhead" />
        </marker>
      </defs>
      {values.map((v, i) => {
        const x = 30 + i * 110;
        const cls = i === s.cur ? 'is-frontier' : i === s.prev ? 'is-hl' : '';
        const target = s.next[i];
        return (
          <g key={i}>
            <rect className={`dsa-viz__bar ${cls}`} x={x} y="35" width="56" height="34" rx="5" />
            <text className="dsa-viz__val" x={x + 28} y="57" textAnchor="middle">
              {v}
            </text>
            {target !== -1 && (
              <path
                className="dsa-viz__edge"
                d={target > i ? `M${x + 58} 45H${30 + target * 110 - 4}` : `M${x - 2} 60H${30 + target * 110 + 60}`}
                markerEnd="url(#dsa-arrow)"
              />
            )}
            {target === -1 && (
              <text className="dsa-viz__note" x={x + 28} y="92" textAnchor="middle">
                → null
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- player ---------- */

const KINDS = {
  sort: (arg) => ({
    title: { heap: 'Heap sort', merge: 'Merge sort', quick: 'Quick sort (Lomuto)' }[arg] || 'Sorting',
    steps: arg === 'heap' ? heapSortSteps([4, 10, 3, 5, 1, 8, 7]) : arg === 'merge' ? mergeSortSteps([38, 27, 43, 3, 9, 82, 10]) : quickSortSteps([3, 8, 2, 5, 1, 4, 7, 6]),
    Draw: Bars,
  }),
  heap: () => ({ title: 'Build-heap, step by step', steps: buildHeapSteps([4, 10, 3, 5, 1, 8, 7]), Draw: Tree }),
  traversal: (arg) => ({ title: 'Tree traversal', steps: traversalSteps(arg || 'in'), Draw: Tree }),
  graph: (arg) => ({ title: arg === 'dfs' ? 'Depth-first search from 1' : 'Breadth-first search from 1', steps: graphSteps(arg === 'dfs' ? 'dfs' : 'bfs'), Draw: Graph }),
  stack: () => {
    const { text, steps } = stackSteps();
    return { title: 'Bracket matching with a stack', steps, Draw: (p) => <StackView {...p} text={text} /> };
  },
  linkedlist: () => {
    const { values, steps } = listSteps();
    return { title: 'Reversing a linked list', steps, Draw: (p) => <ListView {...p} values={values} /> };
  },
};

/** A visualisation chosen by kind and argument, e.g. "sort quick", "graph dfs", "traversal pre". */
export default function StepViz({ kind, args }) {
  const [choice, setChoice] = useState(args);
  const viz = useMemo(() => KINDS[kind](choice), [kind, choice]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = viz.steps.length - 1;

  const running = playing && step < last;
  useEffect(() => {
    if (!running) return undefined;
    const t = setTimeout(() => setStep((v) => v + 1), 900);
    return () => clearTimeout(t);
  }, [running, step]);

  const s = viz.steps[Math.min(step, last)];
  const Draw = viz.Draw;
  const options = kind === 'traversal' ? ['pre', 'in', 'post'] : kind === 'graph' ? ['bfs', 'dfs'] : null;

  return (
    <figure className="dsa-viz" aria-label={viz.title}>
      <p className="dsa-viz__title">{viz.title}</p>
      {options && (
        <div className="oop-filter" role="group" aria-label="Variant">
          {options.map((o) => (
            <button key={o} type="button" aria-pressed={choice === o} onClick={() => { setChoice(o); setStep(0); setPlaying(false); }}>
              {{ pre: 'Preorder', in: 'Inorder', post: 'Postorder', bfs: 'BFS', dfs: 'DFS' }[o]}
            </button>
          ))}
        </div>
      )}
      <div className="dsa-viz__stage">
        <Draw s={s} />
      </div>
      <figcaption className="dsa-viz__caption" aria-live="polite">
        {s.caption}
      </figcaption>
      <div className="dsa-viz__controls">
        <button type="button" className="dsa-btn" onClick={() => { setPlaying(false); setStep(0); }} disabled={step === 0}>
          Reset
        </button>
        <button type="button" className="dsa-btn" onClick={() => { setPlaying(false); setStep((v) => Math.max(0, v - 1)); }} disabled={step === 0}>
          ← Back
        </button>
        <button type="button" className="dsa-btn" onClick={() => { setPlaying(false); setStep((v) => Math.min(last, v + 1)); }} disabled={step >= last}>
          Next →
        </button>
        <button type="button" className="dsa-btn" onClick={() => setPlaying(!running)} disabled={step >= last}>
          {running ? 'Pause' : 'Play'}
        </button>
        <span className="dsa-viz__step">
          Step {step + 1} / {last + 1}
        </span>
      </div>
    </figure>
  );
}
