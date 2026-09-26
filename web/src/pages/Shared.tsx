import { HelpGuide } from '../components/HelpGuide';
import { useEffect, useRef, useState } from 'react';
import { parsePrivate, unprotect, type PrivateContent } from '../domain/privateContent';
import { validateWorld, type World } from '../domain/storage';
import { RichContent } from '../components/RichContent';
import { paperTone } from '../domain/presentation';
export function Shared(){
  const [initial]=useState(()=>{try{if(location.hash.length>18000000)throw new Error('Too large');return {envelope:location.hash?parsePrivate(JSON.parse(decodeURIComponent(location.hash.slice(1)))):null,error:''};}catch{return {envelope:null,error:'This shared link is damaged. Ask for the encrypted file.'};}});
  const generation=useRef(0);
  const [envelope,setEnvelope]=useState<PrivateContent|null>(initial.envelope),[world,setWorld]=useState<World|null>(null),[pass,setPass]=useState(''),[error,setError]=useState(initial.error),[busy,setBusy]=useState(false),[hidden,setHidden]=useState(false);
  useEffect(()=>{history.replaceState(null,'',`${import.meta.env.BASE_URL}shared/`);},[]);
  function hide(){generation.current++;setHidden(true);setWorld(null);setPass('');setBusy(false);document.title='Blank page';}
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]'))hide();};const invalidate=()=>{generation.current++;};window.addEventListener('keydown',key);window.addEventListener('black-wall:hide',hide);return()=>{invalidate();window.removeEventListener('keydown',key);window.removeEventListener('black-wall:hide',hide);};},[]);
  if(hidden)return <main className="blank-page"><button onClick={()=>{setHidden(false);document.title='The Black Wall';}}>Return</button></main>;
  if(!world)return <main className="vault-page"><form className="vault-panel glass" onSubmit={async e=>{e.preventDefault();if(!envelope)return;const operation=++generation.current;setBusy(true);setError('');try{const content=validateWorld(await unprotect(envelope,pass));if(content.rooms.some(r=>r.locked)||content.stickies.some(n=>n.locked))throw new Error('This share contains locked items. Ask for a share with locked items excluded.');if(operation===generation.current){setWorld(content);setPass('');}}catch(e){if(operation===generation.current)setError(e instanceof Error?e.message:'Could not open share.');}finally{if(operation===generation.current)setBusy(false);}}}>
    <HelpGuide /><h1>A thought shared with you</h1><p>This is a private, read-only snapshot. It is not saved to your archive. Ask the sender for its passphrase separately.</p>
    <label>Open shared file<input type="file" accept=".json,application/json" onChange={async e=>{try{const file=e.target.files?.[0];if(!file)return;setEnvelope(parsePrivate(JSON.parse(await file.text())));setError('');}catch(e){setEnvelope(null);setError(e instanceof Error?e.message:'Invalid shared file.');}}}/></label>
    <label>Share passphrase<input type="password" autoComplete="off" required maxLength={200} value={pass} onChange={e=>setPass(e.target.value)}/></label><button className="primary" disabled={!envelope||busy}>{busy?'Opening…':'Open shared snapshot'}</button>{error&&<p role="alert">{error}</p>}<a href={import.meta.env.BASE_URL}>Your own archive</a>
  </form></main>;
  return <main className="shared-world"><header className="diary-bar glass"><h1>A shared space</h1><HelpGuide /><span>Read-only · not saved here</span><button onClick={hide}>Hide screen</button></header>{world.rooms.map(room=><section key={room.id}><h2>{room.name}</h2><div className="shared-notes">{world.stickies.filter(n=>n.roomId===room.id).map(note=><article key={note.id} style={{background:paperTone(note.color)}}><RichContent text={note.body}/>{note.attachments?.map(a=><figure key={a.id}>{a.type.startsWith('image/')?<img src={a.data} alt={a.name}/>:a.type.startsWith('audio/')?<audio controls preload="metadata" src={a.data}/>:<video controls preload="metadata" src={a.data}/>}<figcaption>{a.name}</figcaption></figure>)}</article>)}</div></section>)}</main>;
}
