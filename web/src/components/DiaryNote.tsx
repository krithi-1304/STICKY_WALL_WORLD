import { PileText } from './PileText';
import { useLetterPile } from '../hooks/useLetterPile';
import { SteelBinding, ItemControls } from './ItemPrivacy';
import { fallingFrames, reducedMotion } from '../domain/motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Sticky } from '../domain/types';
import { useWall } from '../state/wall';
import { usePhysicalTilt } from '../hooks/usePhysicalTilt';
import { paperTone } from '../domain/presentation';
function emotion(text: string) {
  const buckets: [RegExp,string,string][] = [[/\b(worry|worried|anxious|afraid|scared|stress)\b/i,'😟','Worried'],[/\b(sad|lost|hurt|lonely|miss|cry)\b/i,'😔','Heavy'],[/\b(love|heart|cherish|care)\b/i,'♡','Tender'],[/\b(happy|joy|grateful|excited|proud)\b/i,'😊','Hopeful'],[/\b(tired|sleep|exhausted)\b/i,'😴','Tired']];
  return buckets.find(([pattern]) => pattern.test(text))?.slice(1) as string[] | undefined ?? ['·','Quiet'];
}
export function DiaryNote({ note, lit, piled = false, falling = false, fallingLetters = true, onFallen, onOpen, onRelease }: { note: Sticky; lit: boolean; piled?: boolean; falling?: boolean; fallingLetters?: boolean; onFallen?: () => void; onOpen: (rect: DOMRect) => void; onRelease: () => void }) {
  const words=useRef<HTMLSpanElement>(null);useLetterPile(words,note.body,fallingLetters);
  const element = useRef<HTMLElement>(null);
  const fallen = useRef(onFallen);
  useEffect(()=>{fallen.current=onFallen;},[onFallen]);
  useEffect(()=>{
    if(!falling||!element.current)return;
    if(reducedMotion()){fallen.current?.();return;}
    const animation=element.current.animate(fallingFrames(element.current),{delay:350,duration:720,easing:'linear',fill:'forwards'});
    animation.finished.then(()=>fallen.current?.()).catch(()=>{});
    return()=>animation.cancel();
  },[falling]);
  const tilt = usePhysicalTilt(); const [focus, setFocus] = useState(false); const [hover, setHover] = useState(false);
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const revealed = lit || focus; const [symbol, label] = emotion(note.body);
  const isPiled = fallingLetters && (piled || !revealed);
  if(note.locked)return <article className="diary-note locked-note" data-testid={`note-${note.id}`} data-note-id={note.id} style={{'--paper':paperTone(note.color)} as CSSProperties}><span className="note-tape" aria-hidden="true"/><SteelBinding/><p>A thought kept close</p><ItemControls scope={{kind:'note',id:note.id}}/></article>;
  return <article ref={element} className={`diary-note physical${falling ? ' is-falling' : ''}${revealed ? ' is-readable' : ' is-dark'}${isPiled?' is-piled':''}${!fallingLetters?' letters-still':''}`} data-testid={`note-${note.id}`} data-note-id={note.id} data-revealed={revealed} data-piled={isPiled} style={{ '--paper': paperTone(note.color), '--rotation': `${note.rotation}deg`, '--dx': `${note.offsetX ?? 0}px`, '--dy': `${note.offsetY ?? 0}px` } as CSSProperties} {...tilt} onPointerEnter={() => setHover(true)} onPointerLeave={e => { setHover(false); tilt.onPointerLeave(e); }} onFocus={() => setFocus(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false); }}>
    <button className="note-tape" aria-label="Move note. Use arrow keys to reposition." onPointerDown={e => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x:e.clientX,y:e.clientY,dx:note.offsetX??0,dy:note.offsetY??0 }; }} onPointerMove={e => {
      if (!drag.current || matchMedia('(max-width: 600px)').matches) return;
      const d=drag.current; useWall.getState().updateSticky(note.id,{offsetX:Math.max(-80,Math.min(80,d.dx+e.clientX-d.x)),offsetY:Math.max(-60,Math.min(60,d.dy+e.clientY-d.y))});
    }} onPointerUp={() => { drag.current=null; }} onPointerCancel={() => { drag.current=null; }} onLostPointerCapture={() => { drag.current=null; }} onKeyDown={e => {
      const move: Record<string,[number,number]> = { ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4] };
      if (move[e.key]) { e.preventDefault(); const [x,y]=move[e.key]; useWall.getState().updateSticky(note.id,{offsetX:Math.max(-80,Math.min(80,(note.offsetX??0)+x)),offsetY:Math.max(-60,Math.min(60,(note.offsetY??0)+y))}); }
    }} />
    <button className="note-open" onClick={()=>{if(!falling&&element.current)onOpen(element.current.getBoundingClientRect());}} aria-label={`Open note from ${new Date(note.createdAt).toLocaleDateString()}`}>
      <span ref={words} className="note-letters pile-field" aria-hidden="true"><PileText text={(note.body || 'A thought begins here…').slice(0,260)}/></span>
      <span className="sr-only">{revealed ? note.body || 'Empty note' : 'Bring the match closer, or open to read.'}</span>
      {!revealed && hover && <span className="note-emotion" aria-label={`Possible mood: ${label}`}>{symbol}</span>}
      {revealed && <span className="note-more">{isPiled?'Open to arrange & read':'Open to read & write'}</span>}
      {(note.attachments?.length ?? 0) > 0 && revealed && <span className="note-media-hint">{note.attachments!.length} attachment{note.attachments!.length === 1 ? '' : 's'}</span>}
    </button>
    <time className="paper-date">{new Date(note.createdAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time>
    <button className="release-note" aria-label="Let this note go" onClick={onRelease}>♧<span>Let go</span></button>
  </article>;
}
