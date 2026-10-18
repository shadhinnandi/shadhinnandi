// Course links written in Markdown as [text](topic:arrays), [text](problem:DSA07-E01)
// or [text](page:question-bank); mapped to paths below the course.
export function resolveLink(href) {
  const m = /^(topic|problem|page):([\w-]+)$/.exec(href || '');
  if (!m) return null;
  if (m[1] === 'topic') return `topic/${m[2]}`;
  if (m[1] === 'problem') return `problem/${m[2]}`;
  return m[2];
}
