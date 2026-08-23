import { useWall } from '../state/wall';
import { RoomTag } from '../components/RoomTag';

/** Lobby: a dark wall of hanging room tags. */
export function Lobby() {
  const rooms = useWall((s) => s.rooms);
  const sorted = [...rooms].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <main className="lobby">
      <header className="lobby__header">
        <h1 className="lobby__title">The Black Wall</h1>
        <p className="lobby__subtitle">Choose a room. Hang a thought.</p>
      </header>

      {sorted.length === 0 ? (
        <div className="lobby__empty">
          <div className="lobby__rail">
            <RoomTag isNew />
          </div>
        </div>
      ) : (
        <div className="lobby__rail">
          {sorted.map((room) => (
            <RoomTag key={room.id} room={room} />
          ))}
          <RoomTag isNew />
        </div>
      )}
    </main>
  );
}
