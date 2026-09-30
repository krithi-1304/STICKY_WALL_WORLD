import { useEffect, useRef } from 'react';
export function DarkBackdrop(){
  const depth=useRef<HTMLDivElement>(null);
  const scene=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
    const move=(event:PointerEvent)=>{if(media.matches||document.hidden||event.pointerType!=='mouse')return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{depth.current?.style.setProperty('--ambient-x',`${(event.clientX/innerWidth-.5)*14}px`);depth.current?.style.setProperty('--ambient-ry',`${(event.clientX/innerWidth-.5)*1.2}deg`);depth.current?.style.setProperty('--ambient-rx',`${(event.clientY/innerHeight-.5)*-.8}deg`);depth.current?.style.setProperty('--ambient-y',`${(event.clientY/innerHeight-.5)*8}px`);});};
    const reset=()=>{cancelAnimationFrame(frame);for(const key of ['--ambient-x','--ambient-y','--ambient-rx','--ambient-ry'])depth.current?.style.removeProperty(key);};
    const visibility=()=>{if(scene.current)scene.current.dataset.paused=String(document.hidden);if(document.hidden)reset();};
    visibility();media.addEventListener('change',reset);document.addEventListener('visibilitychange',visibility);document.documentElement.addEventListener('pointerleave',reset);
    window.addEventListener('pointermove',move,{passive:true});return()=>{reset();media.removeEventListener('change',reset);document.removeEventListener('visibilitychange',visibility);document.documentElement.removeEventListener('pointerleave',reset);window.removeEventListener('pointermove',move);};
  },[]);
  return <div ref={scene} className="ambient-scene night-sky" aria-hidden="true"><div ref={depth} className="ambient-depth"><div className="night-clouds"/><div className="night-haze"/><div className="night-moon"><span/></div>{[[10,18],[31,8],[68,15],[89,43],[18,69],[74,82]].map(([x,y],index)=><span key={index} className={`night-star night-star--${index}`} style={{left:`${x}%`,top:`${y}%`,animationDelay:`${index*-1.7}s`}}/>)}</div><div className="night-vignette"/></div>;
}
