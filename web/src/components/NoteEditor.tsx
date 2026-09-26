import { PileText } from './PileText';
import { useLetterPile } from '../hooks/useLetterPile';
import { ItemControls } from './ItemPrivacy';
import { safeLink } from '../domain/presentation';
import { reducedMotion } from '../domain/motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Sticky } from '../domain/types';
import { useWall } from '../state/wall';
import { readAttachment } from '../domain/media';
import { RichContent, SupportLine } from './RichContent';
import { paperTone } from '../domain/presentation';
import { ArchiveTools } from './ArchiveTools';
export function NoteEditor({ note, origin, onClose, onRelease, onNext }: { note: Sticky; origin?: DOMRect | null; onClose: () => void; onRelease: () => void; onNext: (direction: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null); const text = useRef<HTMLTextAreaElement>(null);
  const [linkOpen,setLinkOpen]=useState(false); const [link,setLink]=useState('');
  const fileInput=useRef<HTMLInputElement>(null);
  const words=useRef<HTMLDivElement>(null);
  const [closing,setClosing]=useState(false);
  const [assembling,setAssembling]=useState(()=>!reducedMotion());
  useLetterPile(words,note.body,closing?'closing':assembling?'opening':false);
  const departing=useRef(false); const motion=useRef<Animation|null>(null);
  const [textBounds,setTextBounds]=useState<CSSProperties>({});
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const active = useRef(true);
  useEffect(() => {
    active.current=true; const previous=document.activeElement as HTMLElement;
    const dialog = ref.current;
    dialog?.showModal(); text.current?.focus();
    const arrangeTimer=setTimeout(()=>setAssembling(false),650);
    if(dialog&&text.current)setTextBounds({top:text.current.offsetTop,left:text.current.offsetLeft,width:text.current.clientWidth,height:text.current.clientHeight});
    if(dialog&&!reducedMotion()){
      const r=dialog.getBoundingClientRect();
      const x=origin?origin.x+origin.width/2-r.x-r.width/2:0;
      const y=origin?origin.y+origin.height/2-r.y-r.height/2:32;
      motion.current=dialog.animate([
        {transform:`translate(-50%,-50%) perspective(1000px) translate3d(${x}px,${y}px,-240px) rotateX(14deg) rotateY(-5deg) scale(${origin?Math.min(1,origin.width/r.width):.9})`,opacity:.65},
        {transform:'translate(-50%,-50%) perspective(1000px) translateZ(12px) rotateX(-1deg)',offset:.8,opacity:1},
        {transform:'translate(-50%,-50%) perspective(1000px) translateZ(0)',opacity:1}
      ],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
    }
    return()=>{clearTimeout(arrangeTimer);active.current=false;motion.current?.cancel();dialog?.close();previous?.focus();};
  },[onClose,origin]);
  function dismiss(after=onClose){
    if(departing.current)return;
    if(reducedMotion()){after();return;}
    departing.current=true;
    if(text.current&&ref.current){
      // Keep the words in view even when Done was clicked below a scrolled textarea.
      const top=Math.max(86,Math.min(text.current.offsetTop-ref.current.scrollTop,ref.current.clientHeight*.3));
      setTextBounds({top,left:text.current.offsetLeft,width:text.current.clientWidth,height:Math.max(140,ref.current.clientHeight-top-48)});
    }
    setAssembling(false);setClosing(true);motion.current?.cancel();
    const dialog=ref.current;
    if(!dialog){after();return;}
    const r=dialog.getBoundingClientRect();
    const x=origin?origin.x+origin.width/2-r.x-r.width/2:0,y=origin?origin.y+origin.height/2-r.y-r.height/2:40;
    motion.current=dialog.animate([{transform:'translate(-50%,-50%) perspective(1000px) translateZ(0)',opacity:1},{transform:`translate(-50%,-50%) perspective(1000px) translate3d(${x}px,${y}px,-180px) rotateX(8deg) scale(${origin?Math.min(1,origin.width/r.width):.9})`,opacity:0}],{delay:850,duration:300,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
    motion.current.finished.then(()=>{if(active.current)after();}).catch(()=>{});
  }
  const update=(body:string)=>useWall.getState().updateSticky(note.id,{body});
  function format(mark:string) {
    if (note.body.length + mark.length * 2 > 10000) { setError('This note has reached its text limit. Shorten it before adding formatting.'); return; }
    const el=text.current!;const start=el.selectionStart,end=el.selectionEnd;
    update(note.body.slice(0,start)+mark+note.body.slice(start,end)+mark+note.body.slice(end));
    requestAnimationFrame(()=>{el.focus();el.setSelectionRange(start+mark.length,end+mark.length);});
  }
  return <dialog ref={ref} className={`note-editor${closing?' is-closing':''}${assembling?' is-assembling':''}`} aria-label="Open note" aria-modal="true" onCancel={e => { e.preventDefault(); dismiss(); }} style={{'--paper':paperTone(note.color)} as CSSProperties}>
    <header><h2>A little space to write</h2><button onClick={()=>dismiss()} aria-label="Close note">×</button></header>
    <ArchiveTools />
    <ItemControls scope={{kind:'note',id:note.id}} onChanged={onClose}/>
    {(closing||assembling)&&<div key={closing?'closing':'opening'} ref={words} className={`editor-falling-text pile-field ${closing?'is-piled':'is-assembling'}`} aria-hidden="true" style={textBounds}><PileText text={note.body.slice(0,600)}/></div>}
    <div className="editor-format"><button onClick={()=>format('**')} aria-label="Bold selected text"><strong>B</strong></button><button onClick={()=>format('*')} aria-label="Italic selected text"><em>I</em></button><button type="button" aria-expanded={linkOpen} onClick={()=>setLinkOpen(!linkOpen)}>Add link</button><span>Use **bold**, *italic*, or a web link.</span></div>
    {linkOpen&&<div className="note-link-entry"><label>Website address<input type="url" value={link} placeholder="https://example.com" onChange={e=>setLink(e.target.value)}/></label><button type="button" onClick={()=>{const url=safeLink(link.trim());if(!url){setError('Enter a complete http:// or https:// link.');return;}const next=note.body+(note.body?'\n':'')+url;if(next.length>10000){setError('This note is too long to add a link.');return;}update(next);setLink('');setLinkOpen(false);setError('');}}>Insert link</button></div>}
    <label className="sr-only" htmlFor="note-writing">Your thought</label><textarea id="note-writing" ref={text} value={note.body} maxLength={10000} placeholder="Write what is on your mind…" onChange={e=>{setAssembling(false);update(e.target.value);}} />
    {note.body && <section className="note-preview" aria-label="Formatted note"><RichContent text={note.body} /></section>}
    <div className="attachments">{(note.attachments??[]).map(a=><figure key={a.id}>{a.type.startsWith('image/')?<img src={a.data} alt={a.name} loading="lazy"/>:a.type.startsWith('audio/')?<audio controls preload="metadata" src={a.data}/>:<video controls preload="metadata" src={a.data}/>}<figcaption>{a.name}<button aria-label={`Remove attachment ${a.name}`} onClick={()=>{if(window.confirm('Remove this attachment from the note?'))useWall.getState().updateSticky(note.id,{attachments:note.attachments!.filter(item=>item.id!==a.id)});}}>Remove</button></figcaption></figure>)}</div>
    <div className="attachment-choices">{[['Photo','image/jpeg,image/png,image/webp'],['Audio','audio/mpeg,audio/wav,audio/ogg,audio/webm'],['Video','video/mp4,video/webm']].map(([name,accept])=><button key={name} type="button" disabled={busy||(note.attachments?.length??0)>=3} onClick={()=>{if(fileInput.current){fileInput.current.accept=accept;fileInput.current.click();}}}>Add {name.toLowerCase()}</button>)}</div>
    <label className="attachment-button">{busy?'Reading file…':'Attach photo, audio or video'}<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,audio/ogg,audio/webm,video/mp4,video/webm" disabled={busy||(note.attachments?.length??0)>=3} onChange={async e=>{
      const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(true);setError('');
      try{const attachment=await readAttachment(file);if(!active.current)return;const current=useWall.getState().stickies.find(n=>n.id===note.id);if(current)useWall.getState().updateSticky(note.id,{attachments:[...(current.attachments??[]),attachment]});}catch(e){if(active.current)setError(e instanceof Error?e.message:'Could not add attachment.');}finally{if(active.current)setBusy(false);}
    }}/></label><p className="attachment-limits">Up to 3 files per note. No app-imposed file-size or duration limit. Available space and processing depend on your browser and device.</p>
    {error&&<p role="alert">{error}</p>}<SupportLine/>
    <footer><button onClick={()=>dismiss(()=>onNext(-1))}>Previous note</button><button onClick={()=>dismiss(()=>onNext(1))}>Next note</button><button onClick={onRelease}>Let this go</button><button onClick={()=>dismiss()}>Done</button></footer>
  </dialog>;
}
