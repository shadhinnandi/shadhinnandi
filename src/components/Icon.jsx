// Small inline stroke icons. Decorative by default (aria-hidden).
const paths = {
  arrowRight: 'M4 10h11M11 5l5 5-5 5',
  arrowLeft: 'M16 10H5M9 5l-5 5 5 5',
  external: 'M8 4H4v12h12v-4M11 3h6v6M17 3l-8 8',
  download: 'M10 3v10M5.5 8.5 10 13l4.5-4.5M4 17h12',
  close: 'M5 5l10 10M15 5 5 15',
  menu: 'M3 6h14M3 10h14M3 14h14',
  document: 'M6 2.5h5.5L15 6v11.5H6zM11 2.5V6h4',
  image: 'M3 4h14v12H3zM3 13l4-4 3 3 2-2 5 5',
};

export default function Icon({ name, size = 16, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
