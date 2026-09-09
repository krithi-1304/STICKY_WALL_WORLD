import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useWall, selectRoomBySlug, selectStickiesForRoom } from '../state/wall';
import { StickyNote } from '../components/StickyNote';
import { WebGLTorchField } from '../components/WebGLTorchField';
import { WritingStylePicker } from '../components/WritingStylePicker';
import { RoomToolsMenu } from '../components/RoomToolsMenu';

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
  const deleteSticky = useWall((s) => s.deleteSticky);
  const deleteStickies = useWall((s) => s.deleteStickies);
  const updateRoom = useWall((s) => s.updateRoom);

  const wallRef = useRef<HTMLDivElement>(null);
  const [wallBounds, setWallBounds] = useState({ w: 900, h: 600 });
  const [newId, setNewId] = useState<string | null>(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightOn, setLightOn] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [lightPulse, setLightPulse] = useState(false);
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const marqueeActive = useRef(false);

  useLayoutEffect(() => {
    const element = wallRef.current;
    if (!element) return;
    const updateBounds = () => setWallBounds({ w: element.clientWidth, h: element.clientHeight });
    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(element);
    return () => observer.disconnect();
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

  const viewMode = focusedId ? 'reading' : lightOn ? 'lantern' : 'night';

  const wallSize = () => {
    const el = wallRef.current;
    return { w: el ? el.clientWidth : 900, h: el ? el.clientHeight : 600 };
  };

  function onAdd() {
    if (!room) return;
    const sticky = addSticky(room.id, wallSize());
    if (sticky) {
      setLightOn(true);
      setFocusedId(sticky.id);
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
    deleteStickies([...selected], wallSize());
    setSelected(new Set());
  }

  function onDeleteSticky(id: string) {
    deleteSticky(id, wallSize());
    setSelected((previous) => {
      const next = new Set(previous);
      next.delete(id);
      return next;
    });
  }

  function onOpenWordNote(id: string) {
    setLightOn(true);
    setFocusedId(id);
    setNewId(id);
    window.setTimeout(() => setNewId(null), 500);
  }

  // --- marquee: drag on empty wall gathers notes -------------------------
  function onWallPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('.sticky')) return;
    setFocusedId(null);
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

  const wallWidth = wallBounds.w;
  const wallHeight = wallBounds.h;
  const wallColumns = Math.max(1, Math.floor((wallWidth - 48) / 320));
  const wallRows = Math.ceil(stickies.length / wallColumns);
  const wallContentHeight = Math.max(wallHeight, 56 + wallRows * 320 + 56);

  return (
    <main className={`room ${lightOn ? 'room--lit' : 'room--dark'}${lightPulse ? ' room--light-pulse' : ''}`}>
      <div className={`room__topbar${chromeVisible ? '' : ' room__topbar--dim'}`}>
        <Link to="/" className="room__back">← Lobby</Link>
        <h2 className="room__title">{room.name}</h2>
        <div className="room__actions">
          {selected.size > 0 && (
            <button className="icon-btn" onClick={onDeleteSelected} title="Delete selected">
              🗑 {selected.size}
            </button>
          )}
          <WritingStylePicker value={room.fontId} onChange={(fontId) => updateRoom(room.id, { fontId })} />
          <button
            className={`wall-switch${lightOn ? ' wall-switch--on' : ''}`}
            type="button"
            aria-pressed={lightOn}
            aria-label={lightOn ? 'Turn room light off' : 'Turn room light on'}
            title={lightOn ? 'Turn light off' : 'Turn light on'}
            onClick={() => {
              setLightOn((current) => {
                if (current) {
                  setFocusedId(null);
                } else {
                  setLightPulse(true);
                  window.setTimeout(() => setLightPulse(false), 900);
                }
                return !current;
              });
            }}
          >
            <span className="wall-switch__plate" aria-hidden="true">
              <span className="wall-switch__lever" />
            </span>
            <span className="wall-switch__label">{lightOn ? 'lit' : 'dark'}</span>
          </button>
          <RoomToolsMenu onAdd={onAdd} onTidy={onTidy} onSort={onSort} />
        </div>
      </div>

      <div
        className="wall"
        ref={wallRef}
        onPointerDown={onWallPointerDown}
        onPointerMove={onWallPointerMove}
        onPointerUp={onWallPointerUp}
      >
        <WebGLTorchField active lit={lightOn} />
        {lightPulse && <span className="wall__light-burst" aria-hidden="true" />}
        <div className="wall__inner" style={{ minHeight: wallContentHeight }}>
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
              onDelete={onDeleteSticky}
              viewMode={focusedId === sticky.id ? 'reading' : viewMode === 'reading' ? 'lantern' : viewMode}
              onOpen={onOpenWordNote}
            />
          ))}
          {marqueeStyle && <div className="wall__marquee" style={marqueeStyle} />}
        </div>
      </div>
    </main>
  );
}
