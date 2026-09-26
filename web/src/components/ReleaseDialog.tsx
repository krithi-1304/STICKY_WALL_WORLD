import { useEffect, useRef, useState } from 'react';
import { playRitualSound } from '../domain/chime';
export function ReleaseDialog({ label, onCancel, onRelease }: { label: string; onCancel: () => void; onRelease: () => void }) {
  const ref = useRef<HTMLDialogElement>(null); const [burning, setBurning] = useState(false); const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { const previous = document.activeElement as HTMLElement; ref.current?.showModal(); return () => { clearTimeout(timer.current); previous?.focus(); }; }, []);
  return <dialog ref={ref} aria-modal="true" aria-label="Let this go?" className={`release-dialog glass${burning ? ' releasing' : ''}`} onCancel={e => { e.preventDefault(); if (!burning) onCancel(); }}>
    <button className="release-hide" type="button" onClick={() => window.dispatchEvent(new Event('black-wall:hide'))}>Hide screen</button>
    <h2>Let this go?</h2><p>{label}</p><p>This removes it from this browser. It cannot be undone. Copies in older backup files remain.</p>
    <div className="release-paper" aria-hidden="true">A little space to move forward.</div>
    <div className="choice-row"><button autoFocus disabled={burning} onClick={onCancel}>Keep it</button><button disabled={burning} onClick={() => {
      setBurning(true); void playRitualSound('burn'); timer.current = setTimeout(onRelease, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
    }}>{burning ? 'Letting go…' : 'Let it go'}</button></div>
  </dialog>;
}
