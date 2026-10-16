import './copy.css';

// Copy-to-clipboard helpers shared by every academic course: the "Copy"
// button on code blocks (added by beginner-c/Markdown.jsx) and the
// "Copy answer" button on solutions (CopyButton.jsx).

/** Copies text to the clipboard; resolves to true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers or a page without clipboard permission: copy through a
    // temporary textarea instead.
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** The visible text of an element as the reader sees it, without the copy buttons themselves. */
export function readText(el) {
  if (!el) return '';
  el.classList.add('is-copying');
  const text = el.innerText;
  el.classList.remove('is-copying');
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

/** Shows "Copied" (or "Copy failed") on a plain DOM button for a moment. */
export function flashButton(button, ok, label = 'Copy') {
  button.textContent = ok ? 'Copied' : 'Copy failed';
  button.classList.toggle('is-done', ok);
  clearTimeout(button.copyTimer);
  button.copyTimer = setTimeout(() => {
    button.textContent = label;
    button.classList.remove('is-done');
  }, 1600);
}
