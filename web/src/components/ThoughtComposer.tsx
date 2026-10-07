import { ARCHIVE_LIMITS, ROOM_LIMIT_MESSAGE, NOTE_LIMIT_MESSAGE } from '../domain/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWall } from '../state/wall';
import { ReleaseDialog } from './ReleaseDialog';
import { SupportLine } from './RichContent';
export function ThoughtComposer(){
  const [text,setText]=useState('');const [choosing,setChoosing]=useState(false);const [release,setRelease]=useState(false);const [roomId,setRoomId]=useState('');const [name,setName]=useState('');const [message,setMessage]=useState('');
  const rooms=useWall(s=>s.rooms);const navigate=useNavigate();
  return <section className="thought-composer" aria-label="Keep or let go"><label htmlFor="first-thought">What is on your mind?</label><textarea id="first-thought" value={text} maxLength={10000} onChange={e=>{setText(e.target.value);setMessage('');}} placeholder="You can put it into words here…"/>
    <p className="draft-hint">This draft is not saved until you choose Keep it.</p>
    {!choosing?<div className="choice-row"><button disabled={!text.trim()} onClick={()=>setChoosing(true)}>Keep it</button><button disabled={!text.trim()} onClick={()=>setRelease(true)}>Let it go</button></div>:<form onSubmit={e=>{
      e.preventDefault();if(!text.trim()){setMessage('Write a thought before keeping it.');return;}const store=useWall.getState();if(store.stickies.length>=ARCHIVE_LIMITS.notes){setMessage(NOTE_LIMIT_MESSAGE);return;}const room=roomId?store.rooms.find(r=>r.id===roomId):store.createRoom({name:name.trim()||'My thoughts',symbol:'✧'});if(!room){setMessage(ROOM_LIMIT_MESSAGE);return;}
      const note=store.addSticky(room.id,{w:900,h:600});if(!note){setMessage('That room is full. Choose another room.');return;}store.updateSticky(note.id,{body:text});setText('');navigate(`/r/${room.slug}`);
    }}><label>Keep in<select value={roomId} onChange={e=>setRoomId(e.target.value)}><option value="">A new room</option>{rooms.filter(room=>!room.locked).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>{!roomId&&<label>Room name<input value={name} maxLength={60} onChange={e=>setName(e.target.value)} placeholder="My thoughts"/></label>}<div className="choice-row"><button type="button" onClick={()=>setChoosing(false)}>Back</button><button type="submit">Keep this thought</button></div></form>}
    {message&&<p role="status">{message}</p>}<SupportLine/>
    {release&&<ReleaseDialog label="You can let this thought go without keeping a copy." onCancel={()=>setRelease(false)} onRelease={()=>{setText('');setRelease(false);setMessage('A little room to breathe.');}}/>}
  </section>;
}
