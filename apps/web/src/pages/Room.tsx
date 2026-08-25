import { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useWall, selectRoomBySlug, selectStickiesForRoom } from '../state/wall';
import { StickyNote } from '../components/StickyNote';

/** A room: black wall, title, + to pin notes. Chrome recedes when idle. */
export function Room() {
  const { slug = '' } = useParams();
  const room = useWall(selectRoomBySlug(slug));
  const stickies = useWall(useShallow(selectStickiesForRoom(room?.id ?? '')));
  const addSticky = useWall((s) => s.addSticky);
  const wallRef = useRef<HTMLDivElement>(null);
  const [newId, setNewId] = useState<string | null>(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chrome fades after 2.5s idle — the wall is the content.
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

  function onAdd() {
    if (!room) return;
    // Pin somewhere in the wall's middle band — scattered, not stacked.
    const wall = wallRef.current;
    const W = wall ? wall.clientWidth : 800;
    const H = wall ? wall.clientHeight : 600;
    const sticky = addSticky(room.id, {
      x: W * 0.18 + Math.random() * W * 0.64 - 100,
      y: H * 0.14 + Math.random() * H * 0.60 - 100,
    });
    if (sticky) {
      setNewId(sticky.id);
      setTimeout(() => setNewId(null), 400);
    }
  }

  return (
    <main className="room">
      <div className={`room__topbar${chromeVisible ? '' : ' room__topbar--dim'}`}>
        <Link to="/" className="room__back">← Lobby</Link>
        <h2 className="room__title">{room.name}</h2>
        <div className="room__actions">
          <button
            className="icon-btn"
            onClick={onAdd}
            aria-label="Add sticky note"
            title="Pin a note"
          >
            +
          </button>
        </div>
      </div>

      <div className="wall" ref={wallRef}>
        <div className="wall__inner">
          {stickies.length === 0 && (
            <p className="wall__hint">Pin your first note</p>
          )}
          {stickies.map((sticky) => (
            <StickyNote
              key={sticky.id}
              sticky={sticky}
              isNew={sticky.id === newId}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
