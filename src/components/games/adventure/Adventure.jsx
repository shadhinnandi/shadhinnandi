import GameShell from '../shared/GameShell.jsx';
import AdventureSetup from './Setup.jsx';
import { createAdventure } from './engine.js';

/** Lost Horizons: island exploration. Map in world.js, rules and puzzles in game.js, drawing in render.js. */
export default function Adventure({ game }) {
  return <GameShell game={game} create={createAdventure} setup={AdventureSetup} />;
}
