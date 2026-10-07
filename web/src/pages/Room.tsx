import { ARCHIVE_LIMITS, NOTE_LIMIT_MESSAGE } from '../domain/types';
import { SteelBinding, ItemControls } from '../components/ItemPrivacy';
import type { Sticky } from '../domain/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { selectRoomBySlug, selectStickiesForRoom, useWall } from '../state/wall';
import { DiaryNote } from '../components/DiaryNote';
import { NoteEditor } from '../components/NoteEditor';
import { ReleaseDialog } from '../components/ReleaseDialog';
import { reducedMotion } from '../domain/motion';
import { playRitualSound, useSound } from '../domain/chime';
export function Room() {
  const {slug=''}=useParams(); const room=useWall(selectRoomBySlug(slug));
  const notes=useWall(useShallow(selectStickiesForRoom(room?.id??'')));
  const [piled,setPiled]=useState<Set<string>>(()=>new Set());
  const [light,setLight]=useState(true);const [near,setNear]=useState<string|null>(null);const [opened,setOpened]=useState<string|null>(null);
  const [release,setRelease]=useState<string|null>(null);const [renaming,setRenaming]=useState(false);const [message,setMessage]=useState('');
  const [ignition,setIgnition]=useState(0);
  const [igniting,setIgniting]=useState(false);
  const ignitionTimer=useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [falling,setFalling]=useState<{note:Sticky;index:number}|null>(null);
  const [origin,setOrigin]=useState<DOMRect|null>(null);
  useEffect(()=>()=>clearTimeout(ignitionTimer.current),[]);
  function toggleLight(){
    clearTimeout(ignitionTimer.current);setNear(null);
    if(light||igniting){setLight(false);setIgniting(false);return;}
    void playRitualSound('light');
    if(reducedMotion()){setLight(true);return;}
    setIgnition(n=>n+1);setIgniting(true);
    ignitionTimer.current=setTimeout(()=>{setLight(true);setIgniting(false);},340);
  }
  function finishRelease(){setFalling(null);}

  const wall=useRef<HTMLDivElement>(null);const glow=useRef<HTMLDivElement>(null);const frame=useRef(0);const sound=useSound();
  const fallingLetters=room?.fallingLetters!==false;
  // Re-enabling must restore the closed-note pile, not only the saved preference.
  function toggleLetters(){
    useWall.getState().updateRoom(room!.id,{fallingLetters:!fallingLetters});
    setPiled(fallingLetters?new Set():new Set(notes.filter(note=>!note.locked&&note.id!==opened).map(note=>note.id)));
  }
  const close=useCallback(()=>{if(opened&&fallingLetters)setPiled(previous=>new Set([...previous,opened]));setOpened(null);},[opened,fallingLetters]);
  useEffect(()=>{document.documentElement.dataset.cursor=light?'wand':'match';return()=>{delete document.documentElement.dataset.cursor;cancelAnimationFrame(frame.current);};},[light]);
  if(!room)return <Navigate to="/" replace/>;
  if(room.locked)return <main className="diary-room"><header className="diary-bar glass"><Link to="/">← Lobby</Link><h1>A room kept close</h1></header><section className="locked-room vault-panel glass"><div className="room-lock-seal"><SteelBinding/></div><h2>This room is locked</h2><p>Its notes have their own layer of encryption.</p><ItemControls scope={{kind:'room',id:room.id}}/></section></main>;
  const visibleNotes=[...notes];if(falling)visibleNotes.splice(Math.min(falling.index,visibleNotes.length),0,falling.note);
  const current=notes.find(note=>note.id===opened&&!note.locked);
  function add(){const note=useWall.getState().addSticky(room!.id,{w:wall.current?.clientWidth??900,h:600});if(note)setOpened(note.id);else setMessage(useWall.getState().stickies.length>=ARCHIVE_LIMITS.notes ? NOTE_LIMIT_MESSAGE : 'This room is full. Keep a new thought in another room.');}
  return <main className={`diary-room ${light?'light-on':'light-off'}${igniting?' is-igniting':''}`}>
    <header className="diary-bar glass"><Link to="/">← Lobby</Link>
      {renaming?<input aria-label="Room name" defaultValue={room.name} maxLength={60} autoFocus onBlur={e=>{const name=e.target.value.trim();if(name)useWall.getState().updateRoom(room.id,{name});setRenaming(false);}} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();if(e.key==='Escape')setRenaming(false);}}/>:<h1><button onClick={()=>setRenaming(true)} title="Rename room">{room.name}</button></h1>}
      <div className="diary-actions"><button className={`diary-switch ${light?'is-on':''}`} aria-pressed={light||igniting} aria-label={light||igniting?'Turn room light off':'Turn room light on'} onClick={toggleLight}><span aria-hidden="true"/>{light?'Light on':'Light off'}</button><button data-sound-toggle title={sound.enabled ? "Turn sound off" : "Turn sound on"} aria-pressed={sound.enabled} onClick={sound.toggle}>Sound {sound.enabled?'on':'off'}</button><button className="room-primary-action" onClick={add}>Pin a thought</button><button className="letters-toggle" aria-pressed={fallingLetters} title="Choose whether letters fall when you close or dim notes" onClick={toggleLetters}>Falling letters {fallingLetters?'on':'off'}</button><ItemControls scope={{kind:'room',id:room.id}}/></div>
    </header>
    <p className="room-guidance">{light?'Open a note to write. Move it by its tape.': 'Bring the match close to read. You can also tap or focus any note.'}</p>
    {message&&<p role="status">{message}</p>}
    <div className="diary-wall" ref={wall} onPointerMove={e=>{
      if(light||e.pointerType!=='mouse')return;
      const x=e.clientX,y=e.clientY;cancelAnimationFrame(frame.current);
      frame.current=requestAnimationFrame(()=>{
        if(glow.current){const r=wall.current!.getBoundingClientRect();glow.current.style.transform=`translate(${x-r.left+wall.current!.scrollLeft}px,${y-r.top+wall.current!.scrollTop}px)`;glow.current.style.opacity='1';}
        let nearest:string|null=null;let distance=210;
        wall.current?.querySelectorAll<HTMLElement>('[data-note-id]').forEach(el=>{const r=el.getBoundingClientRect();const d=Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2);if(d<distance){distance=d;nearest=el.dataset.noteId??null;}});
        setNear(nearest);
      });
    }} onPointerLeave={()=>{cancelAnimationFrame(frame.current);setNear(null);if(glow.current)glow.current.style.opacity='0';}}>
      <div ref={glow} className="room-lamplight" aria-hidden="true"/>
      {['left','center','right'].map(position=><div key={position} className={`room-pendant room-pendant--${position}`} aria-hidden="true"><span className="room-pendant__cord"/><span className="room-pendant__shade"/><span className="room-pendant__bulb"/>{position==='center'&&ignition>0&&(light||igniting)&&<span key={ignition} className="lamp-match"><span className="lamp-match__wood"/><span className="lamp-match__head"/><span className="lamp-match__flame"/></span>}</div>)}
      {notes.length===0&&<div className="empty-wall"><h2>A space of your own</h2><p>Pin a thought. It can be a sentence, a list, or a day you want to remember.</p><button onClick={add}>Pin your first note</button></div>}
      {visibleNotes.map(note=><DiaryNote key={note.id} note={note} fallingLetters={fallingLetters} lit={light||near===note.id||opened===note.id} piled={piled.has(note.id)&&opened!==note.id} falling={falling?.note.id===note.id} onFallen={finishRelease} onOpen={rect=>{setOrigin(rect);setPiled(previous=>{const next=new Set(previous);next.delete(note.id);return next;});setOpened(note.id);}} onRelease={()=>setRelease(note.id)}/>)}
    </div>
    {current&&<NoteEditor key={current.id} note={current} fallingLetters={fallingLetters} origin={origin} onClose={close} onRelease={()=>setRelease(current.id)} onNext={direction=>{const readable=notes.filter(n=>!n.locked);const index=readable.findIndex(n=>n.id===opened);const next=readable[(index+direction+readable.length)%readable.length]?.id;setPiled(previous=>{const result=new Set(previous);if(opened)result.add(opened);if(next&&next!==opened)result.delete(next);return result;});setOrigin(null);setOpened(next===opened?null:next??null);}}/>}
    {release&&<ReleaseDialog label="Let this note leave your wall?" onCancel={()=>setRelease(null)} onRelease={()=>{const id=release;if(opened===id)setOpened(null);setRelease(null);const note=notes.find(n=>n.id===id);if(note&&!reducedMotion())setFalling({note,index:notes.indexOf(note)});useWall.getState().deleteSticky(id);}}/>}
  </main>;
}
