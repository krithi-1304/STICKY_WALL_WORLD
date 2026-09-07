import { useState } from 'react';
import { useWall } from '../state/wall';
import { RoomTag } from '../components/RoomTag';
import { searchRooms } from '../domain/search';

/** Lobby: a dark wall of hanging room tags, revealed through mist. */
export function Lobby() {
  const rooms = useWall((s) => s.rooms);
  const [query, setQuery] = useState('');
  const sorted = [...rooms].sort((a, b) => b.updatedAt - a.updatedAt);
  const visibleRooms = searchRooms(sorted, query);

  return (
    <main className="lobby mist">
      <header className="lobby__header">
        <h1 className="lobby__title">The Black Wall</h1>
        <p className="lobby__subtitle">Choose a room. Hang a thought.</p>
        {rooms.length > 0 && (
          <label className="lobby__search">
            <span className="lobby__search-icon" aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a room…"
              aria-label="Search rooms"
              type="search"
            />
            {query && <span className="lobby__search-count">{visibleRooms.length}</span>}
          </label>
        )}
      </header>

      {rooms.length === 0 ? (
        <div className="lobby__empty">
          <div className="lobby__rail">
            <RoomTag isNew />
          </div>
        </div>
      ) : visibleRooms.length === 0 ? (
        <div className="lobby__empty lobby__empty--search" role="status">
          <p>No room feels like “{query}” yet.</p>
          <button type="button" onClick={() => setQuery('')}>Show every room</button>
        </div>
      ) : (
        <div className="lobby__rail">
          {visibleRooms.map((room) => (
            <RoomTag key={room.id} room={room} />
          ))}
          <RoomTag isNew />
        </div>
      )}
    </main>
  );
}
