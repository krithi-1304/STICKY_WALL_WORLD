import { Link } from 'react-router-dom';
import type { Room } from '../domain/types';
import { pinColorForRoom } from '../domain/symbols';
import { playRoomChime } from '../domain/chime';
import { RoomName } from './RoomName';
import { FairyLights } from './FairyLights';


interface Props {
  room?: Room;
  isNew?: boolean;
  onDelete?: () => void;
}

/** A room hanging from the lobby ceiling: thread + pin + tag. */
export function RoomTag({ room, isNew = false, onDelete }: Props) {
  if (isNew) {
    return (
      <div className="room-tag-wrap room-tag-wrap--new"><FairyLights small />
      <Link to="/new" className="room-tag room-tag--new" aria-label="Create a new room">
        <span className="room-tag__thread" />
        <span className="room-tag__pin" aria-hidden="true">♡</span>
        <span className="room-tag__tag">
          <span className="room-tag__symbol">+</span>
          <span className="room-tag__name">New room</span>
        </span>
      </Link></div>
    );
  }
  if (!room) return null;

  const pin = pinColorForRoom(room.id);

  return (
    <div className="room-tag-wrap" style={{ '--card-color': pin.head, '--card-deep': pin.deep } as React.CSSProperties}>
      <FairyLights small />
      <Link to={`/r/${room.slug}`} className="room-tag" aria-label={`Open ${room.name}`} onPointerEnter={(event) => { if (event.pointerType === 'mouse') void playRoomChime(false, room.id); }} onFocus={() => void playRoomChime(false, room.id)}>
        <span className="room-tag__thread" />
        {/* the pushpin holding the tag — colored per room */}
        <span
          className="room-tag__pin"
          aria-hidden="true"
          style={{ '--pin-head': pin.head, '--pin-deep': pin.deep, '--pin-glow': pin.glow } as React.CSSProperties}
        >♡</span>
        <span className="room-tag__tag">
          <span className="room-tag__symbol">{room.symbol}</span>
          <span className="room-tag__name" title={room.name}><RoomName name={room.name} /></span>
        </span>
      </Link>
      {onDelete && <button className="room-tag__delete" type="button" onClick={onDelete} aria-label={`Delete ${room.name}`}>Delete</button>}
    </div>
  );
}
