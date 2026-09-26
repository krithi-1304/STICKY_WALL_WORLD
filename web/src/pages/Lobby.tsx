import { ItemControls } from '../components/ItemPrivacy';
import { FairyLights } from '../components/FairyLights';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWall } from '../state/wall';
import { RoomTag } from '../components/RoomTag';
import { searchRooms } from '../domain/search';
import { symbolForName } from '../domain/symbols';
import { useSound } from '../domain/chime';
import { ThoughtComposer } from '../components/ThoughtComposer';
import { ReleaseDialog } from '../components/ReleaseDialog';
import { DarkBackdrop } from '../components/DarkBackdrop';

/** Lobby: a dark wall of hanging room tags, revealed through mist. */
export function Lobby() {
  const sound = useSound();
  const rooms = useWall((s) => s.rooms);
  const createRoom = useWall((s) => s.createRoom);
  const deleteRoom = useWall((s) => s.deleteRoom);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [release, setRelease] = useState<{name:string;id:string}|null>(null);
  const sorted = [...rooms].sort((a, b) => b.updatedAt - a.updatedAt);
  const visibleRooms = searchRooms(sorted, query);

  function createFromSearch() {
    const name = query.trim();
    if (!name) return;
    const room = createRoom({ name, symbol: symbolForName(name) });
    navigate(`/r/${room.slug}`);
  }

  function removeRoom(roomName: string, roomId: string) {
    setRelease({name:roomName,id:roomId});
  }

  return (
    <main className="lobby mist lobby--archive">
      <FairyLights />
      <DarkBackdrop />
      <div className="lobby__moon" aria-hidden="true" />
      <header className="lobby__header">
        <p className="lobby__eyebrow">ARCHIVE / 01</p>
        <h1 className="lobby__title" aria-label="Rooms for thoughts that stay."><span className="lobby__title-word">Rooms</span>{' '}<span className="lobby__title-word">for</span>{' '}<span className="lobby__title-word">thoughts</span>{' '}<span className="lobby__title-word">that</span>{' '}<span className="lobby__title-word lobby__title-word--accent">stay.</span></h1>
        <p className="lobby__subtitle">A quiet place to leave something behind</p>
        <div className="lobby__preferences"><span>Saved in this browser · Never shared automatically</span><button type="button" data-sound-toggle title={sound.enabled ? "Turn chimes off" : "Turn chimes on"} aria-pressed={sound.enabled} onClick={sound.toggle}>Chimes {sound.enabled ? 'on' : 'off'}</button><ItemControls scope={{kind:'space'}} shareOnly/></div>
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

      <ThoughtComposer />

      {rooms.length === 0 ? (
        <div className="lobby__empty">
          <p className="lobby__empty-kicker">Nothing here yet. Light one.</p>
          <p className="lobby__empty-copy">A room keeps the thoughts you want to return to.</p>
          <div className="lobby__rail">
            <RoomTag isNew />
          </div>
        </div>
      ) : visibleRooms.length === 0 ? (
        <div className="lobby__empty lobby__empty--search" role="status">
          <p>No rooms match “{query}”.</p>
          <div className="lobby__empty-actions">
            <button type="button" className="lobby__create-search" onClick={createFromSearch}>
              Create room “{query}” <span aria-hidden="true">↗</span>
            </button>
            <button type="button" onClick={() => setQuery('')}>Show every room</button>
          </div>
        </div>
      ) : (
        <div className="lobby__shelf">
          <div className="lobby__shelf-heading">
            <span>Your rooms</span>
            <span>{visibleRooms.length} {query.trim() ? 'found' : visibleRooms.length === 1 ? 'room' : 'rooms'}</span>
          </div>
          <div className="lobby__rail">
            {visibleRooms.map((room) => (
              <RoomTag key={room.id} room={room} onDelete={() => removeRoom(room.name, room.id)} />
            ))}
            <RoomTag isNew />
          </div>
        </div>
      )}
      {release && <ReleaseDialog label={`Let “${release.name}” and every note inside it go?`} onCancel={()=>setRelease(null)} onRelease={()=>{deleteRoom(release.id);setRelease(null);if(rooms.length===1)setQuery('');requestAnimationFrame(()=>document.querySelector<HTMLElement>('.lobby input, .lobby .room-tag')?.focus());}}/>}
    </main>
  );
}
