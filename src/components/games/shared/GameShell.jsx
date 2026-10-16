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
    api.over(result)   ends the run: { title, score, scoreLabel?, stats?: [[label, value]], win?, best? }

  The engine provides:
    reset()                    start a fresh run
    update(dt)                 one fixed step of gameplay (only while playing)
    render(ctx, w, h, time)    draw a frame (w, h in CSS pixels)
    idle?(dt)                  background animation behind the start screen
    destroy?()                 release anything the engine holds
*/

const STEP = 1 / 120;
const MAX_STEPS = 12;

export default function GameShell({ game, create, cursor = 'default' }) {
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

  const setPhase = useCallback((p) => {
    phaseRef.current = p;
    setPhaseState(p);
    const a = api.current;
    if (!a) return;
    a.input.setEnabled(p === 'playing');
    a.kick();
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
        setPhase('over');
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
  }, [create, game.slug]);

  const play = useCallback(() => {
    const a = api.current;
    if (!a) return;
    a.engine.reset();
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
    const onVisibility = () => document.hidden && pause();
    const onBlur = () => pause();
    const onPointer = (e) => {
      if (phaseRef.current === 'playing' && !frameRef.current?.contains(e.target)) pause();
    };
    const onKey = (e) => {
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
      const p = phaseRef.current;
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
  }, [pause, resume, play]);

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
              <div className="game-panel">
                <p className="game-panel__eyebrow">{game.genre}</p>
                <h2 className="game-panel__title">{game.title}</h2>
                <p className="game-panel__text">{game.summary}</p>
                <Controls lists={controls} labels={controlLabels} />
                <div className="game-panel__actions">
                  <button type="button" className="game-btn game-btn--primary" onClick={play}>
                    <Icon name="play" />
                    Play
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
              <div className="game-panel game-panel--compact">
                <p className={`game-panel__eyebrow${result.win ? ' is-win' : ''}`}>{result.subtitle || game.title}</p>
                <h2 className="game-panel__title">{result.title}</h2>
                {result.score !== undefined && (
                  <p className="game-score">
                    <span className="game-score__value">{fmt(result.score)}</span>
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
                  {game.score} <strong>{fmt(result.best)}</strong>
                </p>
                <div className="game-panel__actions">
                  <button type="button" className="game-btn game-btn--primary" onClick={play}>
                    <Icon name="restart" />
                    Play again
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
