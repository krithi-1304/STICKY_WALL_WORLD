import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWall } from '../state/wall';
import { RoomTag } from '../components/RoomTag';
import { searchRooms } from '../domain/search';
import { symbolForName } from '../domain/symbols';

/** Lobby: a dark wall of hanging room tags, revealed through mist. */
export function Lobby() {
  const rooms = useWall((s) => s.rooms);
  const createRoom = useWall((s) => s.createRoom);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const sorted = [...rooms].sort((a, b) => b.updatedAt - a.updatedAt);
  const visibleRooms = searchRooms(sorted, query);

  function createFromSearch() {
    const name = query.trim();
    if (!name) return;
    const room = createRoom({ name, symbol: symbolForName(name) });
    navigate(`/r/${room.slug}`);
  }

  return (
    <main className="lobby mist">
      <div className="lobby__moon" aria-hidden="true" />
      <header className="lobby__header">
        <div className="lobby__stamp"><span>✦</span> archive / 01</div>
        <p className="lobby__eyebrow">The Night Archive</p>
        <h1 className="lobby__title">Rooms for thoughts that stay.</h1>
        <p className="lobby__subtitle">A quiet place to leave something behind.</p>
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
          <p className="lobby__empty-kicker">Start with a small ritual</p>
          <p className="lobby__empty-copy">Give a room to the thought you keep returning to.</p>
          <div className="lobby__rail">
            <RoomTag isNew />
          </div>
        </div>
      ) : visibleRooms.length === 0 ? (
        <div className="lobby__empty lobby__empty--search" role="status">
          <p>No room feels like “{query}” yet.</p>
          <div className="lobby__empty-actions">
            <button type="button" className="lobby__create-search" onClick={createFromSearch}>
              Create “{query}” <span aria-hidden="true">↗</span>
            </button>
            <button type="button" onClick={() => setQuery('')}>Show every room</button>
          </div>
        </div>
      ) : (
        <div className="lobby__shelf">
          <div className="lobby__shelf-heading">
            <span>Your rooms</span>
            <span>{visibleRooms.length.toString().padStart(2, '0')} kept</span>
          </div>
          <div className="lobby__rail">
            {visibleRooms.map((room) => (
              <RoomTag key={room.id} room={room} />
            ))}
            <RoomTag isNew />
          </div>
        </div>
      )}
    </main>
  );
}
