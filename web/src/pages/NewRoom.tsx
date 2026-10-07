import { ROOM_LIMIT_MESSAGE } from '../domain/types';
import { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { useWall } from '../state/wall';
export function NewRoom(){const [name,setName]=useState('');const [error,setError]=useState('');const navigate=useNavigate();return <main className="vault-page"><form className="vault-panel glass" onSubmit={e=>{e.preventDefault();if(!name.trim())return;const room=useWall.getState().createRoom({name:name.trim(),symbol:'✧'});if(!room){setError(ROOM_LIMIT_MESSAGE);return;}navigate(`/r/${room.slug}`);}}><h1>Give it a room</h1><p>A small place for the thoughts you choose to keep.</p><label>Room name<input value={name} onChange={e=>setName(e.target.value)} maxLength={60} placeholder="Late night thoughts" required autoFocus/></label>{error&&<p role="alert">{error}</p>}<div className="choice-row"><Link to="/">← Back</Link><button type="submit" disabled={!name.trim()}>Hang it up</button></div></form></main>;}
