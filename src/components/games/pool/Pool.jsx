import GameShell from '../shared/GameShell.jsx';
import { createPool } from './engine.js';

/** Eight Ball: 8-ball pool against the computer. Physics in physics.js, rules in rules.js and match.js, opponent in ai.js. */
export default function Pool({ game }) {
  return <GameShell game={game} create={createPool} />;
}
