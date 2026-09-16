import { Link } from 'react-router-dom';
import type { Room } from '../domain/types';
import { pinColorForRoom } from '../domain/symbols';

let lastChimeAt = 0;
function playRoomChime() {
  const now = performance.now();
  if (now - lastChimeAt < 180) return;
  lastChimeAt = now;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.022, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.24);
    gain.connect(context.destination);
    [660, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(context.currentTime + index * 0.055);
      oscillator.stop(context.currentTime + 0.24 + index * 0.055);
    });
    window.setTimeout(() => void context.close(), 420);
  } catch {
    // Audio is a decorative enhancement; a blocked context never affects navigation.
  }
}

interface Props {
  room?: Room;
  isNew?: boolean;
  onDelete?: () => void;
}

/** A room hanging from the lobby ceiling: thread + pin + tag. */
export function RoomTag({ room, isNew = false, onDelete }: Props) {
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
    <div className="room-tag-wrap">
      <Link to={`/r/${room.slug}`} className="room-tag" aria-label={`Open ${room.name}`} onPointerEnter={playRoomChime}>
        <span className="room-tag__thread" />
        {/* the pushpin holding the tag — colored per room */}
        <span
          className="room-tag__pin"
          aria-hidden="true"
          style={{ '--pin-head': pin.head, '--pin-deep': pin.deep, '--pin-glow': pin.glow } as React.CSSProperties}
        />
        <span className="room-tag__tag">
          <span className="room-tag__symbol">{room.symbol}</span>
          <span className="room-tag__name" data-room-name={room.name}>{room.name}</span>
        </span>
      </Link>
      {onDelete && <button className="room-tag__delete" type="button" onClick={onDelete} aria-label={`Delete ${room.name}`} title={`Delete ${room.name}`}>×</button>}
    </div>
  );
}
