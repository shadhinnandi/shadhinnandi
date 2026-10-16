import { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { getGame } from '../data/games';
import { gameViews } from '../components/games/gameViews';
import { GameLoadingOverlay } from '../components/games/shared/GameShell.jsx';
import usePageTitle from '../lib/usePageTitle';
import NotFound from './NotFound.jsx';
import '../components/games/games.css';

// /games/:slug — one game. Each game view loads in its own chunk; until it
// arrives the stage shows a loading state instead of an empty box.
export default function Game() {
  const { slug } = useParams();
  const game = getGame(slug);
  const View = game && gameViews[game.slug];
  usePageTitle(game ? `${game.title} · Games` : 'Page not found', game?.summary);

  if (!View) return <NotFound />;
  return (
    <Suspense fallback={<GameFallback game={game} />}>
      <View game={game} />
    </Suspense>
  );
}

function GameFallback({ game }) {
  return (
    <div className="game-page">
      <div className="container game-frame">
        <div className="game-bar">
          <div className="game-bar__title">
            <h1>{game.title}</h1>
            <p className="game-bar__genre">{game.genre}</p>
          </div>
        </div>
        <div className="game-stage">
          <GameLoadingOverlay />
        </div>
      </div>
    </div>
  );
}
