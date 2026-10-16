import { loadJSON } from '../shared/storage.js';
import { STATIONS } from './world.js';

// Continue a saved journey or start a new one (shown only when a save exists).
const KEY = 'train:save';

export default function TrainSetup({ value, onChange, compact = false }) {
  const save = loadJSON(KEY);
  if (!save || compact) return null;
  const set = (mode) => onChange({ mode, playLabel: mode === 'continue' ? 'Continue journey' : 'Start new journey', againLabel: 'New journey' });
  const where = save.line ? `on the line from ${STATIONS[save.station]?.name}` : `at ${STATIONS[save.station]?.name}`;
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
          {value.mode === 'continue' ? `Saved ${where} · ${(save.fragments || []).length} of 3 letter pages` : 'Starting over replaces your saved journey.'}
        </p>
      </div>
    </div>
  );
}

TrainSetup.initial = () => {
  const has = Boolean(loadJSON(KEY));
  return { mode: has ? 'continue' : 'new', playLabel: has ? 'Continue journey' : 'Board the train', againLabel: 'New journey' };
};
