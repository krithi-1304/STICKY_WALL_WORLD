import { useEffect, useState } from 'react';
export function Arrival(){
  const [show,setShow]=useState(()=>{try{return !sessionStorage.getItem('black-wall:arrived')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}});
  useEffect(()=>{
    if(!show)return;
    const finish=()=>setShow(false);try{sessionStorage.setItem('black-wall:arrived','yes');}catch{/* optional preference */}
    const timer=setTimeout(finish,1800);window.addEventListener('pointerdown',finish,{once:true});window.addEventListener('keydown',finish,{once:true});
    return()=>{clearTimeout(timer);window.removeEventListener('pointerdown',finish);window.removeEventListener('keydown',finish);};
  },[show]);
  return show?<div className="arrival" aria-label="Welcome to The Black Wall"><div className="arrival-light" aria-hidden="true"><svg viewBox="0 0 100 170"><path className="arrival-cord" d="M50 0V48"/><path className="arrival-bulb" d="M42 48H58V61C58 74 73 82 73 101C73 133 27 133 27 101C27 82 42 74 42 61Z"/><path className="arrival-filament" d="M44 115L40 95L50 103L60 95L56 115"/></svg></div><p className="eyebrow">THE BLACK WALL</p><h1><span>Make room</span><span>for a thought.</span></h1><p>Keep what matters. Let the rest go.</p><button onClick={()=>setShow(false)}>Enter quietly</button></div>:null;
}
