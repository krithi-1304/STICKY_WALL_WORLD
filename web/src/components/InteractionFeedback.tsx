import { useEffect } from 'react';
import { playRoomChime, playSurfaceSound, type SurfaceVoice } from '../domain/chime';
import { reducedMotion } from '../domain/motion';
function control(target:EventTarget|null){return target instanceof Element?target.closest<HTMLElement>('button,a,input,textarea,select'):null;}
function hoverSound(el:HTMLElement){if(document.querySelector('.blank-page')||el.hasAttribute('data-sound-toggle'))return;if(el.matches('.room-tag'))void playRoomChime(false,el.getAttribute('aria-label')??'room');else void playSurfaceSound(voice(el));}
function voice(el:HTMLElement):SurfaceVoice{
  if(el.closest('.heart-lock-button,.locked-note,.locked-room'))return 'metal';
  if(el.closest('.fairy-lights,.diary-switch'))return 'light';
  if(el.closest('.room-tag'))return 'door';
  if(el.matches('input,textarea,select'))return 'ink';
  if(el.closest('.diary-note,.note-editor')&&!el.closest('.item-controls,.editor-privacy'))return 'paper';
  return 'glass';
}
export function InteractionFeedback(){
  useEffect(()=>{
    const motions=new Set<Animation>();
    const active=new WeakMap<HTMLElement,Animation>();
    const over=(e:PointerEvent)=>{const el=control(e.target);if(!el||e.pointerType==='touch'||el.matches(':disabled')||e.relatedTarget instanceof Node&&el.contains(e.relatedTarget))return;hoverSound(el);};
    const focus=(e:FocusEvent)=>{const el=control(e.target);if(el?.matches(':focus-visible'))hoverSound(el);};
    const click=(e:MouseEvent)=>{
      const el=control(e.target);if(!el||el.matches(':disabled')||document.querySelector('.blank-page'))return;if(!el.hasAttribute('data-sound-toggle'))void playSurfaceSound(voice(el),true);
      if(reducedMotion()||el.matches('input,textarea,select,.room-tag,.note-open,.note-tape'))return;
      active.get(el)?.cancel();
      const base=getComputedStyle(el).transform==='none'?'':getComputedStyle(el).transform;
      const a=el.animate([{transform:`${base} perspective(700px) translateZ(-10px) scale(.94)`},{transform:`${base} perspective(700px) translateZ(4px) scale(1.035)`,offset:.62},{transform:base||'none'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});
      active.set(el,a);motions.add(a);a.finished.catch(()=>{}).finally(()=>motions.delete(a));
    };
    document.addEventListener('pointerover',over);document.addEventListener('focusin',focus);document.addEventListener('click',click,true);
    return()=>{document.removeEventListener('pointerover',over);document.removeEventListener('focusin',focus);document.removeEventListener('click',click,true);motions.forEach(a=>a.cancel());};
  },[]);
  return null;
}
