// Splits an English II page into Markdown and the course's teaching blocks.
//
//   :::model Model paragraph 1 | My Grandmother's Kitchen
//   Optional lead (the prompt), Markdown.
//   --- outline
//   Markdown outline, shown beside the answer but never copied with it.
//   --- answer Paragraph
//   Plain text. Blank lines separate paragraphs. This is the copy target.
//   --- note
//   Markdown: what the model demonstrates.
//   :::
//
//   :::letter ...     same as model, but the answer keeps every line break
//                     (applications and emails)
//   :::practice Practice 1 · Easy | Title
//   The question, Markdown.
//   --- skill   what it tests (one line)
//   --- hint    Markdown, behind "Show hint"
//   --- answer  Markdown, behind "Show model answer"
//   :::
//
//   :::solutions      Markdown behind "Show Full Solutions" (question papers only)
//   :::
//
//   ::doc <slide key> | caption     an original sample image from SLIDES, shown inline
//   ::vocab easy|medium|advanced    that level's vocabulary groups (vocab.js)

const OPEN = /^:::(model|letter|practice|solutions)\s*(.*)$/;
const LINE = /^::(vocab|doc)\s+(.+)$/;
const PART = /^--- (outline|answer|note|skill|hint)\s*(.*)$/;

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[`*_]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const OPTION = /^\s*([a-h][.)]\s|[ivx]+[.)]\s|\*\*[^*]+:\*\*)/;

/** Keeps exam-style option lines ("a) ...", "ii. ...", "**Topic:** ...") on their own lines inside a Markdown paragraph. */
export function breakOptions(md) {
  const lines = md.split('\n');
  return lines
    .map((line, i) => {
      const next = lines[i + 1];
      return line.trim() && next?.trim() && OPTION.test(next) && !/^\s*([-*+]\s|\|)/.test(line) ? `${line}  ` : line;
    })
    .join('\n');
}

/** Lines of the page outside blocks and code fences; used for the "On this page" list. */
export function proseLines(body) {
  const out = [];
  let fence = false;
  let block = false;
  for (const line of body.split('\n')) {
    if (/^```/.test(line)) fence = !fence;
    if (!fence && OPEN.test(line)) block = true;
    else if (!fence && block && /^:::\s*$/.test(line)) block = false;
    else if (!block && !fence) out.push(line);
  }
  return out;
}

/** [{ type: 'md', text } | { type, kicker, title, lead, parts: { outline, answer, ... }, answerLabel }] */
export function parseBlocks(body) {
  const segments = [];
  let md = [];
  let block = null;
  let part = null;
  let fence = false;
  const flushMd = () => {
    const text = md.join('\n').trim();
    if (text) segments.push({ type: 'md', text });
    md = [];
  };
  for (const line of body.split('\n')) {
    if (/^```/.test(line)) fence = !fence;
    let m;
    if (!block && !fence && (m = line.match(LINE))) {
      flushMd();
      const [arg, caption = ''] = m[2].split('|').map((x) => x.trim());
      segments.push({ type: m[1], arg, caption });
      continue;
    }
    if (!block && !fence && (m = line.match(OPEN))) {
      flushMd();
      const [kicker, title] = m[2].includes('|') ? m[2].split('|').map((s) => s.trim()) : ['', m[2].trim()];
      block = { type: m[1], kicker, title, lead: [], parts: {}, answerLabel: '' };
      part = 'lead';
      continue;
    }
    if (block && !fence && /^:::\s*$/.test(line)) {
      const trim = (a) => a.join('\n').trim();
      segments.push({
        ...block,
        lead: trim(block.lead),
        parts: Object.fromEntries(Object.entries(block.parts).map(([k, v]) => [k, trim(v)])),
      });
      block = null;
      continue;
    }
    if (block) {
      if (!fence && (m = line.match(PART))) {
        part = m[1];
        block.parts[part] = [];
        if (part === 'answer') block.answerLabel = m[2].trim();
      } else if (part === 'lead') block.lead.push(line);
      else block.parts[part].push(line);
      continue;
    }
    md.push(line);
  }
  if (block) throw new Error(`Unclosed :::${block.type} block "${block.title}"`);
  flushMd();
  return segments;
}
