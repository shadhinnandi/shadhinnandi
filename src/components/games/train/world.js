// The country of Last Train Home: stations, the lines between them, and
// what happens along each line. No DOM access.
//
// Story: forty years ago your grandfather rode this line home to Northwatch,
// leaving a letter for your grandmother in pieces at the stations where he
// stopped. Winter is closing the northern pass. Take the last train north,
// gather what you can of the letter, and bring it home.

export const STATIONS = {
  millbrook: {
    name: 'Millbrook',
    region: 'country',
    x: 0.12,
    y: 0.82,
    color: '#c96a3a',
    blurb: 'A farming town of red barns and windmills. Your journey starts here.',
    fuelPrice: 12,
  },
  harrow: { name: 'Harrow Junction', region: 'country', x: 0.3, y: 0.66, color: '#7a8a5a', blurb: 'Where the mountain line and the coast line part ways.', fuelPrice: 14 },
  greyfell: { name: 'Greyfell', region: 'mountain', x: 0.36, y: 0.38, color: '#6f7a8a', blurb: 'A slate-roofed mining town clinging to the pass.', fuelPrice: 15, workshop: true },
  quarry: { name: 'Old Quarry Halt', region: 'mountain', x: 0.52, y: 0.24, color: '#9a8a6a', blurb: 'An almost forgotten halt above the old quarry.', fuelPrice: 8 },
  saltmere: { name: 'Saltmere', region: 'coast', x: 0.6, y: 0.78, color: '#3f8fb0', blurb: 'A fishing town of blue boats and drying nets.', fuelPrice: 13 },
  lantern: { name: 'Lantern Bay', region: 'coast', x: 0.82, y: 0.6, color: '#e0b04a', blurb: 'A lighthouse on the cliffs and a keeper who knows the old lines.', fuelPrice: 14, workshop: true },
  pinecross: { name: 'Pinecross', region: 'forest', x: 0.66, y: 0.42, color: '#3f7d4a', blurb: 'A timber town in the deep forest. The last fuel before the north.', fuelPrice: 20 },
  whisperwood: { name: 'Whisperwood Halt', region: 'forest', x: 0.8, y: 0.24, color: '#5a7d6a', blurb: 'A mossy platform no timetable mentions.', fuelPrice: 18, hidden: true },
  northwatch: { name: 'Northwatch', region: 'snow', x: 0.7, y: 0.07, color: '#c9d6e8', blurb: 'Home: a snowbound town under the northern lights.', final: true },
};

export const REGION_NAMES = { country: 'Countryside', mountain: 'Mountains', coast: 'Coast', forest: 'Forest', snow: 'The far north' };
export const REGION_FUEL = { country: 0.85, mountain: 1.45, coast: 1.0, forest: 1.1, snow: 1.35 };

/*
  Lines. Events along a line (km from the start of the line):
    limit     a stretch with a speed limit (bridges, tunnels, drifts); going
              over it damages the train
    tunnel    dark stretch (drawn), bridge: drawn over a valley or river
    block     something on the track: stop before it, then decide what to do
    flag      someone waving from the trackside: stop beside them to meet them
    weather   a stretch with higher fuel use
    chance    (block only) probability the block is there on a given trip
*/
export const LINES = [
  {
    id: 'mill-harrow',
    from: 'millbrook',
    to: 'harrow',
    km: 32,
    region: 'country',
    events: [
      { type: 'flag', km: 14, kind: 'farmer' },
      { type: 'bridge', from: 22, to: 23.4 },
      { type: 'limit', from: 22, to: 23.4, limit: 50, reason: 'Old river bridge' },
    ],
  },
  {
    id: 'harrow-greyfell',
    from: 'harrow',
    to: 'greyfell',
    km: 44,
    region: 'mountain',
    note: 'Short and steep. Tunnels, bridges and a risk of rockslides.',
    events: [
      { type: 'tunnel', from: 9, to: 11.5 },
      { type: 'limit', from: 9, to: 11.5, limit: 60, reason: 'Tunnel' },
      { type: 'block', km: 24, kind: 'rocks', chance: 0.7 },
      { type: 'bridge', from: 33, to: 35.5 },
      { type: 'limit', from: 33, to: 35.5, limit: 45, reason: 'Viaduct' },
    ],
  },
  {
    id: 'harrow-saltmere',
    from: 'harrow',
    to: 'saltmere',
    km: 62,
    region: 'coast',
    note: 'Long and gentle along the sea. Safer, but further.',
    events: [
      { type: 'weather', from: 20, to: 38, kind: 'wind' },
      { type: 'flag', km: 44, kind: 'fisher' },
      { type: 'bridge', from: 50, to: 52 },
      { type: 'limit', from: 50, to: 52, limit: 50, reason: 'Sea bridge' },
    ],
  },
  {
    id: 'greyfell-quarry',
    from: 'greyfell',
    to: 'quarry',
    km: 18,
    region: 'mountain',
    note: 'A short spur to an old halt. Cheap fuel, and stories.',
    events: [{ type: 'limit', from: 6, to: 9, limit: 40, reason: 'Worn track' }],
  },
  {
    id: 'greyfell-pinecross',
    from: 'greyfell',
    to: 'pinecross',
    km: 40,
    region: 'forest',
    note: 'Down through the pass into the forest.',
    events: [
      { type: 'tunnel', from: 5, to: 8 },
      { type: 'limit', from: 5, to: 8, limit: 60, reason: 'Tunnel' },
      { type: 'block', km: 26, kind: 'tree', chance: 0.6 },
    ],
  },
  {
    id: 'quarry-pinecross',
    from: 'quarry',
    to: 'pinecross',
    km: 30,
    region: 'forest',
    note: 'An overgrown line through the forest.',
    events: [
      { type: 'block', km: 12, kind: 'tree', chance: 1 },
      { type: 'flag', km: 22, kind: 'hiker' },
    ],
  },
  {
    id: 'greyfell-saltmere',
    from: 'greyfell',
    to: 'saltmere',
    km: 46,
    region: 'coast',
    note: 'A winding descent from the pass down to the sea.',
    events: [
      { type: 'limit', from: 10, to: 14, limit: 40, reason: 'Hairpin curves' },
      { type: 'flag', km: 30, kind: 'fisher' },
    ],
  },
  {
    id: 'saltmere-lantern',
    from: 'saltmere',
    to: 'lantern',
    km: 36,
    region: 'coast',
    events: [
      { type: 'bridge', from: 18, to: 20 },
      { type: 'limit', from: 18, to: 20, limit: 50, reason: 'Sea bridge' },
    ],
  },
  {
    id: 'lantern-pinecross',
    from: 'lantern',
    to: 'pinecross',
    km: 48,
    region: 'forest',
    note: 'Inland from the coast into the forest.',
    events: [
      { type: 'block', km: 30, kind: 'deer', chance: 1 },
      { type: 'weather', from: 6, to: 16, kind: 'rain' },
    ],
  },
  {
    id: 'pinecross-northwatch',
    from: 'pinecross',
    to: 'northwatch',
    km: 64,
    region: 'snow',
    note: 'The long main line north. Cold, with deep drifts.',
    events: [
      { type: 'weather', from: 10, to: 60, kind: 'snow' },
      { type: 'limit', from: 30, to: 34, limit: 35, reason: 'Snowdrift' },
      { type: 'limit', from: 48, to: 51, limit: 35, reason: 'Snowdrift' },
    ],
  },
  {
    id: 'pinecross-whisperwood',
    from: 'pinecross',
    to: 'whisperwood',
    km: 22,
    region: 'forest',
    hidden: true,
    note: 'An old branch line, unmarked on the timetable.',
    events: [{ type: 'limit', from: 8, to: 11, limit: 40, reason: 'Mossy rails' }],
  },
  {
    id: 'whisperwood-northwatch',
    from: 'whisperwood',
    to: 'northwatch',
    km: 34,
    region: 'snow',
    note: 'A sheltered valley line to the north.',
    events: [{ type: 'weather', from: 12, to: 30, kind: 'snow' }],
  },
];

export const lineById = (id) => LINES.find((l) => l.id === id);
export const linesFrom = (st) => LINES.filter((l) => l.from === st);
