import GameShell from '../shared/GameShell.jsx';
import TrainSetup from './Setup.jsx';
import { createTrain } from './engine.js';

/** Last Train Home: a journey by train. Country in world.js, rules and choices in game.js, drawing in render.js. */
export default function Train({ game }) {
  return <GameShell game={game} create={createTrain} setup={TrainSetup} />;
}
