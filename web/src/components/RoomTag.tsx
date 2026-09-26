import { SteelBinding, ItemControls } from './ItemPrivacy';
import { useEffect, useRef } from 'react';
import { reducedMotion } from '../domain/motion';
import { Link, useNavigate } from 'react-router-dom';
import type { Room } from '../domain/types';
import { pinColorForRoom } from '../domain/symbols';
import { RoomName } from './RoomName';
import { FairyLights } from './FairyLights';
import { usePhysicalTilt } from '../hooks/usePhysicalTilt';


interface Props {
  room?: Room;
  isNew?: boolean;
  onDelete?: () => void;
}

/** A room hanging from the lobby ceiling: thread + pin + tag. */
export function RoomTag({ room, isNew = false, onDelete }: Props) {
  const tilt = usePhysicalTilt();
  const navigate = useNavigate();
  const entering = useRef(false); const flight = useRef<Animation|null>(null);
  useEffect(()=>()=>{flight.current?.cancel();document.querySelector('.lobby')?.classList.remove('is-entering');},[]);
  function enter(event: React.MouseEvent<HTMLAnchorElement>, path: string){
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.detail===0||reducedMotion())return;
    event.preventDefault();if(entering.current)return;entering.current=true;
    const card=event.currentTarget.querySelector<HTMLElement>('.room-tag__tag');
    if(!card){navigate(path);return;}
    const r=card.getBoundingClientRect();const base=getComputedStyle(card).transform;
    const scene=event.currentTarget.closest<HTMLElement>('.lobby');
    scene?.style.setProperty('--entry-x',`${r.x+r.width/2}px`);scene?.style.setProperty('--entry-y',`${r.y+r.height/2}px`);scene?.classList.add('is-entering');
    event.currentTarget.classList.add('is-selected');
    flight.current=card.animate([{transform:base},{transform:`perspective(900px) translate3d(${(innerWidth/2-r.x-r.width/2)*.45}px,${(innerHeight/2-r.y-r.height/2)*.35}px,340px) rotateX(-7deg) rotateY(3deg)`,opacity:1}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
    flight.current.finished.then(()=>navigate(path)).catch(()=>{});
  }
  if (isNew) {
    return (
      <div className="room-tag-wrap room-tag-wrap--new"><FairyLights small />
      <Link to="/new" onClick={e=>enter(e,'/new')} className="room-tag room-tag--new" aria-label="Create a new room">
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
  const tone = ['#C9A0A0','#A3B18A','#C9BBA8'][[...room.id].reduce((n,c)=>n+c.charCodeAt(0),0)%3];

  return (
    <div className="room-tag-wrap" style={{ '--card-color': tone, '--card-deep': '#8d6547' } as React.CSSProperties}>
      <FairyLights small />
      <Link to={`/r/${room.slug}`} onClick={e=>enter(e,`/r/${room.slug}`)} className="room-tag" aria-label={`Open ${room.name}`}>
        <span className="room-tag__thread" />
        {/* the pushpin holding the tag — colored per room */}
        <span
          className="room-tag__pin"
          aria-hidden="true"
          style={{ '--pin-head': pin.head, '--pin-deep': pin.deep, '--pin-glow': pin.glow } as React.CSSProperties}
        >♡</span>
        <span className={`room-tag__tag physical${room.locked?' is-bound':''}`} {...tilt}>
          {room.locked&&<SteelBinding/>}<span className="room-tag__symbol">{room.locked?'♡':room.symbol}</span>
          <span className="room-tag__name" title={room.name}><RoomName name={room.name} /></span>
          <time className="room-tag__date">{new Date(room.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time>
        </span>
      </Link>
      <ItemControls scope={{kind:'room',id:room.id}}/>
      {onDelete && <button className="room-tag__delete" type="button" onClick={onDelete} aria-label={`Let ${room.name} go`}><span aria-hidden="true">♧</span> Let go</button>}
    </div>
  );
}
