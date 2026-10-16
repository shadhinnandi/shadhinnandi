import GameShell from '../shared/GameShell.jsx';
import RacerSetup from './Setup.jsx';
import { createRacer } from './engine.js';

/** Apex Rush: arcade racing. Tracks in tracks.js, handling in physics.js, rivals in ai.js, race rules in race.js. */
export default function Racer({ game }) {
  return <GameShell game={game} create={createRacer} setup={RacerSetup} />;
}
