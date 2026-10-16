import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../ui/Icon.jsx';
import { createInput } from './input.js';
import { fmt } from './math.js';
import { loadNumber, submitBest } from './storage.js';

/*
  Frame around every game: the canvas, the game loop, and the menus
  (start, pause, game over) drawn by React on top of the canvas.

  React only changes state when the phase changes; frames are drawn by the
  engine straight onto the canvas.

  `create(api)` builds the engine:
    api.input          keyboard / pointer state (see input.js)
    api.reducedMotion  true when the visitor prefers reduced motion
    api.over(result)   ends the run: { title, score, scoreLabel?, scoreText?, stats?: [[label, value]], win?, best?, bestText? }
    api.dialog         open(spec) / close() / isOpen(): a panel with choices drawn over the
                       game (station menus, clues, journal). Game input is off while it is open.
                       spec = { eyebrow?, title, body?: string | string[], rows?: [[label, value]],
                                choices: [{ id, label, hint?, disabled?, primary? }], cancel?: id,
                                onChoose(id) }

  Optional `setup` component: shown on the start and results screens to pick
  options (track, mode, continue or new game). Its value is passed to
  engine.reset(options); `Setup.initial()` gives the first value and
  `value.playLabel` can rename the Play button.

  The engine provides:
    reset(options?)            start a fresh run (options come from `setup`)
    update(dt)                 one fixed step of gameplay (only while playing)
    render(ctx, w, h, time)    draw a frame (w, h in CSS pixels)
    idle?(dt)                  background animation behind the start screen
    destroy?()                 release anything the engine holds
*/

const STEP = 1 / 120;
const MAX_STEPS = 12;

export default function GameShell({ game, create, cursor = 'default', setup: Setup = null }) {
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const api = useRef(null);
  const [phase, setPhaseState] = useState('loading');
  const phaseRef = useRef('loading');
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(0);
  const overAt = useRef(0);
  const [touchFirst, setTouchFirst] = useState(false);
  const [options, setOptionsState] = useState(() => (Setup?.initial ? Setup.initial() : null));
  const optionsRef = useRef(options);
  const setOptions = useCallback((v) => {
    optionsRef.current = v;
    setOptionsState(v);
  }, []);
  const [dialog, setDialogState] = useState(null);
  const dialogRef = useRef(null);

  const setPhase = useCallback((p) => {
    phaseRef.current = p;
    setPhaseState(p);
    const a = api.current;
    if (!a) return;
    a.input.setEnabled(p === 'playing' && !dialogRef.current);
    a.kick();
  }, []);

  const setDialog = useCallback((spec) => {
    dialogRef.current = spec;
    setDialogState(spec);
    const a = api.current;
    if (a) a.input.setEnabled(phaseRef.current === 'playing' && !spec);
    if (!spec) canvasRef.current?.focus({ preventScroll: true });
  }, []);

  const choose = useCallback((id) => {
    const d = dialogRef.current;
    const c = d?.choices?.find((x) => x.id === id);
    if (!d || (c && c.disabled)) return;
    d.onChoose?.(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const ctx = canvas.getContext('2d');
    const input = createInput(canvas);
    const view = { w: 1, h: 1, dpr: 1 };
    let raf = 0;
    let last = 0;
    let acc = 0;
    let running = false;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    setTouchFirst(window.matchMedia?.('(pointer: coarse)').matches ?? false);
    setBest(loadNumber(game.slug, 0));

    const shared = {
      input,
      reducedMotion,
      over(res) {
        if (phaseRef.current !== 'playing') return;
        const record = res.best ?? submitBest(game.slug, res.score ?? 0);
        setBest(record.best);
        setResult({ ...res, best: record.best, isNew: record.isNew });
        overAt.current = performance.now();
        dialogRef.current = null;
        setDialogState(null);
        setPhase('over');
      },
      dialog: {
        open: (spec) => setDialog(spec),
        close: () => setDialog(null),
        isOpen: () => Boolean(dialogRef.current),
      },
    };
    const engine = create(shared);

    const draw = (time) => {
      ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      engine.render(ctx, view.w, view.h, time);
    };

    const frame = (now) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const p = phaseRef.current;
      if (p === 'playing') {
        acc += dt;
        let steps = 0;
        while (acc >= STEP && steps < MAX_STEPS) {
          engine.update(STEP);
          acc -= STEP;
          steps += 1;
          if (phaseRef.current !== 'playing') break;
        }
        if (steps === MAX_STEPS) acc = 0;
      } else if (p === 'ready' && !reducedMotion) {
        engine.idle?.(dt);
      }
      draw(now / 1000);
      // Only keep animating while something moves; paused and finished
      // games are drawn once and then left alone.
      const live = phaseRef.current === 'playing' || (phaseRef.current === 'ready' && !reducedMotion);
      if (live && running) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      running = true;
      if (!raf) {
        last = performance.now();
        acc = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const resize = () => {
      const r = stage.getBoundingClientRect();
      view.w = Math.max(1, Math.round(r.width));
      view.h = Math.max(1, Math.round(r.height));
      view.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(view.w * view.dpr);
      canvas.height = Math.round(view.h * view.dpr);
      engine.resize?.(view.w, view.h);
      kick();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    api.current = { input, engine, kick };
    resize();
    phaseRef.current = 'ready';
    setPhaseState('ready');
    kick();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      input.destroy();
      engine.destroy?.();
      api.current = null;
    };
  }, [create, game.slug, setDialog]);

  const play = useCallback(() => {
    const a = api.current;
    if (!a) return;
    dialogRef.current = null;
    setDialogState(null);
    a.engine.reset(optionsRef.current);
    setResult(null);
    setPhase('playing');
    canvasRef.current?.focus({ preventScroll: true });
  }, [setPhase]);

  const pause = useCallback(() => {
    if (phaseRef.current === 'playing') setPhase('paused');
  }, [setPhase]);

  const resume = useCallback(() => {
    if (phaseRef.current !== 'paused') return;
    setPhase('playing');
    canvasRef.current?.focus({ preventScroll: true });
  }, [setPhase]);

  // Pause when the tab is hidden, the window loses focus, or the visitor
  // clicks outside the game (for example on the navbar).
  useEffect(() => {
    // A real tab switch also blurs the window; requiring both avoids pausing
    // on spurious visibility events some browsers fire while the page has focus.
    const onVisibility = () => document.hidden && !document.hasFocus() && pause();
    const onBlur = () => pause();
    const onPointer = (e) => {
      if (phaseRef.current === 'playing' && !frameRef.current?.contains(e.target)) pause();
    };
    const onKey = (e) => {
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
      const p = phaseRef.current;
      const d = dialogRef.current;
      if (p === 'playing' && d) {
        // Number keys pick a choice; Escape takes the cancel choice if there is one.
        const n = Number(e.key);
        if (n >= 1 && n <= 9 && d.choices?.[n - 1]) {
          e.preventDefault();
          choose(d.choices[n - 1].id);
          return;
        }
        if (e.code === 'Escape' && d.cancel !== undefined) {
          e.preventDefault();
          choose(d.cancel);
          return;
        }
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (p === 'playing') {
          e.preventDefault();
          pause();
        } else if (p === 'paused') {
          e.preventDefault();
          resume();
        }
      } else if (p === 'over' && (e.code === 'Enter' || e.code === 'KeyR') && performance.now() - overAt.current > 500) {
        e.preventDefault();
        play();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [pause, resume, play, choose]);

  const inRun = phase === 'playing' || phase === 'paused';
  const controls = touchFirst ? [game.controls.touch, game.controls.keys] : [game.controls.keys, game.controls.touch];
  const controlLabels = touchFirst ? ['Touch', 'Keyboard and mouse'] : ['Keyboard and mouse', 'Touch'];

  return (
    <div className="game-page">
      <div ref={frameRef} className="container game-frame">
        <div className="game-bar">
          <Link to="/games" className="btn btn--quiet btn--small game-bar__back">
            <Icon name="arrowLeft" />
            <span>Games</span>
          </Link>
          <div className="game-bar__title">
            <h1>{game.title}</h1>
            <p className="game-bar__genre">{game.genre}</p>
          </div>
          <div className="game-bar__actions">
            {inRun && (
              <>
                <button type="button" className="icon-button game-bar__btn" onClick={play} aria-label="Restart">
                  <Icon name="restart" size={18} />
                </button>
                <button
                  type="button"
                  className="icon-button game-bar__btn"
                  onClick={phase === 'playing' ? pause : resume}
                  aria-label={phase === 'playing' ? 'Pause' : 'Resume'}
                >
                  <Icon name={phase === 'playing' ? 'pause' : 'play'} size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        <div ref={stageRef} className={`game-stage game-stage--${phase}`} data-cursor={cursor}>
          <canvas ref={canvasRef} tabIndex={-1} aria-label={`${game.title} game area`} />

          {phase === 'loading' && <GameLoadingOverlay />}

          {phase === 'ready' && (
            <div className="game-overlay">
              <div className={`game-panel${Setup ? ' game-panel--setup' : ''}`}>
                <p className="game-panel__eyebrow">{game.genre}</p>
                <h2 className="game-panel__title">{game.title}</h2>
                <p className="game-panel__text">{game.summary}</p>
                <div className="game-panel__grid">
                  <Controls lists={controls} labels={controlLabels} />
                  {Setup && <Setup value={options} onChange={setOptions} />}
                </div>
                <div className="game-panel__actions">
                  <button type="button" className="game-btn game-btn--primary" onClick={play}>
                    <Icon name="play" />
                    {options?.playLabel || 'Play'}
                  </button>
                  {best > 0 && (
                    <p className="game-panel__best">
                      {game.score} <strong>{fmt(best)}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {phase === 'playing' && dialog && <GameDialog dialog={dialog} onChoose={choose} />}

          {phase === 'paused' && (
            <div className="game-overlay">
              <div className="game-panel game-panel--compact">
                <h2 className="game-panel__title">Paused</h2>
                <Controls lists={controls.slice(0, 1)} labels={controlLabels.slice(0, 1)} />
                <div className="game-panel__actions">
                  <button type="button" className="game-btn game-btn--primary" onClick={resume}>
                    <Icon name="play" />
                    Resume
                  </button>
                  <button type="button" className="game-btn" onClick={play}>
                    <Icon name="restart" />
                    Restart
                  </button>
                  <Link to="/games" className="game-btn game-btn--quiet">
                    All games
                  </Link>
                </div>
              </div>
            </div>
          )}

          {phase === 'over' && result && (
            <div className="game-overlay game-overlay--over">
              <div className={`game-panel game-panel--compact${Setup ? ' game-panel--sticky' : ''}`}>
                <p className={`game-panel__eyebrow${result.win ? ' is-win' : ''}`}>{result.subtitle || game.title}</p>
                <h2 className="game-panel__title">{result.title}</h2>
                {(result.score !== undefined || result.scoreText) && (
                  <p className="game-score">
                    <span className="game-score__value">{result.scoreText || fmt(result.score)}</span>
                    <span className="game-score__label">{result.scoreLabel || 'Score'}</span>
                  </p>
                )}
                {result.stats?.length > 0 && (
                  <dl className="game-stats">
                    {result.stats.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="game-panel__best">
                  {result.isNew ? <span className="game-badge">New best</span> : null}
                  {result.bestText || (
                    <>
                      {game.score} <strong>{fmt(result.best)}</strong>
                    </>
                  )}
                </p>
                {Setup && <Setup value={options} onChange={setOptions} compact />}
                <div className="game-panel__actions">
                  <button type="button" className="game-btn game-btn--primary" onClick={play}>
                    <Icon name="restart" />
                    {options?.againLabel || 'Play again'}
                  </button>
                  <Link to="/games" className="game-btn game-btn--quiet">
                    All games
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GameDialog({ dialog, onChoose }) {
  const first = useRef(null);
  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, [dialog]);
  const body = Array.isArray(dialog.body) ? dialog.body : dialog.body ? [dialog.body] : [];
  let firstEnabled = false;
  return (
    <div className="game-dialog">
      <div className="game-dialog__panel" role="dialog" aria-labelledby="game-dialog-title">
        {dialog.eyebrow && <p className="game-panel__eyebrow">{dialog.eyebrow}</p>}
        <h2 id="game-dialog-title" className="game-dialog__title">
          {dialog.title}
        </h2>
        {body.map((t) => (
          <p key={t} className="game-dialog__text">
            {t}
          </p>
        ))}
        {dialog.rows?.length > 0 && (
          <dl className="game-dialog__rows">
            {dialog.rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="game-dialog__choices">
          {dialog.choices.map((c, i) => {
            const isFirst = !c.disabled && !firstEnabled;
            if (isFirst) firstEnabled = true;
            return (
              <button
                key={c.id}
                ref={isFirst ? first : undefined}
                type="button"
                className={`game-choice${c.primary ? ' is-primary' : ''}`}
                disabled={c.disabled}
                onClick={() => onChoose(c.id)}
              >
                <span className="game-choice__key" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="game-choice__label">
                  {c.label}
                  {c.hint && <small>{c.hint}</small>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Controls({ lists, labels }) {
  return (
    <div className="game-controls">
      {lists.map((items, i) => (
        <div key={labels[i]} className="game-controls__group">
          <p className="game-controls__label">{labels[i]}</p>
          <ul>
            {items.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function GameLoadingOverlay() {
  return (
    <div className="game-overlay game-overlay--loading" role="status">
      <span className="game-spinner" aria-hidden="true" />
      <span>Loading game</span>
    </div>
  );
}
