import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWall } from '../state/wall';
import { RoomTag } from '../components/RoomTag';
import { searchRooms } from '../domain/search';
import { symbolForName } from '../domain/symbols';
import { useSound } from '../domain/chime';

/** Lobby: a dark wall of hanging room tags, revealed through mist. */
export function Lobby() {
  const sound = useSound();
  const rooms = useWall((s) => s.rooms);
  const createRoom = useWall((s) => s.createRoom);
  const deleteRoom = useWall((s) => s.deleteRoom);
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

  function removeRoom(roomName: string, roomId: string) {
    const confirmed = window.confirm(`Delete “${roomName}” and everything inside it? This cannot be undone.`);
    if (confirmed) deleteRoom(roomId);
  }

  return (
    <main className="lobby mist lobby--archive">
      <div className="archive-water" aria-hidden="true"><span /><span /><span /></div>
      <div className="lobby__moon" aria-hidden="true" />
      <header className="lobby__header">
        <div className="lobby__stamp"><span>✦</span> archive / 01</div>
        <p className="lobby__eyebrow">The Night Archive</p>
        <h1 className="lobby__title" aria-label="Rooms for thoughts that stay.">
          <span className="lobby__title-word">Rooms</span>{' '}
          <span className="lobby__title-word">for</span>{' '}
          <span className="lobby__title-word">thoughts</span>{' '}
          <span className="lobby__title-word">that</span>{' '}
          <span className="lobby__title-word lobby__title-word--accent">stay.</span>
        </h1>
        <p className="lobby__subtitle">A quiet place to leave something behind.</p>
        <div className="lobby__preferences"><span>Saved in this browser · Not shared online</span><button type="button" aria-pressed={sound.enabled} onClick={sound.toggle}>Chimes {sound.enabled ? 'on' : 'off'}</button></div>
        {rooms.length > 0 && (
          <label className="lobby__search">
            <span className="lobby__search-icon" aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a room…"
              aria-label="Search rooms"
              type="search"
              maxLength={60}
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
              <RoomTag key={room.id} room={room} onDelete={() => removeRoom(room.name, room.id)} />
            ))}
            <RoomTag isNew />
          </div>
        </div>
      )}
    </main>
  );
}
