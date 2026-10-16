import GameShell from '../shared/GameShell.jsx';
import { createFlight } from './engine.js';

/** Ring Pilot: arcade flying through rings. Logic in world.js, drawing in render.js. */
export default function Flight({ game }) {
  return <GameShell game={game} create={createFlight} />;
}
