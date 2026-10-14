/*
  Two small fenced-block notations used by the course Markdown, turned into
  HTML before the Markdown is rendered.

  ```calc        step-by-step working, one step per line
    d = e^{−1} mod z
      = 3^{−1} mod 20
      = (1 + 20 × k) / 3 mod 20      [k = 1]
      = 7
    ∴ d = 7
  ```
    - A line is split at its first "=" so the equals signs line up.
    - "[...]" at the end of a line is a side note.
    - A line starting with "∴" is the final answer and is highlighted.
    - A line starting with "# " is a plain text label.
    - ^{...} or ^x is a superscript, _{...} or _x a subscript.

  ```seq         message exchange between two or more parties
    Alam | Samir                      first line: the parties
    Samir: n = 33; e = 7              a note under one party ("; " starts a new line)
    Samir -> Alam: public key (e, n)  a message from one party to another
  ```

  Everything else in the Markdown is left alone.

  The site's Content Security Policy blocks inline style attributes, so a seq
  diagram carries its grid positions in data-lanes / data-col / data-row
  attributes, and placeSeqDiagrams() applies them through the CSSOM.
*/

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Read a ^ or _ argument starting at s[i]: a {braced group} or a run of word characters. */
function readGroup(s, i) {
  if (s[i] === '{') {
    let depth = 0;
    for (let j = i; j < s.length; j += 1) {
      if (s[j] === '{') depth += 1;
      else if (s[j] === '}') {
        depth -= 1;
        if (depth === 0) return { body: s.slice(i + 1, j), end: j + 1 };
      }
    }
    return { body: s.slice(i + 1), end: s.length };
  }
  const m = s.slice(i).match(/^[−-]?[0-9A-Za-z]+/);
  return m ? { body: m[0], end: i + m[0].length } : null;
}

/** Escape a line and turn ^{...} / _{...} into <sup> / <sub>. */
function formatMath(s) {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '^' || c === '_') {
      const g = readGroup(s, i + 1);
      if (g) {
        const tag = c === '^' ? 'sup' : 'sub';
        out += `<${tag}>${formatMath(g.body)}</${tag}>`;
        i = g.end;
        continue;
      }
    }
    out += escapeHtml(c);
    i += 1;
  }
  return out;
}

function calcToHtml(body) {
  const rows = [];
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line) {
      rows.push('<span class="csec-calc__gap"></span>');
      continue;
    }
    if (line.startsWith('# ')) {
      rows.push(`<span class="csec-calc__text">${formatMath(line.slice(2))}</span>`);
      continue;
    }
    const result = line.startsWith('∴');
    let main = line;
    let note = '';
    const n = main.match(/^(.*?)\s*\[([^\]]+)\]$/);
    if (n) {
      main = n[1];
      note = `<span class="csec-calc__note">${formatMath(n[2])}</span>`;
    }
    const eq = main.indexOf('=');
    const lhs = eq < 0 ? main : main.slice(0, eq).trim();
    const rhs = eq < 0 ? '' : main.slice(eq + 1).trim();
    const cls = result ? ' csec-calc__row--result' : '';
    rows.push(
      `<span class="csec-calc__row${cls}"><span class="csec-calc__lhs">${formatMath(lhs)}</span>` +
        `<span class="csec-calc__eq">${eq < 0 ? '' : '='}</span>` +
        `<span class="csec-calc__rhs">${formatMath(rhs)}${note}</span></span>`,
    );
  }
  return `<div class="csec-calc">${rows.join('')}</div>`;
}

function seqToHtml(body) {
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const lanes = (lines.shift() || '').split('|').map((l) => l.trim());
  const lane = (name) => lanes.indexOf(name.trim());
  const items = [];
  lines.forEach((line, idx) => {
    const row = idx + 2;
    const msg = line.match(/^(.+?)\s*->\s*(.+?):\s*(.*)$/);
    if (msg && lane(msg[1]) >= 0 && lane(msg[2]) >= 0) {
      const a = lane(msg[1]);
      const b = lane(msg[2]);
      const from = Math.min(a, b) * 2 + 2;
      const to = Math.max(a, b) * 2 + 2;
      const dir = b > a ? 'right' : 'left';
      items.push(
        `<div class="csec-seq__msg csec-seq__msg--${dir}" data-col="${from}/${to}" data-row="${row}">` +
          `<span class="csec-seq__label">${formatMath(msg[3])}</span></div>`,
      );
      return;
    }
    const note = line.match(/^(.+?):\s*(.*)$/);
    const at = note ? lane(note[1]) : -1;
    if (at >= 0) {
      items.push(
        `<div class="csec-seq__note" data-col="${at * 2 + 1}/span 2" data-row="${row}">` +
          `${note[2].split(/\s*;\s*/).map(formatMath).join('<br>')}</div>`,
      );
    }
  });
  const last = lines.length + 1;
  const heads = lanes
    .map(
      (name, i) =>
        `<div class="csec-seq__head" data-col="${i * 2 + 1}/span 2" data-row="1">${escapeHtml(name)}</div>` +
        `<div class="csec-seq__life" data-col="${i * 2 + 1}/span 2" data-row="2/${last + 1}"></div>`,
    )
    .join('');
  return (
    `<div class="csec-seq-wrap"><div class="csec-seq" data-lanes="${lanes.length}">` +
    `${heads}${items.join('')}</div></div>`
  );
}

/** Replace ```calc and ```seq blocks in a Markdown source with their HTML. */
export function renderNotation(md) {
  return md.replace(/^```(calc|seq)[^\n]*\n([\s\S]*?)^```[ \t]*$/gm, (_, kind, body) => {
    const html = kind === 'calc' ? calcToHtml(body) : seqToHtml(body);
    return `\n${html}\n`;
  });
}

/** Lay out the seq diagrams inside `root` from their data attributes (see above). */
export function placeSeqDiagrams(root) {
  root.querySelectorAll('.csec-seq[data-lanes]').forEach((seq) => {
    const lanes = Number(seq.dataset.lanes);
    seq.style.gridTemplateColumns = `repeat(${lanes * 2}, minmax(0, 1fr))`;
    seq.style.minWidth = `${lanes * 9}rem`;
    seq.querySelectorAll('[data-col]').forEach((el) => {
      el.style.gridColumn = el.dataset.col;
      el.style.gridRow = el.dataset.row;
    });
  });
}
