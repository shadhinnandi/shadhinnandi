import { useEffect, useState } from 'react';

const interactiveSelector = 'a, button, [role="button"], [tabindex]:not([tabindex="-1"]), summary';
const editableSelector = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const magneticSelector = '[data-cursor-magnetic]';

function isEditableTarget(target) {
  return target instanceof Element && Boolean(target.closest(editableSelector));
}

function getPointerState(target) {
  if (!(target instanceof Element)) {
    return { interactive: false, editable: false, magnetic: null };
  }

  const editable = isEditableTarget(target);
  const interactive = !editable && Boolean(target.closest(interactiveSelector));
  const magnetic = editable ? null : target.closest(magneticSelector);

  return { interactive, editable, magnetic };
}

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia('(pointer: fine)');
    const updateAvailability = () => setEnabled(pointerQuery.matches);

    updateAvailability();
    pointerQuery.addEventListener?.('change', updateAvailability);
    return () => pointerQuery.removeEventListener?.('change', updateAvailability);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const root = document.documentElement;
    const dot = document.querySelector('.custom-cursor__dot');
    const field = document.querySelector('.custom-cursor__field');

    if (!dot || !field) return undefined;

    const pointer = { x: 0, y: 0 };
    const dotPosition = { x: 0, y: 0 };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let hasPointer = false;
    let selectionActive = false;
    let magneticElement = null;

    const resetMagneticElement = () => {
      if (magneticElement) {
        magneticElement.style.translate = '';
        magneticElement = null;
      }
    };

    const updateMagneticPosition = (element) => {
      if (!element || reducedMotion) {
        resetMagneticElement();
        return;
      }

      const bounds = element.getBoundingClientRect();
      const x = Math.max(-4, Math.min(4, pointer.x - (bounds.left + bounds.width / 2)));
      const y = Math.max(-4, Math.min(4, pointer.y - (bounds.top + bounds.height / 2)));
      element.style.translate = `${x}px ${y}px`;
      magneticElement = element;
    };

    const updateClasses = (target) => {
      const state = getPointerState(target);
      root.classList.toggle('custom-cursor--interactive', state.interactive);
      root.classList.toggle('custom-cursor--native', state.editable || selectionActive);
      updateMagneticPosition(state.magnetic);
    };

    const animate = () => {
      if (reducedMotion) {
        dotPosition.x = pointer.x;
        dotPosition.y = pointer.y;
      } else {
        dotPosition.x += (pointer.x - dotPosition.x) * 0.14;
        dotPosition.y += (pointer.y - dotPosition.y) * 0.14;
      }

      dot.style.transform = `translate3d(${dotPosition.x}px, ${dotPosition.y}px, 0)`;
      field.style.setProperty('--cursor-x', `${dotPosition.x}px`);
      field.style.setProperty('--cursor-y', `${dotPosition.y}px`);

      frame = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!hasPointer) {
        dotPosition.x = pointer.x;
        dotPosition.y = pointer.y;
        hasPointer = true;
        root.classList.add('custom-cursor--visible');
      }
      updateClasses(event.target);
    };

    const onSelectionChange = () => {
      selectionActive = !window.getSelection()?.isCollapsed;
      root.classList.toggle('custom-cursor--native', selectionActive);
    };

    root.classList.add('has-custom-cursor');
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('selectionchange', onSelectionChange);
    frame = window.requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('selectionchange', onSelectionChange);
      window.cancelAnimationFrame(frame);
      resetMagneticElement();
      root.classList.remove(
        'has-custom-cursor',
        'custom-cursor--visible',
        'custom-cursor--interactive',
        'custom-cursor--native',
      );
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div className="custom-cursor__field" />
      <div className="custom-cursor__dot" />
    </div>
  );
}
