import { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useWall, selectRoomBySlug, selectStickiesForRoom } from '../state/wall';
import { StickyNote } from '../components/StickyNote';
import { HAND_FONTS } from '../domain/types';

const CALM_WORDS = ['breathe', 'slow', 'here', 'enough', 'softly', 'still'];

interface Marquee {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A room: black wall, title, + to pin. Drag empty wall to gather notes. */
export function Room() {
  const { slug = '' } = useParams();
  const room = useWall(selectRoomBySlug(slug));
  const stickies = useWall(useShallow(selectStickiesForRoom(room?.id ?? '')));
  const addSticky = useWall((s) => s.addSticky);
  const tidyRoom = useWall((s) => s.tidyRoom);
  const sortRoom = useWall((s) => s.sortRoom);
  const deleteStickies = useWall((s) => s.deleteStickies);
  const updateRoom = useWall((s) => s.updateRoom);

  const wallRef = useRef<HTMLDivElement>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const marqueeActive = useRef(false);
  const fogRef = useRef<HTMLDivElement>(null);

  // Fog drifts behind the pointer — eased, never instant.
  useEffect(() => {
    const el = fogRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // One calm word per visit — chosen once, lazily.
  const [calmWord] = useState(
    () => CALM_WORDS[Math.floor(Math.random() * CALM_WORDS.length)],
  );

  useEffect(() => {
    function wake() {
      setChromeVisible(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setChromeVisible(false), 2500);
    }
    wake();
    window.addEventListener('pointermove', wake);
    return () => {
      window.removeEventListener('pointermove', wake);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  if (!room) return <Navigate to="/" replace />;

  const wallSize = () => {
    const el = wallRef.current;
    return { w: el ? el.clientWidth : 900, h: el ? el.clientHeight : 600 };
  };

  function onAdd() {
    if (!room) return;
    const sticky = addSticky(room.id, wallSize());
    if (sticky) {
      setNewId(sticky.id);
      setTimeout(() => setNewId(null), 400);
    }
  }

  function onTidy() {
    if (!room) return;
    tidyRoom(room.id, wallSize());
  }

  function onSort(dir: 'asc' | 'desc') {
    if (!room) return;
    sortRoom(room.id, wallSize(), dir);
  }

  function onSelectToggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onDeleteSelected() {
    if (selected.size === 0) return;
    deleteStickies([...selected]);
    setSelected(new Set());
  }

  // --- marquee: drag on empty wall gathers notes -------------------------
  function onWallPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('.sticky')) return;
    const wall = wallRef.current!.getBoundingClientRect();
    marqueeActive.current = true;
    const x = e.clientX - wall.left;
    const y = e.clientY - wall.top;
    setMarquee({ x0: x, y0: y, x1: x, y1: y });
    if (!e.shiftKey) setSelected(new Set());
  }

  function onWallPointerMove(e: React.PointerEvent) {
    if (!marqueeActive.current || !marquee) return;
    const wall = wallRef.current!.getBoundingClientRect();
    const next = { ...marquee, x1: e.clientX - wall.left, y1: e.clientY - wall.top };
    setMarquee(next);

    const [mx0, mx1] = [Math.min(next.x0, next.x1), Math.max(next.x0, next.x1)];
    const [my0, my1] = [Math.min(next.y0, next.y1), Math.max(next.y0, next.y1)];
    const hit = stickies
      .filter((s) => s.x < mx1 && s.x + s.w > mx0 && s.y < my1 && s.y + s.h > my0)
      .map((s) => s.id);
    setSelected(new Set(hit));
  }

  function onWallPointerUp() {
    marqueeActive.current = false;
    setMarquee(null);
  }

  const marqueeStyle = marquee
    ? {
        left: Math.min(marquee.x0, marquee.x1),
        top: Math.min(marquee.y0, marquee.y1),
        width: Math.abs(marquee.x1 - marquee.x0),
        height: Math.abs(marquee.y1 - marquee.y0),
      }
    : undefined;

  return (
    <main className="room">
      <div className={`room__topbar${chromeVisible ? '' : ' room__topbar--dim'}`}>
        <Link to="/" className="room__back">← Lobby</Link>
        <h2 className="room__title">{room.name}</h2>
        <div className="room__actions">
          {selected.size > 0 && (
            <button className="icon-btn" onClick={onDeleteSelected} title="Delete selected">
              🗑 {selected.size}
            </button>
          )}
          <div className="font-pick" role="group" aria-label="Note handwriting">
            {HAND_FONTS.map((f) => (
              <button
                key={f.id}
                className="font-pick__btn"
                style={{ fontFamily: f.stack }}
                aria-pressed={room.fontId === f.id}
                title={f.label}
                onClick={() => updateRoom(room.id, { fontId: f.id })}
              >
                Aa
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={() => onSort('asc')} title="Sort: oldest first">↑ old</button>
          <button className="icon-btn" onClick={() => onSort('desc')} title="Sort: newest first">↓ new</button>
          <button className="icon-btn" onClick={onTidy} title="Tidy the wall">Tidy</button>
          <button className="icon-btn" onClick={onAdd} aria-label="Add sticky note" title="Pin a note">+</button>
        </div>
      </div>

      <div
        className="wall"
        ref={wallRef}
        onPointerDown={onWallPointerDown}
        onPointerMove={onWallPointerMove}
        onPointerUp={onWallPointerUp}
      >
        <div className="wall__inner">
          {stickies.length === 0 && (
            <>
              <p className="wall__hint">Pin your first note</p>
              <span className="wall__calm" style={{ top: '30%', left: '20%' }}>{calmWord}</span>
            </>
          )}
          {stickies.map((sticky) => (
            <StickyNote
              key={sticky.id}
              sticky={sticky}
              isNew={sticky.id === newId}
              fontId={room.fontId}
              selected={selected.has(sticky.id)}
              onSelectToggle={onSelectToggle}
            />
          ))}
          {marqueeStyle && <div className="wall__marquee" style={marqueeStyle} />}
        </div>
      </div>
    </main>
  );
}
