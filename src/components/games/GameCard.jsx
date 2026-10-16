import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { gamePath } from '../../data/games';
import ShooterPreview from './shooter/Preview.jsx';
import PoolPreview from './pool/Preview.jsx';
import RunnerPreview from './runner/Preview.jsx';
import FlightPreview from './flight/Preview.jsx';
import RacerPreview from './racer/Preview.jsx';
import AdventurePreview from './adventure/Preview.jsx';
import TrainPreview from './train/Preview.jsx';

const previews = { shooter: ShooterPreview, pool: PoolPreview, runner: RunnerPreview, flight: FlightPreview, racer: RacerPreview, adventure: AdventurePreview, train: TrainPreview };

// Game card for the Games page. The title link stretches over the whole card
// so any click opens the game, as on the course cards.
export default function GameCard({ game, index, featured = false }) {
  const Preview = previews[game.slug];
  return (
    <article className={`game-card${featured ? ' game-card--featured' : ''}`}>
      <div className="game-card__art" aria-hidden="true">
        {Preview && <Preview />}
        <span className="game-card__index">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="game-card__body">
        <p className="game-card__genre">{game.genre}</p>
        <h3 className="game-card__title">
          <Link to={gamePath(game)} className="game-card__link">
            {game.title}
          </Link>
        </h3>
        <p className="game-card__summary">{game.summary}</p>
        <ul className="game-card__facts" aria-label="Features">
          {game.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <span className="game-card__play" aria-hidden="true">
          <Icon name="play" />
          Play now
        </span>
      </div>
    </article>
  );
}
