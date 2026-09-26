import { RichContent } from './RichContent';
import type { World } from '../domain/storage';
import { useEffect, useRef, useState } from 'react';
import { useWall } from '../state/wall';
import { changeItemLock, previewLockedItem, mediaBytes, shareSelection, type Scope } from '../domain/itemPrivacy';
import { downloadPrivate, protect, type PrivateContent } from '../domain/privateContent';
export function HeartLock(){return <svg className="heart-lock" viewBox="0 0 32 36" aria-hidden="true"><path className="heart-lock__shackle" d="M9 13V9a7 7 0 0 1 14 0v4"/><path className="heart-lock__body" d="M16 32 4 20C-3 10 10 6 16 13 22 6 35 10 28 20Z"/><path className="heart-lock__key" d="M16 19v6"/><circle cx="16" cy="19" r="2"/></svg>}
export function SteelBinding(){return <span className="steel-binding" aria-hidden="true"><span className="steel-wire steel-wire--one"/><span className="steel-wire steel-wire--two"/><span className="steel-lock"><HeartLock/></span></span>;}
export function ItemControls({scope,onChanged,shareOnly=false}:{scope:Scope|{kind:'space'};onChanged?:()=>void;shareOnly?:boolean}){
  const locked=useWall(s=>scope.kind==='space'?false:scope.kind==='room'?!!s.rooms.find(r=>r.id===scope.id)?.locked:!!s.stickies.find(n=>n.id===scope.id)?.locked);
  const [mode,setMode]=useState<'share'|'lock'|null>(null);
  return <><span className="item-controls">{!locked&&<button type="button" onClick={()=>setMode('share')}>Share {scope.kind==='space'?'space':scope.kind}</button>}{!shareOnly&&scope.kind!=='space'&&<button className="heart-lock-button" type="button" onClick={()=>setMode('lock')}><HeartLock/>{locked?'Unlock':'Lock'} {scope.kind}</button>}</span>{mode&&<PrivacyDialog scope={scope} mode={mode} locked={locked} onClose={()=>setMode(null)} onChanged={onChanged}/>}</>;
}
function PrivacyDialog({scope,mode,locked,onClose,onChanged}:{scope:Scope|{kind:'space'};mode:'share'|'lock';locked:boolean;onClose:()=>void;onChanged?:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);const active=useRef(true);
  const [pass,setPass]=useState(''),[repeat,setRepeat]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [result,setResult]=useState<{envelope:PrivateContent;url:string;excluded:number}|null>(null);
  const [copied,setCopied]=useState(false);
  const [preview,setPreview]=useState<World|null>(null);
  const [removeLock,setRemoveLock]=useState(false);
  useEffect(()=>{active.current=true;const before=document.activeElement as HTMLElement;const d=ref.current;d?.showModal();return()=>{active.current=false;d?.close();before?.focus();};},[]);
  useEffect(()=>{if(preview)ref.current?.querySelector<HTMLElement>('.locked-preview')?.focus();},[preview]);
  const [selection]=useState(()=>mode==='share'?shareSelection(scope):null);
  return <dialog ref={ref} className="vault-panel glass item-privacy-dialog" aria-label={mode==='share'?'Share privately':locked?'Unlock item':'Lock item'} onCancel={e=>{e.preventDefault();if(!busy)onClose();}}><form onSubmit={async e=>{
    e.preventDefault();if(busy)return;setError('');
    if((mode==='share'||!locked)&&pass!==repeat){setError('The passphrases do not match.');return;}
    setBusy(true);
    try{
      if(mode==='share'){
        const {world,excluded}=shareSelection(scope);
        if(!world.stickies.length)throw new Error('There are no unlocked notes to share. Unlock a note first.');
        const envelope=await protect(world,pass,mediaBytes(world));
        const fragment=envelope.data.length<=12000?encodeURIComponent(JSON.stringify(envelope)):null;
        const url=fragment&&fragment.length<=12000?`${location.origin}${import.meta.env.BASE_URL}shared/#${fragment}`:'';
        if(active.current){setResult({envelope,url,excluded});setPass('');setRepeat('');}
      }else if(scope.kind!=='space'){if(locked&&!removeLock){const world=await previewLockedItem(scope,pass);if(active.current){setPreview(world);setPass('');}}else{await changeItemLock(scope,pass,onChanged);if(active.current)onClose();}}
    }catch(e){if(active.current)setError(e instanceof Error?e.message:'Could not complete this action.');}finally{if(active.current)setBusy(false);}
  }}>
    <h1>{mode==='share'?'Share a little of your world':preview?'A private look':locked?'Unlock this space':'Keep this close'}</h1>
    {mode==='share'?<><p>A read-only snapshot of this {scope.kind}. Locked rooms and notes are excluded. Later edits and deletions do not change copies you share.</p>{selection&&<p>{selection.world.rooms.length} room(s) · {selection.world.stickies.length} note(s) · {selection.excluded} locked item(s) excluded</p>}<p>Choose a new share passphrase, different from your archive passphrase, and send it separately. Anyone with the file or link and its passphrase can read and keep a copy. Links cannot be revoked. Large selections use an encrypted file.</p>{location.hostname==='127.0.0.1'||location.hostname==='localhost'?<p className="privacy-copy">This preview address works only on your device. Other people need a reachable hosted copy of this app to open a link or import the shared file.</p>:null}</>:<p>{preview?'This view is temporary. Close it to hide the content and keep its lock.':locked?'Open a read-only view. Closing it keeps the lock in place. To edit, explicitly remove the lock below.':'Choose a separate passphrase to encrypt this item inside your archive. There is no reset for this lock; save its passphrase in your password manager.'}</p>}
    {!result&&!preview&&<>{!locked&&<p className="privacy-copy">Use 12–200 characters. Spaces are allowed.</p>}<label>{mode==='share'?'Share passphrase':locked?'Item passphrase':'New item passphrase'}<input autoFocus type="password" autoComplete={locked?'current-password':'new-password'} minLength={locked?1:12} maxLength={200} required disabled={busy} value={pass} onChange={e=>setPass(e.target.value)}/></label>{(mode==='share'||!locked)&&<label>Repeat passphrase<input type="password" autoComplete="new-password" required maxLength={200} value={repeat} onChange={e=>setRepeat(e.target.value)} disabled={busy}/></label>}<>{locked&&mode==='lock'&&<label className="remove-lock-choice"><input type="checkbox" checked={removeLock} disabled={busy} onChange={e=>setRemoveLock(e.target.checked)}/>Remove this lock so I can edit</label>}</><button className="primary" disabled={busy}>{busy?'Securing…':mode==='share'?'Prepare private share':locked?(removeLock?'Remove lock':'Unlock item'):'Lock item'}</button></>}
    {result&&<div className="share-result"><p role="status">Your protected snapshot is ready. {result.excluded} locked item(s) excluded.</p>{result.url?<><label>Protected share link<input readOnly value={result.url} onFocus={e=>e.target.select()}/></label><button type="button" onClick={()=>{if(!navigator.clipboard){setError('Select and copy the link above.');return;}void navigator.clipboard.writeText(result.url).then(()=>setCopied(true)).catch(()=>setError('Select and copy the link above.'));}}>{copied?'Copied':'Copy link'}</button></>:<p>This selection includes too much content for a reliable URL. Download the encrypted file and send it instead; nothing was left out.</p>}<button type="button" onClick={()=>downloadPrivate(result.envelope)}>Download shared file</button></div>}
    {preview&&<section className="locked-preview" aria-label="Private view" tabIndex={-1}><p role="status">Read-only · Your saved item is still locked.</p>{preview.stickies.length===0&&<p>This room has no notes.</p>}{preview.stickies.map(note=><article key={note.id}>{note.locked?<p><HeartLock/> This note has its own lock. Remove the room lock to open it separately.</p>:<><RichContent text={note.body}/>{(note.attachments??[]).map(a=><figure key={a.id}>{a.type.startsWith('image/')?<img src={a.data} alt={a.name}/>:a.type.startsWith('audio/')?<audio controls src={a.data}/>:<video controls src={a.data}/>}<figcaption>{a.name}</figcaption></figure>)}</>}</article>)}</section>}
    {error&&<p role="alert">{error}</p>}<button type="button" disabled={busy} onClick={onClose}>{preview?'Close and keep locked':result?'Done':'Cancel'}</button><button type="button" onClick={()=>window.dispatchEvent(new Event('black-wall:hide'))}>Hide screen</button>
  </form></dialog>;
}
