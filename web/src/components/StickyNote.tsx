import { useEffect, useRef, useState } from 'react';
import { useWall } from '../state/wall';
import { HAND_FONTS, STICKY_COLORS, STICKY_LIMITS } from '../domain/types';
import type { Sticky } from '../domain/types';

interface Props {
  sticky: Sticky;
  isNew: boolean;
  fontId: string;
  selected: boolean;
  onSelectToggle: (id: string) => void;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/**
 * A sticky note on the wall — real paper, washi tape, a small date tag.
 * Drag to move; click to edit; arrows nudge; shift-click adds to selection.
 */
export function StickyNote({ sticky, isNew, fontId, selected, onSelectToggle }: Props) {
  const updateSticky = useWall((s) => s.updateSticky);
  const deleteSticky = useWall((s) => s.deleteSticky);
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [swing, setSwing] = useState(0);
  const lastX = useRef(0);

  const color = STICKY_COLORS.find((c) => c.id === sticky.color) ?? STICKY_COLORS[0];
  const font = HAND_FONTS.find((f) => f.id === fontId) ?? HAND_FONTS[0];

  useEffect(() => {
    if (isNew) {
      const ta = ref.current?.querySelector('textarea');
      ta?.focus();
    }
  }, [isNew]);

  function onPointerDown(e: React.PointerEvent) {
    // Shift-click toggles selection instead of dragging.
    if (e.shiftKey) {
      onSelectToggle(sticky.id);
      return;
    }
    if ((e.target as HTMLElement).closest('textarea, .sticky__delete')) return;
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
        deleteSticky(sticky.id);
      }
    }
  }

  return (
    <div
      ref={ref}
      className={
        `sticky sticky--tape-${sticky.tape}` +
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
        background: color.paper,
        ['--note-ink' as string]: color.ink,
        ['--tape-tilt' as string]: `${sticky.tapeTilt}deg`,
        transform: `rotate(${sticky.rotation + (dragging ? swing : 0)}deg) scale(${dragging ? 1.03 : 1})`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <span className="sticky__tape" />
      <textarea
        className="sticky__body"
        value={sticky.body}
        placeholder="Write…"
        maxLength={STICKY_LIMITS.maxBodyLength}
        onChange={(e) => updateSticky(sticky.id, { body: e.target.value })}
        style={{ fontFamily: font.stack, fontSize: font.size }}
      />
      <span className="sticky__date" aria-hidden="true">{formatDate(sticky.createdAt)}</span>
      <button
        className="sticky__delete"
        aria-label="Remove note"
        onClick={() => deleteSticky(sticky.id)}
      >
        ×
      </button>
    </div>
  );
}
