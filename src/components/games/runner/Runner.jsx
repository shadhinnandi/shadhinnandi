import GameShell from '../shared/GameShell.jsx';
import { createRunner } from './engine.js';

/** Skyline Run: three-lane endless runner. Logic in world.js, drawing in render.js. */
export default function Runner({ game }) {
  return <GameShell game={game} create={createRunner} />;
}
