// Small inline stroke icons on a 20×20 grid. Decorative (aria-hidden): every
// icon sits next to visible text or inside a control with an accessible name.
const paths = {
  arrowRight: 'M4 10h11M11 5l5 5-5 5',
  arrowLeft: 'M16 10H5M9 5l-5 5 5 5',
  arrowUpRight: 'M6 14 14 6M7.5 6H14v6.5',
  close: 'M5 5l10 10M15 5 5 15',
  menu: 'M3.5 7.5h13M3.5 12.5h13',
  document: 'M6 2.5h5.5L15 6v11.5H6zM11 2.5V6h4M8.5 10h4M8.5 13h4',
  image: 'M3 4h14v12H3zM3 13l4-4 3 3 2-2 5 5',
  sun: 'M10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.3 4.3l1.1 1.1M14.6 14.6l1.1 1.1M4.3 15.7l1.1-1.1M14.6 5.4l1.1-1.1',
  moon: 'M16.5 12.2A6.8 6.8 0 0 1 7.8 3.5a6.8 6.8 0 1 0 8.7 8.7z',
  copy: 'M7.5 7.5h9v9h-9zM4 12.5V4h8.5',
  check: 'M4 10.5l4 4 8-9',
  award: 'M10 12.5a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5zM7.3 11.6 6.4 17.5 10 15.6l3.6 1.9-.9-5.9',
  play: 'M6.5 4.5v11l9-5.5z',
  pause: 'M7 4.5v11M13 4.5v11',
  restart: 'M4.6 11a5.5 5.5 0 1 0 1.5-5.2M5 3.5v3.3h3.3',
  activity: 'M2.5 10h3l1.5-5 3 10 1.5-5h3l1.5 3h3.5',
  canvas: 'M3 3h14v14H3zM6 14l2.5-3 2 2 2.5-3 3 4',
  chart: 'M4 16V9M8 16V5M12 16v-3M16 16V3',
  chip: 'M7 7h6v6H7zM9 2v3M13 2v3M9 15v3M13 15v3M2 9h3M2 13h3M15 9h3M15 13h3',
  code: 'M7 5 2.5 10 7 15M13 5l4.5 5-4.5 5M11.5 3.5 8.5 16.5',
  database: 'M4 5c0-1.1 2.7-2 6-2s6 .9 6 2-2.7 2-6 2-6-.9-6-2zM4 5v5c0 1.1 2.7 2 6 2s6-.9 6-2V5M4 10v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5',
  'data-science': 'M4 16V9M8 16V5M12 16v-8M16 16V3',
  flask: 'M8 2v5l-4 8.5A1.7 1.7 0 0 0 5.5 18h9a1.7 1.7 0 0 0 1.5-2.5L12 7V2M6.5 12h7M7 2h6',
  network: 'M10 3v4M10 7 5 10M10 7l5 3M5 10v4M15 10v4M3 14h4M13 14h4',
  server: 'M3 4h14v5H3zM3 11h14v5H3zM6 6.5h.01M6 13.5h.01M9 6.5h5M9 13.5h5',
  shield: 'M10 2.5 16 5v4.5c0 3.7-2.5 6.2-6 8-3.5-1.8-6-4.3-6-8V5zM7 10l2 2 4-4',
};

export default function Icon({ name, size = 16, className = '' }) {
  return (
    <svg
      className={`icon ${className}`.trim()}
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
