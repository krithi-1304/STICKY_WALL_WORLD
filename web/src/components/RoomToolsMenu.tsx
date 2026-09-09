import { useEffect, useRef, useState } from 'react';

interface Props {
  onAdd: () => void;
  onTidy: () => void;
  onSort: (direction: 'asc' | 'desc') => void;
}

export function RoomToolsMenu({ onAdd, onTidy, onSort }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', escape); };
  }, [open]);

  const action = (callback: () => void) => { callback(); setOpen(false); };

  return (
    <div className="room-tools" ref={ref}>
      <button className="room-tools__trigger" type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((current) => !current)}>
        Tools <span aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="room-tools__menu" role="menu" aria-label="Room tools">
          <button type="button" role="menuitem" onClick={() => action(onAdd)}>＋ Pin note</button>
          <button type="button" role="menuitem" onClick={() => action(onTidy)}>✦ Tidy wall</button>
          <button type="button" role="menuitem" onClick={() => action(() => onSort('asc'))}>↑ Oldest first</button>
          <button type="button" role="menuitem" onClick={() => action(() => onSort('desc'))}>↓ Newest first</button>
        </div>
      )}
    </div>
  );
}
