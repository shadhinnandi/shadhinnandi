import dims from '../data/imageDims.json';

// All processed images live in src/assets as `<name>-<width>.webp`.
// Vite fingerprints them at build time; this helper turns a base name into
// a responsive <img> description (src, srcSet, intrinsic size).
const files = {
  ...import.meta.glob('../assets/images/*.webp', { eager: true, import: 'default' }),
  ...import.meta.glob('../assets/certificates/*.webp', { eager: true, import: 'default' }),
};

const byName = {};
for (const [path, url] of Object.entries(files)) {
  const file = path.split('/').pop();
  const match = file.match(/^(.*)-(\d+)\.webp$/);
  if (!match) continue;
  const [, name, width] = match;
  const [w, h] = dims[file] || [Number(width), Number(width)];
  (byName[name] ||= []).push({ url, w, h });
}
for (const list of Object.values(byName)) list.sort((a, b) => a.w - b.w);

/**
 * @param {string} name   base name, e.g. "vortex-landing"
 * @param {string} alt    descriptive alternative text
 * @param {object} extra  optional { caption, position }
 */
export function image(name, alt, extra = {}) {
  const list = byName[name];
  if (!list) {
    if (import.meta.env.DEV) console.warn(`[media] missing image "${name}"`);
    return null;
  }
  const largest = list[list.length - 1];
  return {
    name,
    alt,
    src: list[0].url,
    full: largest.url,
    srcSet: list.map((i) => `${i.url} ${i.w}w`).join(', '),
    width: largest.w,
    height: largest.h,
    ...extra,
  };
}

/** Prefix a file in /public with the deployment base path. */
export function publicUrl(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
