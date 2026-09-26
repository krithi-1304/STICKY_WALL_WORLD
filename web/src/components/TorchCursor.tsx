import { useEffect, useRef } from 'react';
/** Movement-driven particles; no timer loop or per-frame React state. */
export function TorchCursor(){
  const ref=useRef<HTMLDivElement>(null);const trail=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=ref.current!;const particles=trail.current!;let frame=0;let lastX=0,lastY=0;
    const fine=matchMedia('(hover: hover) and (pointer: fine)');const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const hide=()=>{el.dataset.visible='false';particles.replaceChildren();};
    const move=(event:PointerEvent)=>{
      if(!fine.matches||event.pointerType==='touch'){hide();return;}
      const editing=event.target instanceof Element&&!!event.target.closest('input,textarea,[contenteditable="true"]');
      el.dataset.visible=String(!editing);if(editing){particles.replaceChildren();return;}
      const x=event.clientX,y=event.clientY;cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{el.style.transform=`translate3d(${x+12}px,${y+12}px,0)`;});
      if(!reduced.matches&&Math.hypot(x-lastX,y-lastY)>16){
        lastX=x;lastY=y;const wand=document.documentElement.dataset.cursor==='wand';
        const p=document.createElement('i');p.className=wand?'cursor-spark':'cursor-ember';p.style.left=`${x+12}px`;p.style.top=`${y-12}px`;
        particles.append(p);while(particles.children.length>(wand?5:12))particles.firstElementChild?.remove();
        p.animate([{opacity:.7,transform:'translate(0,0) scale(1)'},{opacity:0,transform:`translate(${Math.random()*22-11}px,-18px) scale(.2)`}],{duration:wand?450:200,easing:'ease-out'}).onfinish=()=>p.remove();
        if(!wand){
          const smoke=document.createElement('i');smoke.className='cursor-smoke';smoke.style.left=`${x+10}px`;smoke.style.top=`${y-62}px`;particles.append(smoke);
          smoke.animate([{opacity:.4,transform:'translate(0,0) scale(.5)'},{opacity:0,transform:`translate(${Math.random()*16-8}px,-58px) scale(1.8)`}],{duration:850,easing:'ease-out'}).onfinish=()=>smoke.remove();
        }
      }
    };
    window.addEventListener('pointermove',move,{passive:true});window.addEventListener('blur',hide);document.documentElement.addEventListener('pointerleave',hide);document.addEventListener('visibilitychange',hide);reduced.addEventListener('change',hide);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);window.removeEventListener('blur',hide);document.documentElement.removeEventListener('pointerleave',hide);document.removeEventListener('visibilitychange',hide);reduced.removeEventListener('change',hide);particles.replaceChildren();};
  },[]);
  return <><div ref={ref} className="match-cursor" data-visible="false" aria-hidden="true"><span className="match-cursor__glow"/><span className="match-cursor__aura"/><span className="match-cursor__wood"/><span className="match-cursor__head"/><span className="match-cursor__flame"><span/></span><span className="match-cursor__tongue match-cursor__tongue--gold"/><span className="match-cursor__tongue match-cursor__tongue--blue"/><span className="wand-tip">✧</span></div><div ref={trail} className="cursor-particles" aria-hidden="true"/></>;
}
