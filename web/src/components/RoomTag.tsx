import { Link } from 'react-router-dom';
import type { Room } from '../domain/types';
import { pinColorForRoom } from '../domain/symbols';

interface Props {
  room?: Room;
  isNew?: boolean;
}

/** A room hanging from the lobby ceiling: thread + pin + tag. */
export function RoomTag({ room, isNew = false }: Props) {
  if (isNew) {
    return (
      <Link to="/new" className="room-tag room-tag--new" aria-label="Create a new room">
        <span className="room-tag__thread" />
        <span className="room-tag__tag">
          <span className="room-tag__symbol">+</span>
          <span className="room-tag__name">New room</span>
        </span>
      </Link>
    );
  }
  if (!room) return null;

  const pin = pinColorForRoom(room.id);

  return (
    <Link to={`/r/${room.slug}`} className="room-tag" aria-label={`Open ${room.name}`}>
      <span className="room-tag__thread" />
      {/* the pushpin holding the tag — colored per room */}
      <span
        className="room-tag__pin"
        aria-hidden="true"
        style={{ '--pin-head': pin.head, '--pin-deep': pin.deep, '--pin-glow': pin.glow } as React.CSSProperties}
      />
      <span className="room-tag__tag">
        <span className="room-tag__symbol">{room.symbol}</span>
        <span className="room-tag__name">{room.name}</span>
      </span>
    </Link>
  );
}
