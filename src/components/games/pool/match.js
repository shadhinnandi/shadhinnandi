// Turn flow for Eight Ball: start a shot, then, once the balls have stopped,
// judge it and hand the table to the right player. Pure state, no drawing,
// so whole games can be played in Node for testing.

import { MAX_SPEED, newEvents } from './physics.js';
import { groupOf, judge, legalTargets, other, opposite, respotEight, returnCue, rackBalls } from './rules.js';

export function newMatch() {
  return {
    balls: rackBalls(),
    turn: 'player',
    groups: { player: null, ai: null },
    isBreak: true,
    ballInHand: true,
    kitchen: true, // ball in hand behind the head string (the break)
    ev: newEvents(),
    targetsBefore: [],
    shooter: null,
    shots: { player: 0, ai: 0 },
    fouls: { player: 0, ai: 0 },
    potted: { player: 0, ai: 0 },
    result: null, // { winner: 'player' | 'ai', who, reason }
  };
}

export const cueBall = (m) => m.balls.find((b) => b.id === 0);

export function beginShot(m, who, angle, power) {
  const cue = cueBall(m);
  m.shooter = who;
  m.targetsBefore = legalTargets(m.balls, m.groups[who]);
  m.ev = newEvents();
  cue.vx = Math.cos(angle) * power * MAX_SPEED;
  cue.vy = Math.sin(angle) * power * MAX_SPEED;
  m.shots[who] += 1;
  m.ballInHand = false;
}

/**
 * Apply the rules to the finished shot. Returns a short message for the HUD:
 * { text, tone } with tone 'info' | 'good' | 'foul' | 'end'.
 */
export function finishShot(m) {
  const who = m.shooter;
  const v = judge(m.balls, m.ev, { who, groups: m.groups, isBreak: m.isBreak, targetsBefore: m.targetsBefore });
  const name = who === 'player' ? 'You' : 'The computer';
  m.potted[who] += m.ev.pots.filter((id) => id !== 0 && id !== 8).length;

  if (v.result !== 'continue') {
    const winner = v.result === 'win' ? who : other(who);
    m.result = { winner, who, reason: `${name} ${v.reason}` };
    return { text: `${name} ${v.reason}`, tone: 'end' };
  }

  const wasBreak = m.isBreak;
  m.isBreak = false;
  const notes = [];
  if (v.respotEight) {
    respotEight(m.balls);
    notes.push('8 ball back on the spot');
  }
  if (v.assign) {
    m.groups[who] = v.assign;
    m.groups[other(who)] = opposite(v.assign);
    notes.push(who === 'player' ? `You are ${v.assign}` : `Computer is ${v.assign}, you are ${opposite(v.assign)}`);
  }

  if (v.foul) {
    m.fouls[who] += 1;
    if (v.scratch) returnCue(m.balls);
    m.turn = other(who);
    m.ballInHand = true;
    m.kitchen = false;
    const hand = m.turn === 'player' ? 'your ball in hand' : 'computer has ball in hand';
    return { text: `Foul: ${v.foul}. ${hand[0].toUpperCase()}${hand.slice(1)}`, tone: 'foul' };
  }
  if (v.keepTurn) {
    const base = who === 'player' ? 'Nice. Shoot again' : 'Computer keeps the table';
    return { text: notes.length ? `${notes.join('. ')}. ${base}` : base, tone: 'good' };
  }
  m.turn = other(who);
  const base = m.turn === 'player' ? 'Your shot' : "Computer's shot";
  const opened = wasBreak && !m.groups.player ? 'Table is open. ' : '';
  return { text: notes.length ? `${notes.join('. ')}. ${base}` : `${opened}${base}`, tone: 'info' };
}

/** Balls still to pocket for a player, for the HUD. */
export function remainingFor(m, who) {
  const g = m.groups[who];
  if (!g) return [];
  return m.balls.filter((b) => !b.sunk && b.id !== 0 && groupOf(b.id) === g).map((b) => b.id);
}
