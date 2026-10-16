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
  {
    slug: 'racer',
    title: 'Apex Rush',
    genre: 'Arcade racing',
    summary:
      'Race three rivals or your own ghost across a coastal highway, a mountain pass and a city circuit. Drift the corners for boost and chase lap records.',
    facts: ['3 tracks', 'Rival AI', 'Ghost racing', 'Drift boost'],
    controls: {
      keys: ['W or up to accelerate, S or down to brake and reverse', 'A D or left and right to steer', 'Space for the handbrake: drift through corners', 'P or Esc to pause'],
      touch: ['LEFT and RIGHT buttons to steer', 'GAS and BRAKE on the right', 'DRIFT for the handbrake'],
    },
    score: 'Race wins',
  },
  {
    slug: 'adventure',
    title: 'Lost Horizons',
    genre: 'Exploration adventure',
    summary:
      'Shipwrecked on a mysterious island: explore the forest, caves, ruins and peak, solve ancient puzzles, gather three sun shards and light the beacon.',
    facts: ['5 regions', '3 puzzles', 'Hidden secrets', 'Saves progress'],
    controls: {
      keys: ['WASD or arrow keys to walk', 'E or Space to interact', 'J for the journal, M for the map', 'Walk into a boulder to push it', 'P or Esc to pause'],
      touch: ['Drag on the left to walk', 'ACT to interact', 'LOG for the journal, MAP for the map'],
    },
    score: 'Times completed',
  },
  {
    slug: 'train',
    title: 'Last Train Home',
    genre: 'Journey and travel',
    summary:
      'Drive the last train north across farmland, mountain passes, the coast and deep forest. Choose your routes, manage fuel and supplies, and gather the pages of a lost letter.',
    facts: ['9 stations', 'Route choices', 'Day and night', '3 endings'],
    controls: {
      keys: ['Hold W or up to open the throttle, S or down to ease off', 'Space to brake; stop by a platform to arrive', 'Number keys pick choices at stations', 'M for the route map, L for the travel log', 'P or Esc to pause'],
      touch: ['FASTER, SLOWER and BRAKE on the right', 'Tap a choice at each station', 'MAP and LOG at the top right'],
    },
    score: 'Journeys completed',
  },
];

export const getGame = (slug) => games.find((g) => g.slug === slug);

/** Canonical URL of a game. */
export const gamePath = (g) => `/games/${g.slug}`;
