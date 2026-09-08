import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useWall } from '../state/wall';
import { HAND_FONTS, STICKY_COLORS, STICKY_LIMITS } from '../domain/types';
import type { Sticky } from '../domain/types';

interface Props {
  sticky: Sticky;
  isNew: boolean;
  fontId: string;
  selected: boolean;
  onSelectToggle: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode: 'words' | 'notes';
  onOpen: (id: string) => void;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/**
 * A sticky note — real paper, washi tape, a date tag hanging by thread.
 * Drag to move · click ↗ to hold it up close · shift-click to select.
 */
export function StickyNote({ sticky, isNew, fontId, selected, onSelectToggle, onDelete, viewMode, onOpen }: Props) {
  const updateSticky = useWall((s) => s.updateSticky);
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [swing, setSwing] = useState(0);
  const lastX = useRef(0);

  const color = STICKY_COLORS.find((c) => c.id === sticky.color) ?? STICKY_COLORS[0];
  const font = HAND_FONTS.find((f) => f.id === fontId) ?? HAND_FONTS[0];
  const wordMode = viewMode === 'words';
  const words = sticky.body.trim().split(/\s+/).filter(Boolean).slice(0, 18);

  useEffect(() => {
    if (isNew) {
      const ta = ref.current?.querySelector('textarea');
      ta?.focus();
    }
  }, [isNew]);

  // Escape closes the maximized view.
  useEffect(() => {
    if (!maximized) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMaximized(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [maximized]);

  function onPointerDown(e: React.PointerEvent) {
    if (e.shiftKey) {
      onSelectToggle(sticky.id);
      return;
    }
    if ((e.target as HTMLElement).closest('textarea, .sticky__delete, .sticky__zoom')) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = ref.current!.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    lastX.current = e.clientX;
    setSwing(0);
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const wall = ref.current!.parentElement!.getBoundingClientRect();
    const x = e.clientX - wall.left - dragOffset.current.x;
    const y = e.clientY - wall.top - dragOffset.current.y;
    const vx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setSwing(Math.max(-4, Math.min(4, -vx * 0.35)));
    updateSticky(sticky.id, { x, y });
  }

  function onPointerUp() {
    setDragging(false);
    setSwing(0);
  }

  function onClick(e: React.MouseEvent) {
    if (wordMode && !(e.target as HTMLElement).closest('button, textarea')) onOpen(sticky.id);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      updateSticky(sticky.id, { x: sticky.x + dx, y: sticky.y + dy });
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if ((e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        onDelete(sticky.id);
      }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setMaximized(true);
    }
  }

  return (
    <>
      <div
        ref={ref}
        className={
          `sticky sticky--tape-${sticky.tape}` +
          `${wordMode ? ' sticky--word-mode' : ''}` +
          `${dragging ? ' sticky--dragging' : ''}` +
          `${isNew ? ' sticky--new' : ''}` +
          `${selected ? ' sticky--selected' : ''}`
        }
        role="note"
        aria-label="Sticky note"
        aria-pressed={selected}
        tabIndex={0}
        style={{
          left: sticky.x,
          top: sticky.y,
          width: sticky.w,
          height: sticky.h,
          zIndex: dragging ? 60 : sticky.zIndex,
          background: wordMode ? 'rgba(14, 13, 14, 0.82)' : color.paper,
          ['--note-paper' as string]: color.paper,
          ['--note-ink' as string]: wordMode ? '#eee8dc' : color.ink,
          ['--tape-tilt' as string]: `${sticky.tapeTilt}deg`,
          transform: `rotate(${sticky.rotation + (dragging ? swing : 0)}deg) scale(${dragging ? 1.03 : 1})`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        onKeyDown={onKeyDown}
      >
        <span className="sticky__tape" />
        {wordMode && (
          <span className="sticky__word-cloud" aria-label={sticky.body || 'Empty note'}>
            {words.length > 0 ? words.map((word, index) => {
              const column = index % 3;
              const row = Math.floor(index / 3);
              const tilt = ((index * 17) % 11) - 5;
              return (
                <span
                  key={`${word}-${index}`}
                  className="sticky__word"
                  style={{
                    left: `${18 + column * 31}%`,
                    top: `${18 + row * 15}%`,
                    transform: `rotate(${tilt}deg)`,
                  }}
                >
                  {word}
                </span>
              );
            }) : <span className="sticky__word sticky__word--empty">A quiet space</span>}
          </span>
        )}
        <textarea
          className="sticky__body"
          value={sticky.body}
          placeholder="Write…"
          maxLength={STICKY_LIMITS.maxBodyLength}
          onChange={(e) => updateSticky(sticky.id, { body: e.target.value })}
          style={{ fontFamily: font.stack, fontSize: font.size }}
        />
        <span className="sticky__date">{formatDate(sticky.createdAt)}</span>
        <button
          className="sticky__zoom"
          aria-label="Hold note up close"
          title="Maximize"
          onClick={() => setMaximized(true)}
        >
          ⤢
        </button>
        <button
          className="sticky__delete"
          aria-label="Remove note"
        onClick={() => onDelete(sticky.id)}
        >
          ×
        </button>
      </div>

      {maximized &&
        createPortal(
          <div
            className="note-overlay"
            role="dialog"
            aria-label="Note, maximized"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMaximized(false);
            }}
          >
            <div className="note-overlay__paper" style={{ background: color.paper, ['--note-ink' as string]: color.ink }}>
              <span className={`sticky__tape note-overlay__tape sticky--tape-${sticky.tape}`} />
              <button
                className="note-overlay__close"
                aria-label="Close"
                onClick={() => setMaximized(false)}
              >
                ×
              </button>
              <textarea
                className="note-overlay__body"
                value={sticky.body}
                placeholder="Write…"
                maxLength={STICKY_LIMITS.maxBodyLength}
                style={{ fontFamily: font.stack }}
                onChange={(e) => updateSticky(sticky.id, { body: e.target.value })}
              />
              <span className="note-overlay__date">{formatDate(sticky.createdAt)}</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
