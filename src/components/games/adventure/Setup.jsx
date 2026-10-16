import { loadJSON } from '../shared/storage.js';

// Continue a saved journey or start a new one (shown only when a save exists).
const KEY = 'adventure:save';

function describe(save) {
  const shards = (save.inv || []).filter((i) => i.startsWith('shard-')).length;
  const mins = Math.floor((save.time || 0) / 60);
  return `${save.checkpoint?.name || 'On the island'} · ${shards} of 3 sun shards · ${mins} min played`;
}

export default function AdventureSetup({ value, onChange, compact = false }) {
  const save = loadJSON(KEY);
  if (!save || compact) return null;
  const set = (mode) => onChange({ mode, playLabel: mode === 'continue' ? 'Continue journey' : 'Start new journey', againLabel: 'New journey' });
  return (
    <div className="game-setup">
      <div>
        <p className="game-setup__label">Saved journey</p>
        <div className="game-seg" role="group" aria-label="Saved journey">
          <button type="button" aria-pressed={value.mode === 'continue'} onClick={() => set('continue')}>
            Continue
          </button>
          <button type="button" aria-pressed={value.mode === 'new'} onClick={() => set('new')}>
            Start over
          </button>
        </div>
        <p className="game-setup__note">
          {value.mode === 'continue' ? describe(save) : 'Starting over replaces your saved journey.'}
        </p>
      </div>
    </div>
  );
}

AdventureSetup.initial = () => {
  const has = Boolean(loadJSON(KEY));
  return { mode: has ? 'continue' : 'new', playLabel: has ? 'Continue journey' : 'Start journey', againLabel: 'New journey' };
};
