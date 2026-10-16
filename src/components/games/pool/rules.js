// 8-ball rules for Eight Ball (a practical subset of the standard rules).
//
//   - The break is played from behind the head string. The table stays open
//     after the break; the first legal pot afterwards decides who has solids
//     (1-7) and who has stripes (9-15).
//   - Fouls: the cue ball is pocketed (scratch), no ball is hit, or the first
//     ball hit is not one of the shooter's (on an open table: hitting the 8
//     first). After a foul the opponent has ball in hand anywhere.
//   - The shooter keeps the table after legally pocketing one of their balls
//     (any ball except the 8 on an open table).
//   - Pocketing the 8 after clearing your group, without a foul, wins.
//     Pocketing it early, or with a foul, loses. An 8 pocketed on the break
//     is spotted again.

import { FOOT_SPOT, HEAD_X, R, nearestFree } from './physics.js';

export const COLORS = {
  1: '#f2c230',
  2: '#2f5fd0',
  3: '#d23a32',
  4: '#6a3aa8',
  5: '#ea7a24',
  6: '#1f8a4c',
  7: '#8a2b2b',
  8: '#141518',
};
export const ballColor = (id) => (id === 0 ? '#f7f4ec' : COLORS[id > 8 ? id - 8 : id]);

export const groupOf = (id) => (id === 8 ? 'eight' : id < 8 ? 'solids' : 'stripes');
export const other = (who) => (who === 'player' ? 'ai' : 'player');
export const opposite = (group) => (group === 'solids' ? 'stripes' : 'solids');

export function rackBalls() {
  const balls = [{ id: 0, x: HEAD_X - 80, y: 250, vx: 0, vy: 0, sunk: false, sinkT: 0, roll: 0 }];
  // Standard rack: 8 in the middle of the third row, one solid and one
  // stripe in the two back corners, the rest shuffled.
  const solids = [1, 2, 3, 4, 5, 6, 7];
  const stripes = [9, 10, 11, 12, 13, 14, 15];
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  shuffle(solids);
  shuffle(stripes);
  const apex = solids.pop();
  const cornerA = solids.pop();
  const cornerB = stripes.pop();
  const rest = shuffle([...solids, ...stripes]);
  const gap = 0.35;
  const dx = (R * 2 + gap) * Math.sqrt(3) / 2;
  const slots = [];
  for (let row = 0; row < 5; row += 1) {
    for (let k = 0; k <= row; k += 1) {
      slots.push({ row, k, x: FOOT_SPOT.x + row * dx, y: FOOT_SPOT.y + (k - row / 2) * (R * 2 + gap) });
    }
  }
  for (const s of slots) {
    let id;
    if (s.row === 0) id = apex;
    else if (s.row === 2 && s.k === 1) id = 8;
    else if (s.row === 4 && s.k === 0) id = cornerA;
    else if (s.row === 4 && s.k === 4) id = cornerB;
    else id = rest.pop();
    // A hair of jitter so every break plays out differently.
    balls.push({ id, x: s.x + (Math.random() - 0.5) * 0.2, y: s.y + (Math.random() - 0.5) * 0.2, vx: 0, vy: 0, sunk: false, sinkT: 0, roll: Math.random() * 10 });
  }
  return balls;
}

export const onTable = (balls, group) => balls.filter((b) => !b.sunk && b.id !== 0 && groupOf(b.id) === group);

/** Ball ids the shooter may legally hit first. */
export function legalTargets(balls, group) {
  if (!group) return balls.filter((b) => !b.sunk && b.id !== 0 && b.id !== 8).map((b) => b.id);
  const own = onTable(balls, group);
  return own.length ? own.map((b) => b.id) : [8];
}

/**
 * Decide the outcome of a finished shot.
 *   ctx = { who, groups, isBreak, targetsBefore }  (targetsBefore: legal ids at the start of the shot)
 */
export function judge(balls, ev, ctx) {
  const { who, groups, isBreak, targetsBefore } = ctx;
  const group = groups[who];
  const pots = ev.pots.filter((id) => id !== 0);
  const scratch = ev.pots.includes(0);
  const eight = pots.includes(8);

  let foul = null;
  if (scratch) foul = 'The white ball was pocketed';
  else if (ev.firstHit === null) foul = 'No ball was hit';
  else if (!isBreak && !targetsBefore.includes(ev.firstHit)) {
    foul = group ? `Hit the ${ev.firstHit === 8 ? '8' : groupOf(ev.firstHit) === 'solids' ? 'solid' : 'striped'} ball first` : 'Hit the 8 ball first';
  }

  if (eight && !isBreak) {
    const clearedBefore = targetsBefore.length === 1 && targetsBefore[0] === 8;
    if (clearedBefore && !foul) return { result: 'win', reason: 'pocketed the 8 ball' };
    return { result: 'lose', reason: foul ? 'fouled while pocketing the 8 ball' : 'pocketed the 8 ball too early' };
  }

  let assign = null;
  if (!group && !foul && !isBreak) {
    const first = pots.find((id) => id !== 8);
    if (first !== undefined) assign = groupOf(first);
  }
  const shooterGroup = group || assign;
  const ownPotted = pots.filter((id) => id !== 8 && (shooterGroup ? groupOf(id) === shooterGroup : true));
  const keepTurn = !foul && (isBreak ? pots.some((id) => id !== 8) : ownPotted.length > 0);

  return { result: 'continue', foul, assign, keepTurn, respotEight: eight && isBreak, scratch };
}

export function respotEight(balls) {
  const eight = balls.find((b) => b.id === 8);
  const spot = nearestFree(balls, FOOT_SPOT.x, FOOT_SPOT.y, 8);
  Object.assign(eight, { sunk: false, sinkT: 0, pocket: null, x: spot.x, y: spot.y, vx: 0, vy: 0 });
}

export function returnCue(balls) {
  const cue = balls.find((b) => b.id === 0);
  const spot = nearestFree(balls, HEAD_X - 80, 250, 0);
  Object.assign(cue, { sunk: false, sinkT: 0, pocket: null, x: spot.x, y: spot.y, vx: 0, vy: 0 });
}
