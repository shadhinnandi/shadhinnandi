import PageHeader from '../components/ui/PageHeader.jsx';
import GameCard from '../components/games/GameCard.jsx';
import { games } from '../data/games';
import usePageTitle from '../lib/usePageTitle';
import '../components/games/games.css';

export default function Games() {
  usePageTitle('Games', 'Four browser games by Shadhin Nandi: a top-down arena shooter, 8-ball pool against the computer, an endless runner and an arcade flying game.');
  return (
    <div className="page">
      <PageHeader
        label="Games"
        title="The Game Room"
        lead="Four games I built for the browser, each against AI enemies or a computer opponent. Pick one and play straight away."
      >
        <ul className="game-hub__notes">
          <li>Runs in your browser</li>
          <li>No account or download</li>
          <li>Best scores stay on this device</li>
        </ul>
      </PageHeader>

      <div className="container">
        <section className="block" aria-labelledby="games-title">
          <h2 id="games-title" className="visually-hidden">
            All games
          </h2>
          <div className="game-grid">
            {games.map((g, i) => (
              <GameCard key={g.slug} game={g} index={i} featured={i === 0} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
