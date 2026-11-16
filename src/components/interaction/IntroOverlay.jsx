import { useEffect, useRef, useState } from 'react';

const INTRO_SEEN_KEY = 'shadhinnandi-intro-seen';
const INITIAL_PAUSE = 2000;
const PROGRESS_DURATION = 3000;
const REDUCED_DURATION = 240;

function shouldShowIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

function pageReady() {
  const fontsReady = document.fonts?.ready || Promise.resolve();
  const windowReady =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));

  return Promise.all([fontsReady, windowReady]);
}

export default function IntroOverlay() {
  const [visible, setVisible] = useState(shouldShowIntro);
  const [exiting, setExiting] = useState(false);
  const progressRef = useRef(null);
  const percentageRef = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pauseDuration = reducedMotion ? 0 : INITIAL_PAUSE;
    const progressDuration = reducedMotion ? REDUCED_DURATION : PROGRESS_DURATION;
    const startedAt = performance.now();
    let frame = 0;
    let removeTimer;
    let ready = false;

    root.classList.add('intro-active');

    pageReady().then(() => {
      ready = true;
    });

    const updateProgress = (now) => {
      const elapsed = now - startedAt;
      const progressElapsed = Math.max(0, elapsed - pauseDuration);
      const timeProgress = Math.min(1, progressElapsed / progressDuration);
      const progress = ready ? timeProgress : timeProgress * 0.92;
      const percentage = Math.round(progress * 100);

      if (progressRef.current) progressRef.current.style.width = `${percentage}%`;
      if (percentageRef.current) percentageRef.current.textContent = `${percentage}%`;

      if (ready && timeProgress >= 1) {
        try {
          window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
        } catch {
          // The introduction remains functional when session storage is unavailable.
        }
        setExiting(true);
        removeTimer = window.setTimeout(() => setVisible(false), reducedMotion ? 0 : 520);
        return;
      }

      frame = window.requestAnimationFrame(updateProgress);
    };

    frame = window.requestAnimationFrame(updateProgress);

    return () => {
      root.classList.remove('intro-active');
      window.cancelAnimationFrame(frame);
      window.clearTimeout(removeTimer);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) document.documentElement.classList.remove('intro-active');
  }, [visible]);

  if (!visible) return null;

  return (
    <section className={`intro-overlay${exiting ? ' is-exiting' : ''}`} aria-label="Portfolio introduction">
      <div className="intro-overlay__content">
        <p className="intro-overlay__eyebrow">Portfolio / 2026</p>
        <h1 className="intro-overlay__name">Shadhin Nandi</h1>
        <p className="intro-overlay__descriptor">Computer Science &amp; Engineering</p>
        <ul className="intro-overlay__roles" aria-label="Professional roles">
          <li>Undergraduate Teaching Assistant</li>
          <li>Software Developer</li>
          <li>Bioinformatics Researcher</li>
        </ul>
      </div>

      <div className="intro-overlay__progress" aria-live="polite">
        <div className="intro-overlay__progress-head">
          <span>Initializing portfolio</span>
          <span ref={percentageRef}>0%</span>
        </div>
        <div className="intro-overlay__track" aria-hidden="true">
          <span ref={progressRef} />
        </div>
      </div>
    </section>
  );
}
