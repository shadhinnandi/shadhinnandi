/*
  Games registry. The Games page lists these in order, and each one is
  served at /games/:slug by the view registered for it in
  src/components/games/gameViews.js.

  To add a game: add an entry here, build it under
  src/components/games/<slug>/ and register it in gameViews.js.

  slug      URL segment under /games/.
  title     Game name, as shown on the card and the start screen.
  genre     One-line genre label.
  summary   One or two sentences for the card.
  facts     Short items shown as a quiet mono line on the card.
  controls  { keys, touch }: lines shown on the start and pause screens.
  score     How the best score is labelled ('Best score', 'Best distance', ...).
*/

export const games = [
  {
    slug: 'shooter',
    title: 'Last Stand',
    genre: 'Top-down arena shooter',
    summary:
      'Hold the arena against waves of enemies that chase, flank and shoot back. Grab drops, chain kills and see how many waves you can survive.',
    facts: ['4 enemy types', 'Endless waves', 'Power-ups'],
    controls: {
      keys: ['WASD or arrow keys to move', 'Mouse to aim, hold left button to fire', 'Space to dash', 'P or Esc to pause'],
      touch: ['Left thumb: move', 'Right thumb: aim and fire', 'Double-tap left side to dash'],
    },
    score: 'Best score',
  },
  {
    slug: 'pool',
    title: 'Eight Ball',
    genre: '8-ball pool vs computer',
    summary:
      'Full 8-ball against a computer opponent that plans its shots: break, claim solids or stripes, avoid fouls and sink the 8 last.',
    facts: ['Real ball physics', 'Fouls and ball in hand', 'Computer opponent'],
    controls: {
      keys: ['Move the mouse to aim', 'Press, pull back and release to shoot', 'Ball in hand: drag the white ball to place it', 'P or Esc to pause'],
      touch: ['Drag on the table to aim', 'Pull the power slider down and release to shoot', 'Ball in hand: drag the white ball'],
    },
    score: 'Wins',
  },
  {
    slug: 'runner',
    title: 'Skyline Run',
    genre: 'Endless runner',
    summary:
      'Sprint down a three-lane rooftop highway at night. Switch lanes, jump barriers, slide under beams and collect coins as the pace climbs.',
    facts: ['3 lanes', 'Jump and slide', 'Speeds up over time'],
    controls: {
      keys: ['Left / right or A / D to change lane', 'Up, W or Space to jump', 'Down or S to slide', 'P or Esc to pause'],
      touch: ['Swipe left or right to change lane', 'Swipe up to jump', 'Swipe down to slide'],
    },
    score: 'Best score',
  },
  {
    slug: 'flight',
    title: 'Ring Pilot',
    genre: 'Arcade flying',
    summary:
      'Fly through rings to keep your fuel up while dodging balloons and storm mines. Rings shrink and the sky gets busier the further you go.',
    facts: ['Pseudo-3D flight', 'Fuel and lives', 'Rising difficulty'],
    controls: {
      keys: ['WASD or arrow keys to steer', 'Shift to boost', 'P or Esc to pause'],
      touch: ['Drag anywhere to steer the plane', 'Hold a second finger to boost'],
    },
    score: 'Best score',
  },
];

export const getGame = (slug) => games.find((g) => g.slug === slug);

/** Canonical URL of a game. */
export const gamePath = (g) => `/games/${g.slug}`;
