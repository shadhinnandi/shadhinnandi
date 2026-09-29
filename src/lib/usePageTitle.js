import { useEffect } from 'react';

const SITE = 'Shadhin Nandi';
const DEFAULT_TITLE = SITE;

// The description in index.html is the default; pages may override it and it
// is restored when they don't.
const defaultDescription =
  typeof document !== 'undefined' ? document.querySelector('meta[name="description"]')?.getAttribute('content') : '';

export default function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : DEFAULT_TITLE;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description || defaultDescription || '');
  }, [title, description]);
}
