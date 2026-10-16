import GameShell from '../shared/GameShell.jsx';
import { createShooter } from './engine.js';

/** Last Stand: top-down arena shooter. Logic in world.js and ai.js, drawing in render.js. */
export default function Shooter({ game }) {
  return <GameShell game={game} create={createShooter} cursor="none" />;
}
