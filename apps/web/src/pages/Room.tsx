import { useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useWall, selectRoomBySlug, selectStickiesForRoom } from '../state/wall';
import { StickyNote } from '../components/StickyNote';

/** A room: black wall, title, + to pin notes. */
export function Room() {
  const { slug = '' } = useParams();
  const room = useWall(selectRoomBySlug(slug));
  const stickies = useWall(useShallow(selectStickiesForRoom(room?.id ?? '')));
  const addSticky = useWall((s) => s.addSticky);
  const wallRef = useRef<HTMLDivElement>(null);
  const [newId, setNewId] = useState<string | null>(null);

  if (!room) return <Navigate to="/" replace />;

  function onAdd() {
    if (!room) return;
    // Pin near the visual center of the wall, slightly scattered.
    const wall = wallRef.current;
    const cx = wall ? wall.clientWidth / 2 : 400;
    const cy = wall ? wall.clientHeight / 2 : 300;
    const sticky = addSticky(room.id, {
      x: cx - 100 + (Math.random() * 120 - 60),
      y: cy - 100 + (Math.random() * 120 - 60),
    });
    if (sticky) {
      setNewId(sticky.id);
      setTimeout(() => setNewId(null), 400);
    }
  }

  return (
    <main className="room">
      <div className="room__topbar">
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
