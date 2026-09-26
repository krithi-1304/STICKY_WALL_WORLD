import { useLayoutEffect, type RefObject } from 'react';
/** Measure on content/size changes; preserve each letter’s flow slot for reassembly. */
export function useLetterPile(ref:RefObject<HTMLElement|null>,text:string,visible:boolean|string=true){
  useLayoutEffect(()=>{
    const field=ref.current;if(!field||!visible)return;
    let frame=0,active=true;
    const measure=()=>{
      if(!active)return;
      const width=field.clientWidth,height=field.clientHeight;
      field.querySelectorAll<HTMLElement>('.pile-letter').forEach((word,i)=>{
        const scale=Math.min(.95,Math.max(.6,(width-18)/Math.max(1,word.offsetWidth)));
        const targetX=8+(i*61%101)/100*Math.max(0,width-word.offsetWidth*scale-18);
        const targetY=Math.max(0,height-24-(i*17%42));
        word.style.setProperty('--pile-x',`${targetX-word.offsetLeft}px`);
        word.style.setProperty('--pile-y',`${targetY-word.offsetTop}px`);
        word.style.setProperty('--pile-angle',`${(i*29%111)-55}deg`);
        word.style.setProperty('--pile-scale',String(scale));
        word.style.setProperty('--pile-delay',`${i*43%160}ms`);
      });
    };
    measure();const observer=new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);});observer.observe(field);
    void document.fonts.ready.then(measure);
    return()=>{active=false;cancelAnimationFrame(frame);observer.disconnect();};
  },[ref,text,visible]);
}
